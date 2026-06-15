const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const RESPONSES = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
  'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
  'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.',
  'Very doubtful.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(opt =>
      opt.setName('question')
        .setDescription('Your question')
        .setRequired(true)),
  category: 'Fun',
  usage: '/8ball <question>',
  description: 'Get a random answer from the magic 8-ball',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');
      const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎱 Magic 8-Ball')
        .addFields(
          { name: 'Question', value: question, inline: false },
          { name: 'Answer', value: answer, inline: false }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('8ball command error:', error);
      await interaction.reply({ content: 'The 8-ball is broken. Try again later.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Usage: 8ball <question>');
      const question = args.join(' ');
      const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎱 Magic 8-Ball')
        .addFields(
          { name: 'Question', value: question, inline: false },
          { name: 'Answer', value: answer, inline: false }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('8ball prefix error:', error);
      await message.reply('The 8-ball is broken. Try again later.');
    }
  },
};
