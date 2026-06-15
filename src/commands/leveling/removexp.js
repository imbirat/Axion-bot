const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('Remove XP from a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to remove XP from')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Amount of XP to remove')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Leveling',
  usage: '/removexp <user> <amount>',
  description: 'Remove XP from a user (admin only)',
  permissions: ['Administrator'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      const profile = await UserProfile.findOne({ userId: target.id, guildId: interaction.guild.id });
      const currentXp = profile?.xp || 0;
      const toRemove = Math.min(amount, currentXp);
      await UserProfile.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guild.id },
        { $inc: { xp: -toRemove } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ Removed **${toRemove}** XP from ${target.username}.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('removexp command error:', error);
      await interaction.reply({ content: 'There was an error removing XP.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1], 10);
      if (!target || isNaN(amount) || amount < 1) return message.reply('Usage: removexp <@user> <amount>');
      const profile = await UserProfile.findOne({ userId: target.id, guildId: message.guild.id });
      const currentXp = profile?.xp || 0;
      const toRemove = Math.min(amount, currentXp);
      await UserProfile.findOneAndUpdate(
        { userId: target.id, guildId: message.guild.id },
        { $inc: { xp: -toRemove } },
        { upsert: true }
      );
      await message.reply(`✅ Removed **${toRemove}** XP from ${target.username}.`);
    } catch (error) {
      console.error('removexp prefix error:', error);
      await message.reply('There was an error removing XP.');
    }
  },
};
