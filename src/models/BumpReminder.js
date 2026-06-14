const mongoose = require('mongoose');

const bumpReminderSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  pingRoleId: { type: String },
  lastBumpAt: { type: Date },
  reminderJobId: { type: String },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BumpReminder', bumpReminderSchema);
