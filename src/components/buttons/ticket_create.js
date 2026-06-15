const {
  ChannelType, PermissionsBitField, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  customId: 'ticket_create',
  async execute(interaction, client) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config || !config.ticketCategory) {
      return interaction.reply({ content: 'Ticket system not configured.', flags: MessageFlags.Ephemeral });
    }
    if (config.ticketBlacklist?.includes(interaction.user.id)) {
      return interaction.reply({ content: 'You are blacklisted from opening tickets.', flags: MessageFlags.Ephemeral });
    }
    const existing = await Ticket.findOne({
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      status: { $ne: 'closed' },
    });
    if (existing) {
      return interaction.reply({ content: 'You already have an open ticket.', flags: MessageFlags.Ephemeral });
    }

    const ticketNumber = (config.ticketCount || 0) + 1;
    config.ticketCount = ticketNumber;
    await config.save();

    const overwrites = [
      { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.EmbedLinks,
        ],
      },
    ];
    if (config.ticketSupportRole) {
      overwrites.push({
        id: config.ticketSupportRole,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageMessages,
        ],
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: config.ticketCategory,
      permissionOverwrites: overwrites,
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Ticket #${ticketNumber}`)
      .setDescription('Support will be with you shortly. Please describe your issue.')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
      new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('👤'),
      new ButtonBuilder().setCustomId('ticket_delete').setLabel('Transcript').setStyle(ButtonStyle.Secondary).setEmoji('📄'),
    );

    await channel.send({
      content: `${config.ticketSupportRole ? `<@&${config.ticketSupportRole}>` : ''} <@${interaction.user.id}>`,
      embeds: [embed],
      components: [row],
    });

    await new Ticket({
      guildId: interaction.guild.id,
      channelId: channel.id,
      userId: interaction.user.id,
      ticketNumber,
    }).save();

    await interaction.reply({ content: `Ticket created: ${channel}`, flags: MessageFlags.Ephemeral });
  },
};
