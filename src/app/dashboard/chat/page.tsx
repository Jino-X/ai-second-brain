'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Loader2, BookOpen, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, KnowledgeSource } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  'What did I learn about React last week?',
  'Summarize my notes on TypeScript',
  'What are the key concepts from my saved PDFs?',
  'What GitHub repos have I indexed?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history: messages.slice(-8) }),
      });
      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Chat with Your Brain</h1>
          <p className="text-white/40 text-sm">Ask anything — answers grounded in your knowledge base</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Ask Your Second Brain</h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto">Your answers are grounded in your uploaded PDFs, notes, URLs, and GitHub repos.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] text-left text-white/60 hover:text-white/80 text-sm transition-all group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 mb-2" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white ml-auto'
                        : 'bg-white/[0.05] border border-white/8 text-white/80'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-white/30 text-xs flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Sources used:
                        </p>
                        {msg.sources.map((src: KnowledgeSource) => (
                          <div key={src.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <span className="text-xs text-violet-400 font-medium">{src.title}</span>
                            <span className="text-white/20 text-xs">·</span>
                            <span className="text-white/30 text-xs truncate">{src.excerpt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-white/20 text-xs mt-1 px-1">{formatRelativeTime(msg.created_at)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white/[0.05] border border-white/8 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-white/5 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your second brain anything... (Enter to send)"
              rows={1}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none max-h-32 scrollbar-thin"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-center text-white/20 text-xs mt-2 max-w-3xl mx-auto">AI responses are grounded in your knowledge base via RAG.</p>
      </div>
    </div>
  );
}
