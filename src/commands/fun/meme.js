const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),
  category: 'Fun',
  usage: '/meme',
  description: 'Fetch a random meme from the internet',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const { data } = await axios.get('https://meme-api.com/gimme');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(data.title || 'Meme')
        .setURL(data.postLink || '')
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups || 0} | r/${data.subreddit || 'unknown'}` });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('meme command error:', error);
      await interaction.reply({ content: 'Could not fetch a meme right now.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const { data } = await axios.get('https://meme-api.com/gimme');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(data.title || 'Meme')
        .setURL(data.postLink || '')
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups || 0} | r/${data.subreddit || 'unknown'}` });
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('meme prefix error:', error);
      await message.reply('Could not fetch a meme right now.');
    }
  },
};
