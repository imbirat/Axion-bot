const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-claim')
    .setDescription('Claim the current ticket'),
  category: 'Ticket',
  description: 'Claim the current ticket',
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
        return interaction.reply({ content: 'You do not have permission to claim tickets.', flags: MessageFlags.Ephemeral });
      }
    }
    if (ticket.claimedBy) {
      return interaction.reply({ content: 'This ticket is already claimed.', flags: MessageFlags.Ephemeral });
    }
    ticket.claimedBy = interaction.user.id;
    ticket.status = 'claimed';
    await ticket.save();
    await interaction.channel.setName(`claim-${ticket.ticketNumber}`);
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Ticket Claimed')
      .setDescription(`Ticket #${ticket.ticketNumber} has been claimed by ${interaction.user}`)
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
        return message.reply('You do not have permission to claim tickets.');
      }
    }
    if (ticket.claimedBy) {
      return message.reply('This ticket is already claimed.');
    }
    ticket.claimedBy = message.author.id;
    ticket.status = 'claimed';
    await ticket.save();
    await message.channel.setName(`claim-${ticket.ticketNumber}`);
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Ticket Claimed')
      .setDescription(`Ticket #${ticket.ticketNumber} has been claimed by ${message.author}`)
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  },
};
