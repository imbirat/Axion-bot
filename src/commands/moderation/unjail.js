const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { t } = require('../../utils/i18n');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unjail')
    .setDescription('Unjail a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unjail')
        .setRequired(true)
    ),
  category: 'Moderation',
  usage: '/unjail <user>',
  description: 'Remove the jail role and restore previous roles',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.user_not_found', { defaultValue: 'Could not find that user in this server.' }), flags: MessageFlags.Ephemeral });
      }

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      const jailRoleId = config?.jailRole;
      const hasJailRole = jailRoleId && member.roles.cache.has(jailRoleId);

      if (!hasJailRole) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.not_jailed', { defaultValue: 'That user is not jailed.' }), flags: MessageFlags.Ephemeral });
      }

      const profile = await UserProfile.findOne({ userId: targetUser.id, guildId: interaction.guild.id });
      const previousRoles = profile?.previousRoles || [];

      const rolesToRestore = previousRoles
        .map(id => interaction.guild.roles.cache.get(id))
        .filter(r => r);

      if (rolesToRestore.length > 0) {
        await member.roles.set(rolesToRestore);
      } else {
        await member.roles.remove(jailRoleId);
      }

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: interaction.guild.id },
        { $set: { jailed: false }, $unset: { previousRoles: '' } }
      );

      const reply = await t(interaction.guild.id, 'moderation.unjail.success', {
        defaultValue: '🔓 **{{user}}** has been unjailed.',
        user: targetUser.tag
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('unjail command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to unjail.');

      const member = message.guild.members.cache.get(targetUser.id);
      if (!member) return message.reply('Could not find that user in this server.');

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      const jailRoleId = config?.jailRole;
      const hasJailRole = jailRoleId && member.roles.cache.has(jailRoleId);

      if (!hasJailRole) return message.reply('That user is not jailed.');

      const profile = await UserProfile.findOne({ userId: targetUser.id, guildId: message.guild.id });
      const previousRoles = profile?.previousRoles || [];

      const rolesToRestore = previousRoles
        .map(id => message.guild.roles.cache.get(id))
        .filter(r => r);

      if (rolesToRestore.length > 0) {
        await member.roles.set(rolesToRestore);
      } else {
        await member.roles.remove(jailRoleId);
      }

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: message.guild.id },
        { $set: { jailed: false }, $unset: { previousRoles: '' } }
      );

      await message.channel.send(`🔓 **${targetUser.tag}** has been unjailed.`);
    } catch (error) {
      console.error('unjail prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
