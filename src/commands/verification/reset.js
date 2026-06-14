const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyreset')
    .setDescription('Reset all verification settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifyreset',
  description: 'Clear all verification settings from the server config',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          $unset: {
            verifyChannel: '',
            verifyRole: '',
            verifyLogChannel: '',
            verifyMessage: ''
          },
          $set: { verifyEnabled: false, verifyMode: 'button' }
        }
      );
      await interaction.reply({ content: '✅ Verification settings reset.', ephemeral: true });
    } catch (error) {
      console.error('verifyreset error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        {
          $unset: {
            verifyChannel: '',
            verifyRole: '',
            verifyLogChannel: '',
            verifyMessage: ''
          },
          $set: { verifyEnabled: false, verifyMode: 'button' }
        }
      );
      await message.reply('✅ Verification settings reset.');
    } catch (error) {
      console.error('verifyreset prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
