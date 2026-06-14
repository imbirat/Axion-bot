const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { t } = require('../../utils/i18n');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)
    ),
  category: 'Moderation',
  usage: '/kick <user> [reason]',
  description: 'Kick a user from the server',
  permissions: ['KickMembers'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.user_not_found', { defaultValue: 'Could not find that user in this server.' }), ephemeral: true });
      }

      if (!member.kickable) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.cannot_kick', { defaultValue: 'I cannot kick that user.' }), ephemeral: true });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.higher_role', { defaultValue: 'You cannot kick a user with a higher or equal role.' }), ephemeral: true });
      }

      await member.kick(reason);

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config && config.loggingEnabled && config.loggingChannel) {
        const logChannel = interaction.guild.channels.cache.get(config.loggingChannel);
        if (logChannel) {
          await logChannel.send(`👢 **Kick** | ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`).catch(() => {});
        }
      }

      const reply = await t(interaction.guild.id, 'moderation.kick.success', {
        defaultValue: '✅ **{{user}}** has been kicked. Reason: {{reason}}',
        user: targetUser.tag,
        reason
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('kick command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to kick.');

      const reason = args.slice(1).join(' ') || 'No reason provided';
      const member = message.guild.members.cache.get(targetUser.id);

      if (!member) return message.reply('Could not find that user in this server.');
      if (!member.kickable) return message.reply('I cannot kick that user.');
      if (member.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply('You cannot kick a user with a higher or equal role.');
      }

      await member.kick(reason);

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config && config.loggingEnabled && config.loggingChannel) {
        const logChannel = message.guild.channels.cache.get(config.loggingChannel);
        if (logChannel) {
          await logChannel.send(`👢 **Kick** | ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}`).catch(() => {});
        }
      }

      await message.channel.send(`✅ **${targetUser.tag}** has been kicked. Reason: ${reason}`);
    } catch (error) {
      console.error('kick prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
