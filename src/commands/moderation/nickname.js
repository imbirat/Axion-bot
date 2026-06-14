const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a user\'s nickname')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to change nickname of')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The new nickname')
        .setRequired(true)
    ),
  category: 'Moderation',
  usage: '/nickname <user> <name>',
  description: 'Change the nickname of a user',
  permissions: ['ManageNicknames'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const name = interaction.options.getString('name');
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.user_not_found', { defaultValue: 'Could not find that user in this server.' }), flags: MessageFlags.Ephemeral });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.member.id !== interaction.guild.ownerId) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.higher_role', { defaultValue: 'You cannot change the nickname of a user with a higher or equal role.' }), flags: MessageFlags.Ephemeral });
      }

      await member.setNickname(name);

      const reply = await t(interaction.guild.id, 'moderation.nickname.success', {
        defaultValue: '✅ Nickname changed.'
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('nickname command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user.');

      const name = args.slice(1).join(' ');
      if (!name) return message.reply('Please provide a nickname.');

      const member = message.guild.members.cache.get(targetUser.id);
      if (!member) return message.reply('Could not find that user in this server.');

      if (member.roles.highest.position >= message.member.roles.highest.position && message.member.id !== message.guild.ownerId) {
        return message.reply('You cannot change the nickname of a user with a higher or equal role.');
      }

      await member.setNickname(name);
      await message.channel.send('✅ Nickname changed.');
    } catch (error) {
      console.error('nickname prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
