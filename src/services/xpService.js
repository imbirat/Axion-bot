const UserProfile = require('../models/UserProfile');

const voiceXpTimers = new Map();

function addVoiceXp(userId, guildId) {
  if (voiceXpTimers.has(`${userId}_${guildId}`)) return;
  voiceXpTimers.set(`${userId}_${guildId}`, true);
  const interval = setInterval(async () => {
    try {
      await UserProfile.findOneAndUpdate(
        { userId, guildId },
        { $inc: { xp: 2, voiceXp: 1 } },
        { upsert: true }
      );
    } catch (_) {}
  }, 60000);

  setTimeout(() => {
    clearInterval(interval);
    voiceXpTimers.delete(`${userId}_${guildId}`);
  }, 1800000);
}

module.exports = { addVoiceXp };
