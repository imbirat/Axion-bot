const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifylog')
    .setDescription('Set the verification log channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Log channel for verification events').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Set the verification log channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { verifyLogChannel: channel.id } },
      { upsert: true }
    );
    await interaction.reply({ content: `✅ Verification log channel set to ${channel}.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('Usage: verifylog <#channel>');
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $set: { verifyLogChannel: channel.id } },
      { upsert: true }
    );
    await message.reply(`✅ Verification log channel set to ${channel}.`);
  },
};
