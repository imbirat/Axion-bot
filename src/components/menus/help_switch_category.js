const helpCategories = require('../../utils/helpData');
const { buildCategoryPage } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_switch_category',
  async execute(interaction, client) {
    const catName = interaction.values[0];
    const cat = helpCategories.find(c => c.name === catName);
    if (!cat) return interaction.deferUpdate();
    const sessionKey = `${interaction.user.id}_${interaction.message.id}`;
    const session = client.helpSessions.get(sessionKey);
    if (session) {
      session.categoryName = catName;
      session.page = 0;
      session.sorted = false;
    }
    await interaction.deferUpdate();
    await interaction.editReply(buildCategoryPage(cat, 0, false));
  },
};
