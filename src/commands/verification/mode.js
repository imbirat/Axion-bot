const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifymode')
    .setDescription('Change the verification mode')
    .addStringOption(opt =>
      opt.setName('mode').setDescription('Verification method').setRequired(true)
        .addChoices(
          { name: 'Button', value: 'button' },
          { name: 'Captcha', value: 'captcha' },
          { name: 'Reaction', value: 'reaction' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Change the verification mode',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const mode = interaction.options.getString('mode');
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { verifyMode: mode } },
      { upsert: true }
    );
    await interaction.reply({ content: `✅ Verification mode set to **${mode}**.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const mode = args[0]?.toLowerCase();
    if (!mode || !['button', 'captcha', 'reaction'].includes(mode)) return message.reply('Usage: verifymode <button|captcha|reaction>');
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $set: { verifyMode: mode } },
      { upsert: true }
    );
    await message.reply(`✅ Verification mode set to **${mode}**.`);
  },
};
