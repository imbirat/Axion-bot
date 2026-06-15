const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-remove')
    .setDescription('Remove a user from the current ticket')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to remove').setRequired(true)),
  category: 'Ticket',
  usage: '/ticket-remove <user>',
  description: 'Remove a user from the current ticket',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = interaction.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return interaction.reply({ content: 'You do not have permission to remove users.', flags: MessageFlags.Ephemeral });
      }
    }
    const user = interaction.options.getUser('user');
    if (user.id === ticket.userId) {
      return interaction.reply({ content: 'Cannot remove the ticket creator.', flags: MessageFlags.Ephemeral });
    }
    await interaction.channel.permissionOverwrites.delete(user.id);
    await interaction.reply({ content: `✅ ${user} has been removed from this ticket.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = message.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return message.reply('You do not have permission to remove users.');
      }
    }
    const user = message.mentions.users.first();
    if (!user) return message.reply('Usage: ticket-remove <@user>');
    if (user.id === ticket.userId) {
      return message.reply('Cannot remove the ticket creator.');
    }
    await message.channel.permissionOverwrites.delete(user.id);
    await message.reply(`✅ ${user} has been removed from this ticket.`);
  },
};
