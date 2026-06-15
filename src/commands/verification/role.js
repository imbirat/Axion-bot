const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyrole')
    .setDescription('Change the verified role')
    .addRoleOption(opt =>
      opt.setName('role').setDescription('The role to assign on verification').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Change the verified role',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const role = interaction.options.getRole('role');
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { verifyRole: role.id } },
      { upsert: true }
    );
    await interaction.reply({ content: `✅ Verify role updated to ${role}.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const role = message.mentions.roles.first();
    if (!role) return message.reply('Usage: verifyrole <@role>');
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $set: { verifyRole: role.id } },
      { upsert: true }
    );
    await message.reply(`✅ Verify role updated to ${role}.`);
  },
};
