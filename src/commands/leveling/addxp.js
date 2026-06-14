const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const xpService = require('../../services/xpService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Add XP to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add XP to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of XP to add')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Leveling',
  usage: '/addxp <user> <amount>',
  description: 'Add XP to a user (Admin only)',
  permissions: ['Administrator'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      const result = await xpService.addXp(target.id, interaction.guild.id, amount);
      let reply = `✅ Added **${amount}** XP to **${target.username}**.`;
      if (result.leveledUp) {
        reply += `\n🎉 They leveled up to level **${result.newLevel}**!`;
      }
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('addxp command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('Please mention a user to add XP to.');
      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) return message.reply('Please provide a valid amount of at least 1.');
      const result = await xpService.addXp(target.id, message.guild.id, amount);
      let reply = `✅ Added **${amount}** XP to **${target.username}**.`;
      if (result.leveledUp) {
        reply += `\n🎉 They leveled up to level **${result.newLevel}**!`;
      }
      await message.channel.send(reply);
    } catch (error) {
      console.error('addxp prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
