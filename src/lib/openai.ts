import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? 'placeholder' });
  }
  return _openai;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  },
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map((t) => t.slice(0, 8000)),
  });
  return response.data.map((d) => d.embedding);
}

export async function summarizeContent(content: string, title: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a concise summarizer. Summarize the given content in 2-3 sentences, focusing on the key insights and takeaways.',
      },
      {
        role: 'user',
        content: `Title: ${title}\n\nContent:\n${content.slice(0, 6000)}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.3,
  });
  return response.choices[0].message.content ?? '';
}

export async function generateWeeklySummary(items: { title: string; summary: string; type: string }[]): Promise<{ summary: string; topics: string[] }> {
  const itemsText = items.map((i) => `- [${i.type}] ${i.title}: ${i.summary}`).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a personal learning coach. Generate a weekly learning summary from the provided knowledge items. 
Return a JSON object with:
- summary: A narrative paragraph highlighting key themes, insights, and growth
- topics: An array of 3-7 topic strings that were covered this week`,
      },
      {
        role: 'user',
        content: `Here are my knowledge items from this week:\n${itemsText}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content ?? '{}');
  return {
    summary: result.summary ?? '',
    topics: result.topics ?? [],
  };
}
