import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GuildConfig from '@/lib/models/GuildConfig';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const config = await GuildConfig.findOne({ guildId }).select('autoRoles').lean() as { autoRoles?: string[] } | null;
  return NextResponse.json(config?.autoRoles || []);
});

export const POST = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const { roleId } = await req.json();
  if (!roleId) return NextResponse.json({ error: 'Missing roleId' }, { status: 400 });
  await dbConnect();
  const config = await GuildConfig.findOneAndUpdate(
    { guildId },
    { $addToSet: { autoRoles: roleId } },
    { upsert: true, new: true }
  ).select('autoRoles').lean() as { autoRoles?: string[] } | null;
  return NextResponse.json(config?.autoRoles || []);
});

export const DELETE = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get('roleId');
  if (!roleId) return NextResponse.json({ error: 'Missing roleId' }, { status: 400 });
  await dbConnect();
  const config = await GuildConfig.findOneAndUpdate(
    { guildId },
    { $pull: { autoRoles: roleId } },
    { new: true }
  ).select('autoRoles').lean() as { autoRoles?: string[] } | null;
  return NextResponse.json(config?.autoRoles || []);
});
