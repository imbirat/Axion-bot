const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  text: { type: String, required: true },
  authorId: String,
  authorName: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quote', quoteSchema);
