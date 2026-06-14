const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unverify')
    .setDescription('Remove verify role from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unverify')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/unverify <user>',
  description: 'Remove the verified role from a user',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
      }

      const member = await interaction.guild.members.fetch(target.id);
      await member.roles.remove(guildConfig.verifyRole);

      await interaction.reply({ content: `✅ Removed verify role from ${target}.`, ephemeral: true });
    } catch (error) {
      console.error('unverify error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.members.first();
      if (!target) return message.reply('Usage: unverify <@user>');

      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return message.reply('Verification role not configured.');
      }

      await target.roles.remove(guildConfig.verifyRole);
      await message.reply(`✅ Removed verify role from ${target.user}.`);
    } catch (error) {
      console.error('unverify prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
