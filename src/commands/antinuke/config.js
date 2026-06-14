const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Anti-nuke protection settings')
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('View anti-nuke configuration'))
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable anti-nuke protection'))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable anti-nuke protection'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Anti-Nuke',
  usage: '/antinuke <config|enable|disable>',
  description: 'Manage anti-nuke protection for the server',
  permissions: ['Administrator'],
  cooldown: 5,
  prefixAliases: ['antinuke-config', 'antinuke-enable', 'antinuke-disable'],
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'config') {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const enabled = config?.antinukeEnabled || false;
        const embed = new EmbedBuilder()
          .setColor(enabled ? 0x57F287 : 0xED4245)
          .setTitle('Anti-Nuke Configuration')
          .addFields({ name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false });
        await interaction.reply({ embeds: [embed] });
      } else {
        const val = sub === 'enable';
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { antinukeEnabled: val } },
          { upsert: true }
        );
        await interaction.reply({ content: `✅ Anti-Nuke ${val ? 'enabled' : 'disabled'}.` });
      }
    } catch (error) {
      console.error('antinuke command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    try {
      if (sub === 'config' || !sub) {
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const enabled = config?.antinukeEnabled || false;
        const embed = new EmbedBuilder()
          .setColor(enabled ? 0x57F287 : 0xED4245)
          .setTitle('Anti-Nuke Configuration')
          .addFields({ name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false });
        await message.channel.send({ embeds: [embed] });
      } else {
        const val = sub === 'enable';
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { antinukeEnabled: val } },
          { upsert: true }
        );
        await message.channel.send(`✅ Anti-Nuke ${val ? 'enabled' : 'disabled'}.`);
      }
    } catch (error) {
      console.error('antinuke prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
