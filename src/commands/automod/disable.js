const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-disable')
    .setDescription('Disable auto-moderation'),
  category: 'Auto-Mod',
  usage: '/automod-disable',
  description: 'Disable auto-moderation features for the server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { automodEnabled: false } },
        { upsert: true }
      );
      await interaction.reply({ content: '✅ Auto-Mod disabled.' });
    } catch (error) {
      console.error('automod disable command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { automodEnabled: false } },
        { upsert: true }
      );
      await message.channel.send('✅ Auto-Mod disabled.');
    } catch (error) {
      console.error('automod disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
