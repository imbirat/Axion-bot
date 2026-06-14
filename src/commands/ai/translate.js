const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const geminiService = require('../../services/geminiService');

const LANGUAGES = [
  { name: 'English', value: 'en' },
  { name: 'Spanish', value: 'es' },
  { name: 'French', value: 'fr' },
  { name: 'German', value: 'de' },
  { name: 'Portuguese', value: 'pt' },
  { name: 'Italian', value: 'it' },
  { name: 'Japanese', value: 'ja' },
  { name: 'Chinese', value: 'zh' },
  { name: 'Korean', value: 'ko' },
  { name: 'Russian', value: 'ru' },
  { name: 'Arabic', value: 'ar' },
  { name: 'Hindi', value: 'hi' },
  { name: 'Dutch', value: 'nl' },
  { name: 'Polish', value: 'pl' },
  { name: 'Turkish', value: 'tr' },
  { name: 'Thai', value: 'th' },
  { name: 'Vietnamese', value: 'vi' },
  { name: 'Greek', value: 'el' },
  { name: 'Hebrew', value: 'he' },
  { name: 'Swedish', value: 'sv' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to another language using AI')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to translate')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(...LANGUAGES.map(l => ({ name: l.name, value: l.value })))),
  category: 'AI',
  usage: '/translate <text> <language>',
  description: 'Translate any text to another language using Gemini AI',
  permissions: 'Everyone',
  cooldown: 10,
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const text = interaction.options.getString('text');
      const langCode = interaction.options.getString('language');
      const langName = LANGUAGES.find(l => l.value === langCode)?.name || langCode;

      const translated = await geminiService.translate(text, langName);
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🌐 Translation')
        .addFields(
          { name: 'Original', value: text.length > 1024 ? text.slice(0, 1021) + '...' : text, inline: false },
          { name: `Translated (${langName})`, value: translated.length > 1024 ? translated.slice(0, 1021) + '...' : translated, inline: false }
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('translate command error:', error);
      await interaction.editReply({ content: '❌ Translation failed. Please try again.' });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length < 2) return message.reply('Usage: translate <language> <text>\nExample: translate Spanish Hello, how are you?');

      const langInput = args[0];
      const text = args.slice(1).join(' ');
      const langName = LANGUAGES.find(l => l.value === langInput.toLowerCase() || l.name.toLowerCase() === langInput.toLowerCase())?.name || langInput;

      const translated = await geminiService.translate(text, langName);
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🌐 Translation')
        .addFields(
          { name: 'Original', value: text.length > 1024 ? text.slice(0, 1021) + '...' : text, inline: false },
          { name: `Translated (${langName})`, value: translated.length > 1024 ? translated.slice(0, 1021) + '...' : translated, inline: false }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('translate prefix error:', error);
      await message.reply('❌ Translation failed.');
    }
  },
};
