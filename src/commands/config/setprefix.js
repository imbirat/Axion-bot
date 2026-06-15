const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Set the command prefix for the server')
    .addStringOption(opt =>
      opt.setName('prefix')
        .setDescription('New prefix (single character)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Config',
  usage: '/setprefix <prefix>',
  description: 'Update the server command prefix (admin only)',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const prefix = interaction.options.getString('prefix');
      if (prefix.length !== 1) {
        return interaction.reply({ content: '❌ Prefix must be a single character.', flags: MessageFlags.Ephemeral });
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $addToSet: { prefix } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ Prefix \`${prefix}\` has been added to the server prefix list.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('setprefix command error:', error);
      await interaction.reply({ content: 'There was an error setting the prefix.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❌ You need Administrator permission to use this command.');
      }
      const prefix = args[0];
      if (!prefix || prefix.length !== 1) return message.reply('❌ Usage: setprefix <prefix> (single character)');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { prefix: [prefix] } },
        { upsert: true }
      );
      await message.reply(`✅ Prefix set to \`${prefix}\`.`);
    } catch (error) {
      console.error('setprefix prefix error:', error);
      await message.reply('There was an error setting the prefix.');
    }
  },
};
