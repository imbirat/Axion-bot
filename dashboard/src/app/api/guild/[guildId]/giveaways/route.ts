import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Giveaway from '@/lib/models/Giveaway';
import { sendDiscordMessage } from '@/lib/discord';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const giveaways = await Giveaway.find({ guildId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(giveaways);
});

export const POST = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  const endsAt = new Date(Date.now() + parseDuration(body.duration));
  await dbConnect();
  const msg = await sendDiscordMessage(body.channelId, {
    embeds: [{
      title: '🎉 Giveaway',
      description: `**Prize:** ${body.prize}\n**Winners:** ${body.winners}\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>`,
      color: 0x3B82F6,
    }],
  });
  const giveaway = await Giveaway.create({
    guildId,
    channelId: body.channelId,
    messageId: msg.id,
    prize: body.prize,
    winners: body.winners || 1,
    endsAt,
    hostedBy: req.auth.user.name || undefined,
    roleRequirement: body.roleRequirement,
    inviteRequirement: body.inviteRequirement,
  });
  return NextResponse.json(giveaway, { status: 201 });
});

function parseDuration(str: string): number {
  const match = str.match(/^(\d+)([mhd])$/);
  if (!match) return 3600000;
  const num = parseInt(match[1]);
  if (match[2] === 'm') return num * 60000;
  if (match[2] === 'h') return num * 3600000;
  if (match[2] === 'd') return num * 86400000;
  return 3600000;
}
