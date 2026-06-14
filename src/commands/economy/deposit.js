const { SlashCommandBuilder } = require('discord.js');
const { getProfile, addBank, removeBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins from your wallet to your bank')
    .addStringOption(option =>
      option.setName('amount')
        .setDescription('Amount to deposit (use "all" to deposit everything)')
        .setRequired(true)
    ),
  category: 'Economy',
  usage: '/deposit <amount|all>',
  description: 'Transfer coins from your wallet to your bank for safe keeping',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const amountStr = interaction.options.getString('amount');
      const profile = await getProfile(interaction.user.id, interaction.guild.id);

      let amount;
      if (amountStr.toLowerCase() === 'all') {
        amount = profile.balance;
      } else {
        amount = parseInt(amountStr, 10);
        if (isNaN(amount) || amount < 1) {
          return interaction.reply({ content: 'Please provide a valid amount or "all".', ephemeral: true });
        }
      }

      if (amount < 1) {
        return interaction.reply({ content: 'You have no coins to deposit.', ephemeral: true });
      }

      await removeBalance(interaction.user.id, interaction.guild.id, amount);
      await addBank(interaction.user.id, interaction.guild.id, amount);

      await interaction.reply({ content: `✅ Deposited **${amount}** coins to your bank.` });
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return interaction.reply({ content: 'You do not have enough coins in your wallet.', ephemeral: true });
      }
      console.error('deposit command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length < 1) return message.reply('Usage: `!deposit <amount|all>`');

      const amountStr = args[0];
      const profile = await getProfile(message.author.id, message.guild.id);

      let amount;
      if (amountStr.toLowerCase() === 'all') {
        amount = profile.balance;
      } else {
        amount = parseInt(amountStr, 10);
        if (isNaN(amount) || amount < 1) {
          return message.reply('Please provide a valid amount or "all".');
        }
      }

      if (amount < 1) {
        return message.reply('You have no coins to deposit.');
      }

      await removeBalance(message.author.id, message.guild.id, amount);
      await addBank(message.author.id, message.guild.id, amount);

      await message.channel.send(`✅ Deposited **${amount}** coins to your bank.`);
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return message.reply('You do not have enough coins in your wallet.');
      }
      console.error('deposit prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
