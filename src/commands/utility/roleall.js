const { SlashCommandBuilder, PermissionsBitField , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleall')
    .setDescription('Give a role to all server members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give to everyone')
        .setRequired(true)
    ),
  category: 'Utilities',
  usage: '/roleall <role>',
  description: 'Give a specified role to every member in the server (Admin only)',
  permissions: ['Administrator'],
  cooldown: 30,
  async execute(interaction, client) {
    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'You need Administrator permission to use this command.', flags: MessageFlags.Ephemeral });
      }

      const role = interaction.options.getRole('role');

      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: 'You cannot give a role that is higher than or equal to your highest role.', flags: MessageFlags.Ephemeral });
      }

      await interaction.deferReply();

      const members = await interaction.guild.members.fetch();
      let count = 0;

      for (const [, member] of members) {
        if (member.user.bot) continue;
        if (member.roles.cache.has(role.id)) continue;
        try {
          await member.roles.add(role);
          count++;
        } catch {
          continue;
        }
      }

      await interaction.editReply({ content: `✅ Successfully given ${role} to **${count}** members.` });
    } catch (error) {
      console.error('roleall command error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
      }
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('You need Administrator permission to use this command.');
      }

      if (args.length === 0) {
        return message.reply('Usage: .roleall <@role>');
      }

      const role = message.mentions.roles.first();
      if (!role) {
        return message.reply('Please mention a valid role.');
      }

      if (role.position >= message.member.roles.highest.position) {
        return message.reply('You cannot give a role that is higher than or equal to your highest role.');
      }

      const loading = await message.channel.send('Giving role to all members, please wait...');

      const members = await message.guild.members.fetch();
      let count = 0;

      for (const [, member] of members) {
        if (member.user.bot) continue;
        if (member.roles.cache.has(role.id)) continue;
        try {
          await member.roles.add(role);
          count++;
        } catch {
          continue;
        }
      }

      await loading.edit(`✅ Successfully given ${role} to **${count}** members.`);
    } catch (error) {
      console.error('roleall prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
