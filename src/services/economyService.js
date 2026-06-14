const UserProfile = require('../models/UserProfile');

async function getOrCreateProfile(userId, guildId) {
  let profile = await UserProfile.findOne({ userId, guildId });
  if (!profile) {
    profile = await UserProfile.create({ userId, guildId });
  }
  return profile;
}

async function addBalance(userId, guildId, amount) {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId, guildId },
      { $inc: { balance: amount } },
      { upsert: true, new: true }
    );
    return profile;
  } catch (error) {
    console.error('addBalance error:', error);
    throw error;
  }
}

async function removeBalance(userId, guildId, amount) {
  try {
    const profile = await getOrCreateProfile(userId, guildId);
    if (profile.balance < amount) {
      throw new Error('Insufficient balance');
    }
    profile.balance -= amount;
    await profile.save();
    return profile;
  } catch (error) {
    console.error('removeBalance error:', error);
    throw error;
  }
}

async function addBank(userId, guildId, amount) {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId, guildId },
      { $inc: { bank: amount } },
      { upsert: true, new: true }
    );
    return profile;
  } catch (error) {
    console.error('addBank error:', error);
    throw error;
  }
}

async function removeBank(userId, guildId, amount) {
  try {
    const profile = await getOrCreateProfile(userId, guildId);
    if (profile.bank < amount) {
      throw new Error('Insufficient bank balance');
    }
    profile.bank -= amount;
    await profile.save();
    return profile;
  } catch (error) {
    console.error('removeBank error:', error);
    throw error;
  }
}

async function getProfile(userId, guildId) {
  try {
    return await getOrCreateProfile(userId, guildId);
  } catch (error) {
    console.error('getProfile error:', error);
    throw error;
  }
}

async function getLeaderboard(guildId, limit = 10) {
  try {
    const profiles = await UserProfile.find({ guildId }).lean();
    return profiles
      .map(p => ({ ...p, total: p.balance + p.bank }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  } catch (error) {
    console.error('getLeaderboard error:', error);
    throw error;
  }
}

async function transfer(fromUserId, toUserId, guildId, amount) {
  try {
    const from = await getOrCreateProfile(fromUserId, guildId);
    if (from.balance < amount) {
      throw new Error('Insufficient balance');
    }
    const to = await getOrCreateProfile(toUserId, guildId);
    from.balance -= amount;
    to.balance += amount;
    await from.save();
    await to.save();
    return { from: from, to: to };
  } catch (error) {
    console.error('transfer error:', error);
    throw error;
  }
}

module.exports = { addBalance, removeBalance, addBank, removeBank, getProfile, getLeaderboard, transfer };
