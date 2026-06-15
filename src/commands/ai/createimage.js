const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
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
  permissions: [],
  cooldown: 30,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const prompt = interaction.options.getString('prompt');
      const result = await geminiService.createImage(prompt);
      if (result.error) throw new Error(result.error);
      if (result.image?.url) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🎨 Generated Image')
          .setDescription(`Prompt: ${prompt}\n[Open image](${result.image.url})`)
          .setImage(result.image.url)
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
      if (result.text) {
        return interaction.editReply({ content: `Gemini returned text instead of an image:\n${result.text.substring(0, 1900)}` });
      }
      const ext = result.mimeType === 'image/png' ? 'png' : 'jpg';
      const attachment = new AttachmentBuilder(Buffer.from(result.data, 'base64'), { name: `image.${ext}` });
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎨 Generated Image')
        .setDescription(`Prompt: ${prompt}`)
        .setImage(`attachment://image.${ext}`)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed], files: [attachment] });
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
      if (result.error) throw new Error(result.error);
      if (result.image?.url) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🎨 Generated Image')
          .setDescription(`Prompt: ${prompt}\n[Open image](${result.image.url})`)
          .setImage(result.image.url)
          .setTimestamp();
        return message.channel.send({ embeds: [embed] });
      }
      if (result.text) {
        return message.channel.send(`Gemini returned text instead of an image:\n${result.text.substring(0, 1900)}`);
      }
      const ext = result.mimeType === 'image/png' ? 'png' : 'jpg';
      const attachment = new AttachmentBuilder(Buffer.from(result.data, 'base64'), { name: `image.${ext}` });
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎨 Generated Image')
        .setDescription(`Prompt: ${prompt}`)
        .setImage(`attachment://image.${ext}`)
        .setTimestamp();
      await message.channel.send({ embeds: [embed], files: [attachment] });
    } catch (error) {
      console.error('createimage prefix error:', error);
      await message.reply('There was an error generating the image.');
    }
  },
};
