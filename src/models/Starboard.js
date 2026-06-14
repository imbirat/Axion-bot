const mongoose = require('mongoose');

const starboardSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String },
  threshold: { type: Number, default: 3 },
  emoji: { type: String, default: '⭐' },
  enabled: { type: Boolean, default: true },
  entries: [{
    originalMessageId: { type: String },
    starboardMessageId: { type: String },
    channelId: { type: String },
    authorId: { type: String },
    starCount: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Starboard', starboardSchema);
