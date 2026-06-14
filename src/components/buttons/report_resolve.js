const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Report = require('../../models/Report');

module.exports = {
  customId: 'report_resolve',
  async execute(interaction, client) {
    try {
      const reportId = interaction.customId.split(':')[1];
      if (!reportId) {
        return interaction.reply({ content: 'Invalid report ID.', ephemeral: true });
      }

      const report = await Report.findById(reportId);
      if (!report) {
        return interaction.reply({ content: 'Report not found.', ephemeral: true });
      }

      if (report.status !== 'pending') {
        return interaction.reply({ content: `This report has already been ${report.status}.`, ephemeral: true });
      }

      report.status = 'resolved';
      report.resolvedBy = interaction.user.id;
      report.resolvedAt = new Date();
      await report.save();

      const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(0x57F287)
        .setTitle('Report Resolved')
        .setFooter({ text: `Resolved by ${interaction.user.tag}` });

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
      console.error('report_resolve error:', error);
      await interaction.reply({ content: 'Failed to resolve report.', ephemeral: true });
    }
  }
};
