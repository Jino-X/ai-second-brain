export async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function fetchUrlContent(url: string): Promise<{ title: string; content: string }> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Second-Brain/1.0)' },
  });
  const html = await response.text();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? url;

  const content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, content: content.slice(0, 50000) };
}

export async function fetchGitHubRepo(
  owner: string,
  repo: string,
  token?: string
): Promise<{ files: { path: string; content: string }[]; description: string; language: string }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) headers['Authorization'] = `token ${token}`;

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.status}`);
  const repoData = await repoRes.json();

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );
  if (!treeRes.ok) throw new Error('Could not fetch repo tree');
  const treeData = await treeRes.json();

  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.md', '.txt'];
  const relevantFiles = (treeData.tree ?? [])
    .filter((f: any) => f.type === 'blob' && codeExtensions.some((ext) => f.path.endsWith(ext)))
    .slice(0, 50);

  const files: { path: string; content: string }[] = [];
  for (const file of relevantFiles) {
    try {
      const fileRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        { headers }
      );
      if (!fileRes.ok) continue;
      const fileData = await fileRes.json();
      if (fileData.encoding === 'base64' && fileData.content) {
        const content = Buffer.from(fileData.content.replace(/\n/g, ''), 'base64').toString('utf-8');
        files.push({ path: file.path, content: content.slice(0, 5000) });
      }
    } catch {
      continue;
    }
  }

  return {
    files,
    description: repoData.description ?? '',
    language: repoData.language ?? '',
  };
}
