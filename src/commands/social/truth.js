const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

const truths = [
  'What is the most embarrassing thing you\'ve ever done?',
  'Have you ever lied to your best friend?',
  'What is your biggest fear?',
  'Who was your first crush?',
  'What is the worst date you\'ve been on?',
  'Have you ever cheated on a test?',
  'What is the most illegal thing you\'ve done?',
  'Have you ever stolen anything?',
  'What is your biggest insecurity?',
  'Who do you secretly dislike?',
  'What is the most trouble you\'ve ever been in?',
  'Have you ever broken someone\'s heart?',
  'What is the weirdest habit you have?',
  'What is the most embarrassing purchase you\'ve made?',
  'Have you ever ghosted someone?',
  'What is a secret you\'ve never told anyone?',
  'Who is your celebrity crush?',
  'What is the worst thing you\'ve said behind someone\'s back?',
  'Have you ever been caught doing something you shouldn\'t?',
  'What is the most embarrassing thing in your search history?',
  'What is the biggest lie you\'ve told?',
  'Have you ever had a crush on a friend\'s partner?',
  'What is something you pretend to like but actually hate?',
  'What is the most childish thing you still do?',
  'Have you ever cried during a movie?',
  'What is the biggest risk you\'ve ever taken?',
  'What is the most awkward moment you\'ve experienced?',
  'Have you ever regretted something you said?',
  'What is a skill you pretend to have but don\'t?',
  'What is the most embarrassing nickname you\'ve had?'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('truth')
    .setDescription('Get a random truth question'),
  category: 'Social',
  usage: '/truth',
  description: 'Receive a random truth question',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const truth = truths[Math.floor(Math.random() * truths.length)];
      await interaction.reply(`📖 **Truth:** ${truth}`);
    } catch (error) {
      console.error('truth command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const truth = truths[Math.floor(Math.random() * truths.length)];
      await message.reply(`📖 **Truth:** ${truth}`);
    } catch (error) {
      console.error('truth prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
