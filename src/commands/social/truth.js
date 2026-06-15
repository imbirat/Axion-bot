const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const TRUTHS = [
  'What is the most embarrassing thing you\'ve ever done?',
  'Have you ever lied to your best friend?',
  'What is your biggest fear?',
  'Who is your secret crush?',
  'What is the worst date you\'ve ever been on?',
  'Have you ever cheated on a test?',
  'What is the most expensive thing you\'ve stolen?',
  'What is your biggest insecurity?',
  'Have you ever been in love?',
  'What is the most childish thing you still do?',
  'What is the biggest lie you\'ve told your parents?',
  'Have you ever broken someone\'s heart?',
  'What is the worst thing you\'ve ever said to someone?',
  'What is your guilty pleasure?',
  'Have you ever stalked someone on social media?',
  'What is the most embarrassing thing in your room?',
  'Have you ever had a crush on a friend\'s partner?',
  'What is the worst thing you\'ve done while angry?',
  'Have you ever regretted a tattoo or piercing?',
  'What is the most awkward moment you\'ve experienced?',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('truth')
    .setDescription('Get a random truth question'),
  category: 'Social',
  usage: '/truth',
  description: 'Get a random truth question for a game of truth or dare',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const truth = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🔎 Truth')
        .setDescription(truth)
        .setFooter({ text: `Requested by ${interaction.user.username}` });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('truth command error:', error);
      await interaction.reply({ content: 'There was an error fetching a truth question.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const truth = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🔎 Truth')
        .setDescription(truth)
        .setFooter({ text: `Requested by ${message.author.username}` });
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('truth prefix error:', error);
      await message.reply('There was an error fetching a truth question.');
    }
  },
};
