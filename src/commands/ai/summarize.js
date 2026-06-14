const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const geminiService = require('../../services/geminiService');

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchTranscript(videoId) {
  const res = await axios.get(`https://youtubetranscript.com/api?vid=${videoId}`, { timeout: 10000 });
  if (res.data && res.data.transcript) {
    return res.data.transcript;
  }
  if (Array.isArray(res.data)) {
    return res.data.map(s => s.text || '').join(' ');
  }
  if (typeof res.data === 'string') return res.data;
  throw new Error('Could not parse transcript');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize a YouTube video using AI')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube video URL')
        .setRequired(true)),
  category: 'AI',
  usage: '/summarize <url>',
  description: 'Fetch a YouTube video transcript and summarize it with AI',
  permissions: 'Everyone',
  cooldown: 30,
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const url = interaction.options.getString('url');
      const videoId = extractVideoId(url);
      if (!videoId) {
        return interaction.editReply({ content: '❌ Invalid YouTube URL. Please provide a valid YouTube video link.' });
      }

      await interaction.editReply({ content: '⏳ Fetching transcript...' });
      const transcript = await fetchTranscript(videoId);

      if (!transcript || transcript.length < 20) {
        return interaction.editReply({ content: '❌ Could not fetch a transcript for this video. It may have auto-generated captions disabled.' });
      }

      await interaction.editReply({ content: '⏳ Summarizing with AI...' });
      const truncated = transcript.length > 15000 ? transcript.slice(0, 15000) : transcript;
      const summary = await geminiService.summarize(truncated, url);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📝 Video Summary')
        .setURL(url)
        .setDescription(summary.length > 4000 ? summary.slice(0, 3997) + '...' : summary)
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('summarize command error:', error);
      await interaction.editReply({ content: '❌ Failed to summarize the video. The video may not have captions or the service is unavailable.' });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Usage: summarize <youtube-url>');
      const url = args[0];
      const videoId = extractVideoId(url);
      if (!videoId) return message.reply('❌ Invalid YouTube URL.');

      const status = await message.reply('⏳ Fetching transcript...');
      const transcript = await fetchTranscript(videoId);

      if (!transcript || transcript.length < 20) {
        return status.edit('❌ Could not fetch a transcript for this video.');
      }

      await status.edit('⏳ Summarizing with AI...');
      const truncated = transcript.length > 15000 ? transcript.slice(0, 15000) : transcript;
      const summary = await geminiService.summarize(truncated, url);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📝 Video Summary')
        .setURL(url)
        .setDescription(summary.length > 4000 ? summary.slice(0, 3997) + '...' : summary)
        .setTimestamp();

      await status.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('summarize prefix error:', error);
      await message.reply('❌ Failed to summarize the video.');
    }
  },
};
