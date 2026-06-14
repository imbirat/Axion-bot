const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  type: { type: String, enum: ['youtube', 'twitch'], required: true },
  targetId: { type: String, required: true },
  message: { type: String },
  lastChecked: { type: Date },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
