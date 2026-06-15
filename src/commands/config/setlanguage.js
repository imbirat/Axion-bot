const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const i18n = require('../../utils/i18n');

const LANGUAGES = [
  { name: 'English', value: 'en' },
  { name: 'Spanish', value: 'es' },
  { name: 'French', value: 'fr' },
  { name: 'German', value: 'de' },
  { name: 'Portuguese', value: 'pt' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlanguage')
    .setDescription('Set the server language')
    .addStringOption(opt =>
      opt.setName('language')
        .setDescription('Language to set')
        .setRequired(true)
        .addChoices(...LANGUAGES))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Config',
  usage: '/setlanguage <language>',
  description: 'Change the server language for bot responses',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const lang = interaction.options.getString('language');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { language: lang } },
        { upsert: true }
      );
      i18n.clearCache(interaction.guild.id);
      const langName = LANGUAGES.find(l => l.value === lang)?.name || lang;
      await interaction.reply({ content: `✅ Language set to **${langName}**.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('setlanguage command error:', error);
      await interaction.reply({ content: 'There was an error setting the language.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const lang = args[0]?.toLowerCase();
      const valid = LANGUAGES.map(l => l.value);
      if (!lang || !valid.includes(lang)) {
        return message.reply(`Usage: setlanguage <${valid.join('|')}>`);
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { language: lang } },
        { upsert: true }
      );
      i18n.clearCache(message.guild.id);
      const langName = LANGUAGES.find(l => l.value === lang)?.name || lang;
      await message.reply(`✅ Language set to **${langName}**.`);
    } catch (error) {
      console.error('setlanguage prefix error:', error);
      await message.reply('There was an error setting the language.');
    }
  },
};
