import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateWeeklySummary } from '@/lib/openai';
import supabase from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data: items } = await supabase
      .from('knowledge_items')
      .select('title, summary, type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: false });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No knowledge items found for this week. Add some content first!' }, { status: 400 });
    }

    const { summary, topics } = await generateWeeklySummary(
      items.map((i) => ({ title: i.title, summary: i.summary ?? i.title, type: i.type }))
    );

    const { data: summaryRecord, error } = await supabase
      .from('weekly_summaries')
      .upsert({
        user_id: user.id,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        summary,
        topics,
        item_count: items.length,
      }, { onConflict: 'user_id,week_start' })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(summaryRecord);
  } catch (err: any) {
    console.error('Summary error:', err);
    return NextResponse.json({ error: err.message ?? 'Summary generation failed' }, { status: 500 });
  }
}
