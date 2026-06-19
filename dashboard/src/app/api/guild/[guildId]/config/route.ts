import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GuildConfig from '@/lib/models/GuildConfig';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const config = await GuildConfig.findOne({ guildId }).lean();
  return NextResponse.json(config || { guildId });
});

export const PATCH = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  await dbConnect();
  const config = await GuildConfig.findOneAndUpdate(
    { guildId },
    { $set: body },
    { upsert: true, new: true }
  ).lean();
  return NextResponse.json(config);
});
