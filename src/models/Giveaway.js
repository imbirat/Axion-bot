const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  prize: { type: String, required: true },
  winners: { type: Number, default: 1 },
  endsAt: { type: Date, required: true },
  ended: { type: Boolean, default: false },
  hostedBy: String,
  entries: [String],
  roleRequirement: String,
  inviteRequirement: Number,
  bonusEntries: [{ roleId: String, entries: Number }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
