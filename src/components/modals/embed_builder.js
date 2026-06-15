const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'embed_builder_',
  async execute(interaction, client) {
    const channelId = interaction.customId.replace('embed_builder_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Target channel not found.', flags: MessageFlags.Ephemeral });
    }

    const content = interaction.fields.getTextInputValue('content');
    if (!content.trim()) {
      return interaction.reply({ content: '❌ Content cannot be empty.', flags: MessageFlags.Ephemeral });
    }

    try {
      const embed = parseEmbed(content);
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Embed sent to ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (err) {
      await interaction.reply({ content: `❌ ${err.message}`, flags: MessageFlags.Ephemeral });
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
