const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

const muteTimeouts = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unmute')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation',
  description: 'Unmute a user by removing the mute role',
  permissions: ['ModerateMembers'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ embeds: [errorEmbed('Could not find that user in this server.')], flags: MessageFlags.Ephemeral });
      }

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config?.muteRole) {
        const muteRole = interaction.guild.roles.cache.get(config.muteRole);
        if (muteRole && member.roles.cache.has(muteRole.id)) {
          await member.roles.remove(muteRole, 'Unmuted');
        }
      }

      const key = `${interaction.guild.id}-${targetUser.id}`;
      const existing = muteTimeouts.get(key);
      if (existing) {
        clearTimeout(existing);
        muteTimeouts.delete(key);
      }

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: interaction.guild.id },
        { $set: { muted: false } }
      );

      await interaction.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been unmuted.`)] });
    } catch (error) {
      console.error('unmute command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to unmute.');

      const member = message.guild.members.cache.get(targetUser.id);
      if (!member) return message.reply('Could not find that user in this server.');

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config?.muteRole) {
        const muteRole = message.guild.roles.cache.get(config.muteRole);
        if (muteRole && member.roles.cache.has(muteRole.id)) {
          await member.roles.remove(muteRole, 'Unmuted');
        }
      }

      const key = `${message.guild.id}-${targetUser.id}`;
      const existing = muteTimeouts.get(key);
      if (existing) {
        clearTimeout(existing);
        muteTimeouts.delete(key);
      }

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: message.guild.id },
        { $set: { muted: false } }
      );

      await message.channel.send({ embeds: [successEmbed(`**${targetUser.tag}** has been unmuted.`)] });
    } catch (error) {
      console.error('unmute prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
