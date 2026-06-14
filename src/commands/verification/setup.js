const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifysetup')
    .setDescription('Set up verification system')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel for verification panel')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to assign on verify')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifysetup <#channel> <@role>',
  description: 'Set up the verification panel and role',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('role');

      const verifyButton = new ButtonBuilder()
        .setCustomId('verify_click')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

      const row = new ActionRowBuilder().addComponents(verifyButton);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Verification')
        .setDescription('Click the button below to verify yourself and gain access to the server.')
        .setTimestamp();

      await channel.send({ embeds: [embed], components: [row] });

      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          $set: {
            verifyChannel: channel.id,
            verifyRole: role.id,
            verifyEnabled: true
          }
        },
        { upsert: true }
      );

      await interaction.reply({ content: '✅ Verification setup complete.', ephemeral: true });
    } catch (error) {
      console.error('verifysetup error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first();
      const role = message.mentions.roles.first();
      if (!channel || !role) {
        return message.reply('Usage: verifysetup <#channel> <@role>');
      }

      const verifyButton = new ButtonBuilder()
        .setCustomId('verify_click')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

      const row = new ActionRowBuilder().addComponents(verifyButton);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Verification')
        .setDescription('Click the button below to verify yourself and gain access to the server.')
        .setTimestamp();

      await channel.send({ embeds: [embed], components: [row] });

      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        {
          $set: {
            verifyChannel: channel.id,
            verifyRole: role.id,
            verifyEnabled: true
          }
        },
        { upsert: true }
      );

      await message.reply('✅ Verification setup complete.');
    } catch (error) {
      console.error('verifysetup prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
