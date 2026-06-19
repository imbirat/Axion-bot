import { auth } from '@/lib/auth';
import { getGuild, getUserGuilds } from '@/lib/discord';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const accessToken = req.auth.user?.accessToken;
  if (!accessToken) return NextResponse.json({ error: 'No access token' }, { status: 401 });

  try {
    const userGuilds = await getUserGuilds(accessToken);
    const canManage = userGuilds.some(
      (g: any) => g.id === guildId && (g.owner || (BigInt(g.permissions) & BigInt(0x20)) !== BigInt(0))
    );
    if (!canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const guild = await getGuild(guildId);
    return NextResponse.json(guild);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
