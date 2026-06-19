import mongoose, { Schema, Document } from 'mongoose';

export interface IGiveaway extends Document {
  guildId: string;
  channelId: string;
  messageId: string;
  prize: string;
  winners: number;
  endsAt: Date;
  ended: boolean;
  hostedBy?: string;
  entries: string[];
  roleRequirement?: string;
  inviteRequirement?: number;
  createdAt: Date;
}

const schema = new Schema<IGiveaway>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  prize: { type: String, required: true },
  winners: { type: Number, required: true },
  endsAt: { type: Date, required: true },
  ended: { type: Boolean, default: false },
  hostedBy: String,
  entries: [String],
  roleRequirement: String,
  inviteRequirement: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Giveaway || mongoose.model<IGiveaway>('Giveaway', schema);
