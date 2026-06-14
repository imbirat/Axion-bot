const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Check your bank balance'),
  category: 'Economy',
  usage: '/bank',
  description: 'View your bank balance and total net worth',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const total = profile.balance + profile.bank;

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${interaction.user.username}'s Bank`)
        .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'Bank Balance', value: `🏦 ${profile.bank.toLocaleString()}`, inline: true },
          { name: 'Wallet', value: `🪙 ${profile.balance.toLocaleString()}`, inline: true },
          { name: 'Total Net Worth', value: `💰 ${total.toLocaleString()}`, inline: false }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('bank command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const profile = await getProfile(message.author.id, message.guild.id);
      const total = profile.balance + profile.bank;

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${message.author.username}'s Bank`)
        .setThumbnail(message.author.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'Bank Balance', value: `🏦 ${profile.bank.toLocaleString()}`, inline: true },
          { name: 'Wallet', value: `🪙 ${profile.balance.toLocaleString()}`, inline: true },
          { name: 'Total Net Worth', value: `💰 ${total.toLocaleString()}`, inline: false }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('bank prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
