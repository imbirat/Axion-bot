const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const birthdayService = require('../../services/birthdayService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Manage birthdays')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set your birthday')
        .addStringOption(opt =>
          opt.setName('date')
            .setDescription('Your birthday (MM/DD or MM-DD)')
            .setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('year')
            .setDescription('Birth year (optional)')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('check')
        .setDescription("Check a user's birthday")
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('The user to check')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all birthdays in the server')),
  category: 'Birthday',
  usage: '/birthday set|check|list',
  description: 'Set, check, or list birthdays',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'set') {
        const dateStr = interaction.options.getString('date');
        const year = interaction.options.getInteger('year') || undefined;
        const match = dateStr.match(/^(0[1-9]|1[0-2])[\/-](0[1-9]|[12]\d|3[01])$/);
        if (!match) {
          return interaction.reply({ content: 'Invalid date format. Use MM/DD or MM-DD (e.g. 12/25).', ephemeral: true });
        }
        const date = `${match[1]}-${match[2]}`;
        await birthdayService.setBirthday(interaction.user.id, interaction.guild.id, date, year);
        await interaction.reply({ content: `✅ Birthday set to ${date}.` });
        return;
      }

      if (sub === 'check') {
        const target = interaction.options.getUser('user') || interaction.user;
        const bday = await birthdayService.checkBirthday(target.id, interaction.guild.id);
        if (!bday) {
          await interaction.reply({ content: `${target.username}'s birthday is not set.` });
        } else {
          await interaction.reply({ content: `${target.username}'s birthday is ${bday.date}.` });
        }
        return;
      }

      if (sub === 'list') {
        const birthdays = await birthdayService.listBirthdays(interaction.guild.id);
        if (birthdays.length === 0) {
          return interaction.reply({ content: 'No birthdays set in this server.' });
        }
        const sorted = birthdays.sort((a, b) => a.date.localeCompare(b.date));
        const itemsPerPage = 10;
        let page = 0;
        const totalPages = Math.ceil(sorted.length / itemsPerPage);
        const pages = [];
        for (let p = 0; p < totalPages; p++) {
          const lines = [];
          const start = p * itemsPerPage;
          const chunk = sorted.slice(start, start + itemsPerPage);
          for (const b of chunk) {
            const user = await client.users.fetch(b.userId).catch(() => null);
            const name = user ? user.username : 'Unknown User';
            lines.push(`**${name}** — ${b.date}${b.year ? ` (${b.year})` : ''}`);
          }
          const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('🎂 Birthdays')
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
      console.error('birthday command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];
      if (!sub) return message.reply('Usage: birthday set|check|list');

      if (sub === 'set') {
        const dateStr = args[1];
        if (!dateStr) return message.reply('Please provide a date (MM/DD or MM-DD).');
        const year = args[2] ? parseInt(args[2], 10) : undefined;
        const match = dateStr.match(/^(0[1-9]|1[0-2])[\/-](0[1-9]|[12]\d|3[01])$/);
        if (!match) return message.reply('Invalid date format. Use MM/DD or MM-DD (e.g. 12/25).');
        const date = `${match[1]}-${match[2]}`;
        await birthdayService.setBirthday(message.author.id, message.guild.id, date, year);
        await message.channel.send(`✅ Birthday set to ${date}.`);
        return;
      }

      if (sub === 'check') {
        const target = message.mentions.users.first() || message.author;
        const bday = await birthdayService.checkBirthday(target.id, message.guild.id);
        if (!bday) {
          await message.channel.send(`${target.username}'s birthday is not set.`);
        } else {
          await message.channel.send(`${target.username}'s birthday is ${bday.date}.`);
        }
        return;
      }

      if (sub === 'list') {
        const birthdays = await birthdayService.listBirthdays(message.guild.id);
        if (birthdays.length === 0) {
          return message.channel.send('No birthdays set in this server.');
        }
        const sorted = birthdays.sort((a, b) => a.date.localeCompare(b.date));
        const itemsPerPage = 10;
        let page = 0;
        const totalPages = Math.ceil(sorted.length / itemsPerPage);
        const pages = [];
        for (let p = 0; p < totalPages; p++) {
          const lines = [];
          const start = p * itemsPerPage;
          const chunk = sorted.slice(start, start + itemsPerPage);
          for (const b of chunk) {
            const user = await client.users.fetch(b.userId).catch(() => null);
            const name = user ? user.username : 'Unknown User';
            lines.push(`**${name}** — ${b.date}${b.year ? ` (${b.year})` : ''}`);
          }
          const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('🎂 Birthdays')
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
      console.error('birthday prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
