const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('movierecommend')
    .setDescription('Get a random anime movie recommendation'),
  category: 'Anime',
  usage: '/movierecommend',
  description: 'Fetch a random anime movie recommendation from Jikan API',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://api.jikan.moe/v4/anime?type=movie&order_by=score&sort=desc&limit=25');
      if (!data.data || !data.data.length) {
        return interaction.reply({ content: 'Could not find any anime movies right now.', ephemeral: true });
      }
      const movie = data.data[Math.floor(Math.random() * data.data.length)];
      const synopsis = movie.synopsis ? (movie.synopsis.length > 500 ? movie.synopsis.substring(0, 500) + '...' : movie.synopsis) : 'No synopsis available.';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(movie.title)
        .setURL(movie.url)
        .setImage(movie.images?.jpg?.large_image_url || null)
        .setDescription(synopsis)
        .addFields(
          { name: '⭐ Score', value: movie.score ? `${movie.score}` : 'N/A', inline: true },
          { name: '🎬 Duration', value: movie.duration || 'N/A', inline: true },
          { name: '📅 Year', value: movie.year ? `${movie.year}` : 'N/A', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('movierecommend command error:', error);
      await interaction.reply({ content: 'Could not fetch a movie recommendation right now.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const { data } = await axios.get('https://api.jikan.moe/v4/anime?type=movie&order_by=score&sort=desc&limit=25');
      if (!data.data || !data.data.length) {
        return message.reply('Could not find any anime movies right now.');
      }
      const movie = data.data[Math.floor(Math.random() * data.data.length)];
      const synopsis = movie.synopsis ? (movie.synopsis.length > 500 ? movie.synopsis.substring(0, 500) + '...' : movie.synopsis) : 'No synopsis available.';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(movie.title)
        .setURL(movie.url)
        .setImage(movie.images?.jpg?.large_image_url || null)
        .setDescription(synopsis)
        .addFields(
          { name: '⭐ Score', value: movie.score ? `${movie.score}` : 'N/A', inline: true },
          { name: '🎬 Duration', value: movie.duration || 'N/A', inline: true },
          { name: '📅 Year', value: movie.year ? `${movie.year}` : 'N/A', inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('movierecommend prefix error:', error);
      await message.reply('Could not fetch a movie recommendation right now.');
    }
  },
};
