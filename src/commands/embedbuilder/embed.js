const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Build and send an embed to a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Target channel').setRequired(true))
    .addStringOption(opt =>
      opt.setName('content').setDescription('Embed content (title:, description:, color:, field:Name|Val|inline)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'Embed Builder',
  usage: '.embed <#channel> <content>',
  description: 'Build a rich embed and send it to a channel',
  permissions: ['ManageMessages'],
  cooldown: 5,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const content = interaction.options.getString('content');
    try {
      const embed = parseEmbed(content);
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Embed sent to ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (err) {
      await interaction.reply({ content: `❌ ${err.message}`, flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You need Manage Messages permission to use this.');
    }
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply('Usage: embed <#channel> <content>');
    const raw = message.content.slice(message.content.indexOf(args[0]) + args[0].length).trim();
    if (!raw) return message.reply('Please provide embed content.');
    try {
      const embed = parseEmbed(raw);
      await channel.send({ embeds: [embed] });
      await message.reply(`✅ Embed sent to ${channel}.`);
    } catch (err) {
      await message.reply(`❌ ${err.message}`);
    }
  },
};

function parseEmbed(text) {
  const embed = new EmbedBuilder().setColor(0x5865F2);
  const lines = text.split('\n');
  let descriptionLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.toLowerCase().startsWith('title:')) {
      embed.setTitle(trimmed.slice(6).trim());
    } else if (trimmed.toLowerCase().startsWith('description:')) {
      embed.setDescription(trimmed.slice(12).trim());
    } else if (trimmed.toLowerCase().startsWith('color:')) {
      const val = trimmed.slice(6).trim();
      embed.setColor(val.startsWith('#') ? parseInt(val.slice(1), 16) : parseInt(val, 10) || 0x5865F2);
    } else if (trimmed.toLowerCase().startsWith('field:')) {
      const parts = trimmed.slice(6).trim().split('|').map(s => s.trim());
      if (parts.length >= 2) {
        embed.addFields({ name: parts[0], value: parts[1], inline: parts[2] === 'true' || parts[2] === 'yes' });
      }
    } else if (trimmed.toLowerCase().startsWith('footer:')) {
      embed.setFooter({ text: trimmed.slice(7).trim() });
    } else if (trimmed.toLowerCase().startsWith('author:')) {
      const parts = trimmed.slice(7).trim().split('|').map(s => s.trim());
      embed.setAuthor({ name: parts[0], iconURL: parts[1] || undefined });
    } else if (trimmed.toLowerCase().startsWith('thumbnail:')) {
      embed.setThumbnail(trimmed.slice(10).trim());
    } else if (trimmed.toLowerCase().startsWith('image:')) {
      embed.setImage(trimmed.slice(6).trim());
    } else if (trimmed.toLowerCase().startsWith('url:')) {
      embed.setURL(trimmed.slice(4).trim());
    } else if (trimmed.toLowerCase().startsWith('timestamp')) {
      embed.setTimestamp();
    } else {
      descriptionLines.push(trimmed);
    }
  }

  if (descriptionLines.length > 0 && !embed.data.description) {
    embed.setDescription(descriptionLines.join('\n'));
  }

  return embed;
}
