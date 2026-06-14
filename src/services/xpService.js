const UserProfile = require('../models/UserProfile');

function xpForLevel(level) {
  return level * 100;
}

async function addXp(userId, guildId, amount) {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId, guildId },
      { $inc: { xp: amount } },
      { upsert: true, new: true }
    );

    let leveledUp = false;
    let newLevel = profile.level;

    while (profile.xp >= xpForLevel(newLevel)) {
      profile.xp -= xpForLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    if (leveledUp) {
      profile.level = newLevel;
      await profile.save();
    } else {
      await UserProfile.updateOne(
        { userId, guildId },
        { xp: profile.xp }
      );
    }

    return { leveledUp, newLevel };
  } catch (error) {
    console.error('addXp error:', error);
    throw error;
  }
}

async function removeXp(userId, guildId, amount) {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId, guildId },
      { $inc: { xp: -amount } },
      { upsert: true, new: true }
    );

    if (profile.xp < 0) {
      profile.xp = 0;
      await profile.save();
    }

    return profile;
  } catch (error) {
    console.error('removeXp error:', error);
    throw error;
  }
}

async function getProfile(userId, guildId) {
  try {
    return await UserProfile.findOne({ userId, guildId });
  } catch (error) {
    console.error('getProfile error:', error);
    throw error;
  }
}

async function getLeaderboard(guildId, limit = 10) {
  try {
    return await UserProfile.find({ guildId })
      .sort({ level: -1, xp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('getLeaderboard error:', error);
    throw error;
  }
}

module.exports = { addXp, removeXp, getProfile, getLeaderboard };
