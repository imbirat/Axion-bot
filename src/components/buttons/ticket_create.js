const { createTicket } = require('../../services/ticketService');

module.exports = {
  customId: 'ticket_create',
  async execute(interaction, client) {
    try {
      const result = await createTicket(interaction);
      if (result.error) {
        return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
      }

      await interaction.reply({ content: `✅ Ticket created! ${result.channel}`, ephemeral: true });
    } catch (error) {
      console.error('ticket_create error:', error);
      await interaction.reply({ content: '❌ Failed to create ticket.', ephemeral: true });
    }
  }
};
