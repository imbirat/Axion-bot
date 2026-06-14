const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_select_category',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
