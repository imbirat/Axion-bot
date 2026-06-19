import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  guildId: string;
  channelId: string;
  type: 'youtube' | 'twitch';
  targetId: string;
  message?: string;
  enabled: boolean;
}

const schema = new Schema<INotification>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  type: { type: String, enum: ['youtube', 'twitch'], required: true },
  targetId: { type: String, required: true },
  message: String,
  enabled: { type: Boolean, default: true },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', schema);
