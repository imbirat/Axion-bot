const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging-disable')
    .setDescription('Disable logging for the server'),
  category: 'Logging',
  usage: '/logging-disable',
  description: 'Disable server logging',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { loggingEnabled: false } },
        { upsert: true }
      );
      await interaction.reply({ content: '✅ Logging disabled.' });
    } catch (error) {
      console.error('logging disable command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { loggingEnabled: false } },
        { upsert: true }
      );
      await message.channel.send('✅ Logging disabled.');
    } catch (error) {
      console.error('logging disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
