const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String },
  userId: { type: String, required: true },
  ticketNumber: { type: Number, required: true },
  subject: { type: String },
  status: { type: String, enum: ['open', 'closed', 'claimed'], default: 'open' },
  claimedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  transcript: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
