const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guessnumber')
    .setDescription('Start a number guessing game (1-100)'),
  category: 'Fun',
  usage: '/guessnumber',
  description: 'Guess the number between 1 and 100 with 5 attempts',
  permissions: 'Everyone',
  cooldown: 10,
  async execute(interaction, client) {
    try {
      if (!client.guessGames) client.guessGames = new Map();
      if (client.guessGames.has(interaction.user.id)) {
        return interaction.reply({ content: 'You already have an active game! Finish it first.', ephemeral: true });
      }

      const number = Math.floor(Math.random() * 100) + 1;
      const game = { number, attempts: 0, maxAttempts: 5 };
      client.guessGames.set(interaction.user.id, game);

      await interaction.reply('🎯 I\'m thinking of a number between **1 and 100**. You have **5 guesses**! Start guessing in this channel.');

      const filter = m => m.author.id === interaction.user.id && !isNaN(m.content) && m.content.trim() !== '';
      const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

      collector.on('collect', async msg => {
        const guess = parseInt(msg.content);
        game.attempts++;

        if (guess === game.number) {
          await msg.reply(`🎉 **Correct!** The number was **${game.number}**. You got it in ${game.attempts} ${game.attempts === 1 ? 'guess' : 'guesses'}!`);
          client.guessGames.delete(interaction.user.id);
          collector.stop();
        } else if (game.attempts >= game.maxAttempts) {
          await msg.reply(`😞 **Game over!** The number was **${game.number}**. Better luck next time!`);
          client.guessGames.delete(interaction.user.id);
          collector.stop();
        } else if (guess < game.number) {
          await msg.reply(`⬆️ **Higher!** You have ${game.maxAttempts - game.attempts} ${game.maxAttempts - game.attempts === 1 ? 'guess' : 'guesses'} left.`);
        } else {
          await msg.reply(`⬇️ **Lower!** You have ${game.maxAttempts - game.attempts} ${game.maxAttempts - game.attempts === 1 ? 'guess' : 'guesses'} left.`);
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time' && client.guessGames.has(interaction.user.id)) {
          interaction.followUp({ content: `⏰ Time\'s up! The number was **${game.number}**.`, ephemeral: true });
          client.guessGames.delete(interaction.user.id);
        }
      });
    } catch (error) {
      console.error('guessnumber command error:', error);
      if (client.guessGames) client.guessGames.delete(interaction.user.id);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!client.guessGames) client.guessGames = new Map();
      if (client.guessGames.has(message.author.id)) {
        return message.reply('You already have an active game! Finish it first.');
      }

      const number = Math.floor(Math.random() * 100) + 1;
      const game = { number, attempts: 0, maxAttempts: 5 };
      client.guessGames.set(message.author.id, game);

      await message.reply('🎯 I\'m thinking of a number between **1 and 100**. You have **5 guesses**! Start guessing in this channel.');

      const filter = m => m.author.id === message.author.id && !isNaN(m.content) && m.content.trim() !== '';
      const collector = message.channel.createMessageCollector({ filter, time: 60000 });

      collector.on('collect', async msg => {
        const guess = parseInt(msg.content);
        game.attempts++;

        if (guess === game.number) {
          await msg.reply(`🎉 **Correct!** The number was **${game.number}**. You got it in ${game.attempts} ${game.attempts === 1 ? 'guess' : 'guesses'}!`);
          client.guessGames.delete(message.author.id);
          collector.stop();
        } else if (game.attempts >= game.maxAttempts) {
          await msg.reply(`😞 **Game over!** The number was **${game.number}**. Better luck next time!`);
          client.guessGames.delete(message.author.id);
          collector.stop();
        } else if (guess < game.number) {
          await msg.reply(`⬆️ **Higher!** You have ${game.maxAttempts - game.attempts} ${game.maxAttempts - game.attempts === 1 ? 'guess' : 'guesses'} left.`);
        } else {
          await msg.reply(`⬇️ **Lower!** You have ${game.maxAttempts - game.attempts} ${game.maxAttempts - game.attempts === 1 ? 'guess' : 'guesses'} left.`);
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time' && client.guessGames.has(message.author.id)) {
          message.channel.send(`⏰ Time\'s up! The number was **${game.number}**.`);
          client.guessGames.delete(message.author.id);
        }
      });
    } catch (error) {
      console.error('guessnumber prefix error:', error);
      if (client.guessGames) client.guessGames.delete(message.author.id);
      await message.reply('There was an error executing this command.');
    }
  },
};
