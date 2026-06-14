const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

const dares = [
  'Do your best impression of someone in this server.',
  'Send a funny selfie to the chat.',
  'Say the alphabet backwards in under 10 seconds.',
  'Let someone write a message to send using your account.',
  'Do 10 pushups right now.',
  'Sing the chorus of your favorite song.',
  'Talk in a funny accent for the next 3 rounds.',
  'Send the last meme you saved on your phone.',
  'Let someone pick a profile picture for you for 24 hours.',
  'Speak only in rhymes for the next 5 minutes.',
  'Do a dramatic reading of the last text you sent.',
  'Act like a chicken for 30 seconds.',
  'Tell an embarrassing story about yourself.',
  'Let someone give you a nickname for the next week.',
  'Do your best celebrity impression.',
  'Send a message to the last person you texted saying something random.',
  'Do a handstand against the wall for 10 seconds.',
  'Talk like a pirate for the next 5 messages.',
  'Record yourself doing a silly dance.',
  'Let someone draw on your arm/hand.',
  'Eat something unusual (like a spoonful of hot sauce).',
  'Do 20 jumping jacks.',
  'Make a poem about the person to your left.',
  'Compliment everyone in the chat individually.',
  'Send a voice message saying something silly.',
  'Change your status to something embarrassing for an hour.',
  'Do a plank for 30 seconds while recording.',
  'Tell a joke in the most serious tone possible.',
  'Let the group pick a filter for you to use.',
  'Do your best animal impression for 15 seconds.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dare')
    .setDescription('Get a random dare'),
  category: 'Social',
  usage: '/dare',
  description: 'Receive a random dare challenge',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const dare = dares[Math.floor(Math.random() * dares.length)];
      await interaction.reply(`🔥 **Dare:** ${dare}`);
    } catch (error) {
      console.error('dare command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const dare = dares[Math.floor(Math.random() * dares.length)];
      await message.reply(`🔥 **Dare:** ${dare}`);
    } catch (error) {
      console.error('dare prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
