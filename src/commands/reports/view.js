const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const Report = require('../../models/Report');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reports')
    .setDescription('View reports')
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('List all reports')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('Filter by reported user')
            .setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Reports',
  usage: '/reports view [user]',
  description: 'View submitted reports with optional user filter',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user');
      const filter = { guildId: interaction.guild.id };
      if (user) filter.reportedUserId = user.id;

      const reports = await Report.find(filter).sort({ status: 1, createdAt: -1 }).lean();
      if (reports.length === 0) {
        return interaction.reply({ content: user ? `No reports for ${user.tag}.` : 'No reports yet.', ephemeral: true });
      }

      const itemsPerPage = 5;
      let page = 0;
      const totalPages = Math.ceil(reports.length / itemsPerPage);

      const buildEmbed = (p) => {
        const start = p * itemsPerPage;
        const pageItems = reports.slice(start, start + itemsPerPage);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('Reports' + (user ? ` for ${user.tag}` : ''))
          .setDescription(`Page ${p + 1}/${totalPages} — ${reports.length} total`)
          .setFooter({ text: 'Axion Report System' });

        for (const r of pageItems) {
          const ts = r.createdAt ? `<t:${Math.floor(new Date(r.createdAt).getTime() / 1000)}:R>` : 'Unknown';
          embed.addFields({
            name: `${r.status === 'pending' ? '⏳' : '✅'} Report #${r._id.toString().slice(0, 6)}`,
            value: `**User:** <@${r.reportedUserId}>\n**Reason:** ${r.reason}\n**Status:** ${r.status}\n**Date:** ${ts}`
          });
        }

        return embed;
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(totalPages <= 1)
      );

      const msg = await interaction.reply({ embeds: [buildEmbed(page)], components: [row], ephemeral: true, fetchReply: true });

      const collector = msg.createMessageComponentCollector({ time: 60000, filter: i => i.user.id === interaction.user.id });

      collector.on('collect', async (i) => {
        if (i.customId === 'prev' && page > 0) page--;
        if (i.customId === 'next' && page < totalPages - 1) page++;

        row.components[0].setDisabled(page === 0);
        row.components[1].setDisabled(page >= totalPages - 1);

        await i.update({ embeds: [buildEmbed(page)], components: [row] });
      });

      collector.on('end', async () => {
        try { await msg.edit({ components: [] }); } catch { /* ignore */ }
      });
    } catch (error) {
      console.error('reports view error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const userMention = message.mentions.users.first();
      const filter = { guildId: message.guild.id };
      if (userMention) filter.reportedUserId = userMention.id;

      const reports = await Report.find(filter).sort({ status: 1, createdAt: -1 }).lean();
      if (reports.length === 0) {
        return message.reply(userMention ? `No reports for ${userMention.tag}.` : 'No reports yet.');
      }

      const itemsPerPage = 5;
      let page = 0;
      const totalPages = Math.ceil(reports.length / itemsPerPage);

      const buildEmbed = (p) => {
        const start = p * itemsPerPage;
        const pageItems = reports.slice(start, start + itemsPerPage);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('Reports' + (userMention ? ` for ${userMention.tag}` : ''))
          .setDescription(`Page ${p + 1}/${totalPages} — ${reports.length} total`)
          .setFooter({ text: 'Axion Report System' });

        for (const r of pageItems) {
          const ts = r.createdAt ? `<t:${Math.floor(new Date(r.createdAt).getTime() / 1000)}:R>` : 'Unknown';
          embed.addFields({
            name: `${r.status === 'pending' ? '⏳' : '✅'} Report #${r._id.toString().slice(0, 6)}`,
            value: `**User:** <@${r.reportedUserId}>\n**Reason:** ${r.reason}\n**Status:** ${r.status}\n**Date:** ${ts}`
          });
        }

        return embed;
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(totalPages <= 1)
      );

      const msg = await message.reply({ embeds: [buildEmbed(page)], components: [row] });

      const collector = msg.createMessageComponentCollector({ time: 60000, filter: i => i.user.id === message.author.id });

      collector.on('collect', async (i) => {
        if (i.customId === 'prev' && page > 0) page--;
        if (i.customId === 'next' && page < totalPages - 1) page++;

        row.components[0].setDisabled(page === 0);
        row.components[1].setDisabled(page >= totalPages - 1);

        await i.update({ embeds: [buildEmbed(page)], components: [row] });
      });

      collector.on('end', async () => {
        try { await msg.edit({ components: [] }); } catch { /* ignore */ }
      });
    } catch (error) {
      console.error('reports view prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
