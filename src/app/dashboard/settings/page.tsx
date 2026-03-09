'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Key, Bell, Palette, Database, Download, Upload, 
  Save, Eye, EyeOff, Trash2, RefreshCw, Check, X 
} from 'lucide-react';
import supabase from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  email_updates: boolean;
  openai_api_key?: string;
  github_token?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    notifications: true,
    email_updates: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [stats, setStats] = useState({ knowledge: 0, chunks: 0, chats: 0 });

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: authUser.email!,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        created_at: authUser.created_at,
      });

      // Load user settings (from localStorage for now)
      const savedSettings = localStorage.getItem('user-settings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }

      // Load stats
      const [{ count: kc }, { count: cc }, { count: chatc }] = await Promise.all([
        supabase.from('knowledge_items').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id),
        supabase.from('knowledge_chunks').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id),
      ]);

      setStats({ knowledge: kc ?? 0, chunks: cc ?? 0, chats: chatc ?? 0 });
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, you'd save to a database)
      localStorage.setItem('user-settings', JSON.stringify(settings));
      
      // Update profile if needed
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            updated_at: new Date().toISOString(),
          });
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const { data: knowledgeItems } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('user_id', user.id);

      const { data: chatSessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        user: user,
        knowledge_items: knowledgeItems,
        chat_sessions: chatSessions,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `second-brain-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAllData = async () => {
    if (!user || !confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) return;

    try {
      await Promise.all([
        supabase.from('knowledge_chunks').delete().eq('user_id', user.id),
        supabase.from('knowledge_items').delete().eq('user_id', user.id),
        supabase.from('chat_sessions').delete().eq('user_id', user.id),
        supabase.from('github_repos').delete().eq('user_id', user.id),
        supabase.from('weekly_summaries').delete().eq('user_id', user.id),
      ]);

      setStats({ knowledge: 0, chunks: 0, chats: 0 });
      toast.success('All data deleted successfully');
    } catch (error) {
      toast.error('Failed to delete data');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/4"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/40">Manage your account, preferences, and data</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/8 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Full Name</label>
              <input
                type="text"
                value={user?.full_name || ''}
                onChange={(e) => setUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-white/40 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        {/* API Keys Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/8 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">OpenAI API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.openai_api_key || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, openai_api_key: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-violet-500/50"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">GitHub Token (Optional)</label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={settings.github_token || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, github_token: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-violet-500/50"
                  placeholder="ghp_..."
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/8 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Notifications</p>
                <p className="text-white/40 text-xs">Receive browser notifications</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-violet-600' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Email Updates</p>
                <p className="text-white/40 text-xs">Receive weekly summary emails</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, email_updates: !prev.email_updates }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.email_updates ? 'bg-violet-600' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.email_updates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.02] border border-white/8 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Data Management</h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-white/[0.02] rounded-lg">
              <p className="text-xl font-bold text-white">{stats.knowledge}</p>
              <p className="text-white/40 text-xs">Knowledge Items</p>
            </div>
            <div className="text-center p-3 bg-white/[0.02] rounded-lg">
              <p className="text-xl font-bold text-white">{stats.chunks}</p>
              <p className="text-white/40 text-xs">Content Chunks</p>
            </div>
            <div className="text-center p-3 bg-white/[0.02] rounded-lg">
              <p className="text-xl font-bold text-white">{stats.chats}</p>
              <p className="text-white/40 text-xs">Chat Sessions</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={handleDeleteAllData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </button>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
