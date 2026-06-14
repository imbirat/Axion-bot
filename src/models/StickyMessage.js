const mongoose = require('mongoose');

const stickyMessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  lastMessageId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StickyMessage', stickyMessageSchema);
