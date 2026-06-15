const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail')
    .setDescription('Jail a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to jail')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for jailing')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Moderation',
  description: 'Jail a user by removing all roles and assigning the jail role',
  permissions: ['Administrator'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ embeds: [errorEmbed('Could not find that user in this server.')], flags: MessageFlags.Ephemeral });
      }

      let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config) {
        config = new GuildConfig({ guildId: interaction.guild.id });
      }

      let jailRole = config.jailRole ? interaction.guild.roles.cache.get(config.jailRole) : null;
      if (!jailRole) {
        jailRole = await interaction.guild.roles.create({
          name: 'Jailed',
          permissions: [],
          reason: 'Auto-created jail role'
        });
        config.jailRole = jailRole.id;
        await config.save();
      }

      const originalRoles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id && r.id !== jailRole.id)
        .map(r => r.id);

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: interaction.guild.id },
        { $set: { jailed: true, roles: originalRoles }, $setOnInsert: { userId: targetUser.id, guildId: interaction.guild.id } },
        { upsert: true }
      );

      await member.roles.set([jailRole.id]);

      await interaction.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been jailed. Reason: ${reason}`)] });
    } catch (error) {
      console.error('jail command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to jail.');

      const reason = args.slice(1).join(' ') || 'No reason provided';
      const member = message.guild.members.cache.get(targetUser.id);
      if (!member) return message.reply('Could not find that user in this server.');

      let config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!config) {
        config = new GuildConfig({ guildId: message.guild.id });
      }

      let jailRole = config.jailRole ? message.guild.roles.cache.get(config.jailRole) : null;
      if (!jailRole) {
        jailRole = await message.guild.roles.create({
          name: 'Jailed',
          permissions: [],
          reason: 'Auto-created jail role'
        });
        config.jailRole = jailRole.id;
        await config.save();
      }

      const originalRoles = member.roles.cache
        .filter(r => r.id !== message.guild.id && r.id !== jailRole.id)
        .map(r => r.id);

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: message.guild.id },
        { $set: { jailed: true, roles: originalRoles }, $setOnInsert: { userId: targetUser.id, guildId: message.guild.id } },
        { upsert: true }
      );

      await member.roles.set([jailRole.id]);

      await message.channel.send({ embeds: [successEmbed(`**${targetUser.tag}** has been jailed. Reason: ${reason}`)] });
    } catch (error) {
      console.error('jail prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
