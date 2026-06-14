const { PermissionsBitField, EmbedBuilder , MessageFlags} = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
  customId: 'ticket_reopen',
  async execute(interaction, client) {
    try {
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) {
        return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
      }
      if (ticket.status !== 'closed') {
        return interaction.reply({ content: 'Ticket is not closed.', flags: MessageFlags.Ephemeral });
      }

      ticket.status = 'open';
      ticket.closedAt = null;
      await ticket.save();

      const channelName = `ticket-${ticket.ticketNumber}`;
      await interaction.channel.setName(channelName);

      await interaction.channel.permissionOverwrites.create(ticket.userId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true,
        EmbedLinks: true,
      });

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Ticket Reopened')
        .setDescription(`This ticket has been reopened by <@${interaction.user.id}>.`)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Ticket reopened.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('ticket_reopen error:', error);
      await interaction.reply({ content: 'Failed to reopen ticket.', flags: MessageFlags.Ephemeral });
    }
  }
};
