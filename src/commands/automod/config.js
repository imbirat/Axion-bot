const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder , MessageFlags} = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Auto-moderation settings')
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('View auto-moderation configuration'))
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable auto-moderation'))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable auto-moderation'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Auto-Mod',
  usage: '/automod <config|enable|disable>',
  description: 'Manage auto-moderation features for the server',
  permissions: ['Administrator'],
  cooldown: 5,
  prefixAliases: ['automod-config', 'automod-enable', 'automod-disable'],
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'config') {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const enabled = config?.automodEnabled || false;
        const embed = new EmbedBuilder()
          .setColor(enabled ? 0x57F287 : 0xED4245)
          .setTitle('Auto-Mod Configuration')
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false },
            { name: 'Anti-Spam', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Invite', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Caps', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Word Filter', value: enabled ? '✅ Active' : '❌ Inactive', inline: true }
          );
        await interaction.reply({ embeds: [embed] });
      } else {
        const val = sub === 'enable';
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { automodEnabled: val } },
          { upsert: true }
        );
        await interaction.reply({ content: `✅ Auto-Mod ${val ? 'enabled' : 'disabled'}.` });
      }
    } catch (error) {
      console.error('automod command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    try {
      if (sub === 'config' || !sub) {
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const enabled = config?.automodEnabled || false;
        const embed = new EmbedBuilder()
          .setColor(enabled ? 0x57F287 : 0xED4245)
          .setTitle('Auto-Mod Configuration')
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false },
            { name: 'Anti-Spam', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Invite', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Caps', value: enabled ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Word Filter', value: enabled ? '✅ Active' : '❌ Inactive', inline: true }
          );
        await message.channel.send({ embeds: [embed] });
      } else {
        const val = sub === 'enable';
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { automodEnabled: val } },
          { upsert: true }
        );
        await message.channel.send(`✅ Auto-Mod ${val ? 'enabled' : 'disabled'}.`);
      }
    } catch (error) {
      console.error('automod prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
