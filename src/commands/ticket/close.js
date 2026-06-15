const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');
const transcriptService = require('../../services/transcriptService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close the current ticket')
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for closing').setRequired(false)),
  category: 'Ticket',
  description: 'Close the current ticket',
  permissions: ['ManageChannels'],
  cooldown: 5,
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const isOwner = ticket.userId === interaction.user.id;
    const isSupport = config?.ticketSupportRole && interaction.member.roles.cache.has(config.ticketSupportRole);
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    if (!isOwner && !isSupport && !isAdmin) {
      return interaction.reply({ content: 'You do not have permission to close this ticket.', flags: MessageFlags.Ephemeral });
    }
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
      ViewChannel: true,
      ReadMessageHistory: true
    });
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_delete')
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('ticket_reopen')
        .setLabel('Re-open')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔓')
    );
    const closeEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🔒 Ticket Closed')
      .setDescription(`Ticket #${ticket.ticketNumber} has been closed.`)
      .addFields(
        { name: 'Closed By', value: interaction.user.username, inline: true },
        { name: 'Reason', value: reason, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [closeEmbed], components: [row] });
    if (config?.ticketLogChannel) {
      try {
        const html = await transcriptService.generateTranscript(interaction.channel, ticket.ticketNumber);
        const buffer = Buffer.from(html, 'utf-8');
        const logChannel = interaction.guild.channels.cache.get(config.ticketLogChannel);
        if (logChannel) {
          await logChannel.send({
            content: `📄 **Ticket #${ticket.ticketNumber}** closed by ${interaction.user.tag}. Reason: ${reason}`,
            files: [{ attachment: buffer, name: `ticket-${ticket.ticketNumber}-transcript.html` }]
          });
        }
      } catch (err) {
        console.error('Failed to post transcript to log channel:', err);
      }
    }
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    const isOwner = ticket.userId === message.author.id;
    const isSupport = config?.ticketSupportRole && message.member.roles.cache.has(config.ticketSupportRole);
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    if (!isOwner && !isSupport && !isAdmin) {
      return message.reply('You do not have permission to close this ticket.');
    }
    const reason = args.join(' ') || 'No reason provided';
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false,
      ViewChannel: true,
      ReadMessageHistory: true
    });
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_delete')
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('ticket_reopen')
        .setLabel('Re-open')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔓')
    );
    const closeEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🔒 Ticket Closed')
      .setDescription(`Ticket #${ticket.ticketNumber} has been closed.`)
      .addFields(
        { name: 'Closed By', value: message.author.username, inline: true },
        { name: 'Reason', value: reason, inline: true }
      )
      .setTimestamp();
    await message.channel.send({ embeds: [closeEmbed], components: [row] });
    if (config?.ticketLogChannel) {
      try {
        const html = await transcriptService.generateTranscript(message.channel, ticket.ticketNumber);
        const buffer = Buffer.from(html, 'utf-8');
        const logChannel = message.guild.channels.cache.get(config.ticketLogChannel);
        if (logChannel) {
          await logChannel.send({
            content: `📄 **Ticket #${ticket.ticketNumber}** closed by ${message.author.tag}. Reason: ${reason}`,
            files: [{ attachment: buffer, name: `ticket-${ticket.ticketNumber}-transcript.html` }]
          });
        }
      } catch (err) {
        console.error('Failed to post transcript to log channel:', err);
      }
    }
  },
};
