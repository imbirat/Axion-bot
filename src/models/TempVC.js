const mongoose = require('mongoose');

const tempVcSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  joinChannelId: { type: String, required: true },
  categoryId: { type: String },
  nameTemplate: { type: String, default: "{user}'s VC" },
  userLimit: { type: Number, default: 0 },
  activeChannels: [{
    channelId: { type: String },
    ownerId: { type: String },
    createdAt: { type: Date }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TempVC', tempVcSchema);
