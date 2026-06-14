const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { t } = require('../../utils/i18n');
const UserProfile = require('../../models/UserProfile');

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
    ),
  category: 'Moderation',
  usage: '/warn <user> <reason>',
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

      const reply = await t(interaction.guild.id, 'moderation.warn.success', {
        defaultValue: '⚠️ **{{user}}** has been warned. Reason: {{reason}}',
        user: targetUser.tag,
        reason
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('warn command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
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

      await message.channel.send(`⚠️ **${targetUser.tag}** has been warned. Reason: ${reason}`);
    } catch (error) {
      console.error('warn prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
