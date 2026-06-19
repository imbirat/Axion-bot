import { auth } from '@/lib/auth';
import { sendDiscordMessage } from '@/lib/discord';
import { NextResponse } from 'next/server';

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { channelId, content, embed } = body;
  if (!channelId) return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
  try {
    const payload: Record<string, any> = {};
    if (content) payload.content = content;
    if (embed) payload.embeds = [embed];
    const msg = await sendDiscordMessage(channelId, payload);
    return NextResponse.json(msg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
