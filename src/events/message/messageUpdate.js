const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const logger = require('../../utils/logger');

module.exports = {
  name: Events.MessageUpdate,
  once: false,
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild) return;
    if (newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    try {
      const config = await GuildConfig.findOne({ guildId: newMessage.guild.id });
      if (!config || !config.loggingEnabled || !config.loggingChannel) return;

      const logChannel = newMessage.guild.channels.cache.get(config.loggingChannel);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle('Message Edited')
        .setDescription(`Message by ${newMessage.author} edited in ${newMessage.channel}`)
        .addFields(
          { name: 'Channel', value: `${newMessage.channel}`, inline: true },
          { name: 'Author', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
          { name: 'Before', value: (oldMessage.content || '*No content*').substring(0, 1024) },
          { name: 'After', value: (newMessage.content || '*No content*').substring(0, 1024) }
        )
        .setFooter({ text: `Message ID: ${newMessage.id}` })
        .setTimestamp();

      if (newMessage.attachments.size > 0) {
        embed.addFields({ name: 'Attachments', value: `${newMessage.attachments.size} file(s)` });
      }

      await logChannel.send({ embeds: [embed] });
    } catch (err) {
      logger.error('Error logging message edit:', err);
    }
  },
};
