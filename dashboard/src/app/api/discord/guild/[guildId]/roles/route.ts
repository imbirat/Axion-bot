import { auth } from '@/lib/auth';
import { getGuildRoles } from '@/lib/discord';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  try {
    const roles = await getGuildRoles(guildId);
    return NextResponse.json(roles.map((r: any) => ({ id: r.id, name: r.name, color: r.color })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
});
