const { helpCategories } = require('../../utils/helpData');
const {
  buildCategoryEmbed, buildCategoryComponents
} = require('../helpers/helpViews');

module.exports = {
  customId: 'help_cat_next',
  async execute(interaction, client) {
    try {
      if (!client.helpSessions) client.helpSessions = new Map();
      const session = client.helpSessions.get(interaction.user.id);
      if (!session) {
        return interaction.reply({ content: 'Session expired. Use /help again.', ephemeral: true });
      }

      const category = helpCategories.find(c => c.name === session.category);
      if (!category) {
        return interaction.reply({ content: 'Category not found.', ephemeral: true });
      }

      const commands = session.sortAlphabetical
        ? [...category.commands].sort((a, b) => a.name.localeCompare(b.name))
        : category.commands;

      const maxPage = Math.ceil(commands.length / 5) - 1;
      session.categoryPage = Math.min(session.categoryPage + 1, maxPage);

      const embed = buildCategoryEmbed(category, commands, session.categoryPage);
      const components = buildCategoryComponents(category, commands, session);

      await interaction.update({ embeds: [embed], components });
    } catch (error) {
      console.error('help_cat_next error:', error);
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
};
