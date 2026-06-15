const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const StickyMessage = require('../../models/StickyMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky-remove')
    .setDescription('Remove the sticky message from this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Sticky',
  description: 'Removes the sticky message from the current channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const data = await StickyMessage.findOneAndDelete({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
      });

      if (!data) {
        return interaction.reply({ content: 'No sticky message set in this channel.', flags: MessageFlags.Ephemeral });
      }

      if (data.lastMessageId) {
        try {
          const msg = await interaction.channel.messages.fetch(data.lastMessageId);
          await msg.delete();
        } catch {}
      }

      await interaction.reply({ content: '✅ Sticky message removed.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('sticky-remove error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const data = await StickyMessage.findOneAndDelete({
        guildId: message.guild.id,
        channelId: message.channel.id,
      });

      if (!data) return message.reply('No sticky message set in this channel.');

      if (data.lastMessageId) {
        try {
          const msg = await message.channel.messages.fetch(data.lastMessageId);
          await msg.delete();
        } catch {}
      }

      await message.reply('✅ Sticky message removed.');
    } catch (error) {
      console.error('sticky-remove prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
