import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GuildConfig from '@/lib/models/GuildConfig';
import { NextResponse } from 'next/server';

const FIELDS = [
  'automodEnabled', 'inviteEnabled', 'capsEnabled', 'spamEnabled', 'badWordEnabled',
  'badWords', 'capThreshold', 'spamThreshold', 'spamInterval', 'automodAction', 'automodWhitelist',
];

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const config = await GuildConfig.findOne({ guildId }).select(FIELDS.join(' ')).lean();
  return NextResponse.json(config || { guildId });
});

export const PATCH = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  const update: Record<string, any> = {};
  for (const key of FIELDS) {
    if (key in body) update[key] = body[key];
  }
  await dbConnect();
  const config = await GuildConfig.findOneAndUpdate({ guildId }, { $set: update }, { upsert: true, new: true }).select(FIELDS.join(' ')).lean();
  return NextResponse.json(config);
});
