const { PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../models/Ticket');
const GuildConfig = require('../models/GuildConfig');

async function createTicket(interaction) {
  try {
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig || !guildConfig.ticketCategory) {
      return { error: 'Ticket system not configured on this server.' };
    }

    if (guildConfig.ticketBlacklist?.includes(interaction.user.id)) {
      return { error: 'You are blacklisted from creating tickets.' };
    }

    const existing = await Ticket.findOne({
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      status: { $in: ['open', 'claimed'] }
    });
    if (existing) {
      return { error: 'You already have an open ticket.' };
    }

    guildConfig.ticketCount = (guildConfig.ticketCount || 0) + 1;
    await guildConfig.save();

    const ticketNumber = guildConfig.ticketCount;
    const channelName = `ticket-${ticketNumber}`;

    const supportRole = guildConfig.ticketSupportRole;

    const permissionOverwrites = [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
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

    if (supportRole) {
      permissionOverwrites.push({
        id: supportRole,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageChannels,
        ],
      });
    }

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: guildConfig.ticketCategory,
      permissionOverwrites,
    });

    const ticket = await Ticket.create({
      guildId: interaction.guild.id,
      channelId: channel.id,
      userId: interaction.user.id,
      ticketNumber,
      subject: interaction.options?.getString('subject') || 'No subject provided',
    });

    const closeButton = new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    const claimButton = new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel('Claim')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🙋');

    const row = new ActionRowBuilder().addComponents(closeButton, claimButton);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Ticket #${ticketNumber}`)
      .setDescription(`**Subject:** ${ticket.subject}\n**Created by:** <@${interaction.user.id}>\n\nSupport will be with you shortly.`)
      .setTimestamp();

    await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

    if (guildConfig.ticketLogChannel) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.ticketLogChannel);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('Ticket Created')
          .addFields(
            { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Channel', value: `<#${channel.id}>`, inline: true },
            { name: 'Number', value: `#${ticketNumber}`, inline: true }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }

    return { ticket, channel };
  } catch (error) {
    console.error('createTicket error:', error);
    return { error: 'Failed to create ticket.' };
  }
}

async function closeTicket(interaction, reason) {
  try {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return { error: 'This is not a ticket channel.' };
    if (ticket.status === 'closed') return { error: 'Ticket is already closed.' };

    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    const channelName = `closed-${ticket.ticketNumber}`;
    await interaction.channel.setName(channelName);

    await interaction.channel.permissionOverwrites.cache.forEach(async (overwrite) => {
      if (overwrite.id !== interaction.guild.id) {
        try {
          await overwrite.edit({ ViewChannel: false });
        } catch (e) {
        }
      }
    });

    const deleteButton = new ButtonBuilder()
      .setCustomId('ticket_delete')
      .setLabel('Delete')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🗑️');

    const reopenButton = new ButtonBuilder()
      .setCustomId('ticket_reopen')
      .setLabel('Reopen')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🔓');

    const row = new ActionRowBuilder().addComponents(deleteButton, reopenButton);

    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle(`Ticket #${ticket.ticketNumber} Closed`)
      .setDescription(`Closed by <@${interaction.user.id}>\n${reason ? `**Reason:** ${reason}` : ''}`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed], components: [row] });

    if (guildConfig?.ticketLogChannel) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.ticketLogChannel);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('Ticket Closed')
          .addFields(
            { name: 'User', value: `<@${ticket.userId}>`, inline: true },
            { name: 'Closed by', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Ticket', value: `#${ticket.ticketNumber}`, inline: true }
          )
          .setTimestamp();
        if (reason) logEmbed.addFields({ name: 'Reason', value: reason });
        await logChannel.send({ embeds: [logEmbed] });
      }
    }

    return { ticket };
  } catch (error) {
    console.error('closeTicket error:', error);
    return { error: 'Failed to close ticket.' };
  }
}

async function claimTicket(interaction) {
  try {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return { error: 'This is not a ticket channel.' };
    if (ticket.status === 'closed') return { error: 'Cannot claim a closed ticket.' };
    if (ticket.claimedBy) return { error: `Already claimed by <@${ticket.claimedBy}>.` };

    ticket.claimedBy = interaction.user.id;
    ticket.status = 'claimed';
    await ticket.save();

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('Ticket Claimed')
      .setDescription(`This ticket has been claimed by <@${interaction.user.id}>.`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });

    return { ticket };
  } catch (error) {
    console.error('claimTicket error:', error);
    return { error: 'Failed to claim ticket.' };
  }
}

async function unclaimTicket(interaction) {
  try {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return { error: 'This is not a ticket channel.' };
    if (!ticket.claimedBy) return { error: 'Ticket is not claimed.' };
    if (ticket.claimedBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return { error: 'You did not claim this ticket.' };
    }

    ticket.claimedBy = null;
    ticket.status = 'open';
    await ticket.save();

    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle('Ticket Unclaimed')
      .setDescription(`This ticket has been unclaimed by <@${interaction.user.id}>.`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });

    return { ticket };
  } catch (error) {
    console.error('unclaimTicket error:', error);
    return { error: 'Failed to unclaim ticket.' };
  }
}

async function reopenTicket(interaction) {
  try {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return { error: 'This is not a ticket channel.' };
    if (ticket.status !== 'closed') return { error: 'Ticket is not closed.' };

    ticket.status = 'open';
    ticket.closedAt = null;
    await ticket.save();

    const channelName = `ticket-${ticket.ticketNumber}`;
    await interaction.channel.setName(channelName);

    await interaction.channel.permissionOverwrites.create(ticket.userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      EmbedLinks: true,
    });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('Ticket Reopened')
      .setDescription(`This ticket has been reopened by <@${interaction.user.id}>.`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });

    return { ticket };
  } catch (error) {
    console.error('reopenTicket error:', error);
    return { error: 'Failed to reopen ticket.' };
  }
}

async function addUserToTicket(interaction, user) {
  try {
    await interaction.channel.permissionOverwrites.create(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      EmbedLinks: true,
    });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(`Added ${user} to the ticket.`);
    await interaction.channel.send({ embeds: [embed] });

    return { success: true };
  } catch (error) {
    console.error('addUserToTicket error:', error);
    return { error: 'Failed to add user to ticket.' };
  }
}

async function removeUserFromTicket(interaction, user) {
  try {
    await interaction.channel.permissionOverwrites.create(user.id, {
      ViewChannel: false,
    });

    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setDescription(`Removed ${user} from the ticket.`);
    await interaction.channel.send({ embeds: [embed] });

    return { success: true };
  } catch (error) {
    console.error('removeUserFromTicket error:', error);
    return { error: 'Failed to remove user from ticket.' };
  }
}

async function renameTicket(interaction, newName) {
  try {
    await interaction.channel.setName(newName);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setDescription(`Channel renamed to \`${newName}\`.`);
    await interaction.channel.send({ embeds: [embed] });

    return { success: true };
  } catch (error) {
    console.error('renameTicket error:', error);
    return { error: 'Failed to rename ticket.' };
  }
}

module.exports = {
  createTicket, closeTicket, claimTicket, unclaimTicket,
  reopenTicket, addUserToTicket, removeUserFromTicket, renameTicket
};
