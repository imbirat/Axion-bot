import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ReactionRole from '@/lib/models/ReactionRole';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const panels = await ReactionRole.find({ guildId }).lean();
  return NextResponse.json(panels);
});

export const POST = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  await dbConnect();
  const panel = await ReactionRole.create({ guildId, ...body });
  return NextResponse.json(panel, { status: 201 });
});

export const DELETE = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await dbConnect();
  await ReactionRole.findOneAndDelete({ _id: id, guildId });
  return NextResponse.json({ success: true });
});
