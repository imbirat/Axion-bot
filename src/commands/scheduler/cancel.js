const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const ScheduledMessage = require('../../models/ScheduledMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-cancel')
    .setDescription('Cancel a scheduled message')
    .addStringOption(opt =>
      opt.setName('id')
        .setDescription('ID of the scheduled message')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Scheduler',
  description: 'Cancels and deletes a scheduled message by ID',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const id = interaction.options.getString('id');
      const result = await ScheduledMessage.findOneAndDelete({ _id: id, guildId: interaction.guild.id });

      if (!result) {
        return interaction.reply({ content: 'Scheduled message not found.', flags: MessageFlags.Ephemeral });
      }

      await interaction.reply({ content: '✅ Scheduled message cancelled.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('schedule-cancel error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const id = args[0];
      if (!id) return message.reply('Usage: schedule-cancel <id>');

      const result = await ScheduledMessage.findOneAndDelete({ _id: id, guildId: message.guild.id });
      if (!result) return message.reply('Scheduled message not found.');

      await message.reply('✅ Scheduled message cancelled.');
    } catch (error) {
      console.error('schedule-cancel prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
