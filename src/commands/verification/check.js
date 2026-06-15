const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifycheck')
    .setDescription('Check if a user is verified')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to check').setRequired(false)),
  category: 'Verification',
  description: 'Check if a user is verified',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) {
      return interaction.reply({ content: 'Verification role not configured.', flags: MessageFlags.Ephemeral });
    }
    const member = await interaction.guild.members.fetch(target.id);
    const verified = member.roles.cache.has(guildConfig.verifyRole);
    await interaction.reply({ content: verified ? `✅ ${target} is verified` : `❌ ${target} is not verified.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const target = message.mentions.members.first() || message.member;
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification role not configured.');
    const verified = target.roles.cache.has(guildConfig.verifyRole);
    await message.reply(verified ? `✅ ${target.user} is verified` : `❌ ${target.user} is not verified.`);
  },
};
