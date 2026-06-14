const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { deployCommands } = require('../../handlers/commandHandler');
const logger = require('../../utils/logger');

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: guild.id },
        { guildId: guild.id },
        { upsert: true, setDefaultsOnInsert: true }
      );
      logger.info(`Joined guild: ${guild.name} (${guild.id})`);
    } catch (err) {
      logger.error(`Error creating GuildConfig for ${guild.id}:`, err);
    }

    try {
      const owner = await guild.fetchOwner();
      if (owner) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('Thanks for adding me!')
          .setDescription(
            'Thanks for adding me to your server!\n' +
            'Type /help for all commands.\n' +
            'Type /botinfo for bot information.\n' +
            'Join our support server for more info.'
          )
          .setFooter({ text: 'Axion — providing premium features for free' });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.SUPPORT_INVITE || 'https://discord.gg/axion'),
          new ButtonBuilder()
            .setLabel('Invite Bot')
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.BOT_INVITE || `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
        );

        await owner.send({ embeds: [embed], components: [row] }).catch(() => {});
      }
    } catch (err) {
      logger.warn(`Could not DM owner of guild ${guild.id}`);
    }

    try {
      client.commands = client.commands || new (require('discord.js').Collection)();
      await deployCommands(client);
    } catch (err) {
      logger.error(`Error deploying commands for guild ${guild.id}:`, err);
    }
  },
};
