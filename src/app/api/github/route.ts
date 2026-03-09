import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateEmbeddings, summarizeContent } from '@/lib/openai';
import { fetchGitHubRepo } from '@/lib/parsers';
import { chunkText } from '@/lib/utils';
import supabase from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { owner, repo } = await request.json();
    if (!owner || !repo) return NextResponse.json({ error: 'owner and repo required' }, { status: 400 });

    const { files, description, language } = await fetchGitHubRepo(owner, repo);
    const repoName = `${owner}/${repo}`;
    const repoUrl = `https://github.com/${owner}/${repo}`;

    const allChunkRows: any[] = [];
    let totalKnowledgeId: string | null = null;

    const combinedContent = files.map((f) => `## ${f.path}\n${f.content}`).join('\n\n');
    const title = `GitHub: ${repoName}`;
    const summary = await summarizeContent(combinedContent.slice(0, 6000), title);

    const { data: item, error: itemErr } = await supabase
      .from('knowledge_items')
      .insert({
        user_id: user.id,
        title,
        content: combinedContent.slice(0, 100000),
        type: 'github',
        source_url: repoUrl,
        summary,
        tags: [language?.toLowerCase(), 'github'].filter(Boolean),
      })
      .select()
      .single();
    if (itemErr) throw itemErr;
    totalKnowledgeId = item.id;

    for (const file of files.slice(0, 30)) {
      const chunks = chunkText(file.content, 400);
      const embeddings = await generateEmbeddings(chunks.slice(0, 10));
      chunks.slice(0, 10).forEach((c, i) => {
        allChunkRows.push({
          knowledge_id: item.id,
          user_id: user.id,
          content: `[${file.path}]\n${c}`,
          embedding: embeddings[i],
          chunk_index: allChunkRows.length + i,
        });
      });
    }

    if (allChunkRows.length > 0) {
      await supabase.from('knowledge_chunks').insert(allChunkRows);
      await supabase.from('knowledge_items').update({ chunk_count: allChunkRows.length }).eq('id', item.id);
    }

    await supabase.from('github_repos').upsert({
      user_id: user.id,
      repo_name: repoName,
      repo_url: repoUrl,
      description,
      language,
      indexed_at: new Date().toISOString(),
      file_count: files.length,
    }, { onConflict: 'user_id,repo_name' });

    return NextResponse.json({ id: totalKnowledgeId, fileCount: files.length, summary });
  } catch (err: any) {
    console.error('GitHub indexing error:', err);
    return NextResponse.json({ error: err.message ?? 'GitHub indexing failed' }, { status: 500 });
  }
}
