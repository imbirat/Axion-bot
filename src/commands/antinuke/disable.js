const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke-disable')
    .setDescription('Disable anti-nuke protection'),
  category: 'Anti-Nuke',
  usage: '/antinuke-disable',
  description: 'Disable anti-nuke protection for the server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { antinukeEnabled: false } },
        { upsert: true }
      );
      await interaction.reply({ content: '✅ Anti-Nuke disabled.' });
    } catch (error) {
      console.error('antinuke disable command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { antinukeEnabled: false } },
        { upsert: true }
      );
      await message.channel.send('✅ Anti-Nuke disabled.');
    } catch (error) {
      console.error('antinuke disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
