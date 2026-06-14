const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchmaking')
    .setDescription('Match two random members and check their love compatibility'),
  category: 'Social',
  usage: '/matchmaking',
  description: 'Pair two random server members and calculate their love meter',
  permissions: 'Everyone',
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const members = await interaction.guild.members.fetch();
      const nonBot = members.filter(m => !m.user.bot).map(m => m.user);
      if (nonBot.length < 2) {
        return interaction.reply({ content: 'Not enough members to matchmake! Need at least 2 non-bot members.', ephemeral: true });
      }
      const shuffled = nonBot.sort(() => Math.random() - 0.5);
      const user1 = shuffled[0];
      const user2 = shuffled[1];
      const loveMeter = Math.floor(Math.random() * 101);
      await interaction.reply(`💘 **${user1} × ${user2}** - love meter: **${loveMeter}%**`);
    } catch (error) {
      console.error('matchmaking command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const members = await message.guild.members.fetch();
      const nonBot = members.filter(m => !m.user.bot).map(m => m.user);
      if (nonBot.length < 2) {
        return message.reply('Not enough members to matchmake! Need at least 2 non-bot members.');
      }
      const shuffled = nonBot.sort(() => Math.random() - 0.5);
      const user1 = shuffled[0];
      const user2 = shuffled[1];
      const loveMeter = Math.floor(Math.random() * 101);
      await message.reply(`💘 **${user1} × ${user2}** - love meter: **${loveMeter}%**`);
    } catch (error) {
      console.error('matchmaking prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
