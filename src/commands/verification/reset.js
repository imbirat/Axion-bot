const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyreset')
    .setDescription('Reset all verification settings and delete panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Reset all verification settings and delete panel',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (guildConfig?.verifyChannel) {
      const channel = interaction.guild.channels.cache.get(guildConfig.verifyChannel);
      if (channel) {
        const messages = await channel.messages.fetch({ limit: 50 });
        const panel = messages.find(m => m.author.id === client.user.id && m.components.length > 0);
        if (panel) await panel.delete().catch(() => {});
      }
    }
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $unset: { verifyChannel: '', verifyRole: '', verifyLogChannel: '', verifyMessage: '' }, $set: { verifyEnabled: false, verifyMode: 'button' } }
    );
    await interaction.reply({ content: '✅ Verification settings have been reset.', flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (guildConfig?.verifyChannel) {
      const channel = message.guild.channels.cache.get(guildConfig.verifyChannel);
      if (channel) {
        const messages = await channel.messages.fetch({ limit: 50 });
        const panel = messages.find(m => m.author.id === client.user.id && m.components.length > 0);
        if (panel) await panel.delete().catch(() => {});
      }
    }
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $unset: { verifyChannel: '', verifyRole: '', verifyLogChannel: '', verifyMessage: '' }, $set: { verifyEnabled: false, verifyMode: 'button' } }
    );
    await message.reply('✅ Verification settings have been reset.');
  },
};
