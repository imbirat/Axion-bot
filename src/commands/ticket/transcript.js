const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');
const transcriptService = require('../../services/transcriptService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-transcript')
    .setDescription('Generate and receive a transcript of this ticket'),
  category: 'Ticket',
  description: 'Generate and receive a transcript of this ticket',
  permissions: ['ManageChannels'],
  cooldown: 10,
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = interaction.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return interaction.reply({ content: 'You do not have permission to view transcripts.', flags: MessageFlags.Ephemeral });
      }
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const html = await transcriptService.generateTranscript(interaction.channel, ticket.ticketNumber);
      const buffer = Buffer.from(html, 'utf-8');
      await interaction.user.send({
        files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.html` }]
      });
      await interaction.editReply({ content: '✅ Transcript has been sent to your DMs.' });
    } catch (err) {
      await interaction.editReply({ content: '❌ Could not DM you. Please enable DMs.' });
    }
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = message.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return message.reply('You do not have permission to view transcripts.');
      }
    }
    try {
      const html = await transcriptService.generateTranscript(message.channel, ticket.ticketNumber);
      const buffer = Buffer.from(html, 'utf-8');
      await message.author.send({
        files: [{ attachment: buffer, name: `transcript-${message.channel.name}.html` }]
      });
      await message.reply('✅ Transcript has been sent to your DMs.');
    } catch (err) {
      await message.reply('❌ Could not DM you. Please enable DMs.');
    }
  },
};
