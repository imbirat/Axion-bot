const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const DARES = [
  'Do your best impression of someone in the chat.',
  'Send a funny selfie to the channel.',
  'Speak in an accent for the next 3 rounds.',
  'Let someone write a message for you.',
  'Do 10 pushups right now.',
  'Sing the chorus of your favorite song.',
  'Tell the group an embarrassing story.',
  'Message a random emoji to your last text contact.',
  'Let someone pick your phone wallpaper.',
  'Do a dramatic reading of the last message in chat.',
  'Talk like a pirate for the next 5 minutes.',
  'Go outside and yell "I love cheese!" as loud as you can.',
  'Let the person who dared you post something on your social media.',
  'Eat a spoonful of something spicy.',
  'Do a handstand against the wall for 10 seconds.',
  'Call a friend and say "I love you" without context.',
  'Wear your shirt backwards for the rest of the game.',
  'Make up a rap about the person to your left.',
  'Try to lick your elbow for 30 seconds.',
  'Speak only in questions for the next 5 minutes.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dare')
    .setDescription('Get a random dare'),
  category: 'Social',
  usage: '/dare',
  description: 'Get a random dare for a game of truth or dare',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const dare = DARES[Math.floor(Math.random() * DARES.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('⚡ Dare')
        .setDescription(dare)
        .setFooter({ text: `Requested by ${interaction.user.username}` });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('dare command error:', error);
      await interaction.reply({ content: 'There was an error fetching a dare.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const dare = DARES[Math.floor(Math.random() * DARES.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('⚡ Dare')
        .setDescription(dare)
        .setFooter({ text: `Requested by ${message.author.username}` });
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('dare prefix error:', error);
      await message.reply('There was an error fetching a dare.');
    }
  },
};
