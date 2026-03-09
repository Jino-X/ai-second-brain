-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge items table
create table if not exists knowledge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null default '',
  type text not null check (type in ('pdf', 'image', 'url', 'note', 'github')),
  source_url text,
  file_path text,
  tags text[] not null default '{}',
  summary text,
  chunk_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Knowledge chunks table (for vector search)
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  knowledge_id uuid references knowledge_items(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  chunk_index int not null default 0,
  created_at timestamptz not null default now()
);

-- GitHub repos table
create table if not exists github_repos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  repo_name text not null,
  repo_url text not null,
  description text,
  language text,
  indexed_at timestamptz not null default now(),
  file_count int default 0,
  unique (user_id, repo_name)
);

-- Weekly summaries table
create table if not exists weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start timestamptz not null,
  week_end timestamptz not null,
  summary text not null,
  topics text[] not null default '{}',
  item_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- Chat sessions table
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Chat',
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists knowledge_items_user_id_idx on knowledge_items(user_id);
create index if not exists knowledge_items_type_idx on knowledge_items(type);
create index if not exists knowledge_items_created_at_idx on knowledge_items(created_at desc);
create index if not exists knowledge_chunks_user_id_idx on knowledge_chunks(user_id);
create index if not exists knowledge_chunks_knowledge_id_idx on knowledge_chunks(knowledge_id);
create index if not exists github_repos_user_id_idx on github_repos(user_id);
create index if not exists weekly_summaries_user_id_idx on weekly_summaries(user_id);

-- Vector index for similarity search
create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_knowledge_items_updated_at
  before update on knowledge_items
  for each row execute function update_updated_at_column();

create trigger update_chat_sessions_updated_at
  before update on chat_sessions
  for each row execute function update_updated_at_column();

-- Row Level Security
alter table profiles enable row level security;
alter table knowledge_items enable row level security;
alter table knowledge_chunks enable row level security;
alter table github_repos enable row level security;
alter table weekly_summaries enable row level security;
alter table chat_sessions enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can manage their own knowledge items"
  on knowledge_items for all using (auth.uid() = user_id);

create policy "Users can manage their own knowledge chunks"
  on knowledge_chunks for all using (auth.uid() = user_id);

create policy "Users can manage their own github repos"
  on github_repos for all using (auth.uid() = user_id);

create policy "Users can manage their own weekly summaries"
  on weekly_summaries for all using (auth.uid() = user_id);

create policy "Users can manage their own chat sessions"
  on chat_sessions for all using (auth.uid() = user_id);

-- Vector similarity search function
create or replace function match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  knowledge_id uuid,
  knowledge_title text,
  knowledge_type text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    kc.id,
    kc.knowledge_id,
    ki.title as knowledge_title,
    ki.type as knowledge_type,
    kc.content,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_items ki on ki.id = kc.knowledge_id
  where kc.user_id = p_user_id
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;
