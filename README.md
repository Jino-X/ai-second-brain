# AI Second Brain for Developers

A production-ready, fullstack AI knowledge management system that remembers everything you read. Built with Next.js 14, Supabase (pgvector), and OpenAI.

## Features

- **PDF & Document Upload** — Upload PDFs, DOCX, TXT, Markdown files
- **Screenshot Ingestion** — Save images and screenshots to your knowledge base
- **URL / Web Page Import** — Paste any URL, content is fetched and indexed
- **Quick Notes** — Write notes with Markdown support and tags
- **GitHub Repo Indexing** — Index any public repo (source files, READMEs)
- **RAG Chat** — Chat with your entire knowledge base via OpenAI embeddings
- **Weekly AI Summaries** — GPT-4o synthesizes your weekly learning themes
- **Semantic Search** — Search across all knowledge by meaning, not just keywords
- **Dark UI** — Beautiful dark-mode UI with Tailwind CSS and Framer Motion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Auth | Supabase Auth (Email + GitHub OAuth) |
| Database | Supabase PostgreSQL + pgvector |
| AI | OpenAI `text-embedding-3-small` + `gpt-4o-mini` / `gpt-4o` |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Auth page
│   ├── auth/callback/route.ts    # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard shell + auth guard
│   │   ├── page.tsx              # Overview / home
│   │   ├── knowledge/page.tsx    # Browse knowledge base
│   │   ├── upload/page.tsx       # Upload PDFs, URLs, notes
│   │   ├── chat/page.tsx         # RAG chat interface
│   │   ├── github/page.tsx       # GitHub repo indexing
│   │   └── summary/page.tsx      # Weekly AI summary
│   └── api/
│       ├── knowledge/upload/     # File upload + embeddings
│       ├── knowledge/url/        # URL import + embeddings
│       ├── knowledge/note/       # Note save + embeddings
│       ├── chat/                 # RAG chat endpoint
│       ├── github/               # GitHub indexing endpoint
│       └── summary/              # AI Second Brain for Developers

A production-ready AI-powered knowledge management system built with Next.js 15, Supabase, and OpenAI. Store, search, and chat with your documents, PDFs, screenshots, URLs, and GitHub repositories using advanced semantic search and RAG (Retrieval-Augmented Generation).

## ✨ Features

### 📚 Knowledge Management
- **Document Processing**: Upload and process PDFs, images, DOCX files with OCR
- **URL Ingestion**: Save and index web pages, articles, and documentation
- **GitHub Integration**: Index entire repositories for intelligent code search
- **Note Taking**: Create and organize rich text notes with tags
- **Content Viewing**: Built-in PDF viewer, image viewer, and document preview

### 🔍 Advanced Search
- **Semantic Search**: Vector-based similarity search using OpenAI embeddings
- **Hybrid Search**: Combines text search with semantic understanding
- **Search Suggestions**: Auto-complete and recent search history
- **Type Filtering**: Filter by content type (PDF, image, URL, note, GitHub)
- **Real-time Results**: Instant search with relevance scoring

### 🤖 AI-Powered Features
- **RAG Chat**: Chat with your knowledge base using GPT-4o
- **Content Summarization**: AI-generated summaries for all content
- **Weekly Insights**: Automated learning summaries and topic analysis
- **Smart Tagging**: Automatic tag suggestions and organization

### 👤 User Experience
- **Individual Item Views**: Detailed pages for each knowledge item
- **Content Editing**: Edit titles, tags, summaries, and metadata
- **Export Functionality**: Download your data in JSON format
- **Settings Management**: User profiles, API keys, and preferences
- **Error Handling**: Comprehensive error boundaries and 404 pages

### 🔒 Security & Performance
- **Row Level Security**: Supabase RLS for data isolation
- **Authentication**: Email/password and GitHub OAuth
- **Real-time Sync**: Live updates across devices
- **Optimized Build**: Static generation with dynamic routes
- **Loading States**: Skeleton components and smooth transitions

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + pgvector)
- **AI**: OpenAI GPT-4o, GPT-4o-mini, text-embedding-3-small
- **Authentication**: Supabase Auth with GitHub OAuth
- **Storage**: Supabase Storage for file uploads
- **Database**: PostgreSQL with pgvector extension
- **Deployment**: Vercel with automatic deployments

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account with pgvector enabled
- OpenAI API key with GPT-4 access
- GitHub OAuth app (optional but recommended)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ai-second-brain
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up the database:**

