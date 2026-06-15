const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Post the ticket creation panel in a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('The channel for the ticket panel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  description: 'Post the ticket creation panel in a channel',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩')
    );
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🎫 Support Ticket')
      .setDescription('Need help? Open a ticket and our support team will assist you.\n\nClick the button below to create a ticket.')
      .setFooter({ text: 'Axion — Ticketing without clutter', iconURL: client.user?.displayAvatarURL() });
    await channel.send({ embeds: [embed], components: [row] });
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { ticketChannel: channel.id } },
      { upsert: true }
    );
    await interaction.reply({ content: '✅ Ticket panel has been posted.', flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('Usage: ticketsetup <#channel>');
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩')
    );
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🎫 Support Ticket')
      .setDescription('Need help? Open a ticket and our support team will assist you.\n\nClick the button below to create a ticket.')
      .setFooter({ text: 'Axion — Ticketing without clutter', iconURL: client.user?.displayAvatarURL() });
    await channel.send({ embeds: [embed], components: [row] });
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $set: { ticketChannel: channel.id } },
      { upsert: true }
    );
    await message.reply('✅ Ticket panel has been posted.');
  },
};
