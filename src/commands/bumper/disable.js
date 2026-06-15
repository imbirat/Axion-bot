const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const BumpReminder = require('../../models/BumpReminder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bumper-disable')
    .setDescription('Disable bump reminders')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Bumper',
  description: 'Sets enabled=false for bump reminders',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const result = await BumpReminder.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { enabled: false } }
      );
      if (!result) {
        return interaction.reply({ content: 'Bump reminder is not set up yet.', flags: MessageFlags.Ephemeral });
      }
      await interaction.reply({ content: '✅ Bump reminders disabled.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('bumper-disable error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const result = await BumpReminder.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { enabled: false } }
      );
      if (!result) return message.reply('Bump reminder is not set up yet.');
      await message.reply('✅ Bump reminders disabled.');
    } catch (error) {
      console.error('bumper-disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
