import { auth } from '@/lib/auth';
import { getGuildChannels } from '@/lib/discord';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  try {
    const channels = await getGuildChannels(guildId);
    const textChannels = channels.filter((c: any) => [0, 5, 15].includes(c.type));
    return NextResponse.json(textChannels.map((c: any) => ({ id: c.id, name: c.name, type: c.type })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
});
