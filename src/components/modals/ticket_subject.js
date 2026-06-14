const { createTicket } = require('../../services/ticketService');

module.exports = {
  customId: 'ticket_subject',
  async execute(interaction, client) {
    try {
      const subject = interaction.fields.getTextInputValue('subject');

      interaction.options = {
        getString: () => subject
      };

      const result = await createTicket(interaction);
      if (result.error) {
        return interaction.reply({ content: `❌ ${result.error}`, flags: MessageFlags.Ephemeral });
      }

      await interaction.reply({ content: `✅ Ticket created! ${result.channel}`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('ticket_subject error:', error);
      await interaction.reply({ content: '❌ Failed to create ticket.', flags: MessageFlags.Ephemeral });
    }
  }
};
