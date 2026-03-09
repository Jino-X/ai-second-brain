'use client';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
}

export default function LoadingSkeleton({ 
  className = '', 
  variant = 'card',
  lines = 3 
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-white/[0.03] animate-pulse rounded-lg';

  const variants = {
    card: 'h-40 rounded-2xl',
    text: 'h-4 rounded-lg',
    avatar: 'w-10 h-10 rounded-full',
    button: 'h-10 rounded-xl'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${baseClasses} ${variants.text}`}
            style={{ width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    />
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <LoadingSkeleton variant="avatar" className="w-6 h-6" />
          <LoadingSkeleton variant="button" className="w-16 h-5" />
        </div>
        <LoadingSkeleton variant="avatar" className="w-7 h-7" />
      </div>
      
      <LoadingSkeleton variant="text" lines={2} className="mb-3" />
      <LoadingSkeleton variant="text" lines={3} className="mb-3" />
      
      <div className="flex gap-1 mb-3">
        <LoadingSkeleton variant="button" className="w-12 h-5" />
        <LoadingSkeleton variant="button" className="w-16 h-5" />
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <LoadingSkeleton variant="text" className="w-20" />
        <div className="flex gap-1">
          <LoadingSkeleton variant="avatar" className="w-4 h-4" />
          <LoadingSkeleton variant="avatar" className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
