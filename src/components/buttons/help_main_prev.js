const { MessageFlags } = require('discord.js');
const { buildMainPage } = require('../helpers/helpViews');

module.exports = {
  customId: 'help_main_prev',
  async execute(interaction, client) {
    const key = `${interaction.user.id}_${interaction.message.id}`;
    const session = client.helpSessions?.get(key);
    if (!session) {
      return interaction.reply({ content: 'Session expired. Run /help again.', flags: MessageFlags.Ephemeral });
    }
    await interaction.deferUpdate();
    session.mainPage = (session.mainPage ?? 0) - 1;
    await interaction.editReply(buildMainPage(client, interaction.guild, session.mainPage));
  },
};
