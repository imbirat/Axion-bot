const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_detail_back',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
