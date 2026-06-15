const { MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
  customId: 'ticket_delete',
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) {
      return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ content: 'Deleting ticket channel...', flags: MessageFlags.Ephemeral });
    await Ticket.deleteOne({ channelId: interaction.channel.id });
    await interaction.channel.delete();
  },
};
