const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('View the member count of the server'),
  category: 'Utilities',
  usage: '/membercount',
  description: 'View the total member count of the server',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const memberCount = interaction.guild.memberCount;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Members')
        .setDescription(`${memberCount}`)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('membercount command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const memberCount = message.guild.memberCount;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Members')
        .setDescription(`${memberCount}`)
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('membercount prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
