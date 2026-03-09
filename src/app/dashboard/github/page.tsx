'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Plus, Loader2, Trash2, ExternalLink, Code2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';

export default function GitHubPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [indexing, setIndexing] = useState(false);

  const loadRepos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('github_repos').select('*').eq('user_id', user?.id).order('indexed_at', { ascending: false });
    setRepos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadRepos(); }, []);

  const handleIndex = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) { toast.error('Invalid GitHub URL'); return; }

    setIndexing(true);
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: match[1], repo: match[2].replace(/\.git$/, '') }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success(`Indexed ${data.fileCount} files from ${match[1]}/${match[2]}`);
      setRepoUrl('');
      loadRepos();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to index repo');
    } finally {
      setIndexing(false);
    }
  };

  const handleDelete = async (id: string, repoName: string) => {
    await supabase.from('knowledge_items').delete().eq('user_id', (await supabase.auth.getUser()).data.user?.id).like('title', `%${repoName}%`);
    await supabase.from('github_repos').delete().eq('id', id);
    setRepos((prev) => prev.filter((r) => r.id !== id));
    toast.success('Repo removed from brain');
  };

  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">GitHub Indexing</h1>
        <p className="text-white/40">Index any public GitHub repo to chat with its code and documentation.</p>
      </motion.div>

      {/* Index form */}
      <form onSubmit={handleIndex} className="mb-8">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <label className="block text-sm text-white/60 mb-2">GitHub Repository URL</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={indexing}
              className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shrink-0"
            >
              {indexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Index Repo</>}
            </button>
          </div>
          <p className="text-white/25 text-xs mt-3">Indexes README, source files (.ts, .js, .py, .go, .md) up to 50 files. Public repos only.</p>
        </div>
      </form>

      {/* Indexed repos */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Indexed Repositories</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : repos.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-white/10 rounded-2xl">
            <Github className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No repos indexed yet</p>
            <p className="text-white/20 text-xs mt-1">Paste a GitHub URL above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {repos.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.02] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5 text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{repo.repo_name}</p>
                    {repo.language && (
                      <span className="flex items-center gap-1 text-xs text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
                        <Code2 className="w-2.5 h-2.5" /> {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && <p className="text-white/40 text-xs mt-0.5 truncate">{repo.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/25 text-xs">{repo.file_count} files indexed</span>
                    <span className="text-white/25 text-xs">·</span>
                    <span className="text-white/25 text-xs">{formatRelativeTime(repo.indexed_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={repo.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(repo.id, repo.repo_name)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
