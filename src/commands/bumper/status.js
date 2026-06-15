const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const BumpReminder = require('../../models/BumpReminder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bumper-status')
    .setDescription('Show bump reminder status'),
  category: 'Bumper',
  description: 'Shows lastBumpAt, enabled, and channel info for bump reminders',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const config = await BumpReminder.findOne({ guildId: interaction.guild.id });
      if (!config) {
        return interaction.reply({ content: 'Bump reminder is not set up.', flags: MessageFlags.Ephemeral });
      }

      const channel = interaction.guild.channels.cache.get(config.channelId);
      const lastBump = config.lastBumpAt
        ? `<t:${Math.floor(new Date(config.lastBumpAt).getTime() / 1000)}:R>`
        : 'Never';

      const nextBump = config.lastBumpAt
        ? `<t:${Math.floor(new Date(config.lastBumpAt).getTime() / 1000) + 7200}:R>`
        : 'Bump now!';

      const embed = new EmbedBuilder()
        .setColor(config.enabled ? 0x57F287 : 0xED4245)
        .setTitle('Bump Reminder Status')
        .addFields(
          { name: 'Channel', value: channel ? `${channel}` : '`#deleted-channel`', inline: true },
          { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
          { name: 'Last Bump', value: lastBump, inline: true },
          { name: 'Next Bump', value: nextBump, inline: true },
          { name: 'Ping Role', value: config.pingRoleId ? `<@&${config.pingRoleId}>` : 'None', inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('bumper-status error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await BumpReminder.findOne({ guildId: message.guild.id });
      if (!config) return message.reply('Bump reminder is not set up.');

      const channel = message.guild.channels.cache.get(config.channelId);
      const lastBump = config.lastBumpAt
        ? `<t:${Math.floor(new Date(config.lastBumpAt).getTime() / 1000)}:R>`
        : 'Never';

      const nextBump = config.lastBumpAt
        ? `<t:${Math.floor(new Date(config.lastBumpAt).getTime() / 1000) + 7200}:R>`
        : 'Bump now!';

      const embed = new EmbedBuilder()
        .setColor(config.enabled ? 0x57F287 : 0xED4245)
        .setTitle('Bump Reminder Status')
        .addFields(
          { name: 'Channel', value: channel ? `${channel}` : '`#deleted-channel`', inline: true },
          { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
          { name: 'Last Bump', value: lastBump, inline: true },
          { name: 'Next Bump', value: nextBump, inline: true },
          { name: 'Ping Role', value: config.pingRoleId ? `<@&${config.pingRoleId}>` : 'None', inline: true }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('bumper-status prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
