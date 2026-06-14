const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags} = require('discord.js');
const Report = require('../../models/Report');

module.exports = {
  customId: 'report_dismiss',
  async execute(interaction, client) {
    try {
      const reportId = interaction.customId.split(':')[1];
      if (!reportId) {
        return interaction.reply({ content: 'Invalid report ID.', flags: MessageFlags.Ephemeral });
      }

      const report = await Report.findById(reportId);
      if (!report) {
        return interaction.reply({ content: 'Report not found.', flags: MessageFlags.Ephemeral });
      }

      if (report.status !== 'pending') {
        return interaction.reply({ content: `This report has already been ${report.status}.`, flags: MessageFlags.Ephemeral });
      }

      report.status = 'dismissed';
      report.resolvedBy = interaction.user.id;
      report.resolvedAt = new Date();
      await report.save();

      const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(0xFEE75C)
        .setTitle('Report Dismissed')
        .setFooter({ text: `Dismissed by ${interaction.user.tag}` });

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('report_resolve:' + reportId)
          .setLabel('Resolve')
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('report_dismiss:' + reportId)
          .setLabel('Dismiss')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await interaction.update({ embeds: [embed], components: [disabledRow] });
    } catch (error) {
      console.error('report_dismiss error:', error);
      await interaction.reply({ content: 'Failed to dismiss report.', flags: MessageFlags.Ephemeral });
    }
  }
};
