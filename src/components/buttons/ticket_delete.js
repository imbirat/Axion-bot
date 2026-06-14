const { EmbedBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');
const { generateTranscript } = require('../../services/transcriptService');

module.exports = {
  customId: 'ticket_delete',
  async execute(interaction, client) {
    try {
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) {
        return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
      }

      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

      await interaction.reply({ content: 'Deleting ticket and saving transcript...', ephemeral: true });

      let transcriptHtml = null;
      try {
        transcriptHtml = await generateTranscript(interaction.channel);
        ticket.transcript = transcriptHtml;
      } catch (e) {
        console.error('Transcript generation error:', e);
      }

      ticket.status = 'closed';
      await ticket.save();

      if (guildConfig?.ticketLogChannel && transcriptHtml) {
        const logChannel = interaction.guild.channels.cache.get(guildConfig.ticketLogChannel);
        if (logChannel) {
          const buffer = Buffer.from(transcriptHtml, 'utf-8');
          const logEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('Ticket Deleted')
            .addFields(
              { name: 'User', value: `<@${ticket.userId}>`, inline: true },
              { name: 'Deleted by', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Ticket', value: `#${ticket.ticketNumber}`, inline: true }
            )
            .setTimestamp();

          await logChannel.send({
            embeds: [logEmbed],
            files: [{ attachment: buffer, name: `transcript-${ticket.ticketNumber}.html` }]
          });
        }
      }

      await interaction.channel.delete();
    } catch (error) {
      console.error('ticket_delete error:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Failed to delete ticket.', ephemeral: true });
      }
    }
  }
};
