const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Quote = require('../../models/Quote');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Quote management')
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
        .setDescription('List all quotes'))
    .setDMPermission(false),
  category: 'Quotes',
  usage: '/quote <add|random|list> [text]',
  description: 'Save, retrieve, and list quotes',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'add') {
        const text = interaction.options.getString('text');
        await Quote.create({
          guildId: interaction.guild.id,
          text,
          authorId: interaction.user.id,
          authorName: interaction.user.username,
        });
        await interaction.reply({ content: '✅ Quote saved!', flags: MessageFlags.Ephemeral });
      } else if (sub === 'random') {
        const count = await Quote.countDocuments({ guildId: interaction.guild.id });
        if (!count) return interaction.reply({ content: 'No quotes in this server yet.' });
        const random = await Quote.findOne({ guildId: interaction.guild.id }).skip(Math.floor(Math.random() * count));
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setDescription(`"${random.text}"`)
          .setFooter({ text: `— ${random.authorName}` });
        await interaction.reply({ embeds: [embed] });
      } else {
        const quotes = await Quote.find({ guildId: interaction.guild.id }).sort({ createdAt: -1 });
        if (!quotes.length) return interaction.reply({ content: 'No quotes in this server yet.' });
        const lines = quotes.map((q, i) => `**${i + 1}.** "${q.text}" — ${q.authorName}`);
        const chunks = [];
        for (let i = 0; i < lines.length; i += 10) chunks.push(lines.slice(i, i + 10));
        let page = 0;
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📜 Server Quotes')
          .setDescription(chunks[page].join('\n'))
          .setFooter({ text: `Page ${page + 1}/${chunks.length}` });
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('quote command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0]?.toLowerCase();
      if (sub === 'add') {
        const text = args.slice(1).join(' ');
        if (!text) return message.reply('Usage: quote add <text>');
        await Quote.create({
          guildId: message.guild.id,
          text,
          authorId: message.author.id,
          authorName: message.author.username,
        });
        await message.reply('✅ Quote saved!');
      } else if (sub === 'random' || !sub) {
        const count = await Quote.countDocuments({ guildId: message.guild.id });
        if (!count) return message.reply('No quotes in this server yet.');
        const random = await Quote.findOne({ guildId: message.guild.id }).skip(Math.floor(Math.random() * count));
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setDescription(`"${random.text}"`)
          .setFooter({ text: `— ${random.authorName}` });
        await message.channel.send({ embeds: [embed] });
      } else {
        const quotes = await Quote.find({ guildId: message.guild.id }).sort({ createdAt: -1 });
        if (!quotes.length) return message.reply('No quotes in this server yet.');
        const lines = quotes.map((q, i) => `**${i + 1}.** "${q.text}" — ${q.authorName}`);
        const chunks = [];
        for (let i = 0; i < lines.length; i += 10) chunks.push(lines.slice(i, i + 10));
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📜 Server Quotes')
          .setDescription(chunks[0].join('\n'))
          .setFooter({ text: `Page 1/${chunks.length}` });
        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('quote prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
