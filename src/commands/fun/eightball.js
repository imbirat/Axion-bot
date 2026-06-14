const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

const responses = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
  'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
  'Don\'t count on it.', 'My reply is no.', 'My sources say no.',
  'Outlook not so good.', 'Very doubtful.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question for the 8-ball')
        .setRequired(true)),
  category: 'Fun',
  usage: '/8ball <question>',
  description: 'Ask the magic 8-ball a question and receive a mystical answer',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');
      const response = responses[Math.floor(Math.random() * responses.length)];
      await interaction.reply(`🎱 Question: ${question}\nAnswer: ${response}`);
    } catch (error) {
      console.error('8ball command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide a question for the 8-ball.');
      const question = args.join(' ');
      const response = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(`🎱 Question: ${question}\nAnswer: ${response}`);
    } catch (error) {
      console.error('8ball prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
