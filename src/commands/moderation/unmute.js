const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unmute')
        .setRequired(true)
    ),
  category: 'Moderation',
  usage: '/unmute <user>',
  description: 'Remove a timeout from a user',
  permissions: ['ModerateMembers'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.user_not_found', { defaultValue: 'Could not find that user in this server.' }), ephemeral: true });
      }

      if (!member.communicationDisabledUntil) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.not_muted', { defaultValue: 'That user is not muted.' }), ephemeral: true });
      }

      await member.timeout(null);

      const reply = await t(interaction.guild.id, 'moderation.unmute.success', {
        defaultValue: '🔈 **{{user}}** has been unmuted.',
        user: targetUser.tag
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('unmute command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to unmute.');

      const member = message.guild.members.cache.get(targetUser.id);
      if (!member) return message.reply('Could not find that user in this server.');

      if (!member.communicationDisabledUntil) {
        return message.reply('That user is not muted.');
      }

      await member.timeout(null);
      await message.channel.send(`🔈 **${targetUser.tag}** has been unmuted.`);
    } catch (error) {
      console.error('unmute prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
