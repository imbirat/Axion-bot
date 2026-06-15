const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd-list')
    .setDescription('List all custom commands'),
  category: 'Custom Commands',
  description: 'Lists all custom commands with pagination',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const commands = await CustomCommand.find({ guildId: interaction.guild.id }).sort({ trigger: 1 }).lean();
      if (commands.length === 0) {
        return interaction.reply({ content: 'No custom commands set for this server.', flags: MessageFlags.Ephemeral });
      }

      const itemsPerPage = 10;
      const totalPages = Math.ceil(commands.length / itemsPerPage);
      let page = 0;

      const buildEmbed = (p) => {
        const start = p * itemsPerPage;
        const pageItems = commands.slice(start, start + itemsPerPage);
        return new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('Custom Commands')
          .setDescription(pageItems.map(c => `**\`${c.trigger}\`** → ${c.response.substring(0, 50)}`).join('\n'))
          .setFooter({ text: `Page ${p + 1} of ${totalPages} • ${commands.length} total` });
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
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
      console.error('customcmd-list error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const commands = await CustomCommand.find({ guildId: message.guild.id }).sort({ trigger: 1 }).lean();
      if (commands.length === 0) return message.reply('No custom commands set for this server.');

      const itemsPerPage = 10;
      const totalPages = Math.ceil(commands.length / itemsPerPage);
      let page = 0;

      const buildEmbed = (p) => {
        const start = p * itemsPerPage;
        const pageItems = commands.slice(start, start + itemsPerPage);
        return new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('Custom Commands')
          .setDescription(pageItems.map(c => `**\`${c.trigger}\`** → ${c.response.substring(0, 50)}`).join('\n'))
          .setFooter({ text: `Page ${p + 1} of ${totalPages} • ${commands.length} total` });
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
        try { await msg.edit({ components: [] }); } catch {}
      });
    } catch (error) {
      console.error('customcmd-list prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
