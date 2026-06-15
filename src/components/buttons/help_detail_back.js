const { MessageFlags } = require('discord.js');
const { buildCategoryPage } = require('../helpers/helpViews');
const helpCategories = require('../../utils/helpData');

module.exports = {
  customId: 'help_detail_back',
  async execute(interaction, client) {
    const key = `${interaction.user.id}_${interaction.message.id}`;
    const session = client.helpSessions?.get(key);
    if (!session) {
      return interaction.reply({ content: 'Session expired. Run /help again.', flags: MessageFlags.Ephemeral });
    }
    await interaction.deferUpdate();
    const cat = helpCategories.find(c => c.name === session.categoryName);
    await interaction.editReply(buildCategoryPage(cat, session.page, session.sorted));
  },
};
