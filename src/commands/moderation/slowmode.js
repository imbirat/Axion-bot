const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../utils/i18n');

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
    ),
  category: 'Moderation',
  usage: '/slowmode <seconds>',
  description: 'Set the slowmode duration in the current channel',
  permissions: ['ManageChannels'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const seconds = interaction.options.getInteger('seconds');

      await interaction.channel.setRateLimitPerUser(seconds);

      const reply = await t(interaction.guild.id, 'moderation.slowmode.success', {
        defaultValue: '✅ Slowmode set to {{seconds}}s.',
        seconds
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('slowmode command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const seconds = parseInt(args[0], 10);
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        return message.reply('Please provide a valid number of seconds (0-21600).');
      }

      await message.channel.setRateLimitPerUser(seconds);
      await message.channel.send(`✅ Slowmode set to ${seconds}s.`);
    } catch (error) {
      console.error('slowmode prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
