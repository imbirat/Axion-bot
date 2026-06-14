const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waifu')
    .setDescription('Get a random waifu image'),
  category: 'Anime',
  usage: '/waifu',
  description: 'Fetch a random waifu image',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/waifu');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setImage(data.url);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('waifu command error:', error);
      await interaction.reply({ content: 'Could not fetch a waifu image right now.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/waifu');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setImage(data.url);
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('waifu prefix error:', error);
      await message.reply('Could not fetch a waifu image right now.');
    }
  },
};
