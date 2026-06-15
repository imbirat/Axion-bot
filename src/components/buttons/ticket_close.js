const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');
const { generateTranscript } = require('../../services/transcriptService');

module.exports = {
  customId: 'ticket_close',
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) {
      return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    }
    if (ticket.status === 'closed') {
      return interaction.reply({ content: 'Ticket is already closed.', flags: MessageFlags.Ephemeral });
    }

    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    await interaction.channel.setName(`closed-${ticket.ticketNumber}`);

    await interaction.channel.permissionOverwrites.edit(ticket.userId, {
      SendMessages: false,
      AddReactions: false,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_delete').setLabel('Delete').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
      new ButtonBuilder().setCustomId('ticket_reopen').setLabel('Re-open').setStyle(ButtonStyle.Success).setEmoji('🔓'),
    );

    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle(`Ticket #${ticket.ticketNumber} Closed`)
      .setDescription(`Closed by <@${interaction.user.id}>`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed], components: [row] });

    let transcriptHtml = null;
    try {
      transcriptHtml = await generateTranscript(interaction.channel, ticket.ticketNumber);
      ticket.transcript = transcriptHtml;
      await ticket.save();
    } catch (e) {
      console.error('Transcript error:', e);
    }

    if (guildConfig?.ticketLogChannel && transcriptHtml) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.ticketLogChannel);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('Ticket Closed')
          .addFields(
            { name: 'User', value: `<@${ticket.userId}>`, inline: true },
            { name: 'Closed by', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Ticket', value: `#${ticket.ticketNumber}`, inline: true },
          )
          .setTimestamp();
        await logChannel.send({
          embeds: [logEmbed],
          files: [{ attachment: Buffer.from(transcriptHtml, 'utf-8'), name: `transcript-${ticket.ticketNumber}.html` }],
        });
      }
    }

    if (!interaction.replied) {
      await interaction.reply({ content: 'Ticket closed.', flags: MessageFlags.Ephemeral });
    }
  },
};
