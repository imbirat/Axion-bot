import mongoose, { Schema, Document } from 'mongoose';

export interface IReactionRole extends Document {
  guildId: string;
  messageId: string;
  channelId: string;
  roles: { emoji: string; roleId: string; label: string }[];
  type: 'reaction' | 'button';
}

const schema = new Schema<IReactionRole>({
  guildId: { type: String, required: true },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  roles: [{ emoji: String, roleId: String, label: String }],
  type: { type: String, enum: ['reaction', 'button'], required: true },
});

export default mongoose.models.ReactionRole || mongoose.model<IReactionRole>('ReactionRole', schema);
