const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  ticketNumber: { type: Number, required: true },
  subject: String,
  status: { type: String, enum: ['open', 'closed', 'claimed'], default: 'open' },
  claimedBy: String,
  createdAt: { type: Date, default: Date.now },
  closedAt: Date,
  transcript: String,
});

module.exports = mongoose.model('Ticket', ticketSchema);
