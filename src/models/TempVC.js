const mongoose = require('mongoose');

const tempVCSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  joinChannelId: { type: String, required: true },
  categoryId: String,
  nameTemplate: { type: String, default: "{user}'s VC" },
  userLimit: { type: Number, default: 0 },
  activeChannels: [{
    channelId: String,
    ownerId: String,
    createdAt: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('TempVC', tempVCSchema);
