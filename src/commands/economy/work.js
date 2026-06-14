const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { getProfile, addBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn some coins'),
  category: 'Economy',
  usage: '/work',
  description: 'Work and earn between 50 and 200 coins (1h cooldown)',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const now = Date.now();
      const cooldown = 3600000;

      if (profile.lastWork && (now - profile.lastWork.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastWork.getTime());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return interaction.reply({ content: `⏰ You need to rest! Come back in **${minutes}m ${seconds}s**.` });
      }

      const amount = Math.floor(Math.random() * 151) + 50;
      profile.lastWork = new Date();
      await profile.save();
      await addBalance(interaction.user.id, interaction.guild.id, amount);

      await interaction.reply({ content: `💼 You worked and earned **${amount}** coins!` });
    } catch (error) {
      console.error('work command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const profile = await getProfile(message.author.id, message.guild.id);
      const now = Date.now();
      const cooldown = 3600000;

      if (profile.lastWork && (now - profile.lastWork.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastWork.getTime());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return message.reply(`⏰ You need to rest! Come back in **${minutes}m ${seconds}s**.`);
      }

      const amount = Math.floor(Math.random() * 151) + 50;
      profile.lastWork = new Date();
      await profile.save();
      await addBalance(message.author.id, message.guild.id, amount);

      await message.channel.send(`💼 You worked and earned **${amount}** coins!`);
    } catch (error) {
      console.error('work prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
