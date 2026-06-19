import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  guildId: string;
  channelId: string;
  userId: string;
  ticketNumber: number;
  subject?: string;
  status: 'open' | 'closed' | 'claimed';
  claimedBy?: string;
  createdAt: Date;
  closedAt?: Date;
}

const schema = new Schema<ITicket>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  ticketNumber: { type: Number, required: true },
  subject: String,
  status: { type: String, enum: ['open', 'closed', 'claimed'], default: 'open' },
  claimedBy: String,
  createdAt: { type: Date, default: Date.now },
  closedAt: Date,
});

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', schema);
