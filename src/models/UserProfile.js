const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  lastDaily: Date,
  lastWork: Date,
  lastFish: Date,
  afk: { type: Boolean, default: false },
  afkReason: String,
  afkSince: Date,
  warns: [{ reason: String, moderator: String, date: { type: Date, default: Date.now } }],
  jailed: { type: Boolean, default: false },
  roles: [String],
  muted: { type: Boolean, default: false },
  voiceXp: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
});

userProfileSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
