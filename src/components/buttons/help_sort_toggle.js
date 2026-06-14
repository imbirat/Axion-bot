const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_sort_toggle',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
