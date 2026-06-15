const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  message: String,
  isEmbed: { type: Boolean, default: false },
  embedData: mongoose.Schema.Types.Mixed,
  scheduledFor: { type: Date, required: true },
  createdBy: String,
  sent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);
