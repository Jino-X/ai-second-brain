import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { openai, generateEmbedding } from '@/lib/openai';
import supabase from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, history } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const queryEmbedding = await generateEmbedding(message);

    const { data: chunks } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 6,
      p_user_id: user.id,
    });

    const sources = (chunks ?? []).map((c: any) => ({
      id: c.knowledge_id,
      title: c.knowledge_title ?? 'Unknown',
      type: c.knowledge_type ?? 'note',
      excerpt: c.content.slice(0, 120),
      similarity: c.similarity,
    }));

    const context = (chunks ?? [])
      .map((c: any) => `[${c.knowledge_title ?? 'Source'}]\n${c.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are an AI assistant with access to the user's personal knowledge base. 
Answer questions based on the provided context from their knowledge base.
If the context doesn't contain relevant information, say so honestly.
Be concise, helpful, and cite which sources you're drawing from.

Context from knowledge base:
${context || 'No relevant context found.'}`;

    const chatHistory = (history ?? []).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = response.choices[0].message.content ?? '';

    return NextResponse.json({ answer, sources });
  } catch (err: any) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message ?? 'Chat failed' }, { status: 500 });
  }
}
