const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animequote')
    .setDescription('Get a random anime quote'),
  category: 'Anime',
  usage: '/animequote',
  description: 'Fetch a random anime quote from AnimeChan',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://animechan.xyz/api/random');
      const quote = data.quote || 'No quote available';
      const character = data.character || 'Unknown';
      const anime = data.anime || 'Unknown';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(`"${quote}"`)
        .addFields(
          { name: '— Character', value: character, inline: true },
          { name: 'Anime', value: anime, inline: true }
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
      const quote = data.quote || 'No quote available';
      const character = data.character || 'Unknown';
      const anime = data.anime || 'Unknown';
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(`"${quote}"`)
        .addFields(
          { name: '— Character', value: character, inline: true },
          { name: 'Anime', value: anime, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('animequote prefix error:', error);
      await message.reply('Could not fetch an anime quote right now.');
    }
  },
};
