const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

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
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  category: 'Moderation',
  description: 'Kick a user from the server',
  permissions: ['KickMembers'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ embeds: [errorEmbed('Could not find that user in this server.')], flags: MessageFlags.Ephemeral });
      }

      if (!member.kickable) {
        return interaction.reply({ embeds: [errorEmbed('I cannot kick that user.')], flags: MessageFlags.Ephemeral });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.member.id !== interaction.guild.ownerId) {
        return interaction.reply({ embeds: [errorEmbed('You cannot kick a user with a higher or equal role.')], flags: MessageFlags.Ephemeral });
      }

      await member.kick(reason);

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config?.loggingEnabled && config.loggingChannel) {
        const logChannel = interaction.guild.channels.cache.get(config.loggingChannel);
        if (logChannel) {
          await logChannel.send({ embeds: [successEmbed(`👢 **Kick** | ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`)] }).catch(() => {});
        }
      }

      await interaction.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been kicked. Reason: ${reason}`)] });
    } catch (error) {
      console.error('kick command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
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
      if (member.roles.highest.position >= message.member.roles.highest.position && message.member.id !== message.guild.ownerId) {
        return message.reply('You cannot kick a user with a higher or equal role.');
      }

      await member.kick(reason);

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config?.loggingEnabled && config.loggingChannel) {
        const logChannel = message.guild.channels.cache.get(config.loggingChannel);
        if (logChannel) {
          await logChannel.send({ embeds: [successEmbed(`👢 **Kick** | ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}`)] }).catch(() => {});
        }
      }

      await message.channel.send({ embeds: [successEmbed(`**${targetUser.tag}** has been kicked. Reason: ${reason}`)] });
    } catch (error) {
      console.error('kick prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
