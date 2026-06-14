const cron = require('node-cron');
const ServerStats = require('../models/ServerStats');

async function updateStatsChannels(client) {
  try {
    const configs = await ServerStats.find({ enabled: true });

    for (const config of configs) {
      try {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) continue;

        await guild.members.fetch();

        const values = {};
        values.members = guild.members.cache.filter(m => !m.user.bot).size;
        values.bots = guild.members.cache.filter(m => m.user.bot).size;
        values.boosts = guild.premiumSubscriptionCount || 0;
        values.channels = guild.channels.cache.size;
        values.roles = guild.roles.cache.size;
        values.online = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;

        for (let i = 0; i < config.stats.length; i++) {
          const stat = config.stats[i];
          if (!stat.channelId) continue;

          const channel = guild.channels.cache.get(stat.channelId);
          if (!channel) continue;

          const statValue = values[stat.type] ?? 0;
          const newName = (stat.template || `{type}: {count}`)
            .replace('{type}', stat.type)
            .replace('{count}', String(statValue))
            .replace('{value}', String(statValue));

          if (channel.name !== newName) {
            await channel.setName(newName);

            if (i < config.stats.length - 1) {
              await delay(2000);
            }
          }
        }
      } catch (err) {
        console.error(`Stats channel update error for guild ${config.guildId}:`, err);
      }
    }
  } catch (error) {
    console.error('updateStatsChannels error:', error);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startCron(client) {
  cron.schedule('*/5 * * * *', () => {
    updateStatsChannels(client).catch(() => {});
  });
  console.log('[StatsChannel] Cron started (every 5 minutes)');
}

module.exports = { updateStatsChannels, startCron };
