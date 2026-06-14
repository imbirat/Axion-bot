const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animerandom')
    .setDescription('Get a random anime recommendation'),
  category: 'Anime',
  usage: '/animerandom',
  description: 'Fetch a random anime from Jikan API',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://api.jikan.moe/v4/random/anime');
      const anime = data.data;
      const synopsis = anime.synopsis ? (anime.synopsis.length > 500 ? anime.synopsis.substring(0, 500) + '...' : anime.synopsis) : 'No synopsis available.';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(anime.title)
        .setURL(anime.url)
        .setImage(anime.images?.jpg?.large_image_url || null)
        .setDescription(synopsis)
        .addFields(
          { name: '⭐ Score', value: anime.score ? `${anime.score}` : 'N/A', inline: true },
          { name: '📺 Episodes', value: anime.episodes ? `${anime.episodes}` : 'N/A', inline: true },
          { name: '📌 Status', value: anime.status || 'N/A', inline: true },
          { name: '🎭 Type', value: anime.type || 'N/A', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('animerandom command error:', error);
      await interaction.reply({ content: 'Could not fetch a random anime right now.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const { data } = await axios.get('https://api.jikan.moe/v4/random/anime');
      const anime = data.data;
      const synopsis = anime.synopsis ? (anime.synopsis.length > 500 ? anime.synopsis.substring(0, 500) + '...' : anime.synopsis) : 'No synopsis available.';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(anime.title)
        .setURL(anime.url)
        .setImage(anime.images?.jpg?.large_image_url || null)
        .setDescription(synopsis)
        .addFields(
          { name: '⭐ Score', value: anime.score ? `${anime.score}` : 'N/A', inline: true },
          { name: '📺 Episodes', value: anime.episodes ? `${anime.episodes}` : 'N/A', inline: true },
          { name: '📌 Status', value: anime.status || 'N/A', inline: true },
          { name: '🎭 Type', value: anime.type || 'N/A', inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('animerandom prefix error:', error);
      await message.reply('Could not fetch a random anime right now.');
    }
  },
};
