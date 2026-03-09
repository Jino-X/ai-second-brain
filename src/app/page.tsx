'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Upload, Github, MessageSquare, Sparkles, ArrowRight, CheckCircle, Zap, BookOpen, Clock } from 'lucide-react';

const features = [
  { icon: Upload, title: 'Upload Everything', desc: 'PDFs, screenshots, docs, web pages — your entire knowledge base in one place.' },
  { icon: Github, title: 'GitHub Indexing', desc: 'Index any GitHub repo. Chat with codebases, READMEs, and documentation.' },
  { icon: MessageSquare, title: 'Chat with Your Knowledge', desc: 'Ask questions and get answers grounded in your saved content via RAG.' },
  { icon: Sparkles, title: 'AI Weekly Summaries', desc: 'Every week, AI synthesizes what you learned and surfaces key themes.' },
  { icon: Brain, title: 'Ask Your Past Self', desc: 'Retrieve insights you once wrote down but forgot — your second brain remembers.' },
  { icon: Zap, title: 'Instant Search', desc: 'Semantic search across all your knowledge. Find anything in seconds.' },
];

const steps = [
  { step: '01', title: 'Upload Your Knowledge', desc: 'Drop PDFs, paste URLs, upload screenshots, or index a GitHub repo.' },
  { step: '02', title: 'AI Processes & Indexes', desc: 'OpenAI embeddings power semantic understanding of all your content.' },
  { step: '03', title: 'Chat & Discover', desc: 'Ask questions, get summaries, and rediscover forgotten insights.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Second Brain</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/login" className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Personal Knowledge System</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Your{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                AI Second Brain
              </span>
              {' '}for Developers
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop losing knowledge across GitHub, docs, screenshots, and notes.
              Upload everything once — chat with it forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all text-base shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40"
              >
                Start Building Your Brain
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-8 py-3.5 rounded-xl font-medium transition-all text-base"
              >
                <BookOpen className="w-4 h-4" />
                See How It Works
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-20 relative"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-2xl">
            <div className="bg-white/[0.04] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-white/30 text-xs font-mono">second-brain — chat</span>
            </div>
            <div className="p-6 space-y-4 font-mono text-sm">
              <div className="flex gap-3">
                <span className="text-violet-400 shrink-0">You</span>
                <span className="text-white/70">What did I learn about React Server Components last month?</span>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 shrink-0">AI</span>
                <div className="text-white/60 space-y-1">
                  <p>Based on your saved notes and PDFs, here are the key insights:</p>
                  <p className="text-white/40">📄 <span className="text-violet-300">react-server-components.pdf</span> — RSCs run on the server, reducing client JS bundle size by ~60%...</p>
                  <p className="text-white/40">🔗 <span className="text-violet-300">nextjs.org/docs</span> — The &apos;use client&apos; directive marks component boundaries...</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white/[0.05] rounded-lg px-4 py-2.5 text-white/30 text-sm border border-white/5">
                  Ask your second brain anything...
                </div>
                <button className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to remember everything</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Built for developers who learn constantly but struggle to retain and connect knowledge.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors">
                  <f.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-white/40 text-lg">Three simple steps to build your developer second brain.</p>
          </div>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <span className="text-violet-400 font-mono font-bold text-sm">{s.step}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <Clock className="w-10 h-10 text-violet-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop forgetting what you learn</h2>
          <p className="text-white/40 mb-8">Join developers who use AI to build a permanent, queryable knowledge base from everything they read and build.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-medium transition-all text-base shadow-lg shadow-violet-600/25"
          >
            Build Your Second Brain
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/30">
            {['Free to start', 'No credit card', 'Deploy on Vercel'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-white/20 text-sm">© 2025 AI Second Brain. Built with Next.js + Supabase + OpenAI.</p>
      </footer>
    </div>
  );
}
