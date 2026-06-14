const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  message: { type: String, required: true },
  isEmbed: { type: Boolean, default: false },
  embedData: { type: mongoose.Schema.Types.Mixed },
  scheduledFor: { type: Date, required: true },
  createdBy: { type: String },
  sent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);
