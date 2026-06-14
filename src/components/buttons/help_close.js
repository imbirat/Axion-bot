module.exports = {
  customId: 'help_close',
  async execute(interaction, client) {
    try {
      if (client.helpSessions) {
        client.helpSessions.delete(interaction.user.id);
      }
      await interaction.message.delete();
    } catch (error) {
      console.error('help_close error:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Failed to close help menu.', ephemeral: true });
      }
    }
  }
};
