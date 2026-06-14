const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { clearCache } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlanguage')
    .setDescription('Set the server language')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('The language to set')
        .setRequired(true)
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'Spanish', value: 'es' },
          { name: 'French', value: 'fr' },
          { name: 'German', value: 'de' },
          { name: 'Portuguese', value: 'pt' }
        )
    ),
  category: 'Config',
  usage: '/setlanguage <language>',
  description: 'Set the server language for bot responses',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const language = interaction.options.getString('language');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { language } },
        { upsert: true }
      );
      clearCache(interaction.guild.id);
      const langNames = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' };
      await interaction.reply({ content: `✅ Language set to ${langNames[language]}` });
    } catch (error) {
      console.error('setlanguage command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const language = args[0]?.toLowerCase();
      const validLangs = ['en', 'es', 'fr', 'de', 'pt'];
      if (!language || !validLangs.includes(language)) return message.reply('Usage: setlanguage <en|es|fr|de|pt>');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { language } },
        { upsert: true }
      );
      clearCache(message.guild.id);
      const langNames = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' };
      await message.channel.send(`✅ Language set to ${langNames[language]}`);
    } catch (error) {
      console.error('setlanguage prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
