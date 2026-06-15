const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { snipeCache } = require('../../utils/snipeCache');

module.exports = {
  name: Events.MessageDelete,

  async execute(message, client) {
    if (message.author?.bot) return;
    if (!message.guild) return;

    // Logging
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!config?.loggingEnabled || !config.loggingChannel) return;

    const logChannel = message.guild.channels.cache.get(config.loggingChannel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('Message Deleted')
      .setDescription(`**Author:** ${message.author?.tag || 'Unknown'}\n**Channel:** ${message.channel}\n**Content:** ${message.content || 'No content (embed/sticker)'}`)
      .setFooter({ text: `User ID: ${message.author?.id || 'Unknown'}` })
      .setTimestamp();

    if (message.attachments.size > 0) {
      embed.addFields({ name: 'Attachments', value: message.attachments.map(a => a.url).join('\n') });
    }

    logChannel.send({ embeds: [embed] });
  },
};
