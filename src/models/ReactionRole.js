const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  roles: [{ emoji: String, roleId: String, label: String }],
  type: { type: String, enum: ['reaction', 'button'], required: true },
});

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);
