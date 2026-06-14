const { SlashCommandBuilder } = require('discord.js');
const { getProfile, addBalance, removeBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Bet coins on a coin flip')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of coins to bet')
        .setRequired(true)
        .setMinValue(1)
    ),
  category: 'Economy',
  usage: '/coinflip <amount>',
  description: 'Bet coins on a 50/50 coin flip — double your bet on win, lose it all on loss',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const amount = interaction.options.getInteger('amount');
      const profile = await getProfile(interaction.user.id, interaction.guild.id);

      if (profile.balance < amount) {
        return interaction.reply({ content: 'You do not have enough coins in your wallet.', ephemeral: true });
      }

      await removeBalance(interaction.user.id, interaction.guild.id, amount);

      const win = Math.random() < 0.5;
      const result = win ? 'Heads' : 'Tails';

      if (win) {
        const winnings = amount * 2;
        await addBalance(interaction.user.id, interaction.guild.id, winnings);
        await interaction.reply({ content: `🪙 The coin landed on **${result}**! You won **${winnings}** coins! 🎉` });
      } else {
        await interaction.reply({ content: `🪙 The coin landed on **${result}**! You lost **${amount}** coins. Better luck next time!` });
      }
    } catch (error) {
      console.error('coinflip command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length < 1) return message.reply('Usage: `!coinflip <amount>`');

      const amount = parseInt(args[0], 10);
      if (isNaN(amount) || amount < 1) return message.reply('Please provide a valid bet amount of at least 1 coin.');

      const profile = await getProfile(message.author.id, message.guild.id);

      if (profile.balance < amount) {
        return message.reply('You do not have enough coins in your wallet.');
      }

      await removeBalance(message.author.id, message.guild.id, amount);

      const win = Math.random() < 0.5;
      const result = win ? 'Heads' : 'Tails';

      if (win) {
        const winnings = amount * 2;
        await addBalance(message.author.id, message.guild.id, winnings);
        await message.channel.send(`🪙 The coin landed on **${result}**! You won **${winnings}** coins! 🎉`);
      } else {
        await message.channel.send(`🪙 The coin landed on **${result}**! You lost **${amount}** coins. Better luck next time!`);
      }
    } catch (error) {
      console.error('coinflip prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
