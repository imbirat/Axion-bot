const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifylog')
    .setDescription('Set the verification log channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel for verification logs')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifylog <#channel>',
  description: 'Set the channel where verification logs are sent',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { verifyLogChannel: channel.id } }
      );
      await interaction.reply({ content: '✅ Verify log channel set.', ephemeral: true });
    } catch (error) {
      console.error('verifylog error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('Usage: verifylog <#channel>');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { verifyLogChannel: channel.id } }
      );
      await message.reply('✅ Verify log channel set.');
    } catch (error) {
      console.error('verifylog prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
