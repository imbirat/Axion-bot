const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Search for an anime')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the anime to search')
        .setRequired(true)),
  category: 'Anime',
  usage: '/anime <name>',
  description: 'Search for an anime and display its information',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const name = interaction.options.getString('name');
      const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=1`);
      if (!data.data || !data.data.length) {
        return interaction.reply({ content: `No anime found for "${name}".`, flags: MessageFlags.Ephemeral });
      }
      const anime = data.data[0];
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
          { name: '📌 Status', value: anime.status || 'N/A', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('anime command error:', error);
      await interaction.reply({ content: 'There was an error searching for anime.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide an anime name to search.');
      const name = args.join(' ');
      const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=1`);
      if (!data.data || !data.data.length) {
        return message.reply(`No anime found for "${name}".`);
      }
      const anime = data.data[0];
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
          { name: '📌 Status', value: anime.status || 'N/A', inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('anime prefix error:', error);
      await message.reply('There was an error searching for anime.');
    }
  },
};
