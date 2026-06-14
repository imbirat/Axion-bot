const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Starboard = require('../../models/Starboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Manage starboard')
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable the starboard'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Starboard',
  usage: '/starboard disable',
  description: 'Disable the starboard feature',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const config = await Starboard.findOne({ guildId: interaction.guild.id });

      if (!config) {
        return interaction.reply({ content: 'Starboard is not configured.', ephemeral: true });
      }

      config.enabled = false;
      await config.save();

      await interaction.reply({ content: '⭐ Starboard disabled.', ephemeral: true });
    } catch (error) {
      console.error('starboard disable error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await Starboard.findOne({ guildId: message.guild.id });

      if (!config) {
        return message.reply('Starboard is not configured.');
      }

      config.enabled = false;
      await config.save();

      await message.reply('⭐ Starboard disabled.');
    } catch (error) {
      console.error('starboard disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
