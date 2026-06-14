const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketstats')
    .setDescription('Show ticket statistics for the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  usage: '/ticketstats',
  description: 'Display total, open, closed tickets and average resolution time',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const tickets = await Ticket.find({ guildId: interaction.guild.id });
      const total = tickets.length;
      const open = tickets.filter(t => t.status === 'open' || t.status === 'claimed').length;
      const closed = tickets.filter(t => t.status === 'closed').length;

      let avgResolution = 0;
      const closedTickets = tickets.filter(t => t.status === 'closed' && t.closedAt);
      if (closedTickets.length > 0) {
        const totalMs = closedTickets.reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0);
        avgResolution = Math.floor(totalMs / closedTickets.length / 1000);
      }

      const hours = Math.floor(avgResolution / 3600);
      const minutes = Math.floor((avgResolution % 3600) / 60);
      const avgStr = avgResolution > 0 ? `${hours}h ${minutes}m` : 'N/A';

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Ticket Statistics')
        .addFields(
          { name: 'Total Tickets', value: String(total), inline: true },
          { name: 'Open', value: String(open), inline: true },
          { name: 'Closed', value: String(closed), inline: true },
          { name: 'Avg Resolution Time', value: avgStr, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('ticketstats error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const tickets = await Ticket.find({ guildId: message.guild.id });
      const total = tickets.length;
      const open = tickets.filter(t => t.status === 'open' || t.status === 'claimed').length;
      const closed = tickets.filter(t => t.status === 'closed').length;

      let avgResolution = 0;
      const closedTickets = tickets.filter(t => t.status === 'closed' && t.closedAt);
      if (closedTickets.length > 0) {
        const totalMs = closedTickets.reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0);
        avgResolution = Math.floor(totalMs / closedTickets.length / 1000);
      }

      const hours = Math.floor(avgResolution / 3600);
      const minutes = Math.floor((avgResolution % 3600) / 60);
      const avgStr = avgResolution > 0 ? `${hours}h ${minutes}m` : 'N/A';

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Ticket Statistics')
        .addFields(
          { name: 'Total Tickets', value: String(total), inline: true },
          { name: 'Open', value: String(open), inline: true },
          { name: 'Closed', value: String(closed), inline: true },
          { name: 'Avg Resolution Time', value: avgStr, inline: false }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('ticketstats prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
