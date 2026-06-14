const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { transfer } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give coins to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of coins to give')
        .setRequired(true)
        .setMinValue(1)
    ),
  category: 'Economy',
  usage: '/give <user> <amount>',
  description: 'Give coins from your wallet to another user',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      if (target.id === interaction.user.id) {
        return interaction.reply({ content: 'You cannot give coins to yourself!', flags: MessageFlags.Ephemeral });
      }

      if (amount < 1) {
        return interaction.reply({ content: 'You must give at least 1 coin.', flags: MessageFlags.Ephemeral });
      }

      await transfer(interaction.user.id, target.id, interaction.guild.id, amount);
      await interaction.reply({ content: `✅ You gave **${amount}** coins to **${target.username}**.` });
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return interaction.reply({ content: 'You do not have enough coins in your wallet.', flags: MessageFlags.Ephemeral });
      }
      console.error('give command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('Please mention a user to give coins to.');
      if (target.id === message.author.id) return message.reply('You cannot give coins to yourself!');

      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) return message.reply('Please provide a valid amount of at least 1 coin.');

      await transfer(message.author.id, target.id, message.guild.id, amount);
      await message.channel.send(`✅ You gave **${amount}** coins to **${target.username}**.`);
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return message.reply('You do not have enough coins in your wallet.');
      }
      console.error('give prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
