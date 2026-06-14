const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ReactionRole = require('../../models/ReactionRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage auto-role assignments')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a role to auto-roles')
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription('Role to assign on join')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a role from auto-roles')
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription('Role to remove from auto-roles')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all auto-roles'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Auto Role',
  usage: '/autorole add <role> | /autorole remove <role> | /autorole list',
  description: 'Manage roles that are automatically assigned to new members',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();
      const role = interaction.options.getRole('role');

      if (sub === 'add') {
        const existing = await ReactionRole.findOne({
          guildId: interaction.guild.id,
          type: 'auto',
          'roles.roleId': role.id
        });

        if (existing) {
          return interaction.reply({ content: `${role} is already an auto-role.`, ephemeral: true });
        }

        await ReactionRole.findOneAndUpdate(
          { guildId: interaction.guild.id, type: 'auto' },
          { $push: { roles: { roleId: role.id } }, $setOnInsert: { guildId: interaction.guild.id, messageId: 'auto', channelId: 'auto', type: 'auto' } },
          { upsert: true }
        );

        await interaction.reply({ content: `✅ ${role} added to auto-roles.`, ephemeral: true });
        return;
      }

      if (sub === 'remove') {
        const result = await ReactionRole.findOneAndUpdate(
          { guildId: interaction.guild.id, type: 'auto' },
          { $pull: { roles: { roleId: role.id } } }
        );

        if (!result) {
          return interaction.reply({ content: `${role} is not in auto-roles.`, ephemeral: true });
        }

        await interaction.reply({ content: `✅ ${role} removed from auto-roles.`, ephemeral: true });
        return;
      }

      if (sub === 'list') {
        const doc = await ReactionRole.findOne({ guildId: interaction.guild.id, type: 'auto' });
        if (!doc || doc.roles.length === 0) {
          return interaction.reply({ content: 'No auto-roles configured.', ephemeral: true });
        }

        const mentions = doc.roles.map(r => `<@&${r.roleId}>`).join(', ');
        await interaction.reply({ content: `**Auto-Roles:** ${mentions}`, ephemeral: true });
      }
    } catch (error) {
      console.error('autorole error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];

      if (sub === 'add') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('Usage: autorole add <@role>');

        const existing = await ReactionRole.findOne({
          guildId: message.guild.id,
          type: 'auto',
          'roles.roleId': role.id
        });

        if (existing) return message.reply(`${role} is already an auto-role.`);

        await ReactionRole.findOneAndUpdate(
          { guildId: message.guild.id, type: 'auto' },
          { $push: { roles: { roleId: role.id } }, $setOnInsert: { guildId: message.guild.id, messageId: 'auto', channelId: 'auto', type: 'auto' } },
          { upsert: true }
        );

        await message.reply(`✅ ${role} added to auto-roles.`);
        return;
      }

      if (sub === 'remove') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('Usage: autorole remove <@role>');

        const result = await ReactionRole.findOneAndUpdate(
          { guildId: message.guild.id, type: 'auto' },
          { $pull: { roles: { roleId: role.id } } }
        );

        if (!result) return message.reply(`${role} is not in auto-roles.`);

        await message.reply(`✅ ${role} removed from auto-roles.`);
        return;
      }

      if (sub === 'list') {
        const doc = await ReactionRole.findOne({ guildId: message.guild.id, type: 'auto' });
        if (!doc || doc.roles.length === 0) return message.reply('No auto-roles configured.');

        const mentions = doc.roles.map(r => `<@&${r.roleId}>`).join(', ');
        await message.reply(`**Auto-Roles:** ${mentions}`);
        return;
      }

      await message.reply('Usage: autorole add <@role> | autorole remove <@role> | autorole list');
    } catch (error) {
      console.error('autorole prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
