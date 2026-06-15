const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const Birthday = require('../models/Birthday');
const GuildConfig = require('../models/GuildConfig');

function startBirthdayService(client) {
  cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${month}/${day}`;

    const birthdays = await Birthday.find({ date: dateStr });
    for (const bd of birthdays) {
      const config = await GuildConfig.findOne({ guildId: bd.guildId });
      if (!config?.birthdayChannel) continue;
      const channel = client.channels.cache.get(config.birthdayChannel);
      if (!channel) continue;
      const user = await client.users.fetch(bd.userId).catch(() => null);
      if (!user) continue;
      channel.send({
        content: `🎂 Happy Birthday **${user.username}**! 🎉`,
      });
    }
  });
  console.log('[BIRTHDAY] Service started');
}

module.exports = { startBirthdayService };
