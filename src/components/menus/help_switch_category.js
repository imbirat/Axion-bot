const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_switch_category',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
