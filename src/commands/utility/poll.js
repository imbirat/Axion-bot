const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const LETTER_EMOJIS = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The poll question')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Comma-separated options (max 10)')
        .setRequired(false)
    ),
  category: 'Utilities',
  usage: '/poll <question> [options]',
  description: 'Create a poll with up to 10 comma-separated options',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');
      const optionsStr = interaction.options.getString('options');

      if (!optionsStr) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📊 Poll')
          .setDescription(question)
          .setFooter({ text: `Poll by ${interaction.user.tag}` })
          .setTimestamp();

        const poll = (await interaction.reply({ embeds: [embed], withResponse: true })).resource.message;
        await poll.react('👍');
        await poll.react('👎');
        return;
      }

      const options = optionsStr.split(',').map(o => o.trim()).filter(o => o.length > 0);
      if (options.length < 2) {
        return interaction.reply({ content: 'Please provide at least 2 options separated by commas.', flags: MessageFlags.Ephemeral });
      }
      if (options.length > 10) {
        return interaction.reply({ content: 'Maximum of 10 options allowed.', flags: MessageFlags.Ephemeral });
      }

      const description = options.map((opt, i) => `${LETTER_EMOJIS[i]} ${opt}`).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setFooter({ text: `Poll by ${interaction.user.tag}` })
        .setTimestamp();

      const poll = (await interaction.reply({ embeds: [embed], withResponse: true })).resource.message;
      for (let i = 0; i < options.length; i++) {
        await poll.react(LETTER_EMOJIS[i]);
      }
    } catch (error) {
      console.error('poll command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length === 0) {
        return message.reply('Usage: .poll <question> [opt1,opt2,...]');
      }

      const question = args[0];
      const optionsStr = args.slice(1).join(' ');

      if (!optionsStr) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📊 Poll')
          .setDescription(question)
          .setFooter({ text: `Poll by ${message.author.tag}` })
          .setTimestamp();

        const poll = await message.channel.send({ embeds: [embed] });
        await poll.react('👍');
        await poll.react('👎');
        return;
      }

      const options = optionsStr.split(',').map(o => o.trim()).filter(o => o.length > 0);
      if (options.length < 2) {
        return message.reply('Please provide at least 2 options separated by commas.');
      }
      if (options.length > 10) {
        return message.reply('Maximum of 10 options allowed.');
      }

      const description = options.map((opt, i) => `${LETTER_EMOJIS[i]} ${opt}`).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setFooter({ text: `Poll by ${message.author.tag}` })
        .setTimestamp();

      const poll = await message.channel.send({ embeds: [embed] });
      for (let i = 0; i < options.length; i++) {
        await poll.react(LETTER_EMOJIS[i]);
      }
    } catch (error) {
      console.error('poll prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
