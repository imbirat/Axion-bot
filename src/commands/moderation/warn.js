const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const UserProfile = require('../../models/UserProfile');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation',
  description: 'Warn a user and store the warning in their profile',
  permissions: ['ModerateMembers'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      let profile = await UserProfile.findOne({ userId: targetUser.id, guildId: interaction.guild.id });
      if (!profile) {
        profile = new UserProfile({ userId: targetUser.id, guildId: interaction.guild.id });
      }

      profile.warns.push({
        reason,
        moderator: interaction.user.id,
        date: new Date()
      });
      await profile.save();

      await targetUser.send({ embeds: [errorEmbed(`You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});

      await interaction.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been warned. Reason: ${reason}`)] });
    } catch (error) {
      console.error('warn command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to warn.');

      const reason = args.slice(1).join(' ');
      if (!reason) return message.reply('Please provide a reason for the warning.');

      let profile = await UserProfile.findOne({ userId: targetUser.id, guildId: message.guild.id });
      if (!profile) {
        profile = new UserProfile({ userId: targetUser.id, guildId: message.guild.id });
      }

      profile.warns.push({
        reason,
        moderator: message.author.id,
        date: new Date()
      });
      await profile.save();

      await targetUser.send({ embeds: [errorEmbed(`You have been warned in **${message.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});

      await message.channel.send({ embeds: [successEmbed(`**${targetUser.tag}** has been warned. Reason: ${reason}`)] });
    } catch (error) {
      console.error('warn prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
