const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Add XP to a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to add XP to')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Amount of XP to add')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Leveling',
  usage: '/addxp <user> <amount>',
  description: 'Add XP to a user (admin only)',
  permissions: ['Administrator'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      await UserProfile.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guild.id },
        { $inc: { xp: amount } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ Added **${amount}** XP to ${target.username}.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('addxp command error:', error);
      await interaction.reply({ content: 'There was an error adding XP.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1], 10);
      if (!target || isNaN(amount) || amount < 1) return message.reply('Usage: addxp <@user> <amount>');
      await UserProfile.findOneAndUpdate(
        { userId: target.id, guildId: message.guild.id },
        { $inc: { xp: amount } },
        { upsert: true }
      );
      await message.reply(`✅ Added **${amount}** XP to ${target.username}.`);
    } catch (error) {
      console.error('addxp prefix error:', error);
      await message.reply('There was an error adding XP.');
    }
  },
};
