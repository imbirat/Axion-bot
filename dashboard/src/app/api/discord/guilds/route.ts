import { auth } from '@/lib/auth';
import { getUserGuilds, hasManageServer } from '@/lib/discord';
import { NextResponse } from 'next/server';

export const GET = auth(async (req) => {
  if (!req.auth?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const guilds = await getUserGuilds(req.auth.user.accessToken);
    const manageable = guilds.filter((g) => hasManageServer(g.permissions));
    return NextResponse.json(manageable);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 });
  }
});
