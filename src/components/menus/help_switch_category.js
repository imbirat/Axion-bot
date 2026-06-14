const { helpCategories } = require('../../utils/helpData');
const { buildCategoryEmbed, buildCategoryComponents } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_switch_category',
  async execute(interaction, client) {
    try {
      if (!client.helpSessions) client.helpSessions = new Map();
      const session = client.helpSessions.get(interaction.user.id);
      if (!session) {
        return interaction.reply({ content: 'Session expired. Use /help again.', ephemeral: true });
      }

      const categoryName = interaction.values[0];
      const category = helpCategories.find(c => c.name === categoryName);
      if (!category) {
        return interaction.reply({ content: 'Category not found.', ephemeral: true });
      }

      session.category = categoryName;
      session.categoryPage = 0;

      const commands = session.sortAlphabetical
        ? [...category.commands].sort((a, b) => a.name.localeCompare(b.name))
        : category.commands;

      const embed = buildCategoryEmbed(category, commands, 0);
      const components = buildCategoryComponents(category, commands, session);

      await interaction.update({ embeds: [embed], components });
    } catch (error) {
      console.error('help_switch_category error:', error);
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
};
