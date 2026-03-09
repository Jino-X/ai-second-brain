'use client';
import { motion } from 'framer-motion';
import { Brain, Home, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center relative"
      >
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white text-lg">Second Brain</span>
          </div>

          {/* 404 Content */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white/20 mb-4">404</h1>
            <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
            <p className="text-white/60 text-sm">
              The page you're looking for doesn't exist in your knowledge base.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            
            <div className="flex gap-2">
              <Link
                href="/dashboard/knowledge"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm font-medium transition-all"
              >
                <Search className="w-4 h-4" />
                Browse Knowledge
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
