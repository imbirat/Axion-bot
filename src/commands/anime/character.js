const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Search for an anime character')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the character to search')
        .setRequired(true)),
  category: 'Anime',
  usage: '/character <name>',
  description: 'Search for an anime character and display their information',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const name = interaction.options.getString('name');
      const { data } = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1`);
      if (!data.data || !data.data.length) {
        return interaction.reply({ content: `No character found for "${name}".`, flags: MessageFlags.Ephemeral });
      }
      const chara = data.data[0];
      const about = chara.about ? (chara.about.length > 800 ? chara.about.substring(0, 800) + '...' : chara.about) : 'No description available.';
      const animeAppearances = chara.anime?.map(a => a.anime?.title).filter(Boolean).join(', ') || 'None listed';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(chara.name)
        .setURL(chara.url)
        .setImage(chara.images?.jpg?.image_url || null)
        .setDescription(about)
        .addFields(
          { name: '🎬 Anime Appearances', value: animeAppearances.length > 500 ? animeAppearances.substring(0, 500) + '...' : animeAppearances, inline: false }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('character command error:', error);
      await interaction.reply({ content: 'There was an error searching for character.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide a character name to search.');
      const name = args.join(' ');
      const { data } = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1`);
      if (!data.data || !data.data.length) {
        return message.reply(`No character found for "${name}".`);
      }
      const chara = data.data[0];
      const about = chara.about ? (chara.about.length > 800 ? chara.about.substring(0, 800) + '...' : chara.about) : 'No description available.';
      const animeAppearances = chara.anime?.map(a => a.anime?.title).filter(Boolean).join(', ') || 'None listed';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(chara.name)
        .setURL(chara.url)
        .setImage(chara.images?.jpg?.image_url || null)
        .setDescription(about)
        .addFields(
          { name: '🎬 Anime Appearances', value: animeAppearances.length > 500 ? animeAppearances.substring(0, 500) + '...' : animeAppearances, inline: false }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('character prefix error:', error);
      await message.reply('There was an error searching for character.');
    }
  },
};
