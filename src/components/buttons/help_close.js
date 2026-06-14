const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_close',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
