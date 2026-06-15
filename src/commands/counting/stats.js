const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const CountingChannel = require('../../models/CountingChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('counting-stats')
    .setDescription('Show counting stats'),
  category: 'Counting',
  description: 'Shows current count, record, and last user who broke the streak',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const data = await CountingChannel.findOne({ guildId: interaction.guild.id });
      if (!data) {
        return interaction.reply({ content: 'Counting is not set up yet.', flags: MessageFlags.Ephemeral });
      }

      let lastUser = 'None';
      if (data.lastBrokeBy) {
        try {
          const u = await client.users.fetch(data.lastBrokeBy);
          lastUser = u.tag;
        } catch { lastUser = 'Unknown User'; }
      }

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Counting Stats')
        .addFields(
          { name: 'Current Count', value: `${data.currentCount || 0}`, inline: true },
          { name: 'Record', value: `${data.record || 0}`, inline: true },
          { name: 'Last Broke By', value: lastUser, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('counting-stats error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const data = await CountingChannel.findOne({ guildId: message.guild.id });
      if (!data) return message.reply('Counting is not set up yet.');

      let lastUser = 'None';
      if (data.lastBrokeBy) {
        try {
          const u = await client.users.fetch(data.lastBrokeBy);
          lastUser = u.tag;
        } catch { lastUser = 'Unknown User'; }
      }

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Counting Stats')
        .addFields(
          { name: 'Current Count', value: `${data.currentCount || 0}`, inline: true },
          { name: 'Record', value: `${data.record || 0}`, inline: true },
          { name: 'Last Broke By', value: lastUser, inline: true }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('counting-stats prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
