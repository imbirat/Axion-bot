const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-unclaim')
    .setDescription('Unclaim the current ticket'),
  category: 'Ticket',
  usage: '/ticket-unclaim',
  description: 'Unclaim the current ticket',
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
        return interaction.reply({ content: 'You do not have permission to unclaim tickets.', flags: MessageFlags.Ephemeral });
      }
    }
    if (!ticket.claimedBy) {
      return interaction.reply({ content: 'This ticket is not claimed.', flags: MessageFlags.Ephemeral });
    }
    if (ticket.claimedBy !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You can only unclaim your own tickets.', flags: MessageFlags.Ephemeral });
    }
    ticket.claimedBy = null;
    ticket.status = 'open';
    await ticket.save();
    await interaction.channel.setName(`ticket-${ticket.ticketNumber}`);
    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle('📋 Ticket Unclaimed')
      .setDescription(`Ticket #${ticket.ticketNumber} has been unclaimed by ${interaction.user}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = message.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return message.reply('You do not have permission to unclaim tickets.');
      }
    }
    if (!ticket.claimedBy) {
      return message.reply('This ticket is not claimed.');
    }
    if (ticket.claimedBy !== message.author.id && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('You can only unclaim your own tickets.');
    }
    ticket.claimedBy = null;
    ticket.status = 'open';
    await ticket.save();
    await message.channel.setName(`ticket-${ticket.ticketNumber}`);
    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle('📋 Ticket Unclaimed')
      .setDescription(`Ticket #${ticket.ticketNumber} has been unclaimed by ${message.author}`)
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  },
};
