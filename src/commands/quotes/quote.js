const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Quote = require('../../models/Quote');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Manage quotes')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a quote')
        .addStringOption(opt =>
          opt.setName('text')
            .setDescription('The quote text')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('random')
        .setDescription('Get a random quote'))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all quotes')),
  category: 'Quotes',
  usage: '/quote add|random|list',
  description: 'Add, view random, or list quotes',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'add') {
        const text = interaction.options.getString('text');
        await Quote.create({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          text
        });
        await interaction.reply({ content: '✅ Quote saved.' });
        return;
      }

      if (sub === 'random') {
        const count = await Quote.countDocuments({ guildId: interaction.guild.id });
        if (count === 0) {
          return interaction.reply({ content: 'No quotes found in this server.', ephemeral: true });
        }
        const random = Math.floor(Math.random() * count);
        const quote = await Quote.findOne({ guildId: interaction.guild.id }).skip(random);
        const user = await client.users.fetch(quote.userId).catch(() => null);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setDescription(quote.text)
          .addFields(
            { name: 'Author', value: user ? user.username : 'Unknown User', inline: true },
            { name: 'Date', value: `<t:${Math.floor(quote.createdAt.getTime() / 1000)}:D>`, inline: true }
          );
        await interaction.reply({ embeds: [embed] });
        return;
      }

      if (sub === 'list') {
        const quotes = await Quote.find({ guildId: interaction.guild.id })
          .sort({ createdAt: -1 })
          .lean();
        if (quotes.length === 0) {
          return interaction.reply({ content: 'No quotes found in this server.' });
        }
        const itemsPerPage = 10;
        let page = 0;
        const totalPages = Math.ceil(quotes.length / itemsPerPage);
        const pages = [];
        for (let p = 0; p < totalPages; p++) {
          const lines = [];
          const start = p * itemsPerPage;
          const chunk = quotes.slice(start, start + itemsPerPage);
          for (const q of chunk) {
            const user = await client.users.fetch(q.userId).catch(() => null);
            const name = user ? user.username : 'Unknown';
            const date = q.createdAt ? `<t:${Math.floor(new Date(q.createdAt).getTime() / 1000)}:D>` : 'N/A';
            lines.push(`**#${start + chunk.indexOf(q) + 1}** — ${q.text}\n— ${name} (${date})`);
          }
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📜 Quotes')
            .setDescription(lines.join('\n'))
            .setFooter({ text: `Page ${p + 1}/${totalPages}` });
          pages.push(embed);
        }
        let msg = await interaction.reply({ embeds: [pages[0]], fetchReply: true });
        if (totalPages > 1) {
          await msg.react('⬅️');
          await msg.react('➡️');
          const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
          const collector = msg.createReactionCollector({ filter, time: 30000 });
          collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '➡️' && page < totalPages - 1) {
              page++;
            } else if (reaction.emoji.name === '⬅️' && page > 0) {
              page--;
            } else {
              return;
            }
            await msg.edit({ embeds: [pages[page]] });
            await reaction.users.remove(interaction.user.id).catch(() => {});
          });
          collector.on('end', async () => {
            await msg.reactions.removeAll().catch(() => {});
          });
        }
      }
    } catch (error) {
      console.error('quote command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];
      if (!sub) return message.reply('Usage: quote add|random|list');

      if (sub === 'add') {
        const text = args.slice(1).join(' ');
        if (!text) return message.reply('Please provide quote text.');
        await Quote.create({
          guildId: message.guild.id,
          userId: message.author.id,
          text
        });
        await message.channel.send('✅ Quote saved.');
        return;
      }

      if (sub === 'random') {
        const count = await Quote.countDocuments({ guildId: message.guild.id });
        if (count === 0) {
          return message.channel.send('No quotes found in this server.');
        }
        const random = Math.floor(Math.random() * count);
        const quote = await Quote.findOne({ guildId: message.guild.id }).skip(random);
        const user = await client.users.fetch(quote.userId).catch(() => null);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setDescription(quote.text)
          .addFields(
            { name: 'Author', value: user ? user.username : 'Unknown User', inline: true },
            { name: 'Date', value: `<t:${Math.floor(quote.createdAt.getTime() / 1000)}:D>`, inline: true }
          );
        await message.channel.send({ embeds: [embed] });
        return;
      }

      if (sub === 'list') {
        const quotes = await Quote.find({ guildId: message.guild.id })
          .sort({ createdAt: -1 })
          .lean();
        if (quotes.length === 0) {
          return message.channel.send('No quotes found in this server.');
        }
        const itemsPerPage = 10;
        let page = 0;
        const totalPages = Math.ceil(quotes.length / itemsPerPage);
        const pages = [];
        for (let p = 0; p < totalPages; p++) {
          const lines = [];
          const start = p * itemsPerPage;
          const chunk = quotes.slice(start, start + itemsPerPage);
          for (const q of chunk) {
            const user = await client.users.fetch(q.userId).catch(() => null);
            const name = user ? user.username : 'Unknown';
            const date = q.createdAt ? `<t:${Math.floor(new Date(q.createdAt).getTime() / 1000)}:D>` : 'N/A';
            lines.push(`**#${start + chunk.indexOf(q) + 1}** — ${q.text}\n— ${name} (${date})`);
          }
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📜 Quotes')
            .setDescription(lines.join('\n'))
            .setFooter({ text: `Page ${p + 1}/${totalPages}` });
          pages.push(embed);
        }
        let msg = await message.channel.send({ embeds: [pages[0]] });
        if (totalPages > 1) {
          await msg.react('⬅️');
          await msg.react('➡️');
          const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
          const collector = msg.createReactionCollector({ filter, time: 30000 });
          collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '➡️' && page < totalPages - 1) {
              page++;
            } else if (reaction.emoji.name === '⬅️' && page > 0) {
              page--;
            } else {
              return;
            }
            await msg.edit({ embeds: [pages[page]] });
            await reaction.users.remove(message.author.id).catch(() => {});
          });
          collector.on('end', async () => {
            await msg.reactions.removeAll().catch(() => {});
          });
        }
      }
    } catch (error) {
      console.error('quote prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
