const { helpCategories } = require('../../utils/helpData');
const { buildMainEmbed, buildMainComponents } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_main_next',
  async execute(interaction, client) {
    try {
      if (!client.helpSessions) client.helpSessions = new Map();
      const session = client.helpSessions.get(interaction.user.id);
      if (!session) {
        return interaction.reply({ content: 'Session expired. Use /help again.', ephemeral: true });
      }

      const totalPages = Math.ceil(helpCategories.length / 6);
      session.mainPage = Math.min(session.mainPage + 1, totalPages - 1);

      const embed = buildMainEmbed(helpCategories, session.mainPage);
      const components = buildMainComponents(helpCategories, session.mainPage, session);

      await interaction.update({ embeds: [embed], components });
    } catch (error) {
      console.error('help_main_next error:', error);
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
};
