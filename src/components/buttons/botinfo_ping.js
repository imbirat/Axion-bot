const { MessageFlags } = require('discord.js');

module.exports = {
  customId: 'botinfo_ping',
  async execute(interaction, client) {
    const ping = Math.round(client.ws.ping);
    await interaction.reply({ content: `🏓 Pong! WebSocket ping: ${ping}ms`, flags: MessageFlags.Ephemeral });
  },
};
