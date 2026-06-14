const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifymode')
    .setDescription('Set the verification mode')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Verification method')
        .setRequired(true)
        .addChoices(
          { name: 'Button', value: 'button' },
          { name: 'Captcha', value: 'captcha' },
          { name: 'Reaction', value: 'reaction' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifymode <button|captcha|reaction>',
  description: 'Change how users verify (button, captcha, or reaction)',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const mode = interaction.options.getString('mode');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { verifyMode: mode } }
      );
      await interaction.reply({ content: `✅ Verify mode set to ${mode}.`, ephemeral: true });
    } catch (error) {
      console.error('verifymode error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const mode = args[0]?.toLowerCase();
      if (!mode || !['button', 'captcha', 'reaction'].includes(mode)) {
        return message.reply('Usage: verifymode <button|captcha|reaction>');
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { verifyMode: mode } }
      );
      await message.reply(`✅ Verify mode set to ${mode}.`);
    } catch (error) {
      console.error('verifymode prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
