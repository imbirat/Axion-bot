import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GuildConfig from '@/lib/models/GuildConfig';
import Ticket from '@/lib/models/Ticket';
import { NextResponse } from 'next/server';

const FIELDS = ['ticketChannel', 'ticketCategory', 'ticketSupportRole', 'ticketLogChannel', 'ticketCount', 'ticketBlacklist'];

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const config = await GuildConfig.findOne({ guildId }).select(FIELDS.join(' ')).lean();
  const tickets = await Ticket.find({ guildId }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ config: config || { guildId }, tickets });
});

export const PATCH = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  const update: Record<string, any> = {};
  for (const key of FIELDS) if (key in body) update[key] = body[key];
  await dbConnect();
  const config = await GuildConfig.findOneAndUpdate({ guildId }, { $set: update }, { upsert: true, new: true }).select(FIELDS.join(' ')).lean();
  return NextResponse.json(config);
});
