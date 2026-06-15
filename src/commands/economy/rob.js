const { SlashCommandBuilder, MessageFlags } = require('discord.js');
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
  description: 'Attempt to rob another user — 50% success, steal 10-50% of their balance, fail fine is 25% of your balance',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      if (target.id === interaction.user.id) {
        return interaction.reply({ content: 'You cannot rob yourself!', flags: MessageFlags.Ephemeral });
      }

      const targetProfile = await getProfile(target.id, interaction.guild.id);
      if (targetProfile.balance < 100) {
        return interaction.reply({ content: `${target.username} is too poor to rob! They have less than 100 coins.` });
      }

      const profile = await getProfile(interaction.user.id, interaction.guild.id);
      const success = Math.random() < 0.5;

      if (success) {
        const stealPercent = Math.random() * 0.40 + 0.10;
        const stealAmount = Math.max(1, Math.floor(targetProfile.balance * stealPercent));
        await removeBalance(target.id, interaction.guild.id, stealAmount);
        await addBalance(interaction.user.id, interaction.guild.id, stealAmount);
        await interaction.reply({ content: `🔫 You robbed **${target.username}** and got away with **${stealAmount}** coins!` });
      } else {
        const fine = Math.max(1, Math.floor(profile.balance * 0.25));
        if (profile.balance < fine) {
          return interaction.reply({ content: `🚔 You failed to rob **${target.username}** and were caught! You don't have enough coins to pay the **${fine}** fine though...` });
        }
        await removeBalance(interaction.user.id, interaction.guild.id, fine);
        await interaction.reply({ content: `🚔 You failed to rob **${target.username}** and were caught! You paid a fine of **${fine}** coins.` });
      }
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return interaction.reply({ content: 'You do not have enough coins in your wallet.', flags: MessageFlags.Ephemeral });
      }
      console.error('rob command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('Please mention a user to rob.');
      if (target.id === message.author.id) return message.reply('You cannot rob yourself!');

      const targetProfile = await getProfile(target.id, message.guild.id);
      if (targetProfile.balance < 100) {
        return message.reply(`${target.username} is too poor to rob! They have less than 100 coins.`);
      }

      const profile = await getProfile(message.author.id, message.guild.id);
      const success = Math.random() < 0.5;

      if (success) {
        const stealPercent = Math.random() * 0.40 + 0.10;
        const stealAmount = Math.max(1, Math.floor(targetProfile.balance * stealPercent));
        await removeBalance(target.id, message.guild.id, stealAmount);
        await addBalance(message.author.id, message.guild.id, stealAmount);
        await message.channel.send(`🔫 You robbed **${target.username}** and got away with **${stealAmount}** coins!`);
      } else {
        const fine = Math.max(1, Math.floor(profile.balance * 0.25));
        if (profile.balance < fine) {
          return message.reply(`🚔 You failed to rob **${target.username}** and were caught! You don't have enough coins to pay the **${fine}** fine though...`);
        }
        await removeBalance(message.author.id, message.guild.id, fine);
        await message.channel.send(`🚔 You failed to rob **${target.username}** and were caught! You paid a fine of **${fine}** coins.`);
      }
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return message.reply('You do not have enough coins in your wallet.');
      }
      console.error('rob prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
