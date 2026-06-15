const cron = require('node-cron');
const ServerStats = require('../models/ServerStats');

function startStatsChannelService(client) {
  cron.schedule('*/10 * * * *', async () => {
    const configs = await ServerStats.find({ enabled: true });
    for (const config of configs) {
      const guild = client.guilds.cache.get(config.guildId);
      if (!guild) continue;

      const values = {
        members: guild.memberCount - guild.members.cache.filter(m => m.user.bot).size,
        bots: guild.members.cache.filter(m => m.user.bot).size,
        boosts: guild.premiumSubscriptionCount ?? 0,
        channels: guild.channels.cache.size,
        roles: guild.roles.cache.size,
        online: guild.members.cache.filter(m => m.presence?.status === 'online').size,
      };

      for (const stat of config.stats) {
        const channel = guild.channels.cache.get(stat.channelId);
        if (!channel) continue;
        const newName = stat.template.replace('{count}', values[stat.type] || 0);
        if (channel.name !== newName) {
          await channel.setName(newName).catch(() => {});
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  });
  console.log('[STATS] Service started');
}

module.exports = { startStatsChannelService };
