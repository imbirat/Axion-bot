import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const users = await UserProfile.find({ guildId }).sort({ xp: -1 }).limit(10).lean();
  return NextResponse.json(users);
});
