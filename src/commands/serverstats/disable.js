const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const ServerStats = require('../../models/ServerStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats-disable')
    .setDescription('Disable server stats and delete all stat voice channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Server Stats',
  description: 'Deletes all stat VCs and disables the server stats system',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const doc = await ServerStats.findOne({ guildId: interaction.guild.id });
      if (!doc) {
        return interaction.reply({ content: 'Server stats not configured.', flags: MessageFlags.Ephemeral });
      }

      for (const stat of doc.stats) {
        const channel = interaction.guild.channels.cache.get(stat.channelId);
        if (channel) await channel.delete().catch(() => {});
      }

      if (doc.categoryId) {
        const category = interaction.guild.channels.cache.get(doc.categoryId);
        if (category) await category.delete().catch(() => {});
      }

      await ServerStats.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { enabled: false, categoryId: null, stats: [] } }
      );

      await interaction.reply({ content: '✅ Server stats disabled and all stat channels deleted.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('serverstats-disable error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const doc = await ServerStats.findOne({ guildId: message.guild.id });
      if (!doc) return message.reply('Server stats not configured.');

      for (const stat of doc.stats) {
        const channel = message.guild.channels.cache.get(stat.channelId);
        if (channel) await channel.delete().catch(() => {});
      }

      if (doc.categoryId) {
        const category = message.guild.channels.cache.get(doc.categoryId);
        if (category) await category.delete().catch(() => {});
      }

      await ServerStats.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { enabled: false, categoryId: null, stats: [] } }
      );

      await message.reply('✅ Server stats disabled and all stat channels deleted.');
    } catch (error) {
      console.error('serverstats-disable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
