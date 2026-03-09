'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Loader2, Brain, RefreshCw, Tag } from 'lucide-react';
import supabase from '@/lib/supabase/client';
import { WeeklySummary } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SummaryPage() {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadSummaries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', user?.id)
      .order('week_start', { ascending: false });
    setSummaries(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadSummaries(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/summary', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success('Weekly summary generated!');
      loadSummaries();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Weekly AI Summary</h1>
          <p className="text-white/40">AI synthesizes your weekly learning into key themes and insights.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shrink-0"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate This Week
        </button>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 font-medium mb-1">No summaries yet</p>
          <p className="text-white/20 text-sm mb-4">Add at least 3 knowledge items, then generate your first weekly summary.</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate First Summary
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {summaries.map((summary, i) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Week of {formatDate(summary.week_start)}
                    </p>
                    <p className="text-white/30 text-xs">
                      {formatDate(summary.week_start)} – {formatDate(summary.week_end)} · {summary.item_count} items
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-4">{summary.summary}</p>

              {summary.topics.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-white/30" />
                    <p className="text-white/30 text-xs uppercase tracking-wider">Topics Covered</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.topics.map((topic) => (
                      <span key={topic} className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
