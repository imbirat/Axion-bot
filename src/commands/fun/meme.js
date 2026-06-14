const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme from the internet'),
  category: 'Fun',
  usage: '/meme',
  description: 'Fetch a random meme from Reddit',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://meme-api.com/gimme');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(data.title)
        .setURL(data.postLink)
        .setImage(data.url)
        .addFields({ name: '👍 Upvotes', value: `${data.ups}`, inline: false });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('meme command error:', error);
      await interaction.reply({ content: 'Could not fetch a meme right now. Try again later.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const { data } = await axios.get('https://meme-api.com/gimme');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(data.title)
        .setURL(data.postLink)
        .setImage(data.url)
        .addFields({ name: '👍 Upvotes', value: `${data.ups}`, inline: false });
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('meme prefix error:', error);
      await message.reply('Could not fetch a meme right now. Try again later.');
    }
  },
};
