const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const TempVC = require('../../models/TempVC');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvc-config')
    .setDescription('Configure temp VC settings')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('Name template. Use {user} and {count} variables')
        .setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('limit')
        .setDescription('User limit for created VCs (0 for unlimited)')
        .setRequired(false)
        .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Temp VC',
  description: 'Manages name template, user limit, or disable for temp voice channels',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const name = interaction.options.getString('name');
      const limit = interaction.options.getInteger('limit');

      const update = {};
      if (name) update.nameTemplate = name;
      if (limit !== null) update.userLimit = limit;

      if (Object.keys(update).length === 0) {
        const config = await TempVC.findOne({ guildId: interaction.guild.id });
        if (!config) {
          return interaction.reply({ content: 'Temp VC not configured. Use `/tempvc-setup` first.', flags: MessageFlags.Ephemeral });
        }
        return interaction.reply({
          content: `**Temp VC Config**\nJoin Channel: <#${config.joinChannelId}>\nName Template: \`${config.nameTemplate}\`\nUser Limit: ${config.userLimit || 'Unlimited'}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await TempVC.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: update },
        { upsert: true }
      );

      await interaction.reply({ content: '✅ Temp VC config updated.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('tempvc-config error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const name = args.find(a => a.startsWith('name:'));
      const limit = args.find(a => a.startsWith('limit:'));

      const update = {};
      if (name) update.nameTemplate = name.replace('name:', '');
      if (limit) update.userLimit = parseInt(limit.replace('limit:', ''), 10);

      if (Object.keys(update).length === 0) {
        const config = await TempVC.findOne({ guildId: message.guild.id });
        if (!config) return message.reply('Temp VC not configured. Use `tempvc-setup` first.');
        return message.reply(`**Temp VC Config**\nJoin Channel: <#${config.joinChannelId}>\nName Template: \`${config.nameTemplate}\`\nUser Limit: ${config.userLimit || 'Unlimited'}`);
      }

      await TempVC.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: update },
        { upsert: true }
      );

      await message.reply('✅ Temp VC config updated.');
    } catch (error) {
      console.error('tempvc-config prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
