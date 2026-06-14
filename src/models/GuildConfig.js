const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: [String], default: ['.', '/'] },
  welcomeChannel: { type: String },
  farewellChannel: { type: String },
  boosterChannel: { type: String },
  levelingChannel: { type: String },
  welcomeMessage: { type: String },
  farewellMessage: { type: String },
  boosterMessage: { type: String },
  welcomeEmbed: { type: Boolean, default: false },
  farewellEmbed: { type: Boolean, default: false },
  boosterEmbed: { type: Boolean, default: false },
  loggingChannel: { type: String },
  loggingEnabled: { type: Boolean, default: false },
  automodEnabled: { type: Boolean, default: false },
  antinukeEnabled: { type: Boolean, default: false },
  verifyChannel: { type: String },
  verifyRole: { type: String },
  verifyLogChannel: { type: String },
  verifyMode: { type: String, enum: ['button', 'captcha', 'reaction'], default: 'button' },
  verifyMessage: { type: String, default: 'Click the button below to verify yourself.' },
  verifyEnabled: { type: Boolean, default: false },
  jailRole: { type: String },
  muteRole: { type: String },
  ticketChannel: { type: String },
  ticketCategory: { type: String },
  ticketSupportRole: { type: String },
  ticketLogChannel: { type: String },
  ticketCount: { type: Number, default: 0 },
  ticketBlacklist: [{ type: String }],
  reportChannel: { type: String },
  language: { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
