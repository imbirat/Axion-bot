const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_cat_prev',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
