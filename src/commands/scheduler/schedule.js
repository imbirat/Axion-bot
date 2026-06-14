const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const ScheduledMessage = require('../../models/ScheduledMessage');

function parseTime(input) {
  const relative = input.match(/^(\d+)([smhd])$/);
  if (relative) {
    const num = parseInt(relative[1]);
    const unit = relative[2];
    const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
    return new Date(Date.now() + num * ms);
  }

  const absolute = input.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (absolute) {
    const [, y, m, d, h, min] = absolute.map(Number);
    return new Date(y, m - 1, d, h, min);
  }

  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Manage scheduled messages')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Schedule a message')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel to post the message')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('time')
            .setDescription('Time (1h, 30m, 2d, or YYYY-MM-DD HH:mm)')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('Message content to send')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all pending scheduled messages'))
    .addSubcommand(sub =>
      sub.setName('cancel')
        .setDescription('Cancel a scheduled message')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('Message ID of the scheduled message')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Scheduler',
  usage: '/schedule create <#channel> <time> <message> | /schedule list | /schedule cancel <id>',
  description: 'Schedule, list, or cancel timed messages',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'create') {
        const channel = interaction.options.getChannel('channel');
        const timeStr = interaction.options.getString('time');
        const content = interaction.options.getString('message');

        const scheduledFor = parseTime(timeStr);
        if (!scheduledFor || scheduledFor.getTime() <= Date.now()) {
          return interaction.reply({ content: 'Invalid or past time. Use formats like `1h`, `30m`, `2d`, or `YYYY-MM-DD HH:mm`.', ephemeral: true });
        }

        await ScheduledMessage.create({
          guildId: interaction.guild.id,
          channelId: channel.id,
          message: content,
          scheduledFor,
          createdBy: interaction.user.id
        });

        const ts = Math.floor(scheduledFor.getTime() / 1000);
        await interaction.reply({ content: `✅ Message scheduled for <t:${ts}:F> in ${channel}.`, ephemeral: true });
        return;
      }

      if (sub === 'list') {
        const messages = await ScheduledMessage.find({ guildId: interaction.guild.id, sent: false }).sort({ scheduledFor: 1 }).lean();
        if (messages.length === 0) {
          return interaction.reply({ content: 'No pending scheduled messages.', ephemeral: true });
        }

        const itemsPerPage = 5;
        let page = 0;
        const totalPages = Math.ceil(messages.length / itemsPerPage);

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
              value: `**Channel:** <#${m.channelId}>\n**Time:** <t:${ts}:R>\n**Message:** ${m.message.slice(0, 100)}`
            });
          }

          return embed;
        };

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(true),
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
        return;
      }

      if (sub === 'cancel') {
        const id = interaction.options.getString('id');
        const result = await ScheduledMessage.findOneAndDelete({ _id: id, guildId: interaction.guild.id });

        if (!result) {
          return interaction.reply({ content: 'Scheduled message not found.', ephemeral: true });
        }

        await interaction.reply({ content: '✅ Scheduled message cancelled.', ephemeral: true });
      }
    } catch (error) {
      console.error('schedule error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];

      if (sub === 'create') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('Usage: schedule create <#channel> <time> <message>');

        const timeStr = args[1];
        if (!timeStr) return message.reply('Usage: schedule create <#channel> <time> <message>');

        const content = args.slice(2).join(' ');
        if (!content) return message.reply('Usage: schedule create <#channel> <time> <message>');

        const scheduledFor = parseTime(timeStr);
        if (!scheduledFor || scheduledFor.getTime() <= Date.now()) {
          return message.reply('Invalid or past time. Use formats like `1h`, `30m`, `2d`, or `YYYY-MM-DD HH:mm`.');
        }

        await ScheduledMessage.create({
          guildId: message.guild.id,
          channelId: channel.id,
          message: content,
          scheduledFor,
          createdBy: message.author.id
        });

        const ts = Math.floor(scheduledFor.getTime() / 1000);
        await message.reply(`✅ Message scheduled for <t:${ts}:F> in ${channel}.`);
        return;
      }

      if (sub === 'list') {
        const messages = await ScheduledMessage.find({ guildId: message.guild.id, sent: false }).sort({ scheduledFor: 1 }).lean();
        if (messages.length === 0) return message.reply('No pending scheduled messages.');

        const itemsPerPage = 5;
        let page = 0;
        const totalPages = Math.ceil(messages.length / itemsPerPage);

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
              value: `**Channel:** <#${m.channelId}>\n**Time:** <t:${ts}:R>\n**Message:** ${m.message.slice(0, 100)}`
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
          try { await msg.edit({ components: [] }); } catch { /* ignore */ }
        });
        return;
      }

      if (sub === 'cancel') {
        const id = args[1];
        if (!id) return message.reply('Usage: schedule cancel <id>');

        const result = await ScheduledMessage.findOneAndDelete({ _id: id, guildId: message.guild.id });
        if (!result) return message.reply('Scheduled message not found.');

        await message.reply('✅ Scheduled message cancelled.');
        return;
      }

      await message.reply('Usage: schedule create <#channel> <time> <message> | schedule list | schedule cancel <id>');
    } catch (error) {
      console.error('schedule prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
