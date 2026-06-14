const { handleHelpInteraction } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_command_detail',
  async execute(interaction, client) {
    await handleHelpInteraction(interaction);
  },
};
