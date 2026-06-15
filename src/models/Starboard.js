const mongoose = require('mongoose');

const starboardSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: String,
  threshold: { type: Number, default: 3 },
  emoji: { type: String, default: '⭐' },
  enabled: { type: Boolean, default: true },
  entries: [{
    originalMessageId: String,
    starboardMessageId: String,
    channelId: String,
    authorId: String,
    starCount: Number,
  }],
});

module.exports = mongoose.model('Starboard', starboardSchema);
