const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('container')
    .setDescription('Build and send a container (Components v2) to a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Target channel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'Embed Builder',
  usage: '.container <#channel> <content>',
  description: 'Build a container message (Components v2) and send it to a channel',
  permissions: ['ManageMessages'],
  cooldown: 5,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const modal = new ModalBuilder()
      .setCustomId(`container_builder_${channel.id}`)
      .setTitle('Container Builder')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('content')
            .setLabel('Container content (use --- for dividers)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Section 1 text...\n\n---\n\nSection 2 text...')
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
    if (!channel) return message.reply('Usage: container <#channel> <content>');
    if (!content) return message.reply('Please provide container content.');
    try {
      const container = parseContainer(content);
      await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
      await message.reply(`✅ Container sent to ${channel}.`);
    } catch (err) {
      await message.reply(`❌ ${err.message}`);
    }
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

function parseContainer(text) {
  const C = new ContainerBuilder();
  const sections = text.split('\n---\n').map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < sections.length; i++) {
    C.addTextDisplayComponents(new TextDisplayBuilder().setContent(sections[i]));
    if (i < sections.length - 1) {
      C.addSeparatorComponents(new SeparatorBuilder().setDivider(true));
    }
  }

  return C;
}
