const mongoose = require('mongoose');

const bumpReminderSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  pingRoleId: String,
  lastBumpAt: Date,
  enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('BumpReminder', bumpReminderSchema);
