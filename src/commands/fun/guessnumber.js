const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const games = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guessnumber')
    .setDescription('Guess the number (1-100)'),
  category: 'Fun',
  usage: '/guessnumber',
  description: 'Start a number guessing game. You have 5 guesses.',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const key = `${interaction.user.id}:${interaction.guild.id}`;
      if (games.has(key)) {
        return interaction.reply({ content: 'You already have an active game. Use your last guess or wait for it to expire.', flags: MessageFlags.Ephemeral });
      }
      const number = Math.floor(Math.random() * 100) + 1;
      games.set(key, { number, attempts: 0, maxAttempts: 5 });
      setTimeout(() => { if (games.has(key)) games.delete(key); }, 120000);
      await interaction.reply({ content: '🔢 I\'m thinking of a number between **1 and 100**. You have **5 guesses**. Reply with your guess in this channel!' });
      const filter = m => m.author.id === interaction.user.id && !isNaN(parseInt(m.content)) && parseInt(m.content) >= 1 && parseInt(m.content) <= 100;
      const collector = interaction.channel.createMessageCollector({ filter, time: 120000 });
      collector.on('collect', async msg => {
        const game = games.get(key);
        if (!game) return collector.stop();
        const guess = parseInt(msg.content);
        game.attempts++;
        if (guess === game.number) {
          await msg.reply(`🎉 **Correct!** The number was **${game.number}**. You got it in ${game.attempts} guess(es)!`);
          games.delete(key);
          collector.stop();
        } else if (game.attempts >= game.maxAttempts) {
          await msg.reply(`😞 Game over! The number was **${game.number}**.`);
          games.delete(key);
          collector.stop();
        } else {
          const hint = guess < game.number ? 'higher' : 'lower';
          await msg.reply(`❌ Wrong! Try **${hint}**. (${game.attempts}/${game.maxAttempts} guesses used)`);
        }
      });
      collector.on('end', (collected, reason) => {
        if (reason === 'time' && games.has(key)) {
          games.delete(key);
        }
      });
    } catch (error) {
      console.error('guessnumber command error:', error);
      await interaction.reply({ content: 'Failed to start the game.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const key = `${message.author.id}:${message.guild.id}`;
      if (games.has(key)) return message.reply('You already have an active game!');
      const number = Math.floor(Math.random() * 100) + 1;
      games.set(key, { number, attempts: 0, maxAttempts: 5 });
      setTimeout(() => { if (games.has(key)) games.delete(key); }, 120000);
      await message.channel.send('🔢 I\'m thinking of a number between **1 and 100**. You have **5 guesses**. Reply with your guess!');
      const filter = m => m.author.id === message.author.id && !isNaN(parseInt(m.content)) && parseInt(m.content) >= 1 && parseInt(m.content) <= 100;
      const collector = message.channel.createMessageCollector({ filter, time: 120000 });
      collector.on('collect', async msg => {
        const game = games.get(key);
        if (!game) return collector.stop();
        const guess = parseInt(msg.content);
        game.attempts++;
        if (guess === game.number) {
          await msg.reply(`🎉 **Correct!** The number was **${game.number}**. You got it in ${game.attempts} guess(es)!`);
          games.delete(key);
          collector.stop();
        } else if (game.attempts >= game.maxAttempts) {
          await msg.reply(`😞 Game over! The number was **${game.number}**.`);
          games.delete(key);
          collector.stop();
        } else {
          const hint = guess < game.number ? 'higher' : 'lower';
          await msg.reply(`❌ Wrong! Try **${hint}**. (${game.attempts}/${game.maxAttempts} guesses used)`);
        }
      });
    } catch (error) {
      console.error('guessnumber prefix error:', error);
      await message.reply('Failed to start the game.');
    }
  },
};
