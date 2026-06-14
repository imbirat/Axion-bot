const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String },
  prize: { type: String, required: true },
  winners: { type: Number, required: true },
  endsAt: { type: Date, required: true },
  ended: { type: Boolean, default: false },
  hostedBy: { type: String },
  entries: [{ type: String }],
  roleRequirement: { type: String },
  inviteRequirement: { type: Number },
  bonusEntries: [{
    roleId: { type: String },
    entries: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Giveaway', giveawaySchema);
