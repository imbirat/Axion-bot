const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const StickyMessage = require('../../models/StickyMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Manage sticky messages')
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove the sticky message from this channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Sticky',
  usage: '/sticky remove',
  description: 'Remove the sticky message from this channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const result = await StickyMessage.findOneAndDelete({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id
      });

      if (!result) {
        return interaction.reply({ content: 'No sticky message set in this channel.', ephemeral: true });
      }

      await interaction.reply({ content: '✅ Sticky message removed.', ephemeral: true });
    } catch (error) {
      console.error('sticky remove error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const result = await StickyMessage.findOneAndDelete({
        guildId: message.guild.id,
        channelId: message.channel.id
      });

      if (!result) {
        return message.reply('No sticky message set in this channel.');
      }

      await message.reply('✅ Sticky message removed.');
    } catch (error) {
      console.error('sticky remove prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
