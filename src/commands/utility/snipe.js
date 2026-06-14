const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const snipeCache = require('../../utils/snipeCache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Snipe the last deleted message in this channel'),
  category: 'Utilities',
  usage: '/snipe',
  description: 'Retrieve the last deleted message in the current channel',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const data = snipeCache.get(interaction.channel.id);

      if (!data) {
        return interaction.reply({ content: 'Nothing to snipe!', ephemeral: true });
      }

      const timeAgo = Math.floor((Date.now() - new Date(data.createdAt).getTime()) / 1000);
      const timeDisplay = timeAgo < 60
        ? `${timeAgo}s ago`
        : timeAgo < 3600
          ? `${Math.floor(timeAgo / 60)}m ago`
          : `${Math.floor(timeAgo / 3600)}h ago`;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ name: data.author.tag, iconURL: data.author.displayAvatarURL() })
        .setDescription(data.content || '*No text content*')
        .setFooter({ text: `Deleted ${timeDisplay}` })
        .setTimestamp();

      if (data.attachments && data.attachments.length > 0) {
        const attachment = data.attachments[0];
        if (attachment.contentType && attachment.contentType.startsWith('image/')) {
          embed.setImage(attachment.url);
        }
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('snipe command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const data = snipeCache.get(message.channel.id);

      if (!data) {
        return message.reply('Nothing to snipe!');
      }

      const timeAgo = Math.floor((Date.now() - new Date(data.createdAt).getTime()) / 1000);
      const timeDisplay = timeAgo < 60
        ? `${timeAgo}s ago`
        : timeAgo < 3600
          ? `${Math.floor(timeAgo / 60)}m ago`
          : `${Math.floor(timeAgo / 3600)}h ago`;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ name: data.author.tag, iconURL: data.author.displayAvatarURL() })
        .setDescription(data.content || '*No text content*')
        .setFooter({ text: `Deleted ${timeDisplay}` })
        .setTimestamp();

      if (data.attachments && data.attachments.length > 0) {
        const attachment = data.attachments[0];
        if (attachment.contentType && attachment.contentType.startsWith('image/')) {
          embed.setImage(attachment.url);
        }
      }

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('snipe prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