Run the SQL schema in your Supabase SQL editor:
```bash
# Copy and paste the contents of supabase/schema.sql
# This creates all tables, indexes, RLS policies, and functions
```

5. **Enable pgvector extension:**

In your Supabase SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with email or GitHub
2. **Configure Settings**: Add your OpenAI API key in Settings
3. **Upload Content**: Start with a PDF, image, or URL
4. **Explore Features**: Try semantic search and AI chat

### Core Features

#### 📄 Knowledge Management
- **Upload Files**: Drag & drop PDFs, images, DOCX files
- **Save URLs**: Paste any web URL to extract and index content
- **Create Notes**: Write and organize text notes with tags
- **GitHub Repos**: Index entire repositories for code search

#### 🔍 Search & Discovery
- **Semantic Search**: Find content by meaning, not just keywords
- **Advanced Filters**: Filter by type, date, tags, and relevance
- **Search History**: Access recent searches and suggestions
- **Content Preview**: View documents inline with zoom and rotation

#### 💬 AI Chat
- **Ask Questions**: Chat with your entire knowledge base
- **Source Citations**: See which documents informed each answer
- **Context Aware**: Maintains conversation context and history
- **Multiple Models**: Choose between GPT-4o and GPT-4o-mini

#### ⚙️ Settings & Management
- **Profile**: Manage your account and preferences
- **API Keys**: Configure OpenAI and GitHub tokens
- **Data Export**: Download all your data in JSON format
- **Privacy**: All data is private and encrypted

## 🏗 Architecture

### Database Schema
```sql
-- Core tables
profiles          # User profiles and preferences
knowledge_items   # Main content items
knowledge_chunks  # Text chunks with embeddings
github_repos      # Indexed repositories
chat_sessions     # Chat history
weekly_summaries  # AI-generated insights
```

### API Routes
```
POST /api/knowledge/upload    # File upload and processing
POST /api/knowledge/url       # URL content extraction
POST /api/knowledge/note      # Note creation
POST /api/chat               # AI chat interface
POST /api/github             # GitHub repository indexing
POST /api/summary            # Weekly summary generation
POST /api/search             # Advanced semantic search
GET  /api/search?q=query     # Search suggestions
```

### Key Components
- **DocumentViewer**: PDF/image viewer with controls
- **AdvancedSearch**: Semantic search with suggestions
- **ErrorBoundary**: Production error handling
- **LoadingSkeleton**: Smooth loading states

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**: Commit your code to a GitHub repository
2. **Connect Vercel**: Import your repository in Vercel dashboard
3. **Environment Variables**: Add all environment variables
4. **Deploy**: Automatic deployment on every push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup

Ensure these environment variables are set in production:
- All Supabase credentials
- OpenAI API key
- GitHub OAuth credentials (if using)
- Correct NEXT_PUBLIC_APP_URL

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable pgvector extension
3. Run the schema.sql file
4. Configure authentication providers
5. Set up storage buckets for file uploads

### OpenAI Setup
1. Get API key from OpenAI platform
2. Ensure GPT-4 access for best results
3. Monitor usage and set billing limits

### GitHub OAuth (Optional)
1. Create GitHub OAuth app
2. Set authorization callback URL
3. Add client ID and secret to environment

## 📊 Performance

### Optimization Features
- **Static Generation**: Pre-rendered pages for fast loading
- **Dynamic Routes**: Server-side rendering for dynamic content
- **Vector Indexing**: Optimized similarity search with ivfflat
- **Lazy Loading**: Components load on demand
- **Image Optimization**: Next.js automatic image optimization

### Monitoring
- **Error Tracking**: Built-in error boundaries
- **Performance**: Web Vitals monitoring
- **Usage Analytics**: Track search and chat usage

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add proper error handling
- Include loading states for async operations
- Write meaningful commit messages
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact for enterprise support

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Collaborative workspaces
- [ ] Advanced analytics dashboard
- [ ] Integration with more AI models
- [ ] Bulk import/export tools
- [ ] API rate limiting and quotas

---

Built with ❤️ using Next.js, Supabase, and OpenAI.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/knowledge/upload` | POST | Upload file (PDF/image/text) |
| `/api/knowledge/url` | POST | Import web page by URL |
| `/api/knowledge/note` | POST | Save a quick note |
| `/api/chat` | POST | RAG chat with knowledge base |
| `/api/github` | POST | Index a GitHub repository |
| `/api/summary` | POST | Generate weekly AI summary |

## License

MIT
