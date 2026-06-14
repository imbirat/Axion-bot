const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const geminiService = require('../../services/geminiService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createimage')
    .setDescription('Generate an image using AI')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Description of the image to generate')
        .setRequired(true)),
  category: 'AI',
  usage: '/createimage <prompt>',
  description: 'Generate an image based on a text prompt using Gemini AI',
  permissions: 'Everyone',
  cooldown: 30,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const prompt = interaction.options.getString('prompt');
      const result = await geminiService.createImage(prompt);
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎨 Generated Image')
        .setDescription(`Prompt: ${prompt}`)
        .setImage(result?.image?.url || null)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('createimage command error:', error);
      await interaction.editReply({ content: 'There was an error generating the image.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide a prompt for the image.');
      const prompt = args.join(' ');
      const result = await geminiService.createImage(prompt);
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎨 Generated Image')
        .setDescription(`Prompt: ${prompt}`)
        .setImage(result?.image?.url || null)
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('createimage prefix error:', error);
      await message.reply('There was an error generating the image.');
    }
  },
};
