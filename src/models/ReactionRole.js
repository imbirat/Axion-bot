const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  roles: [{
    emoji: { type: String },
    roleId: { type: String },
    label: { type: String }
  }],
  type: { type: String, enum: ['reaction', 'button'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);
