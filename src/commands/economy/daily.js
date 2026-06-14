const { SlashCommandBuilder } = require('discord.js');
const { getProfile, addBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coin reward'),
  category: 'Economy',
  usage: '/daily',
  description: 'Claim a random daily reward between 100 and 500 coins (24h cooldown)',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const now = Date.now();
      const cooldown = 86400000;

      if (profile.lastDaily && (now - profile.lastDaily.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastDaily.getTime());
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({ content: `⏰ You already claimed your daily! Come back in **${hours}h ${minutes}m**.` });
      }

      const amount = Math.floor(Math.random() * 401) + 100;
      profile.lastDaily = new Date();
      await profile.save();
      await addBalance(interaction.user.id, interaction.guild.id, amount);

      await interaction.reply({ content: `✅ You claimed your daily **${amount}** coins!` });
    } catch (error) {
      console.error('daily command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const profile = await getProfile(message.author.id, message.guild.id);
      const now = Date.now();
      const cooldown = 86400000;

      if (profile.lastDaily && (now - profile.lastDaily.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastDaily.getTime());
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return message.reply(`⏰ You already claimed your daily! Come back in **${hours}h ${minutes}m**.`);
      }

      const amount = Math.floor(Math.random() * 401) + 100;
      profile.lastDaily = new Date();
      await profile.save();
      await addBalance(message.author.id, message.guild.id, amount);

      await message.channel.send(`✅ You claimed your daily **${amount}** coins!`);
    } catch (error) {
      console.error('daily prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
