const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchmaking')
    .setDescription('Match two random server members'),
  category: 'Social',
  usage: '/matchmaking',
  description: 'Picks 2 random server members and matches them together',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const members = await interaction.guild.members.fetch();
      const eligible = members.filter(m => !m.user.bot).map(m => m.user);
      if (eligible.length < 2) {
        return interaction.reply({ content: 'Not enough members to matchmake.', flags: MessageFlags.Ephemeral });
      }
      const shuffled = eligible.sort(() => Math.random() - 0.5);
      const [user1, user2] = [shuffled[0], shuffled[1]];
      const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('💘 Matchmaking')
        .setDescription(`**${user1}** 💕 **${user2}**\n\nA match made in heaven!`)
        .setThumbnail('https://cdn.discordapp.com/emojis/1026533090627174460.png')
        .setFooter({ text: `Requested by ${interaction.user.username}` });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('matchmaking command error:', error);
      await interaction.reply({ content: 'There was an error during matchmaking.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const members = await message.guild.members.fetch();
      const eligible = members.filter(m => !m.user.bot).map(m => m.user);
      if (eligible.length < 2) return message.reply('Not enough members to matchmake.');
      const shuffled = eligible.sort(() => Math.random() - 0.5);
      const [user1, user2] = [shuffled[0], shuffled[1]];
      const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('💘 Matchmaking')
        .setDescription(`**${user1}** 💕 **${user2}**\n\nA match made in heaven!`)
        .setFooter({ text: `Requested by ${message.author.username}` });
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('matchmaking prefix error:', error);
      await message.reply('There was an error during matchmaking.');
    }
  },
};
