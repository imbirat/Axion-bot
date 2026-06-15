const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage auto-role assignments')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a role to auto-roles')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to assign on join').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a role from auto-roles')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all configured auto-roles'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Auto Role',
  usage: '/autorole <add|remove|list> [role]',
  description: 'Manage roles automatically assigned to new members',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'add') {
        const role = interaction.options.getRole('role');
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const autoRoles = config?.autoRoles || [];
        if (autoRoles.includes(role.id)) {
          return interaction.reply({ content: `${role} is already an auto-role.`, flags: MessageFlags.Ephemeral });
        }
        autoRoles.push(role.id);
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { autoRoles } },
          { upsert: true }
        );
        await interaction.reply({ content: `✅ ${role} added to auto-roles.`, flags: MessageFlags.Ephemeral });
      } else if (sub === 'remove') {
        const role = interaction.options.getRole('role');
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const autoRoles = config?.autoRoles || [];
        if (!autoRoles.includes(role.id)) {
          return interaction.reply({ content: `${role} is not in auto-roles.`, flags: MessageFlags.Ephemeral });
        }
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $pull: { autoRoles: role.id } }
        );
        await interaction.reply({ content: `✅ ${role} removed from auto-roles.`, flags: MessageFlags.Ephemeral });
      } else {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const autoRoles = config?.autoRoles || [];
        if (!autoRoles.length) {
          return interaction.reply({ content: 'No auto-roles configured.', flags: MessageFlags.Ephemeral });
        }
        const mentions = autoRoles.map(id => `<@&${id}>`).join(', ');
        await interaction.reply({ content: `**Auto-Roles:** ${mentions}`, flags: MessageFlags.Ephemeral });
      }
    } catch (error) {
      console.error('autorole command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0]?.toLowerCase();
      if (sub === 'add') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('Usage: autorole add <@role>');
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const autoRoles = config?.autoRoles || [];
        if (autoRoles.includes(role.id)) return message.reply(`${role} is already an auto-role.`);
        autoRoles.push(role.id);
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { autoRoles } },
          { upsert: true }
        );
        await message.reply(`✅ ${role} added to auto-roles.`);
      } else if (sub === 'remove') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('Usage: autorole remove <@role>');
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const autoRoles = config?.autoRoles || [];
        if (!autoRoles.includes(role.id)) return message.reply(`${role} is not in auto-roles.`);
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $pull: { autoRoles: role.id } }
        );
        await message.reply(`✅ ${role} removed from auto-roles.`);
      } else {
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const autoRoles = config?.autoRoles || [];
        if (!autoRoles.length) return message.reply('No auto-roles configured.');
        const mentions = autoRoles.map(id => `<@&${id}>`).join(', ');
        await message.reply(`**Auto-Roles:** ${mentions}`);
      }
    } catch (error) {
      console.error('autorole prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
