const { EmbedBuilder } = require('discord.js');
const BumpReminder = require('../models/BumpReminder');

const activeTimers = new Map();

async function recordBump(guildId, client) {
  try {
    const config = await BumpReminder.findOne({ guildId });
    if (!config) return;

    config.lastBumpAt = new Date();
    await config.save();

    cancelReminder(guildId);

    const timer = setTimeout(async () => {
      try {
        const channel = client.channels.cache.get(config.channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🔔 Bump Reminder')
          .setDescription('It has been 2 hours since the last bump! Please use `/bump` to support the server.')
          .setTimestamp();

        const content = config.pingRoleId ? `<@&${config.pingRoleId}>` : '';
        await channel.send({ content, embeds: [embed] });
      } catch (err) {
        console.error('Bump reminder send error:', err);
      }
      activeTimers.delete(guildId);
    }, 2 * 60 * 60 * 1000);

    activeTimers.set(guildId, timer);
  } catch (error) {
    console.error('recordBump error:', error);
    throw error;
  }
}

function cancelReminder(guildId) {
  const timer = activeTimers.get(guildId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(guildId);
  }
}

async function getStatus(guildId) {
  try {
    const config = await BumpReminder.findOne({ guildId });
    return config ? config.lastBumpAt : null;
  } catch (error) {
    console.error('getStatus error:', error);
    throw error;
  }
}

module.exports = { recordBump, cancelReminder, getStatus };
