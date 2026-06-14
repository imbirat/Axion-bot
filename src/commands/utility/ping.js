const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot latency'),
  category: 'Utilities',
  usage: '/ping',
  description: 'Check the bot response time and WebSocket latency',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
      const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'WebSocket Latency', value: `\`${client.ws.ping}ms\``, inline: true },
          { name: 'Round-trip Latency', value: `\`${roundtrip}ms\``, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('ping command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sent = await message.channel.send('Pinging...');
      const roundtrip = sent.createdTimestamp - message.createdTimestamp;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'WebSocket Latency', value: `\`${client.ws.ping}ms\``, inline: true },
          { name: 'Round-trip Latency', value: `\`${roundtrip}ms\``, inline: true }
        )
        .setTimestamp();

      await sent.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('ping prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
