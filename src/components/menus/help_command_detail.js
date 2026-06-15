const helpCategories = require('../../utils/helpData');
const { buildCommandDetail } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_command_detail',
  async execute(interaction, client) {
    const sessionKey = `${interaction.user.id}_${interaction.message.id}`;
    const session = client.helpSessions.get(sessionKey);
    if (!session?.categoryName) return interaction.deferUpdate();

    const cmdName = interaction.values[0];
    const cat = helpCategories.find(c => c.name === session.categoryName);
    if (!cat) return interaction.deferUpdate();
    const cmd = cat.commands.find(c => c.name === cmdName);
    if (!cmd) return interaction.deferUpdate();

    await interaction.deferUpdate();
    await interaction.editReply(buildCommandDetail(cat, cmd));
  },
};
