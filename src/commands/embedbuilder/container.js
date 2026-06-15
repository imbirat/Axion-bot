const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('container')
    .setDescription('Build and send a container (Components v2) to a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Target channel').setRequired(true))
    .addStringOption(opt =>
      opt.setName('content').setDescription('Container content (use --- for dividers)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'Embed Builder',
  usage: '.container <#channel> <content>',
  description: 'Build a container message (Components v2) and send it to a channel',
  permissions: ['ManageMessages'],
  cooldown: 5,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const content = interaction.options.getString('content');
    try {
      const container = parseContainer(content);
      await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
      await interaction.reply({ content: `✅ Container sent to ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (err) {
      await interaction.reply({ content: `❌ ${err.message}`, flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You need Manage Messages permission to use this.');
    }
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply('Usage: container <#channel> <content>');
    const raw = message.content.slice(message.content.indexOf(args[0]) + args[0].length).trim();
    if (!raw) return message.reply('Please provide container content.');
    try {
      const container = parseContainer(raw);
      await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
      await message.reply(`✅ Container sent to ${channel}.`);
    } catch (err) {
      await message.reply(`❌ ${err.message}`);
    }
  },
};

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
