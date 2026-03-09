import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateEmbedding } from '@/lib/openai';
import supabase from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, type, limit = 20 } = await request.json();
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

    // Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(query);

    // Build the search query
    let searchQuery = supabase
      .from('knowledge_items')
      .select(`
        *,
        chunks:knowledge_chunks(id, content, chunk_index)
      `)
      .eq('user_id', user.id);

    // Apply type filter if specified
    if (type && type !== 'all') {
      searchQuery = searchQuery.eq('type', type);
    }

    // Execute text search first
    const textSearchQuery = query.toLowerCase();
    searchQuery = searchQuery.or(`
      title.ilike.%${textSearchQuery}%,
      content.ilike.%${textSearchQuery}%,
      summary.ilike.%${textSearchQuery}%
    `);

    const { data: textResults, error: textError } = await searchQuery
      .order('created_at', { ascending: false })
      .limit(limit);

    if (textError) throw textError;

    // Perform semantic search on chunks
    const { data: semanticResults, error: semanticError } = await supabase
      .rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
        user_id: user.id
      });

    if (semanticError) throw semanticError;

    // Combine and deduplicate results
    const combinedResults = new Map();
    
    // Add text search results
    textResults?.forEach(item => {
      combinedResults.set(item.id, {
        ...item,
        search_type: 'text',
        relevance_score: 1.0
      });
    });

    // Add semantic search results with similarity scores
    semanticResults?.forEach((chunk: any) => {
      const existingItem = combinedResults.get(chunk.knowledge_id);
      if (existingItem) {
        // Update with higher relevance score if semantic search found it
        existingItem.relevance_score = Math.max(existingItem.relevance_score, chunk.similarity);
        existingItem.search_type = 'hybrid';
        existingItem.matching_chunk = chunk.content;
      } else {
        // Add new item from semantic search
        combinedResults.set(chunk.knowledge_id, {
          id: chunk.knowledge_id,
          title: chunk.title || 'Untitled',
          content: chunk.content,
          type: chunk.type || 'unknown',
          created_at: chunk.created_at,
          search_type: 'semantic',
          relevance_score: chunk.similarity,
          matching_chunk: chunk.content
        });
      }
    });

    // Convert to array and sort by relevance
    const results = Array.from(combinedResults.values())
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);

    return NextResponse.json({
      results,
      total: results.length,
      query,
      search_types: {
        text: results.filter(r => r.search_type === 'text').length,
        semantic: results.filter(r => r.search_type === 'semantic').length,
        hybrid: results.filter(r => r.search_type === 'hybrid').length
      }
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for search suggestions
export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get search suggestions from titles and tags
    const { data: suggestions, error } = await supabase
      .from('knowledge_items')
      .select('title, tags')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(10);

    if (error) throw error;

    // Extract unique suggestions
    const uniqueSuggestions = new Set<string>();
    
    suggestions?.forEach(item => {
      // Add matching titles
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        uniqueSuggestions.add(item.title);
      }
      
      // Add matching tags
      item.tags?.forEach((tag: string) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          uniqueSuggestions.add(tag);
        }
      });
    });

    return NextResponse.json({
      suggestions: Array.from(uniqueSuggestions).slice(0, 8)
    });

  } catch (error: any) {
    console.error('Suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
