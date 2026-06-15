const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('View server activity stats'),
  category: 'Analytics',
  usage: '/activity',
  description: 'Shows server activity statistics including online members',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      await guild.members.fetch();
      const members = guild.members.cache;
      const online = members.filter(m => m.presence?.status === 'online').size;
      const idle = members.filter(m => m.presence?.status === 'idle').size;
      const dnd = members.filter(m => m.presence?.status === 'dnd').size;
      const offline = members.filter(m => !m.presence || m.presence.status === 'offline').size;
      const total = members.size;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📊 Server Activity')
        .addFields(
          { name: '🟢 Online', value: `${online}`, inline: true },
          { name: '🟡 Idle', value: `${idle}`, inline: true },
          { name: '🔴 Do Not Disturb', value: `${dnd}`, inline: true },
          { name: '⚫ Offline', value: `${offline}`, inline: true },
          { name: '📈 Total', value: `${total}`, inline: true },
          { name: '📊 Active %', value: `${((online + idle + dnd) / total * 100).toFixed(1)}%`, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('activity command error:', error);
      await interaction.reply({ content: 'There was an error fetching activity stats.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guild = message.guild;
      await guild.members.fetch();
      const members = guild.members.cache;
      const online = members.filter(m => m.presence?.status === 'online').size;
      const idle = members.filter(m => m.presence?.status === 'idle').size;
      const dnd = members.filter(m => m.presence?.status === 'dnd').size;
      const offline = members.filter(m => !m.presence || m.presence.status === 'offline').size;
      const total = members.size;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📊 Server Activity')
        .addFields(
          { name: '🟢 Online', value: `${online}`, inline: true },
          { name: '🟡 Idle', value: `${idle}`, inline: true },
          { name: '🔴 Do Not Disturb', value: `${dnd}`, inline: true },
          { name: '⚫ Offline', value: `${offline}`, inline: true },
          { name: '📈 Total', value: `${total}`, inline: true },
          { name: '📊 Active %', value: `${((online + idle + dnd) / total * 100).toFixed(1)}%`, inline: true }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('activity prefix error:', error);
      await message.reply('There was an error fetching activity stats.');
    }
  },
};
