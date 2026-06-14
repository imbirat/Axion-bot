const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const xpService = require('../../services/xpService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xpleaderboard')
    .setDescription('View the top 10 users by XP'),
  category: 'Leveling',
  usage: '/leaderboard',
  description: 'View the top 10 users ranked by XP and level',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const top = await xpService.getLeaderboard(interaction.guild.id, 10);
      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('XP Leaderboard');
      if (top.length === 0) {
        embed.setDescription('No users found on the leaderboard yet.');
      } else {
        let description = '';
        const medals = ['🥇', '🥈', '🥉'];
        for (let i = 0; i < top.length; i++) {
          const user = await client.users.fetch(top[i].userId).catch(() => null);
          const name = user ? user.username : 'Unknown User';
          const medal = medals[i] || `#${i + 1}`;
          description += `${medal} **${name}** — Level ${top[i].level} (${top[i].xp.toLocaleString()} XP)\n`;
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
      const top = await xpService.getLeaderboard(message.guild.id, 10);
      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('XP Leaderboard');
      if (top.length === 0) {
        embed.setDescription('No users found on the leaderboard yet.');
      } else {
        let description = '';
        const medals = ['🥇', '🥈', '🥉'];
        for (let i = 0; i < top.length; i++) {
          const user = await client.users.fetch(top[i].userId).catch(() => null);
          const name = user ? user.username : 'Unknown User';
          const medal = medals[i] || `#${i + 1}`;
          description += `${medal} **${name}** — Level ${top[i].level} (${top[i].xp.toLocaleString()} XP)\n`;
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
