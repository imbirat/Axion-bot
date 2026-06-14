const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');
const { getProfile } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your economy profile')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view profile of')
        .setRequired(false)
    ),
  category: 'Economy',
  usage: '/profile [user]',
  description: 'View economy profile showing balance, bank, net worth, and daily streak info',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user') || interaction.user;
      const profile = await getProfile(target.id, interaction.guild.id);

      const total = profile.balance + profile.bank;

      let dailyStreak = 'Never claimed';
      if (profile.lastDaily) {
        const now = Date.now();
        const diff = now - profile.lastDaily.getTime();
        if (diff < 86400000) {
          dailyStreak = 'Already claimed today';
        } else if (diff < 172800000) {
          dailyStreak = 'Streak: 1 day';
        } else {
          dailyStreak = `Last claimed <t:${Math.floor(profile.lastDaily.getTime() / 1000)}:R>`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${target.username}'s Economy Profile`)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'Wallet', value: `🪙 ${profile.balance.toLocaleString()}`, inline: true },
          { name: 'Bank', value: `🏦 ${profile.bank.toLocaleString()}`, inline: true },
          { name: 'Net Worth', value: `💰 ${total.toLocaleString()}`, inline: true },
          { name: 'Daily', value: dailyStreak, inline: false }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('profile command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first() || message.author;
      const profile = await getProfile(target.id, message.guild.id);

      const total = profile.balance + profile.bank;

      let dailyStreak = 'Never claimed';
      if (profile.lastDaily) {
        const now = Date.now();
        const diff = now - profile.lastDaily.getTime();
        if (diff < 86400000) {
          dailyStreak = 'Already claimed today';
        } else if (diff < 172800000) {
          dailyStreak = 'Streak: 1 day';
        } else {
          dailyStreak = `Last claimed <t:${Math.floor(profile.lastDaily.getTime() / 1000)}:R>`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${target.username}'s Economy Profile`)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'Wallet', value: `🪙 ${profile.balance.toLocaleString()}`, inline: true },
          { name: 'Bank', value: `🏦 ${profile.bank.toLocaleString()}`, inline: true },
          { name: 'Net Worth', value: `💰 ${total.toLocaleString()}`, inline: true },
          { name: 'Daily', value: dailyStreak, inline: false }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('profile prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
