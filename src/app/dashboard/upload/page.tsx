'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, Link, FileX, CheckCircle2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { UploadProgress } from '@/types';

type Tab = 'file' | 'url' | 'note';

export default function UploadPage() {
  const [tab, setTab] = useState<Tab>('file');
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [url, setUrl] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const entry: UploadProgress = { file: file.name, progress: 0, status: 'uploading' };
      setUploads((prev) => [...prev, entry]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploads((prev) => prev.map((u) => u.file === file.name ? { ...u, progress: 40, status: 'uploading' } : u));
        const res = await fetch('/api/knowledge/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(await res.text());
        setUploads((prev) => prev.map((u) => u.file === file.name ? { ...u, progress: 70, status: 'processing' } : u));
        await res.json();
        setUploads((prev) => prev.map((u) => u.file === file.name ? { ...u, progress: 100, status: 'done' } : u));
        toast.success(`"${file.name}" added to your brain!`);
      } catch (err: any) {
        setUploads((prev) => prev.map((u) => u.file === file.name ? { ...u, status: 'error', error: err.message } : u));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'text/*': ['.txt', '.md'] },
    maxSize: 20 * 1024 * 1024,
  });

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/knowledge/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('URL added to your brain!');
      setUrl('');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to import URL');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/knowledge/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: noteTitle, content: noteContent, tags: noteTags.split(',').map((t) => t.trim()).filter(Boolean) }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Note saved to your brain!');
      setNoteTitle(''); setNoteContent(''); setNoteTags('');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'file', label: 'File Upload', icon: Upload },
    { id: 'url', label: 'URL / Web Page', icon: Link },
    { id: 'note', label: 'Quick Note', icon: FileText },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Upload Knowledge</h1>
        <p className="text-white/40">Add PDFs, web pages, screenshots, or quick notes to your second brain.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/8 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'file' && (
          <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-medium mb-1">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
              </p>
              <p className="text-white/30 text-sm">PDF, PNG, JPG, TXT, MD · Max 20MB each</p>
              <button className="mt-5 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
                Browse Files
              </button>
            </div>

            {/* Upload progress list */}
            {uploads.length > 0 && (
              <div className="mt-5 space-y-2">
                {uploads.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                    {u.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : u.status === 'error' ? (
                      <FileX className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm truncate">{u.file}</p>
                      {u.status === 'error' && <p className="text-red-400 text-xs">{u.error}</p>}
                      {u.status !== 'error' && (
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${u.status === 'done' ? 'bg-emerald-500' : 'bg-violet-500'}`}
                            style={{ width: `${u.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button onClick={() => setUploads((p) => p.filter((_, j) => j !== i))} className="text-white/20 hover:text-white/50 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'url' && (
          <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                <label className="block text-sm text-white/60 mb-2">Web Page URL</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://docs.example.com/article"
                      required
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                  </button>
                </div>
                <p className="text-white/30 text-xs mt-3">We&apos;ll fetch and parse the page content, then create embeddings for RAG.</p>
              </div>
            </form>
          </motion.div>
        )}

        {tab === 'note' && (
          <motion.div key="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleNoteSubmit} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Title</label>
                <input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title..."
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your notes here... (Markdown supported)"
                  required
                  rows={8}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Tags (comma-separated)</label>
                <input
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  placeholder="react, typescript, learning..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Note to Brain'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
