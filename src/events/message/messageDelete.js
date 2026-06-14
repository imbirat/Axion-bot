const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const snipeCache = require('../../utils/snipeCache');
const logger = require('../../utils/logger');

module.exports = {
  name: Events.MessageDelete,
  once: false,
  async execute(message) {
    if (!message.guild) return;
    if (message.author?.bot) return;

    snipeCache.set(message.channel.id, {
      content: message.content,
      author: message.author,
      createdAt: message.createdAt,
      attachments: [...message.attachments.values()],
    });

    try {
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!config || !config.loggingEnabled || !config.loggingChannel) return;

      const logChannel = message.guild.channels.cache.get(config.loggingChannel);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('Message Deleted')
        .setDescription(`Message by ${message.author} deleted in ${message.channel}`)
        .addFields(
          { name: 'Channel', value: `${message.channel}`, inline: true },
          { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true }
        )
        .setFooter({ text: `Message ID: ${message.id}` })
        .setTimestamp();

      if (message.content) {
        embed.addFields({ name: 'Content', value: message.content.substring(0, 1024) });
      }

      if (message.attachments.size > 0) {
        embed.addFields({ name: 'Attachments', value: `${message.attachments.size} file(s)` });
      }

      await logChannel.send({ embeds: [embed] });
    } catch (err) {
      logger.error('Error logging message deletion:', err);
    }
  },
};
