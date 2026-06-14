const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

const questions = [
  'If you could have dinner with any historical figure, who would it be?',
  'What is the best piece of advice you\'ve ever received?',
  'If you could instantly master any skill, what would it be?',
  'What is your favorite memory from childhood?',
  'If you could travel anywhere right now, where would you go?',
  'What movie could you watch over and over again?',
  'What is the most important lesson life has taught you?',
  'If you could have a superpower, what would it be?',
  'What does your ideal day look like?',
  'What is a book that changed your perspective on life?',
  'If you could switch lives with someone for a day, who would it be?',
  'What is something you\'re really proud of?',
  'What is the kindest thing someone has ever done for you?',
  'If you could only eat one food for the rest of your life, what would it be?',
  'What is a goal you\'re currently working toward?',
  'What is your favorite way to spend a weekend?',
  'If you could time travel, would you go to the past or the future?',
  'What song always gets you in a good mood?',
  'What is something you wish more people understood about you?',
  'What is the best decision you\'ve ever made?',
  'If you could meet any fictional character, who would it be?',
  'What is a small thing that makes you happy?',
  'What is the most interesting place you\'ve ever visited?',
  'If you could change one thing about the world, what would it be?',
  'What hobby have you always wanted to try?',
  'What is the best compliment you\'ve ever received?',
  'If you could speak any language fluently, which would it be?',
  'What is your favorite season and why?',
  'What is something you would tell your younger self?',
  'What does success mean to you?'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailyquestion')
    .setDescription('Post a random discussion question'),
  category: 'Social',
  usage: '/dailyquestion',
  description: 'Post a random thought-provoking question for discussion',
  permissions: 'Everyone',
  cooldown: 30,
  async execute(interaction, client) {
    try {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const config = await GuildConfig.findOne({ guildId: interaction.guildId });
      const channelId = config?.dailyQuestionChannel;
      if (channelId) {
        const channel = interaction.guild.channels.cache.get(channelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('💬 Daily Question')
            .setDescription(question)
            .setTimestamp();
          await channel.send({ embeds: [embed] });
          return interaction.reply({ content: `✅ Question posted in ${channel}.`, ephemeral: true });
        }
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('💬 Daily Question')
        .setDescription(question)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('dailyquestion command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const config = await GuildConfig.findOne({ guildId: message.guildId });
      const channelId = config?.dailyQuestionChannel;
      if (channelId) {
        const channel = message.guild.channels.cache.get(channelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('💬 Daily Question')
            .setDescription(question)
            .setTimestamp();
          await channel.send({ embeds: [embed] });
          return message.reply(`✅ Question posted in ${channel}.`);
        }
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('💬 Daily Question')
        .setDescription(question)
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('dailyquestion prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
