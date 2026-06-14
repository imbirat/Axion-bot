const mongoose = require('mongoose');

const serverStatsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  categoryId: { type: String },
  stats: [{
    type: { type: String, enum: ['members', 'bots', 'boosts', 'channels', 'roles', 'online'] },
    channelId: { type: String },
    template: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServerStats', serverStatsSchema);
