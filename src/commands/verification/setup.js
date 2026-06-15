const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifysetup')
    .setDescription('Post the verification panel in a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel for verification panel').setRequired(true))
    .addRoleOption(opt =>
      opt.setName('role').setDescription('Role to assign on verify').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Post the verification panel in a channel',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const defaultMsg = 'Click the button below to verify yourself and gain access to the server.';

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('✅ Verification Required')
      .setDescription(config?.verifyMessage || defaultMsg)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields({ name: '• Why verify?', value: 'Helps us keep the server safe from bots.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_click')
        .setLabel('✅ Verify')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { verifyChannel: channel.id, verifyRole: role.id, verifyEnabled: true } },
      { upsert: true }
    );

    await interaction.reply({ content: '✅ Verification panel posted.', flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const channel = message.mentions.channels.first();
    const role = message.mentions.roles.first();
    if (!channel || !role) return message.reply('Usage: verifysetup <#channel> <@role>');

    let config = await GuildConfig.findOne({ guildId: message.guild.id });
    const defaultMsg = 'Click the button below to verify yourself and gain access to the server.';

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('✅ Verification Required')
      .setDescription(config?.verifyMessage || defaultMsg)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields({ name: '• Why verify?', value: 'Helps us keep the server safe from bots.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_click')
        .setLabel('✅ Verify')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $set: { verifyChannel: channel.id, verifyRole: role.id, verifyEnabled: true } },
      { upsert: true }
    );
    await message.reply('✅ Verification panel posted.');
  },
};
