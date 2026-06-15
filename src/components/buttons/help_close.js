const { MessageFlags } = require('discord.js');

module.exports = {
  customId: 'help_close',
  async execute(interaction, client) {
    const key = `${interaction.user.id}_${interaction.message.id}`;
    const session = client.helpSessions?.get(key);
    if (!session) {
      return interaction.reply({ content: 'Session expired. Run /help again.', flags: MessageFlags.Ephemeral });
    }
    client.helpSessions.delete(key);
    await interaction.deleteReply();
  },
};
