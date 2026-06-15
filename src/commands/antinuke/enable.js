const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Anti-nuke protection settings')
    .addSubcommand(sub => sub.setName('enable').setDescription('Enable anti-nuke protection'))
    .addSubcommand(sub => sub.setName('disable').setDescription('Disable anti-nuke protection'))
    .addSubcommand(sub => sub.setName('config').setDescription('View anti-nuke configuration'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Anti-Nuke',
  usage: '/antinuke <enable|disable|config>',
  description: 'Manage anti-nuke protection settings',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'config') {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const enabled = config?.antinukeEnabled || false;
        const action = config?.antinukeAction || 'ban';
        const whitelist = config?.antinukeWhitelist || [];
        const logChannel = config?.antinukeLogChannel ? `<#${config.antinukeLogChannel}>` : 'Not set';
        const embed = new EmbedBuilder()
          .setColor(enabled ? 0x57F287 : 0xED4245)
          .setTitle('Anti-Nuke Configuration')
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false },
            { name: 'Action', value: action, inline: true },
            { name: 'Log Channel', value: logChannel, inline: true },
            { name: 'Whitelisted Users', value: whitelist.length ? whitelist.map(id => `<@${id}>`).join(', ') : 'None', inline: false }
          );
        await interaction.reply({ embeds: [embed] });
      } else {
        const val = sub === 'enable';
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { antinukeEnabled: val } },
          { upsert: true }
        );
        await interaction.reply({ content: `✅ Anti-nuke ${val ? 'enabled' : 'disabled'}.` });
      }
    } catch (error) {
      console.error('antinuke command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    try {
      if (sub === 'config' || !sub) {
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const enabled = config?.antinukeEnabled || false;
        const action = config?.antinukeAction || 'ban';
        const whitelist = config?.antinukeWhitelist || [];
        const logChannel = config?.antinukeLogChannel ? `<#${config.antinukeLogChannel}>` : 'Not set';
        const embed = new EmbedBuilder()
          .setColor(enabled ? 0x57F287 : 0xED4245)
          .setTitle('Anti-Nuke Configuration')
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: false },
            { name: 'Action', value: action, inline: true },
            { name: 'Log Channel', value: logChannel, inline: true },
            { name: 'Whitelisted Users', value: whitelist.length ? whitelist.map(id => `<@${id}>`).join(', ') : 'None', inline: false }
          );
        await message.channel.send({ embeds: [embed] });
      } else {
        const val = sub === 'enable';
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { antinukeEnabled: val } },
          { upsert: true }
        );
        await message.channel.send(`✅ Anti-nuke ${val ? 'enabled' : 'disabled'}.`);
      }
    } catch (error) {
      console.error('antinuke prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
