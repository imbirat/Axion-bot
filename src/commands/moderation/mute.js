const { SlashCommandBuilder, PermissionsBitField , MessageFlags} = require('discord.js');
const { t } = require('../../utils/i18n');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute (timeout) a user')
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
    ),
  category: 'Moderation',
  usage: '/mute <user> [duration] [reason]',
  description: 'Mute (timeout) a user for a specified duration',
  permissions: ['ModerateMembers'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const duration = interaction.options.getString('duration') || '60m';
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.user_not_found', { defaultValue: 'Could not find that user in this server.' }), flags: MessageFlags.Ephemeral });
      }

      if (!member.moderatable) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.cannot_mute', { defaultValue: 'I cannot mute that user.' }), flags: MessageFlags.Ephemeral });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.higher_role', { defaultValue: 'You cannot mute a user with a higher or equal role.' }), flags: MessageFlags.Ephemeral });
      }

      const durationMs = ms(duration);
      if (!durationMs) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.invalid_duration', { defaultValue: 'Invalid duration format. Use e.g. 10m, 1h, 1d.' }), flags: MessageFlags.Ephemeral });
      }

      if (durationMs > 2419200000) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.duration_too_long', { defaultValue: 'Duration cannot exceed 28 days.' }), flags: MessageFlags.Ephemeral });
      }

      await member.timeout(durationMs, reason);

      const displayDuration = ms(durationMs, { long: true });
      const reply = await t(interaction.guild.id, 'moderation.mute.success', {
        defaultValue: '🔇 **{{user}}** has been muted for {{duration}}.',
        user: targetUser.tag,
        duration: displayDuration
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('mute command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to mute.');

      const duration = args[1] || '60m';
      const reason = args.slice(2).join(' ') || 'No reason provided';
      const member = message.guild.members.cache.get(targetUser.id);

      if (!member) return message.reply('Could not find that user in this server.');
      if (!member.moderatable) return message.reply('I cannot mute that user.');
      if (member.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply('You cannot mute a user with a higher or equal role.');
      }

      const durationMs = ms(duration);
      if (!durationMs) return message.reply('Invalid duration format. Use e.g. 10m, 1h, 1d.');
      if (durationMs > 2419200000) return message.reply('Duration cannot exceed 28 days.');

      await member.timeout(durationMs, reason);

      const displayDuration = ms(durationMs, { long: true });
      await message.channel.send(`🔇 **${targetUser.tag}** has been muted for ${displayDuration}.`);
    } catch (error) {
      console.error('mute prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
