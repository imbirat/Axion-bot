const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { getProfile, addBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Go fishing for coins'),
  category: 'Economy',
  usage: '/fish',
  description: 'Go fishing and catch fish (20-100), a boot (nothing), or treasure (200-500) — 30min cooldown',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const now = Date.now();
      const cooldown = 1800000;

      if (profile.lastFish && (now - profile.lastFish.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastFish.getTime());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return interaction.reply({ content: `⏰ You need to wait before fishing again! **${minutes}m ${seconds}s** remaining.` });
      }

      profile.lastFish = new Date();
      await profile.save();

      const roll = Math.random();
      let amount = 0;
      let message = '';

      if (roll < 0.15) {
        amount = Math.floor(Math.random() * 301) + 200;
        message = `🎣 You fished up a **treasure chest** worth **${amount}** coins!`;
      } else if (roll < 0.25) {
        message = '🎣 You caught an old **boot**. Nothing valuable today.';
      } else {
        amount = Math.floor(Math.random() * 81) + 20;
        const fishTypes = ['🐟 salmon', '🐠 tropical fish', '🐡 pufferfish', '🦈 shark'];
        const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        message = `🎣 You caught a${fish} worth **${amount}** coins!`;
      }

      if (amount > 0) {
        await addBalance(interaction.user.id, interaction.guild.id, amount);
      }

      await interaction.reply({ content: message });
    } catch (error) {
      console.error('fish command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const profile = await getProfile(message.author.id, message.guild.id);
      const now = Date.now();
      const cooldown = 1800000;

      if (profile.lastFish && (now - profile.lastFish.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastFish.getTime());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return message.reply(`⏰ You need to wait before fishing again! **${minutes}m ${seconds}s** remaining.`);
      }

      profile.lastFish = new Date();
      await profile.save();

      const roll = Math.random();
      let amount = 0;
      let resultMsg = '';

      if (roll < 0.15) {
        amount = Math.floor(Math.random() * 301) + 200;
        resultMsg = `🎣 You fished up a **treasure chest** worth **${amount}** coins!`;
      } else if (roll < 0.25) {
        resultMsg = '🎣 You caught an old **boot**. Nothing valuable today.';
      } else {
        amount = Math.floor(Math.random() * 81) + 20;
        const fishTypes = ['🐟 salmon', '🐠 tropical fish', '🐡 pufferfish', '🦈 shark'];
        const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        resultMsg = `🎣 You caught a${fish} worth **${amount}** coins!`;
      }

      if (amount > 0) {
        await addBalance(message.author.id, message.guild.id, amount);
      }

      await message.channel.send(resultMsg);
    } catch (error) {
      console.error('fish prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
