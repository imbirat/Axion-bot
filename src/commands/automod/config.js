const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-config')
    .setDescription('View auto-moderation configuration'),
  category: 'Auto-Mod',
  usage: '/automod-config',
  description: 'View current auto-moderation settings',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      const enabled = config?.automodEnabled || false;
      const embed = new EmbedBuilder()
        .setColor(enabled ? 0x57F287 : 0xED4245)
        .setTitle('Auto-Mod Configuration')
        .addFields(
          { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false },
          { name: 'Anti-Spam', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
          { name: 'Anti-Invite', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
          { name: 'Anti-Caps', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
          { name: 'Word Filter', value: enabled ? '✅ Active' : '❌ Inactive', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('automod config command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      const enabled = config?.automodEnabled || false;
      const embed = new EmbedBuilder()
        .setColor(enabled ? 0x57F287 : 0xED4245)
        .setTitle('Auto-Mod Configuration')
        .addFields(
          { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false },
          { name: 'Anti-Spam', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
          { name: 'Anti-Invite', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
          { name: 'Anti-Caps', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
          { name: 'Word Filter', value: enabled ? '✅ Active' : '❌ Inactive', inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('automod config prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
