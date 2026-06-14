const { SlashCommandBuilder, PermissionsBitField , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giverole')
    .setDescription('Give a role to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give the role to')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give')
        .setRequired(true)
    ),
  category: 'Utilities',
  usage: '/giverole <user> <role>',
  description: 'Give a specified role to a user (Admin only)',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'You need Administrator permission to use this command.', flags: MessageFlags.Ephemeral });
      }

      const targetUser = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: 'Could not find that member in this server.', flags: MessageFlags.Ephemeral });
      }

      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: 'You cannot give a role that is higher than or equal to your highest role.', flags: MessageFlags.Ephemeral });
      }

      if (member.roles.cache.has(role.id)) {
        return interaction.reply({ content: `${targetUser.username} already has the role ${role.name}.`, flags: MessageFlags.Ephemeral });
      }

      await member.roles.add(role);
      await interaction.reply({ content: `✅ Successfully given ${role} to ${targetUser}.` });
    } catch (error) {
      console.error('giverole command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('You need Administrator permission to use this command.');
      }

      if (args.length < 2) {
        return message.reply('Usage: .giverole <@user> <@role>');
      }

      const targetUser = message.mentions.users.first();
      const role = message.mentions.roles.first();

      if (!targetUser) {
        return message.reply('Please mention a valid user.');
      }

      if (!role) {
        return message.reply('Please mention a valid role.');
      }

      const member = message.guild.members.cache.get(targetUser.id);
      if (!member) {
        return message.reply('Could not find that member in this server.');
      }

      if (role.position >= message.member.roles.highest.position) {
        return message.reply('You cannot give a role that is higher than or equal to your highest role.');
      }

      if (member.roles.cache.has(role.id)) {
        return message.reply(`${targetUser.username} already has the role ${role.name}.`);
      }

      await member.roles.add(role);
      await message.channel.send(`✅ Successfully given ${role} to ${targetUser}.`);
    } catch (error) {
      console.error('giverole prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
