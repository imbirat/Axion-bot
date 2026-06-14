const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manga')
    .setDescription('Search for a manga')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the manga to search')
        .setRequired(true)),
  category: 'Anime',
  usage: '/manga <name>',
  description: 'Search for a manga and display its information',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const name = interaction.options.getString('name');
      const { data } = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(name)}&limit=1`);
      if (!data.data || !data.data.length) {
        return interaction.reply({ content: `No manga found for "${name}".`, flags: MessageFlags.Ephemeral });
      }
      const manga = data.data[0];
      const synopsis = manga.synopsis ? (manga.synopsis.length > 500 ? manga.synopsis.substring(0, 500) + '...' : manga.synopsis) : 'No synopsis available.';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(manga.title)
        .setURL(manga.url)
        .setImage(manga.images?.jpg?.large_image_url || null)
        .setDescription(synopsis)
        .addFields(
          { name: '⭐ Score', value: manga.score ? `${manga.score}` : 'N/A', inline: true },
          { name: '📖 Volumes', value: manga.volumes ? `${manga.volumes}` : 'N/A', inline: true },
          { name: '📌 Status', value: manga.status || 'N/A', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('manga command error:', error);
      await interaction.reply({ content: 'There was an error searching for manga.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide a manga name to search.');
      const name = args.join(' ');
      const { data } = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(name)}&limit=1`);
      if (!data.data || !data.data.length) {
        return message.reply(`No manga found for "${name}".`);
      }
      const manga = data.data[0];
      const synopsis = manga.synopsis ? (manga.synopsis.length > 500 ? manga.synopsis.substring(0, 500) + '...' : manga.synopsis) : 'No synopsis available.';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(manga.title)
        .setURL(manga.url)
        .setImage(manga.images?.jpg?.large_image_url || null)
        .setDescription(synopsis)
        .addFields(
          { name: '⭐ Score', value: manga.score ? `${manga.score}` : 'N/A', inline: true },
          { name: '📖 Volumes', value: manga.volumes ? `${manga.volumes}` : 'N/A', inline: true },
          { name: '📌 Status', value: manga.status || 'N/A', inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('manga prefix error:', error);
      await message.reply('There was an error searching for manga.');
    }
  },
};
