import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export function getKnowledgeTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    pdf: '📄',
    image: '🖼️',
    url: '🔗',
    note: '📝',
    github: '🐙',
  };
  return icons[type] ?? '📄';
}

export function getKnowledgeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF',
    image: 'Screenshot',
    url: 'Web Page',
    note: 'Note',
    github: 'GitHub Repo',
  };
  return labels[type] ?? type;
}

export function bytesToSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function chunkText(text: string, maxTokens = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];
  let tokenCount = 0;

  for (const word of words) {
    const tokens = Math.ceil(word.length / 4);
    if (tokenCount + tokens > maxTokens && current.length > 0) {
      chunks.push(current.join(' '));
      current = [word];
      tokenCount = tokens;
    } else {
      current.push(word);
      tokenCount += tokens;
    }
  }
  if (current.length > 0) chunks.push(current.join(' '));
  return chunks;
}
