const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { registerSlashCommands } = require('../../handlers/commandHandler');

module.exports = {
  name: Events.GuildCreate,

  async execute(guild, client) {
    // Create guild config if not exists
    await GuildConfig.findOneAndUpdate(
      { guildId: guild.id },
      { $setOnInsert: { guildId: guild.id } },
      { upsert: true }
    );

    // Register slash commands to this guild
    await registerSlashCommands(client, guild.id);

    // DM the owner
    try {
      const owner = await guild.fetchOwner();
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Thanks for adding me!')
        .setDescription(
          'Thanks for adding **Axion** to your server!\n\n' +
          'Type `/help` for all commands.\n' +
          'Type `/botinfo` for bot information.\n' +
          'Join our support server for more info.'
        )
        .setFooter({ text: 'Axion — providing premium features for free' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Support')
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.SUPPORT_SERVER || 'https://discord.gg/5ZGTMY6GRj'),
        new ButtonBuilder()
          .setLabel('Invite Bot')
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.INVITE_URL || 'https://discord.com/oauth2/authorize?client_id=1502623528476737627')
      );

      await owner.send({ embeds: [embed], components: [row] });
    } catch (_) {}
  },
};
