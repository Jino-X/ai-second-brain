'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit3, Trash2, ExternalLink, Download, Share2, 
  BookOpen, Calendar, Tag, FileText, Eye, Copy, Check 
} from 'lucide-react';
import Link from 'next/link';
import supabase from '@/lib/supabase/client';
import { KnowledgeItem, KnowledgeChunk } from '@/types';
import { formatRelativeTime, getKnowledgeTypeIcon, getKnowledgeTypeLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import DocumentViewer from '@/components/ui/DocumentViewer';

export default function KnowledgeItemPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [itemResult, chunksResult] = await Promise.all([
        supabase
          .from('knowledge_items')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('knowledge_chunks')
          .select('*')
          .eq('knowledge_id', params.id)
          .eq('user_id', user.id)
          .order('chunk_index')
      ]);

      if (itemResult.error || !itemResult.data) {
        toast.error('Knowledge item not found');
        router.push('/dashboard/knowledge');
        return;
      }

      setItem(itemResult.data);
      setChunks(chunksResult.data || []);
      setEditTitle(itemResult.data.title);
      setEditTags(itemResult.data.tags.join(', '));
      setEditSummary(itemResult.data.summary || '');
      setLoading(false);
    };

    if (params.id) loadItem();
  }, [params.id, supabase, router]);

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this knowledge item?')) return;

    await supabase.from('knowledge_chunks').delete().eq('knowledge_id', item.id);
    await supabase.from('knowledge_items').delete().eq('id', item.id);
    toast.success('Knowledge item deleted');
    router.push('/dashboard/knowledge');
  };

  const handleSave = async () => {
    if (!item) return;

    const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from('knowledge_items')
      .update({
        title: editTitle,
        tags,
        summary: editSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update item');
      return;
    }

    setItem({ ...item, title: editTitle, tags, summary: editSummary });
    setIsEditing(false);
    toast.success('Knowledge item updated');
  };

  const copyContent = async () => {
    if (!item) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    toast.success('Content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    if (!item) return;
    const blob = new Blob([item.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/3"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/knowledge"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getKnowledgeTypeIcon(item.type)}</span>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {getKnowledgeTypeLabel(item.type)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={copyContent}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadContent}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Download content"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Edit item"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Title & Metadata */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xl font-bold bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500/50"
                placeholder="Title"
              />
              <input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm focus:outline-none focus:border-violet-500/50"
                placeholder="Tags (comma separated)"
              />
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm focus:outline-none focus:border-violet-500/50 resize-none"
                placeholder="Summary"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-4">{item.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatRelativeTime(item.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{chunks.length} chunks</span>
                </div>
                {item.source_url && (
                  <a 
                    href={item.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Source</span>
                  </a>
                )}
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="flex items-center gap-1 text-xs text-violet-400/80 bg-violet-500/10 px-2 py-1 rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.summary && (
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white/80 mb-2">Summary</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.summary}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Document Viewer */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-white/60" />
            <h2 className="font-medium text-white/80">Document Preview</h2>
          </div>
          
          <DocumentViewer item={item} />

          {/* Raw Content */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white/60 mb-3">Extracted Content</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {item.content}
              </pre>
            </div>
          </div>
        </div>

        {/* Chunks */}
        {chunks.length > 0 && (
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-white/60" />
              <h2 className="font-medium text-white/80">Content Chunks</h2>
              <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
                {chunks.length} chunks
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {chunks.map((chunk, index) => (
                <div key={chunk.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      Chunk {index + 1}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
