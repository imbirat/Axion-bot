const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const CountingChannel = require('../../models/CountingChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('counting-disable')
    .setDescription('Disable the counting system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Counting',
  description: 'Disables counting in the current server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const result = await CountingChannel.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { enabled: false } }
      );
      if (!result) {
        return interaction.reply({ content: 'Counting is not set up yet.', flags: MessageFlags.Ephemeral });
      }
      await interaction.reply({ content: '✅ Counting disabled.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('counting-disable error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const result = await CountingChannel.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { enabled: false } }
      );
      if (!result) return message.reply('Counting is not set up yet.');
      await message.reply('✅ Counting disabled.');
    } catch (error) {
      console.error('counting-disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
