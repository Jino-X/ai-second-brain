import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateEmbeddings, summarizeContent } from '@/lib/openai';
import { parsePDF, parseDocx } from '@/lib/parsers';
import { chunkText } from '@/lib/utils';
import supabase from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let content = '';
    let type: 'pdf' | 'image' | 'note' = 'note';

    if (fileName.endsWith('.pdf')) {
      content = await parsePDF(buffer);
      type = 'pdf';
    } else if (fileName.endsWith('.docx')) {
      content = await parseDocx(buffer);
      type = 'note';
    } else if (fileName.match(/\.(png|jpg|jpeg|webp|gif)$/)) {
      type = 'image';
      content = `Image file: ${file.name}`;
    } else {
      content = buffer.toString('utf-8');
      type = 'note';
    }

    const title = file.name.replace(/\.[^.]+$/, '');
    const summary = await summarizeContent(content, title);

    const { data: item, error: itemErr } = await supabase
      .from('knowledge_items')
      .insert({ user_id: user.id, title, content: content.slice(0, 100000), type, summary, tags: [] })
      .select()
      .single();
    if (itemErr) throw itemErr;

    if (type !== 'image' && content.trim().length > 0) {
      const chunks = chunkText(content);
      const embeddings = await generateEmbeddings(chunks.slice(0, 100));
      const chunkRows = chunks.slice(0, 100).map((c, i) => ({
        knowledge_id: item.id,
        user_id: user.id,
        content: c,
        embedding: embeddings[i],
        chunk_index: i,
      }));
      await supabase.from('knowledge_chunks').insert(chunkRows);
      await supabase.from('knowledge_items').update({ chunk_count: chunkRows.length }).eq('id', item.id);
    }

    return NextResponse.json({ id: item.id, title, type, summary });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 });
  }
}
