const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  type: { type: String, enum: ['youtube', 'twitch'] },
  targetId: String,
  message: String,
  lastChecked: Date,
  enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('Notification', notificationSchema);
