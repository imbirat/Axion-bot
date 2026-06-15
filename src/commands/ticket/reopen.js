const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-reopen')
    .setDescription('Re-open a closed ticket'),
  category: 'Ticket',
  description: 'Re-open a closed ticket',
  permissions: ['ManageChannels'],
  cooldown: 5,
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    if (ticket.status !== 'closed') {
      return interaction.reply({ content: 'This ticket is not closed.', flags: MessageFlags.Ephemeral });
    }
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = interaction.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return interaction.reply({ content: 'You do not have permission to reopen tickets.', flags: MessageFlags.Ephemeral });
      }
    }
    await interaction.channel.setName(`ticket-${ticket.ticketNumber}`);
    await interaction.channel.permissionOverwrites.edit(ticket.userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    if (config?.ticketSupportRole) {
      await interaction.channel.permissionOverwrites.edit(config.ticketSupportRole, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      ViewChannel: false,
      SendMessages: false,
      ReadMessageHistory: false
    });
    ticket.status = 'open';
    ticket.claimedBy = null;
    ticket.closedAt = null;
    await ticket.save();
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🔓 Ticket Re-opened')
      .setDescription(`Ticket #${ticket.ticketNumber} has been re-opened by ${interaction.user}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    if (ticket.status !== 'closed') return message.reply('This ticket is not closed.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = message.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return message.reply('You do not have permission to reopen tickets.');
      }
    }
    await message.channel.setName(`ticket-${ticket.ticketNumber}`);
    await message.channel.permissionOverwrites.edit(ticket.userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    if (config?.ticketSupportRole) {
      await message.channel.permissionOverwrites.edit(config.ticketSupportRole, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
    }
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      ViewChannel: false,
      SendMessages: false,
      ReadMessageHistory: false
    });
    ticket.status = 'open';
    ticket.claimedBy = null;
    ticket.closedAt = null;
    await ticket.save();
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🔓 Ticket Re-opened')
      .setDescription(`Ticket #${ticket.ticketNumber} has been re-opened by ${message.author}`)
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  },
};
