const mongoose = require('mongoose');

const countingChannelSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  currentCount: { type: Number, default: 0 },
  record: { type: Number, default: 0 },
  lastUserId: { type: String },
  lastBrokeBy: { type: String },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CountingChannel', countingChannelSchema);
