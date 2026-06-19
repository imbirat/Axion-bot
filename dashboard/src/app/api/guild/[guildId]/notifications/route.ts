import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { NextResponse } from 'next/server';

export const GET = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  await dbConnect();
  const notifications = await Notification.find({ guildId }).lean();
  return NextResponse.json(notifications);
});

export const POST = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  await dbConnect();
  const notification = await Notification.create({ guildId, ...body });
  return NextResponse.json(notification, { status: 201 });
});

export const DELETE = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await dbConnect();
  await Notification.findOneAndDelete({ _id: id, guildId });
  return NextResponse.json({ success: true });
});

export const PATCH = auth(async (req, { params }: { params: Promise<{ guildId: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guildId } = await params;
  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await dbConnect();
  const notification = await Notification.findOneAndUpdate({ _id: id, guildId }, { $set: body }, { new: true }).lean();
  return NextResponse.json(notification);
});
