const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const CountingChannel = require('../../models/CountingChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('counting-reset')
    .setDescription('Reset the count to 0')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Counting',
  description: 'Resets currentCount to 0',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      await CountingChannel.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { currentCount: 0 } }
      );
      await interaction.reply({ content: '✅ Count reset to 0.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('counting-reset error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      await CountingChannel.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { currentCount: 0 } }
      );
      await message.reply('✅ Count reset to 0.');
    } catch (error) {
      console.error('counting-reset prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
