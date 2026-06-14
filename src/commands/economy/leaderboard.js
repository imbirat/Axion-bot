const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 richest users'),
  category: 'Economy',
  usage: '/leaderboard',
  description: 'View the top 10 users ranked by total wealth (balance + bank)',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const top = await getLeaderboard(interaction.guild.id, 10);

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏆 Economy Leaderboard');

      if (top.length === 0) {
        embed.setDescription('No users found on the leaderboard yet.');
      } else {
        let description = '';
        const medals = ['🥇', '🥈', '🥉'];
        for (let i = 0; i < top.length; i++) {
          const user = await client.users.fetch(top[i].userId).catch(() => null);
          const name = user ? user.username : 'Unknown User';
          const medal = medals[i] || `#${i + 1}`;
          description += `${medal} **${name}** — 🪙 ${top[i].total.toLocaleString()}\n`;
        }
        embed.setDescription(description);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('leaderboard command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const top = await getLeaderboard(message.guild.id, 10);

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏆 Economy Leaderboard');

      if (top.length === 0) {
        embed.setDescription('No users found on the leaderboard yet.');
      } else {
        let description = '';
        const medals = ['🥇', '🥈', '🥉'];
        for (let i = 0; i < top.length; i++) {
          const user = await client.users.fetch(top[i].userId).catch(() => null);
          const name = user ? user.username : 'Unknown User';
          const medal = medals[i] || `#${i + 1}`;
          description += `${medal} **${name}** — 🪙 ${top[i].total.toLocaleString()}\n`;
        }
        embed.setDescription(description);
      }

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('leaderboard prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
