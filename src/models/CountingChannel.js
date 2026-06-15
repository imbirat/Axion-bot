const mongoose = require('mongoose');

const countingChannelSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  currentCount: { type: Number, default: 0 },
  record: { type: Number, default: 0 },
  lastUserId: String,
  lastBrokeBy: String,
  enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('CountingChannel', countingChannelSchema);
