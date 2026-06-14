const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Starboard = require('../../models/Starboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Manage starboard')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Configure the starboard')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Starboard channel')
            .setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('threshold')
            .setDescription('Reaction threshold')
            .setRequired(false)
            .setMinValue(1)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Starboard',
  usage: '/starboard setup <#channel> [threshold]',
  description: 'Set the starboard channel and reaction threshold',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');
      const threshold = interaction.options.getInteger('threshold') || 3;

      await Starboard.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { channelId: channel.id, threshold, enabled: true } },
        { upsert: true }
      );

      await interaction.reply({ content: `⭐ Starboard configured! Channel: ${channel}, Threshold: ${threshold}`, ephemeral: true });
    } catch (error) {
      console.error('starboard setup error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('Usage: starboard setup <#channel> [threshold]');
      }

      const threshold = parseInt(args[1], 10) || 3;

      await Starboard.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { channelId: channel.id, threshold, enabled: true } },
        { upsert: true }
      );

      await message.reply(`⭐ Starboard configured! Channel: ${channel}, Threshold: ${threshold}`);
    } catch (error) {
      console.error('starboard setup prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
