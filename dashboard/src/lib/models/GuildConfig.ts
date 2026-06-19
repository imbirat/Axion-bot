import mongoose, { Schema, Document } from 'mongoose';

export interface IGuildConfig extends Document {
  guildId: string;
  prefix: string[];
  welcomeChannel?: string;
  farewellChannel?: string;
  boosterChannel?: string;
  levelingChannel?: string;
  welcomeMessage: string;
  farewellMessage: string;
  boosterMessage: string;
  welcomeEmbed: boolean;
  farewellEmbed: boolean;
  boosterEmbed: boolean;
  welcomeEmbedTitle?: string;
  welcomeEmbedFooter?: boolean;
  welcomeEmbedThumbnail?: boolean;
  farewellEmbedTitle?: string;
  farewellEmbedFooter?: boolean;
  boosterEmbedTitle?: string;
  loggingChannel?: string;
  loggingEnabled: boolean;
  automodEnabled: boolean;
  inviteEnabled: boolean;
  capsEnabled: boolean;
  spamEnabled: boolean;
  badWordEnabled: boolean;
  badWords: string[];
  capThreshold: number;
  spamThreshold: number;
  spamInterval: number;
  automodAction: 'warn' | 'mute' | 'kick' | 'none';
  automodWhitelist: string[];
  antinukeEnabled: boolean;
  antinukeAction: 'ban' | 'kick' | 'none';
  antinukeLogChannel?: string;
  antinukeWhitelist: string[];
  verifyChannel?: string;
  verifyRole?: string;
  verifyLogChannel?: string;
  verifyMode: 'button' | 'captcha' | 'reaction';
  verifyMessage: string;
  verifyEnabled: boolean;
  jailRole?: string;
  muteRole?: string;
  ticketChannel?: string;
  ticketCategory?: string;
  ticketSupportRole?: string;
  ticketLogChannel?: string;
  ticketCount: number;
  ticketBlacklist: string[];
  language: string;
  birthdayChannel?: string;
  aiChannel?: string;
  confessChannel?: string;
  autoRoles?: string[];
}

const schema = new Schema<IGuildConfig>(
  {
    guildId: { type: String, required: true, unique: true },
    prefix: { type: [String], default: ['.', '/'] },
    welcomeChannel: String,
    farewellChannel: String,
    boosterChannel: String,
    levelingChannel: String,
    welcomeMessage: { type: String, default: 'Welcome {user} to {server}!' },
    farewellMessage: { type: String, default: 'Goodbye {user}!' },
    boosterMessage: { type: String, default: 'Thank you {user} for boosting {server}!' },
    welcomeEmbed: { type: Boolean, default: false },
    farewellEmbed: { type: Boolean, default: false },
    boosterEmbed: { type: Boolean, default: false },
    welcomeEmbedTitle: String,
    welcomeEmbedFooter: Boolean,
    welcomeEmbedThumbnail: Boolean,
    farewellEmbedTitle: String,
    farewellEmbedFooter: Boolean,
    boosterEmbedTitle: String,
    loggingChannel: String,
    loggingEnabled: { type: Boolean, default: false },
    automodEnabled: { type: Boolean, default: false },
    inviteEnabled: { type: Boolean, default: true },
    capsEnabled: { type: Boolean, default: true },
    spamEnabled: { type: Boolean, default: true },
    badWordEnabled: { type: Boolean, default: true },
    badWords: [String],
    capThreshold: { type: Number, default: 50 },
    spamThreshold: { type: Number, default: 5 },
    spamInterval: { type: Number, default: 5000 },
    automodAction: { type: String, enum: ['warn', 'mute', 'kick', 'none'], default: 'warn' },
    automodWhitelist: [String],
    antinukeEnabled: { type: Boolean, default: false },
    antinukeAction: { type: String, enum: ['ban', 'kick', 'none'], default: 'ban' },
    antinukeLogChannel: String,
    antinukeWhitelist: [String],
    verifyChannel: String,
    verifyRole: String,
    verifyLogChannel: String,
    verifyMode: { type: String, enum: ['button', 'captcha', 'reaction'], default: 'button' },
    verifyMessage: { type: String, default: 'Click the button below to verify yourself.' },
    verifyEnabled: { type: Boolean, default: false },
    jailRole: String,
    muteRole: String,
    ticketChannel: String,
    ticketCategory: String,
    ticketSupportRole: String,
    ticketLogChannel: String,
    ticketCount: { type: Number, default: 0 },
    ticketBlacklist: [String],
    language: { type: String, default: 'en' },
    birthdayChannel: String,
    aiChannel: String,
    confessChannel: String,
    autoRoles: [String],
  },
  { collection: 'guildconfigs' }
);

export default mongoose.models.GuildConfig || mongoose.model<IGuildConfig>('GuildConfig', schema);
