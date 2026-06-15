const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode in the channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode duration in seconds (0 to disable)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'Moderation',
  description: 'Set the slowmode duration in the current channel',
  permissions: ['ManageChannels'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const seconds = interaction.options.getInteger('seconds');

      await interaction.channel.setRateLimitPerUser(seconds);

      await interaction.reply({ embeds: [successEmbed(`Slowmode set to ${seconds}s.`)] });
    } catch (error) {
      console.error('slowmode command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const seconds = parseInt(args[0], 10);
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        return message.reply('Please provide a valid number of seconds (0-21600).');
      }

      await message.channel.setRateLimitPerUser(seconds);
      await message.channel.send({ embeds: [successEmbed(`Slowmode set to ${seconds}s.`)] });
    } catch (error) {
      console.error('slowmode prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
