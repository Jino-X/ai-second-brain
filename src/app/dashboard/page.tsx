'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, MessageSquare, Github, Sparkles, TrendingUp, Clock, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import supabase from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ knowledge: 0, chats: 0, repos: 0, summaries: 0 });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const [{ count: kc }, { count: cc }, { count: rc }, { count: sc }, { data: recent }] = await Promise.all([
        supabase.from('knowledge_items').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('github_repos').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('weekly_summaries').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('knowledge_items').select('id,title,type,created_at').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({ knowledge: kc ?? 0, chats: cc ?? 0, repos: rc ?? 0, summaries: sc ?? 0 });
      setRecentItems(recent ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Knowledge Items', value: stats.knowledge, icon: BookOpen, href: '/dashboard/knowledge', color: 'violet' },
    { label: 'Chat Sessions', value: stats.chats, icon: MessageSquare, href: '/dashboard/chat', color: 'blue' },
    { label: 'GitHub Repos', value: stats.repos, icon: Github, href: '/dashboard/github', color: 'emerald' },
    { label: 'Weekly Summaries', value: stats.summaries, icon: Sparkles, href: '/dashboard/summary', color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const typeIconMap: Record<string, string> = { pdf: '📄', image: '🖼️', url: '🔗', note: '📝', github: '🐙' };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋
        </h1>
        <p className="text-white/40">{user?.email} · Your knowledge base is ready</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={card.href} className="block p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : card.value}</p>
              <p className="text-white/40 text-xs mt-1">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Knowledge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.02] p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <h2 className="font-semibold text-white text-sm">Recently Added</h2>
            </div>
            <Link href="/dashboard/knowledge" className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-10">
              <Brain className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No knowledge yet</p>
              <Link href="/dashboard/upload" className="inline-flex items-center gap-1 text-violet-400 text-sm mt-2 hover:text-violet-300">
                Upload your first item <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/knowledge/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                >
                  <span className="text-lg">{typeIconMap[item.type] ?? '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate group-hover:text-white transition-colors">{item.title}</p>
                    <p className="text-white/30 text-xs">{formatRelativeTime(item.created_at)}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/8 bg-white/[0.02] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-white/40" />
            <h2 className="font-semibold text-white text-sm">Quick Actions</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { href: '/dashboard/upload', icon: Upload, label: 'Upload Knowledge', desc: 'PDF, image, or URL', color: 'violet' },
              { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat with Brain', desc: 'Ask anything', color: 'blue' },
              { href: '/dashboard/github', icon: Github, label: 'Index a Repo', desc: 'Connect GitHub', color: 'emerald' },
              { href: '/dashboard/summary', icon: Sparkles, label: 'Weekly Summary', desc: 'AI learning digest', color: 'amber' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/8 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colorMap[action.color]}`}>
                  <action.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{action.label}</p>
                  <p className="text-white/30 text-xs">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
