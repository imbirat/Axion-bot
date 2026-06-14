const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animequote')
    .setDescription('Get a random anime quote'),
  category: 'Anime',
  usage: '/animequote',
  description: 'Fetch a random anime quote from AnimeChan',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://animechan.xyz/api/random');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(`"${data.quote}"`)
        .addFields(
          { name: '— Character', value: data.character, inline: true },
          { name: 'Anime', value: data.anime, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('animequote command error:', error);
      await interaction.reply({ content: 'Could not fetch an anime quote right now.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const { data } = await axios.get('https://animechan.xyz/api/random');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(`"${data.quote}"`)
        .addFields(
          { name: '— Character', value: data.character, inline: true },
          { name: 'Anime', value: data.anime, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('animequote prefix error:', error);
      await message.reply('Could not fetch an anime quote right now.');
    }
  },
};
