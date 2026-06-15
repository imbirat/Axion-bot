const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Auto-moderation settings')
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable auto-moderation')
        .addStringOption(opt =>
          opt.setName('module')
            .setDescription('Specific module to toggle')
            .setRequired(false)
            .addChoices(
              { name: 'All', value: 'all' },
              { name: 'Invite Protection', value: 'invite' },
              { name: 'Caps Protection', value: 'caps' },
              { name: 'Spam Protection', value: 'spam' },
              { name: 'Bad Word Filter', value: 'badword' }
            )))
    .addSubcommand(sub => sub.setName('disable').setDescription('Disable auto-moderation'))
    .addSubcommand(sub => sub.setName('config').setDescription('View auto-moderation configuration'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Auto-Mod',
  usage: '/automod <enable|disable|config>',
  description: 'Manage auto-moderation features for the server',
  permissions: ['Administrator'],
  cooldown: 5,
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
            { name: 'Anti-Spam', value: config?.spamEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Invite', value: config?.inviteEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Caps', value: config?.capsEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Word Filter', value: config?.badWordEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Action', value: config?.automodAction || 'warn', inline: true }
          );
        await interaction.reply({ embeds: [embed] });
      } else if (sub === 'enable') {
        const module = interaction.options.getString('module') || 'all';
        if (module === 'all') {
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { automodEnabled: true, inviteEnabled: true, capsEnabled: true, spamEnabled: true, badWordEnabled: true } },
            { upsert: true }
          );
          await interaction.reply({ content: '✅ Auto-mod fully enabled.' });
        } else {
          const fieldMap = { invite: 'inviteEnabled', caps: 'capsEnabled', spam: 'spamEnabled', badword: 'badWordEnabled' };
          if (fieldMap[module]) {
            const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            const current = config?.[fieldMap[module]] !== false;
            await GuildConfig.findOneAndUpdate(
              { guildId: interaction.guild.id },
              { $set: { [fieldMap[module]]: !current, automodEnabled: true } },
              { upsert: true }
            );
            await interaction.reply({ content: `✅ ${module.charAt(0).toUpperCase() + module.slice(1)} protection ${!current ? 'enabled' : 'disabled'}.` });
          }
        }
      } else {
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { automodEnabled: false } },
          { upsert: true }
        );
        await interaction.reply({ content: '✅ Auto-mod disabled.' });
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
            { name: 'Anti-Spam', value: config?.spamEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Invite', value: config?.inviteEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Anti-Caps', value: config?.capsEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Word Filter', value: config?.badWordEnabled !== false ? '✅ Active' : '❌ Inactive', inline: true },
            { name: 'Action', value: config?.automodAction || 'warn', inline: true }
          );
        await message.channel.send({ embeds: [embed] });
      } else if (sub === 'enable') {
        const moduleArg = args[1]?.toLowerCase();
        if (!moduleArg || moduleArg === 'all') {
          await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { $set: { automodEnabled: true, inviteEnabled: true, capsEnabled: true, spamEnabled: true, badWordEnabled: true } },
            { upsert: true }
          );
          await message.channel.send('✅ Auto-mod fully enabled.');
        } else if (['invite', 'caps', 'spam', 'badword'].includes(moduleArg)) {
          const fieldMap = { invite: 'inviteEnabled', caps: 'capsEnabled', spam: 'spamEnabled', badword: 'badWordEnabled' };
          const config = await GuildConfig.findOne({ guildId: message.guild.id });
          const current = config?.[fieldMap[moduleArg]] !== false;
          await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { $set: { [fieldMap[moduleArg]]: !current, automodEnabled: true } },
            { upsert: true }
          );
          await message.channel.send(`✅ ${moduleArg.charAt(0).toUpperCase() + moduleArg.slice(1)} protection ${!current ? 'enabled' : 'disabled'}.`);
        } else {
          await message.reply('Usage: automod enable [all|invite|caps|spam|badword]');
        }
      } else {
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { automodEnabled: false } },
          { upsert: true }
        );
        await message.channel.send('✅ Auto-mod disabled.');
      }
    } catch (error) {
      console.error('automod prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
