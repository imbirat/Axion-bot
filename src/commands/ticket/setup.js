const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Set up the ticket system panel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post the ticket panel')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  usage: '/ticketsetup <#channel>',
  description: 'Post the ticket creation panel in the specified channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');

      const createButton = new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

      const row = new ActionRowBuilder().addComponents(createButton);

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

      await interaction.reply({ content: '✅ Ticket panel has been posted.', ephemeral: true });
    } catch (error) {
      console.error('ticketsetup error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('Usage: ticketsetup <#channel>');

      const createButton = new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

      const row = new ActionRowBuilder().addComponents(createButton);

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
    } catch (error) {
      console.error('ticketsetup prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
