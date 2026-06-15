const mongoose = require('mongoose');

const stickyMessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  lastMessageId: String,
  color: { type: String, default: '#5865F2' },
  embed: { type: Boolean, default: false },
});

module.exports = mongoose.model('StickyMessage', stickyMessageSchema);
