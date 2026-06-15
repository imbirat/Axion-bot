const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  date: { type: String, required: true },
  year: Number,
  createdAt: { type: Date, default: Date.now },
});

birthdaySchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Birthday', birthdaySchema);
