export type KnowledgeType = 'pdf' | 'image' | 'url' | 'note' | 'github';

export interface KnowledgeItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  source_url?: string;
  file_path?: string;
  tags: string[];
  summary?: string;
  created_at: string;
  updated_at: string;
  chunk_count?: number;
}

export interface KnowledgeChunk {
  id: string;
  knowledge_id: string;
  user_id: string;
  content: string;
  embedding?: number[];
  chunk_index: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: KnowledgeSource[];
  created_at: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  type: KnowledgeType;
  excerpt: string;
  similarity: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: string;
  user_id: string;
  repo_name: string;
  repo_url: string;
  description?: string;
  language?: string;
  indexed_at: string;
  file_count: number;
}

export interface WeeklySummary {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  summary: string;
  topics: string[];
  item_count: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  github_username?: string;
  created_at: string;
}

export interface UploadProgress {
  file: string;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
}
