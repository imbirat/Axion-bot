const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Starboard = require('../../models/Starboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Manage starboard')
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('View current starboard configuration'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Starboard',
  usage: '/starboard config',
  description: 'View the current starboard settings',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const config = await Starboard.findOne({ guildId: interaction.guild.id });

      if (!config) {
        return interaction.reply({ content: 'Starboard is not configured. Use `/starboard setup` to configure it.', ephemeral: true });
      }

      const channel = interaction.guild.channels.cache.get(config.channelId);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Starboard Configuration')
        .addFields(
          { name: 'Channel', value: channel ? `${channel}` : '`#deleted-channel`', inline: true },
          { name: 'Threshold', value: `${config.threshold} ⭐`, inline: true },
          { name: 'Emoji', value: config.emoji || '⭐', inline: true },
          { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
          { name: 'Starred Messages', value: `${config.entries?.length || 0}`, inline: true }
        );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('starboard config error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await Starboard.findOne({ guildId: message.guild.id });

      if (!config) {
        return message.reply('Starboard is not configured. Use `starboard setup <#channel> [threshold]` to configure it.');
      }

      const channel = message.guild.channels.cache.get(config.channelId);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Starboard Configuration')
        .addFields(
          { name: 'Channel', value: channel ? `${channel}` : '`#deleted-channel`', inline: true },
          { name: 'Threshold', value: `${config.threshold} ⭐`, inline: true },
          { name: 'Emoji', value: config.emoji || '⭐', inline: true },
          { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
          { name: 'Starred Messages', value: `${config.entries?.length || 0}`, inline: true }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('starboard config prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
