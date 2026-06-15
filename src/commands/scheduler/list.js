const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const ScheduledMessage = require('../../models/ScheduledMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-list')
    .setDescription('List all pending scheduled messages'),
  category: 'Scheduler',
  description: 'Shows all pending scheduled messages with pagination',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const messages = await ScheduledMessage.find({ guildId: interaction.guild.id, sent: false }).sort({ scheduledFor: 1 }).lean();
      if (messages.length === 0) {
        return interaction.reply({ content: 'No pending scheduled messages.', flags: MessageFlags.Ephemeral });
      }

      const itemsPerPage = 5;
      const totalPages = Math.ceil(messages.length / itemsPerPage);
      let page = 0;

      const buildEmbed = (p) => {
        const start = p * itemsPerPage;
        const pageItems = messages.slice(start, start + itemsPerPage);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('Scheduled Messages')
          .setDescription(`Page ${p + 1}/${totalPages} — ${messages.length} total`);
        for (const m of pageItems) {
          const ts = Math.floor(new Date(m.scheduledFor).getTime() / 1000);
          embed.addFields({
            name: `#${m._id.toString().slice(0, 6)}`,
            value: `**Channel:** <#${m.channelId}>\n**Time:** <t:${ts}:R>\n**Message:** ${m.message.slice(0, 100)}`,
          });
        }
        return embed;
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(totalPages <= 1)
      );

      const msg = (await interaction.reply({ embeds: [buildEmbed(page)], components: [row], flags: MessageFlags.Ephemeral, withResponse: true })).resource.message;

      const collector = msg.createMessageComponentCollector({ time: 60000, filter: i => i.user.id === interaction.user.id });

      collector.on('collect', async (i) => {
        if (i.customId === 'prev' && page > 0) page--;
        if (i.customId === 'next' && page < totalPages - 1) page++;
        row.components[0].setDisabled(page === 0);
        row.components[1].setDisabled(page >= totalPages - 1);
        await i.update({ embeds: [buildEmbed(page)], components: [row] });
      });

      collector.on('end', async () => {
        try { await msg.edit({ components: [] }); } catch {}
      });
    } catch (error) {
      console.error('schedule-list error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const messages = await ScheduledMessage.find({ guildId: message.guild.id, sent: false }).sort({ scheduledFor: 1 }).lean();
      if (messages.length === 0) return message.reply('No pending scheduled messages.');

      const itemsPerPage = 5;
      const totalPages = Math.ceil(messages.length / itemsPerPage);
      let page = 0;

      const buildEmbed = (p) => {
        const start = p * itemsPerPage;
        const pageItems = messages.slice(start, start + itemsPerPage);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('Scheduled Messages')
          .setDescription(`Page ${p + 1}/${totalPages} — ${messages.length} total`);
        for (const m of pageItems) {
          const ts = Math.floor(new Date(m.scheduledFor).getTime() / 1000);
          embed.addFields({
            name: `#${m._id.toString().slice(0, 6)}`,
            value: `**Channel:** <#${m.channelId}>\n**Time:** <t:${ts}:R>\n**Message:** ${m.message.slice(0, 100)}`,
          });
        }
        return embed;
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(true),
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
        try { await msg.edit({ components: [] }); } catch {}
      });
    } catch (error) {
      console.error('schedule-list prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
