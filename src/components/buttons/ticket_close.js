const { PermissionsBitField , MessageFlags} = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags} = require('discord.js');

module.exports = {
  customId: 'ticket_close',
  async execute(interaction, client) {
    try {
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

      const channelName = `closed-${ticket.ticketNumber}`;
      await interaction.channel.setName(channelName);

      await interaction.channel.permissionOverwrites.cache.forEach(async (overwrite) => {
        if (overwrite.id !== interaction.guild.id && overwrite.id !== guildConfig?.ticketSupportRole) {
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
        .setDescription(`Closed by <@${interaction.user.id}>`)
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
          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      if (!interaction.replied) {
        await interaction.reply({ content: 'Ticket closed.', flags: MessageFlags.Ephemeral });
      }
    } catch (error) {
      console.error('ticket_close error:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Failed to close ticket.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};
