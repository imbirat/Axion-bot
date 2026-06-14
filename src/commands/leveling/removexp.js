const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const xpService = require('../../services/xpService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('Remove XP from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove XP from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of XP to remove')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Leveling',
  usage: '/removexp <user> <amount>',
  description: 'Remove XP from a user (Admin only)',
  permissions: ['Administrator'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      await xpService.removeXp(target.id, interaction.guild.id, amount);
      await interaction.reply({ content: `✅ Removed **${amount}** XP from **${target.username}**.` });
    } catch (error) {
      console.error('removexp command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('Please mention a user to remove XP from.');
      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) return message.reply('Please provide a valid amount of at least 1.');
      await xpService.removeXp(target.id, message.guild.id, amount);
      await message.channel.send(`✅ Removed **${amount}** XP from **${target.username}**.`);
    } catch (error) {
      console.error('removexp prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
