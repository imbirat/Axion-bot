const mongoose = require('mongoose');

const serverStatsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  categoryId: String,
  stats: [{
    type: { type: String, enum: ['members', 'bots', 'boosts', 'channels', 'roles', 'online'] },
    channelId: String,
    template: String,
  }],
});

module.exports = mongoose.model('ServerStats', serverStatsSchema);
