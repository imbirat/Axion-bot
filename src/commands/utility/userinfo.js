const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View information about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get info about')
        .setRequired(false)
    ),
  category: 'Utilities',
  usage: '/userinfo [target]',
  description: 'View detailed information about a user',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('target') || interaction.user;
      const member = interaction.guild.members.cache.get(target.id);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}`)
        .setThumbnail(target.displayAvatarURL({ size: 1024 }))
        .addFields(
          { name: 'Username', value: `${target.username}`, inline: true },
          { name: 'Display Name', value: member ? member.displayName : target.username, inline: true },
          { name: 'ID', value: target.id, inline: true },
          { name: 'Avatar URL', value: `[Click here](${target.displayAvatarURL({ size: 4096 })})`, inline: false }
        );

      if (member) {
        embed.addFields(
          { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true }
        );
      }

      embed.addFields(
        { name: 'Joined Discord', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: true }
      );

      if (member) {
        const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position);
        const rolesStr = roles.size > 0 ? roles.map(r => r.toString()).join(', ') : 'None';
        embed.addFields(
          { name: `Roles (${roles.size})`, value: rolesStr.length > 1024 ? `${rolesStr.slice(0, 1021)}...` : rolesStr, inline: false }
        );

        const keyPerms = [];
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) keyPerms.push('Administrator');
        if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) keyPerms.push('Manage Server');
        if (member.permissions.has(PermissionsBitField.Flags.ManageMessages)) keyPerms.push('Manage Messages');
        if (member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) keyPerms.push('Moderate Members');
        if (member.permissions.has(PermissionsBitField.Flags.ManageRoles)) keyPerms.push('Manage Roles');
        if (member.permissions.has(PermissionsBitField.Flags.ManageChannels)) keyPerms.push('Manage Channels');

        embed.addFields(
          { name: 'Key Permissions', value: keyPerms.length > 0 ? keyPerms.join(', ') : 'None', inline: false }
        );
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('userinfo command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      let target = message.author;
      let member = message.member;

      if (args.length > 0) {
        const mention = message.mentions.users.first();
        if (mention) {
          target = mention;
          member = message.guild.members.cache.get(target.id);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}`)
        .setThumbnail(target.displayAvatarURL({ size: 1024 }))
        .addFields(
          { name: 'Username', value: `${target.username}`, inline: true },
          { name: 'Display Name', value: member ? member.displayName : target.username, inline: true },
          { name: 'ID', value: target.id, inline: true },
          { name: 'Avatar URL', value: `[Click here](${target.displayAvatarURL({ size: 4096 })})`, inline: false }
        );

      if (member) {
        embed.addFields(
          { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true }
        );
      }

      embed.addFields(
        { name: 'Joined Discord', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: true }
      );

      if (member) {
        const roles = member.roles.cache.filter(r => r.id !== message.guild.id).sort((a, b) => b.position - a.position);
        const rolesStr = roles.size > 0 ? roles.map(r => r.toString()).join(', ') : 'None';
        embed.addFields(
          { name: `Roles (${roles.size})`, value: rolesStr.length > 1024 ? `${rolesStr.slice(0, 1021)}...` : rolesStr, inline: false }
        );

        const keyPerms = [];
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) keyPerms.push('Administrator');
        if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) keyPerms.push('Manage Server');
        if (member.permissions.has(PermissionsBitField.Flags.ManageMessages)) keyPerms.push('Manage Messages');
        if (member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) keyPerms.push('Moderate Members');
        if (member.permissions.has(PermissionsBitField.Flags.ManageRoles)) keyPerms.push('Manage Roles');
        if (member.permissions.has(PermissionsBitField.Flags.ManageChannels)) keyPerms.push('Manage Channels');

        embed.addFields(
          { name: 'Key Permissions', value: keyPerms.length > 0 ? keyPerms.join(', ') : 'None', inline: false }
        );
      }

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('userinfo prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
