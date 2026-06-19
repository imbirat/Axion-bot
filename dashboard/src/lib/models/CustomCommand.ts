import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomCommand extends Document {
  guildId: string;
  trigger: string;
  response: string;
  isEmbed: boolean;
}

const schema = new Schema<ICustomCommand>({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true },
  response: { type: String, required: true },
  isEmbed: { type: Boolean, default: false },
});

export default mongoose.models.CustomCommand || mongoose.model<ICustomCommand>('CustomCommand', schema);
