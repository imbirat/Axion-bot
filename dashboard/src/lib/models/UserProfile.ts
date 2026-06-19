import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  balance: number;
  bank: number;
  warns: { reason: string; moderator: string; date: Date }[];
  jailed: boolean;
  muted: boolean;
  voiceXp: number;
  totalMessages: number;
  joinDate: Date;
}

const schema = new Schema<IUserProfile>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  warns: [{ reason: String, moderator: String, date: Date }],
  jailed: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  voiceXp: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
});

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', schema);
