'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Filter, Trash2, ExternalLink, Brain, Plus } from 'lucide-react';
import Link from 'next/link';
import supabase from '@/lib/supabase/client';
import { KnowledgeItem, KnowledgeType } from '@/types';
import { formatRelativeTime, getKnowledgeTypeIcon, getKnowledgeTypeLabel, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';
import AdvancedSearch from '@/components/ui/AdvancedSearch';

const TYPE_FILTERS: { label: string; value: KnowledgeType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'PDFs', value: 'pdf' },
  { label: 'Screenshots', value: 'image' },
  { label: 'Web Pages', value: 'url' },
  { label: 'Notes', value: 'note' },
  { label: 'GitHub', value: 'github' },
];

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [filtered, setFiltered] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setItems(data ?? []);
      setFiltered(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setIsSearchMode(true);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearchMode(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('knowledge_chunks').delete().eq('knowledge_id', id);
    await supabase.from('knowledge_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Removed from knowledge base');
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Knowledge Base</h1>
          <p className="text-white/40 text-sm">{items.length} items in your second brain</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Add Knowledge
        </Link>
      </motion.div>

      {/* Advanced Search */}
      <div className="mb-6">
        <AdvancedSearch onResults={handleSearchResults} onClear={handleClearSearch} />
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : (isSearchMode ? searchResults : filtered).length === 0 ? (
        <div className="text-center py-20">
          <Brain className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 font-medium mb-1">{isSearchMode ? 'No results found' : 'Your knowledge base is empty'}</p>
          <p className="text-white/20 text-sm">{isSearchMode ? 'Try a different search query' : 'Start by uploading a PDF or saving a URL'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(isSearchMode ? searchResults : filtered).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getKnowledgeTypeIcon(item.type)}</span>
                  <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
                    {getKnowledgeTypeLabel(item.type)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link href={`/dashboard/knowledge/${item.id}`}>
                <h3 className="font-semibold text-white/90 hover:text-white text-sm mb-2 line-clamp-2 transition-colors cursor-pointer">
                  {item.title}
                </h3>
              </Link>

              {item.summary && (
                <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">{item.summary}</p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs text-violet-400/70 bg-violet-500/10 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <span className="text-white/25 text-xs">{formatRelativeTime(item.created_at)}</span>
                <div className="flex items-center gap-1">
                  {item.source_url && (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/50 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link href={`/dashboard/knowledge/${item.id}`} className="text-violet-400/60 hover:text-violet-400 transition-colors">
                    <BookOpen className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
