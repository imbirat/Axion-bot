const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getProfile, addBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Go fishing for coins'),
  category: 'Economy',
  description: 'Go fishing and earn 1-50 coins (30s cooldown)',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const now = Date.now();
      const cooldown = 30000;

      if (profile.lastFish && (now - profile.lastFish.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastFish.getTime());
        const seconds = Math.ceil(remaining / 1000);
        return interaction.reply({ content: `⏰ You need to wait before fishing again! **${seconds}s** remaining.` });
      }

      const amount = Math.floor(Math.random() * 50) + 1;
      profile.lastFish = new Date();
      await profile.save();
      await addBalance(interaction.user.id, interaction.guild.id, amount);

      const fishTypes = ['🐟 salmon', '🐠 tropical fish', '🐡 pufferfish', '🦐 shrimp', '🦀 crab'];
      const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      await interaction.reply({ content: `🎣 You caught a${fish} worth **${amount}** coins!` });
    } catch (error) {
      console.error('fish command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const profile = await getProfile(message.author.id, message.guild.id);
      const now = Date.now();
      const cooldown = 30000;

      if (profile.lastFish && (now - profile.lastFish.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastFish.getTime());
        const seconds = Math.ceil(remaining / 1000);
        return message.reply(`⏰ You need to wait before fishing again! **${seconds}s** remaining.`);
      }

      const amount = Math.floor(Math.random() * 50) + 1;
      profile.lastFish = new Date();
      await profile.save();
      await addBalance(message.author.id, message.guild.id, amount);

      const fishTypes = ['🐟 salmon', '🐠 tropical fish', '🐡 pufferfish', '🦐 shrimp', '🦀 crab'];
      const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      await message.channel.send(`🎣 You caught a${fish} worth **${amount}** coins!`);
    } catch (error) {
      console.error('fish prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
