import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateEmbeddings, summarizeContent } from '@/lib/openai';
import { chunkText } from '@/lib/utils';
import supabase from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, tags } = await request.json();
    if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 });

    const summary = await summarizeContent(content, title);

    const { data: item, error } = await supabase
      .from('knowledge_items')
      .insert({ user_id: user.id, title, content, type: 'note', summary, tags: tags ?? [] })
      .select()
      .single();
    if (error) throw error;

    const chunks = chunkText(content);
    const embeddings = await generateEmbeddings(chunks.slice(0, 50));
    const chunkRows = chunks.slice(0, 50).map((c, i) => ({
      knowledge_id: item.id,
      user_id: user.id,
      content: c,
      embedding: embeddings[i],
      chunk_index: i,
    }));
    await supabase.from('knowledge_chunks').insert(chunkRows);
    await supabase.from('knowledge_items').update({ chunk_count: chunkRows.length }).eq('id', item.id);

    return NextResponse.json({ id: item.id, title, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to save note' }, { status: 500 });
  }
}
