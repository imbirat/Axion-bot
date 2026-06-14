const { helpCategories } = require('../../utils/helpData');
const { buildDetailEmbed, buildDetailComponents } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_command_detail',
  async execute(interaction, client) {
    try {
      if (!client.helpSessions) client.helpSessions = new Map();
      const session = client.helpSessions.get(interaction.user.id);
      if (!session || !session.category) {
        return interaction.reply({ content: 'Session expired. Use /help again.', ephemeral: true });
      }

      const commandName = interaction.values[0];
      const category = helpCategories.find(c => c.name === session.category);
      if (!category) {
        return interaction.reply({ content: 'Category not found.', ephemeral: true });
      }

      const command = category.commands.find(c => c.name === commandName);
      if (!command) {
        return interaction.reply({ content: 'Command not found.', ephemeral: true });
      }

      const embed = buildDetailEmbed(command, category);
      const components = buildDetailComponents();

      await interaction.update({ embeds: [embed], components });
    } catch (error) {
      console.error('help_command_detail error:', error);
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
};
