const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketService = require('../../services/ticketService');
const GuildConfig = require('../../models/GuildConfig');
const Ticket = require('../../models/Ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketclose')
    .setDescription('Close the current ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for closing')
        .setRequired(false)),
  category: 'Ticket',
  usage: '/ticketclose [reason]',
  description: 'Close the active support ticket',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });

      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      const isOwner = ticket.userId === interaction.user.id;
      const isSupport = guildConfig?.ticketSupportRole && interaction.member.roles.cache.has(guildConfig.ticketSupportRole);
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

      if (!isOwner && !isSupport && !isAdmin) {
        return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
      }

      const reason = interaction.options.getString('reason');
      const result = await ticketService.closeTicket(interaction, reason);
      if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
      await interaction.reply({ content: '✅ Ticket closed.', ephemeral: true });
    } catch (error) {
      console.error('ticketclose error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const ticket = await Ticket.findOne({ channelId: message.channel.id });
      if (!ticket) return message.reply('This is not a ticket channel.');

      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      const isOwner = ticket.userId === message.author.id;
      const isSupport = guildConfig?.ticketSupportRole && message.member.roles.cache.has(guildConfig.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);

      if (!isOwner && !isSupport && !isAdmin) {
        return message.reply('You do not have permission to close this ticket.');
      }

      const reason = args.join(' ') || null;
      const pseudo = { channel: message.channel, guild: message.guild, user: message.author };
      const result = await ticketService.closeTicket(pseudo, reason);
      if (result.error) return message.reply(result.error);
      await message.reply('✅ Ticket closed.');
    } catch (error) {
      console.error('ticketclose prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
