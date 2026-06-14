const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-enable')
    .setDescription('Enable auto-moderation'),
  category: 'Auto-Mod',
  usage: '/automod-enable',
  description: 'Enable auto-moderation features for the server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { automodEnabled: true } },
        { upsert: true }
      );
      await interaction.reply({ content: '✅ Auto-Mod enabled.' });
    } catch (error) {
      console.error('automod enable command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { automodEnabled: true } },
        { upsert: true }
      );
      await message.channel.send('✅ Auto-Mod enabled.');
    } catch (error) {
      console.error('automod enable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
