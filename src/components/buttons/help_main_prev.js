const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_main_prev',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
