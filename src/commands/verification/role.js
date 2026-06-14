const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyrole')
    .setDescription('Change the verify role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign on verify')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifyrole <@role>',
  description: 'Change the role assigned when users verify',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const role = interaction.options.getRole('role');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { verifyRole: role.id } }
      );
      await interaction.reply({ content: '✅ Verify role updated.', ephemeral: true });
    } catch (error) {
      console.error('verifyrole error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const role = message.mentions.roles.first();
      if (!role) return message.reply('Usage: verifyrole <@role>');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { verifyRole: role.id } }
      );
      await message.reply('✅ Verify role updated.');
    } catch (error) {
      console.error('verifyrole prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
