const { helpCategories } = require('../../utils/helpData');
const {
  buildCategoryEmbed, buildCategoryComponents
} = require('../helpers/helpViews');

module.exports = {
  customId: 'help_sort_toggle',
  async execute(interaction, client) {
    try {
      if (!client.helpSessions) client.helpSessions = new Map();
      const session = client.helpSessions.get(interaction.user.id);
      if (!session || !session.category) {
        return interaction.reply({ content: 'Session expired. Use /help again.', ephemeral: true });
      }

      session.sortAlphabetical = !session.sortAlphabetical;

      const category = helpCategories.find(c => c.name === session.category);
      if (!category) {
        return interaction.reply({ content: 'Category not found.', ephemeral: true });
      }

      const commands = session.sortAlphabetical
        ? [...category.commands].sort((a, b) => a.name.localeCompare(b.name))
        : category.commands;

      const embed = buildCategoryEmbed(category, commands, session.categoryPage);
      const components = buildCategoryComponents(category, commands, session);

      await interaction.update({ embeds: [embed], components });
    } catch (error) {
      console.error('help_sort_toggle error:', error);
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
};
