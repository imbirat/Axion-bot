const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Birthday = require('../../models/Birthday');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Manage your birthday')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set your birthday')
        .addStringOption(opt =>
          opt.setName('date')
            .setDescription('Your birthday in MM/DD format')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('check')
        .setDescription('Check a user\'s birthday')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to check')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all birthdays'))
    .setDMPermission(false),
  category: 'Birthday',
  usage: '/birthday <set|check|list> [user]',
  description: 'Set, check, or list birthdays',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'set') {
        const date = interaction.options.getString('date');
        if (!/^\d{2}\/\d{2}$/.test(date)) {
          return interaction.reply({ content: '❌ Invalid date format. Please use MM/DD (e.g., 12/25).', flags: MessageFlags.Ephemeral });
        }
        const [month, day] = date.split('/').map(Number);
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return interaction.reply({ content: '❌ Invalid date. Month must be 01-12 and day 01-31.', flags: MessageFlags.Ephemeral });
        }
        await Birthday.findOneAndUpdate(
          { userId: interaction.user.id, guildId: interaction.guild.id },
          { $set: { userId: interaction.user.id, guildId: interaction.guild.id, date } },
          { upsert: true }
        );
        await interaction.reply({ content: `✅ Birthday set to **${date}**.`, flags: MessageFlags.Ephemeral });
      } else if (sub === 'check') {
        const target = interaction.options.getUser('user') || interaction.user;
        const birthday = await Birthday.findOne({ userId: target.id, guildId: interaction.guild.id });
        if (!birthday) {
          return interaction.reply({ content: target.id === interaction.user.id ? 'You haven\'t set your birthday yet.' : `${target.username} hasn't set their birthday yet.` });
        }
        await interaction.reply({ content: `🎂 ${target.username}'s birthday is **${birthday.date}**.` });
      } else {
        const birthdays = await Birthday.find({ guildId: interaction.guild.id }).sort({ date: 1 });
        if (!birthdays.length) {
          return interaction.reply({ content: 'No birthdays set in this server.' });
        }
        const lines = birthdays.map(b => {
          const member = interaction.guild.members.cache.get(b.userId);
          return `**${b.date}** - ${member ? member.displayName : b.userId}`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🎂 Birthdays')
          .setDescription(lines.join('\n'));
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('birthday command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0]?.toLowerCase();
      if (sub === 'set') {
        const date = args[1];
        if (!date || !/^\d{2}\/\d{2}$/.test(date)) {
          return message.reply('Usage: birthday set MM/DD (e.g., birthday set 12/25)');
        }
        const [month, day] = date.split('/').map(Number);
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return message.reply('❌ Invalid date. Month must be 01-12 and day 01-31.');
        }
        await Birthday.findOneAndUpdate(
          { userId: message.author.id, guildId: message.guild.id },
          { $set: { userId: message.author.id, guildId: message.guild.id, date } },
          { upsert: true }
        );
        await message.reply(`✅ Birthday set to **${date}**.`);
      } else if (sub === 'check') {
        const target = message.mentions.users.first() || message.author;
        const birthday = await Birthday.findOne({ userId: target.id, guildId: message.guild.id });
        if (!birthday) {
          return message.reply(target.id === message.author.id ? "You haven't set your birthday yet." : `${target.username} hasn't set their birthday yet.`);
        }
        await message.reply(`🎂 ${target.username}'s birthday is **${birthday.date}**.`);
      } else {
        const birthdays = await Birthday.find({ guildId: message.guild.id }).sort({ date: 1 });
        if (!birthdays.length) return message.reply('No birthdays set in this server.');
        const lines = birthdays.map(b => {
          const member = message.guild.members.cache.get(b.userId);
          return `**${b.date}** - ${member ? member.displayName : b.userId}`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🎂 Birthdays')
          .setDescription(lines.join('\n'));
        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('birthday prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
