const { Events, ActivityType } = require('discord.js');
const { registerSlashCommands } = require('../../handlers/commandHandler');
const { startBirthdayService } = require('../../services/birthdayService');
const { startGiveawayService } = require('../../services/giveawayService');
const { startStatsChannelService } = require('../../services/statsChannelService');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`[READY] Logged in as ${client.user.tag}`);

    client.user.setActivity('/help | Axion', { type: ActivityType.Playing });

    await registerSlashCommands(client);

    startBirthdayService(client);
    startGiveawayService(client);
    startStatsChannelService(client);

    console.log(`[READY] Serving ${client.guilds.cache.size} guilds`);
  },
};
