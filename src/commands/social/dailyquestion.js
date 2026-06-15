const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const QUESTIONS = [
  'What is one thing you are grateful for today?',
  'If you could have dinner with anyone alive or dead, who would it be?',
  'What is the best piece of advice you\'ve ever received?',
  'What would you do if you won the lottery tomorrow?',
  'What is your favorite memory from childhood?',
  'If you could travel anywhere right now, where would you go?',
  'What skill would you learn if you had unlimited time?',
  'What does your perfect day look like?',
  'What is something you wish more people knew about you?',
  'If you could switch lives with someone for a day, who would it be?',
  'What is the most important lesson life has taught you?',
  'What is your biggest dream that you haven\'t achieved yet?',
  'What fictional world would you most like to live in?',
  'What is the kindest thing someone has done for you?',
  'If you could have any superpower, what would it be?',
  'What is a small thing that always makes you happy?',
  'What would you tell your younger self?',
  'What is the most beautiful place you\'ve ever been?',
  'If you could only eat one food for the rest of your life, what would it be?',
  'What is something you want to accomplish this year?',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailyquestion')
    .setDescription('Get a random daily question'),
  category: 'Social',
  usage: '/dailyquestion',
  description: 'Get a random thought-provoking question',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('💭 Daily Question')
        .setDescription(question)
        .setFooter({ text: `Requested by ${interaction.user.username}` });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('dailyquestion command error:', error);
      await interaction.reply({ content: 'There was an error fetching a question.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('💭 Daily Question')
        .setDescription(question)
        .setFooter({ text: `Requested by ${message.author.username}` });
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('dailyquestion prefix error:', error);
      await message.reply('There was an error fetching a question.');
    }
  },
};
