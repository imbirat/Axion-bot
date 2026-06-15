const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const ms = require('ms');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

const muteTimeouts = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user by assigning the mute role')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 1d)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation',
  description: 'Mute a user by assigning the mute role',
  permissions: ['ModerateMembers'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const duration = interaction.options.getString('duration');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ embeds: [errorEmbed('Could not find that user in this server.')], flags: MessageFlags.Ephemeral });
      }

      if (!member.moderatable) {
        return interaction.reply({ embeds: [errorEmbed('I cannot mute that user.')], flags: MessageFlags.Ephemeral });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.member.id !== interaction.guild.ownerId) {
        return interaction.reply({ embeds: [errorEmbed('You cannot mute a user with a higher or equal role.')], flags: MessageFlags.Ephemeral });
      }

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config?.muteRole) {
        return interaction.reply({ embeds: [errorEmbed('No mute role configured. Set one using the config command.')], flags: MessageFlags.Ephemeral });
      }

      const muteRole = interaction.guild.roles.cache.get(config.muteRole);
      if (!muteRole) {
        return interaction.reply({ embeds: [errorEmbed('The configured mute role no longer exists.')], flags: MessageFlags.Ephemeral });
      }

      if (member.roles.cache.has(muteRole.id)) {
        return interaction.reply({ embeds: [errorEmbed('That user is already muted.')], flags: MessageFlags.Ephemeral });
      }

      await member.roles.add(muteRole, reason);

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: interaction.guild.id },
        { $set: { muted: true }, $setOnInsert: { userId: targetUser.id, guildId: interaction.guild.id } },
        { upsert: true }
      );

      const key = `${interaction.guild.id}-${targetUser.id}`;
      const existing = muteTimeouts.get(key);
      if (existing) clearTimeout(existing);

      if (duration) {
        const durationMs = ms(duration);
        if (!durationMs) {
          return interaction.reply({ embeds: [errorEmbed('Invalid duration format. Use e.g. 10m, 1h, 1d.')], flags: MessageFlags.Ephemeral });
        }

        const timeout = setTimeout(async () => {
          try {
            const m = await interaction.guild.members.fetch(targetUser.id);
            if (m && m.roles.cache.has(muteRole.id)) {
              await m.roles.remove(muteRole, 'Mute duration expired');
            }
            await UserProfile.findOneAndUpdate(
              { userId: targetUser.id, guildId: interaction.guild.id },
              { $set: { muted: false } }
            );
          } catch {} finally {
            muteTimeouts.delete(key);
          }
        }, durationMs);

        muteTimeouts.set(key, timeout);

        const displayDuration = ms(durationMs, { long: true });
        await interaction.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been muted for ${displayDuration}. Reason: ${reason}`)] });
      } else {
        await interaction.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been muted. Reason: ${reason}`)] });
      }
    } catch (error) {
      console.error('mute command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to mute.');

      const duration = args[1];
      const reason = args.slice(2).join(' ') || 'No reason provided';
      const member = message.guild.members.cache.get(targetUser.id);

      if (!member) return message.reply('Could not find that user in this server.');
      if (!member.moderatable) return message.reply('I cannot mute that user.');
      if (member.roles.highest.position >= message.member.roles.highest.position && message.member.id !== message.guild.ownerId) {
        return message.reply('You cannot mute a user with a higher or equal role.');
      }

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!config?.muteRole) return message.reply('No mute role configured.');

      const muteRole = message.guild.roles.cache.get(config.muteRole);
      if (!muteRole) return message.reply('The configured mute role no longer exists.');

      if (member.roles.cache.has(muteRole.id)) return message.reply('That user is already muted.');

      await member.roles.add(muteRole, reason);

      await UserProfile.findOneAndUpdate(
        { userId: targetUser.id, guildId: message.guild.id },
        { $set: { muted: true }, $setOnInsert: { userId: targetUser.id, guildId: message.guild.id } },
        { upsert: true }
      );

      const key = `${message.guild.id}-${targetUser.id}`;
      const existing = muteTimeouts.get(key);
      if (existing) clearTimeout(existing);

      if (duration) {
        const durationMs = ms(duration);
        if (!durationMs) return message.reply('Invalid duration format. Use e.g. 10m, 1h, 1d.');

        const timeout = setTimeout(async () => {
          try {
            const m = await message.guild.members.fetch(targetUser.id);
            if (m && m.roles.cache.has(muteRole.id)) {
              await m.roles.remove(muteRole, 'Mute duration expired');
            }
            await UserProfile.findOneAndUpdate(
              { userId: targetUser.id, guildId: message.guild.id },
              { $set: { muted: false } }
            );
          } catch {} finally {
            muteTimeouts.delete(key);
          }
        }, durationMs);

        muteTimeouts.set(key, timeout);

        const displayDuration = ms(durationMs, { long: true });
        await message.channel.send({ embeds: [successEmbed(`**${targetUser.tag}** has been muted for ${displayDuration}. Reason: ${reason}`)] });
      } else {
        await message.channel.send({ embeds: [successEmbed(`**${targetUser.tag}** has been muted. Reason: ${reason}`)] });
      }
    } catch (error) {
      console.error('mute prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
