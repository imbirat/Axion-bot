const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  lastDaily: { type: Date },
  lastWork: { type: Date },
  lastFish: { type: Date },
  lastRob: { type: Date },
  afk: { type: Boolean, default: false },
  afkReason: { type: String },
  afkSince: { type: Date },
  warns: [{
    reason: { type: String },
    moderator: { type: String },
    date: { type: Date }
  }],
  previousRoles: [{ type: String }],
  jailed: { type: Boolean, default: false },
  muted: { type: Boolean, default: false }
}, { timestamps: true });

userProfileSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
