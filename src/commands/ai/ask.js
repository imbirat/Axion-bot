const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const geminiService = require('../../services/geminiService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI a question')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Your question or prompt')
        .setRequired(true)),
  category: 'AI',
  usage: '/ask <prompt>',
  description: 'Ask the Gemini AI a question and get a response',
  permissions: 'Everyone',
  cooldown: 10,
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const prompt = interaction.options.getString('prompt');
      const response = await geminiService.ask(prompt);
      const truncated = response.length > 2000 ? response.substring(0, 1997) + '...' : response;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🤖 AI Response')
        .setDescription(truncated)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('ask command error:', error);
      await interaction.editReply({ content: 'There was an error getting a response from the AI.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide a prompt for the AI.');
      const prompt = args.join(' ');
      const response = await geminiService.ask(prompt);
      const truncated = response.length > 2000 ? response.substring(0, 1997) + '...' : response;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🤖 AI Response')
        .setDescription(truncated)
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('ask prefix error:', error);
      await message.reply('There was an error getting a response from the AI.');
    }
  },
};
