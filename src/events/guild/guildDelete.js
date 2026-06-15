const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildDelete,

  async execute(guild, client) {
    console.log(`[GUILD] Left guild: ${guild.name} (${guild.id})`);
  },
};
