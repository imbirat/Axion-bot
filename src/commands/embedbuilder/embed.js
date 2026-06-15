const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Build and send an embed to a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Target channel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'Embed Builder',
  usage: '.embed <#channel> <content>',
  description: 'Build a rich embed and send it to a channel',
  permissions: ['ManageMessages'],
  cooldown: 5,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const modal = new ModalBuilder()
      .setCustomId(`embed_builder_${channel.id}`)
      .setTitle('Embed Builder')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('content')
            .setLabel('Embed content (use Shift+Enter for newlines)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('title: My Title\ndescription: Hello\ncolor: #FF0000\nfield: Name|Value|inline')
            .setRequired(true)
        )
      );
    await interaction.showModal(modal);
  },
  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You need Manage Messages permission to use this.');
    }
    const { channel, content } = extractChannelContent(message);
    if (!channel) return message.reply('Usage: embed <#channel> <content>');
    if (content) {
      try {
        const embed = parseEmbed(content);
        await channel.send({ embeds: [embed] });
        return message.reply(`✅ Embed sent to ${channel}.`);
      } catch (err) {
        return message.reply(`❌ ${err.message}`);
      }
    }
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`embed_builder_trigger_${channel.id}`)
        .setLabel('Open Embed Builder')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📦')
    );
    await message.reply({ content: `Click below to build an embed for ${channel}.`, components: [row] });
  },
};

function extractChannelContent(message) {
  const afterCmd = message.content.slice(message.content.indexOf(' ') + 1).trim();
  const mention = afterCmd.match(/^<#\d+>/);
  const id = !mention ? afterCmd.match(/^\d{17,20}/) : null;
  if (!mention && !id) return { channel: null, content: null };
  const chStr = mention ? mention[0] : id[0];
  const channel = message.mentions.channels.first() || message.guild.channels.cache.get(chStr.replace(/[<#>]/g, ''));
  const content = afterCmd.slice(chStr.length).trim();
  return { channel, content };
}

function parseEmbed(text) {
  const embed = new (require('discord.js').EmbedBuilder)().setColor(0x5865F2);
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
