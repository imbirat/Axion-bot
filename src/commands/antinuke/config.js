const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke-config')
    .setDescription('View anti-nuke configuration'),
  category: 'Anti-Nuke',
  usage: '/antinuke-config',
  description: 'View current anti-nuke protection settings',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      const enabled = config?.antinukeEnabled || false;
      const embed = new EmbedBuilder()
        .setColor(enabled ? 0x57F287 : 0xED4245)
        .setTitle('Anti-Nuke Configuration')
        .addFields(
          { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('antinuke config command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      const enabled = config?.antinukeEnabled || false;
      const embed = new EmbedBuilder()
        .setColor(enabled ? 0x57F287 : 0xED4245)
        .setTitle('Anti-Nuke Configuration')
        .addFields(
          { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('antinuke config prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
