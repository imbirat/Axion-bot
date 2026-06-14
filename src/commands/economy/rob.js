const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const { getProfile, addBalance, removeBalance } = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Rob another user for coins')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to rob')
        .setRequired(true)
    ),
  category: 'Economy',
  usage: '/rob <user>',
  description: 'Attempt to rob another user — 40% success chance, steal 10-25% of their balance (30min cooldown)',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      if (target.id === interaction.user.id) {
        return interaction.reply({ content: 'You cannot rob yourself!', flags: MessageFlags.Ephemeral });
      }

      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const now = Date.now();
      const cooldown = 1800000;

      if (profile.lastRob && (now - profile.lastRob.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastRob.getTime());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return interaction.reply({ content: `⏰ You need to wait before robbing again! **${minutes}m ${seconds}s** remaining.` });
      }

      const targetProfile = await getProfile(target.id, interaction.guild.id);
      if (targetProfile.balance < 50) {
        return interaction.reply({ content: `${target.username} is too poor to rob! They have less than 50 coins.` });
      }

      profile.lastRob = new Date();
      await profile.save();

      const success = Math.random() < 0.4;

      if (success) {
        const stealPercent = Math.random() * 0.15 + 0.10;
        const stealAmount = Math.max(1, Math.floor(targetProfile.balance * stealPercent));
        await removeBalance(target.id, interaction.guild.id, stealAmount);
        await addBalance(interaction.user.id, interaction.guild.id, stealAmount);
        await interaction.reply({ content: `🔫 You robbed **${target.username}** and got away with **${stealAmount}** coins!` });
      } else {
        const fine = 50;
        const robberProfile = await getProfile(interaction.user.id, interaction.guild.id);
        if (robberProfile.balance < fine) {
          return interaction.reply({ content: `🚔 You failed to rob **${target.username}** and were caught! You don't have enough coins to pay the **${fine}** fine though...` });
        }
        await removeBalance(interaction.user.id, interaction.guild.id, fine);
        await interaction.reply({ content: `🚔 You failed to rob **${target.username}** and were caught! You paid a fine of **${fine}** coins.` });
      }
    } catch (error) {
      console.error('rob command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('Please mention a user to rob.');
      if (target.id === message.author.id) return message.reply('You cannot rob yourself!');

      const profile = await getProfile(message.author.id, message.guild.id);
      const now = Date.now();
      const cooldown = 1800000;

      if (profile.lastRob && (now - profile.lastRob.getTime()) < cooldown) {
        const remaining = cooldown - (now - profile.lastRob.getTime());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return message.reply(`⏰ You need to wait before robbing again! **${minutes}m ${seconds}s** remaining.`);
      }

      const targetProfile = await getProfile(target.id, message.guild.id);
      if (targetProfile.balance < 50) {
        return message.reply(`${target.username} is too poor to rob! They have less than 50 coins.`);
      }

      profile.lastRob = new Date();
      await profile.save();

      const success = Math.random() < 0.4;

      if (success) {
        const stealPercent = Math.random() * 0.15 + 0.10;
        const stealAmount = Math.max(1, Math.floor(targetProfile.balance * stealPercent));
        await removeBalance(target.id, message.guild.id, stealAmount);
        await addBalance(message.author.id, message.guild.id, stealAmount);
        await message.channel.send(`🔫 You robbed **${target.username}** and got away with **${stealAmount}** coins!`);
      } else {
        const fine = 50;
        const robberProfile = await getProfile(message.author.id, message.guild.id);
        if (robberProfile.balance < fine) {
          return message.reply(`🚔 You failed to rob **${target.username}** and were caught! You don't have enough coins to pay the **${fine}** fine though...`);
        }
        await removeBalance(message.author.id, message.guild.id, fine);
        await message.channel.send(`🚔 You failed to rob **${target.username}** and were caught! You paid a fine of **${fine}** coins.`);
      }
    } catch (error) {
      console.error('rob prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
