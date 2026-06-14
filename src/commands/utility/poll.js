const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a simple thumbs up/down poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The poll question')
        .setRequired(true)
    ),
  category: 'Utilities',
  usage: '/poll <question>',
  description: 'Create a simple yes/no poll with thumbs up and thumbs down reactions',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📊 Poll')
        .setDescription(question)
        .setFooter({ text: `Poll by ${interaction.user.tag}` })
        .setTimestamp();

      const poll = await interaction.reply({ embeds: [embed], fetchReply: true });
      await poll.react('👍');
      await poll.react('👎');
    } catch (error) {
      console.error('poll command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length === 0) {
        return message.reply('Usage: .poll <question>');
      }

      const question = args.join(' ');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📊 Poll')
        .setDescription(question)
        .setFooter({ text: `Poll by ${message.author.tag}` })
        .setTimestamp();

      const poll = await message.channel.send({ embeds: [embed] });
      await poll.react('👍');
      await poll.react('👎');
    } catch (error) {
      console.error('poll prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
