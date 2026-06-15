const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  reportedUserId: { type: String, required: true },
  reporterUserId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  modLogMessageId: String,
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  resolvedBy: String,
});

module.exports = mongoose.model('Report', reportSchema);
