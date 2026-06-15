const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  name: Events.MessageUpdate,

  async execute(oldMessage, newMessage, client) {
    if (oldMessage.author?.bot) return;
    if (!oldMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;

    const config = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
    if (!config?.loggingEnabled || !config.loggingChannel) return;

    const logChannel = oldMessage.guild.channels.cache.get(config.loggingChannel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('Message Edited')
      .setDescription(`**Author:** ${oldMessage.author?.tag || 'Unknown'}\n**Channel:** ${oldMessage.channel}\n**Before:** ${oldMessage.content || 'No content'}\n**After:** ${newMessage.content || 'No content'}`)
      .setFooter({ text: `User ID: ${oldMessage.author?.id || 'Unknown'}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
