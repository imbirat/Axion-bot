const { EmbedBuilder } = require('discord.js');
const { claimTicket } = require('../../services/ticketService');

module.exports = {
  customId: 'ticket_claim',
  async execute(interaction, client) {
    try {
      const result = await claimTicket(interaction);
      if (result.error) {
        return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Ticket Claimed')
        .setDescription(`This ticket has been claimed by <@${interaction.user.id}>.`)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Claimed', ephemeral: true });
    } catch (error) {
      console.error('ticket_claim error:', error);
      await interaction.reply({ content: 'Failed to claim ticket.', ephemeral: true });
    }
  }
};
