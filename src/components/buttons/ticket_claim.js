const { EmbedBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
  customId: 'ticket_claim',
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) {
      return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    }
    if (ticket.claimedBy) {
      return interaction.reply({ content: `Ticket already claimed by <@${ticket.claimedBy}>.`, flags: MessageFlags.Ephemeral });
    }

    ticket.claimedBy = interaction.user.id;
    ticket.status = 'claimed';
    await ticket.save();

    await interaction.channel.setName(`claim-${ticket.ticketNumber}`);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('Ticket Claimed')
      .setDescription(`Claimed by <@${interaction.user.id}>`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Ticket claimed.', flags: MessageFlags.Ephemeral });
  },
};
