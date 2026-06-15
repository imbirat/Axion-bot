const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile')
    .addSubcommand(sub => sub
      .setName('xp')
      .setDescription('View your XP profile')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('User to check')
          .setRequired(false)))
    .addSubcommand(sub => sub
      .setName('economy')
      .setDescription('View your economy profile')),
  category: 'Leveling',
  usage: '/profile <xp|economy> [user]',
  description: 'Shows XP or economy profile',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();
      if (sub === 'xp') {
        const target = interaction.options.getUser('user') || interaction.user;
        const profile = await UserProfile.findOne({ userId: target.id, guildId: interaction.guild.id });
        if (!profile) {
          return interaction.reply({ content: `${target.username} has no XP data yet.`, flags: MessageFlags.Ephemeral });
        }
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`${target.username}'s Profile`)
          .setThumbnail(target.displayAvatarURL())
          .addFields(
            { name: 'Level', value: `${profile.level}`, inline: true },
            { name: 'XP', value: `${profile.xp}`, inline: true },
            { name: 'Total Messages', value: `${profile.totalMessages || 0}`, inline: true }
          );
        await interaction.reply({ embeds: [embed] });
      } else if (sub === 'economy') {
        const profile = await UserProfile.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!profile) {
          return interaction.reply({ content: 'You have no economy data yet.', flags: MessageFlags.Ephemeral });
        }
        const total = profile.balance + profile.bank;

        let dailyInfo = 'Never claimed';
        if (profile.lastDaily) {
          const now = Date.now();
          const diff = now - profile.lastDaily.getTime();
          if (diff < 86400000) {
            dailyInfo = '✅ Claimed today';
          } else {
            dailyInfo = `<t:${Math.floor(profile.lastDaily.getTime() / 1000)}:R>`;
          }
        }

        let workInfo = 'Never worked';
        if (profile.lastWork) {
          const now = Date.now();
          const diff = now - profile.lastWork.getTime();
          if (diff < 3600000) {
            const mins = Math.floor((3600000 - diff) / 60000);
            workInfo = `⏳ Cooldown: ${mins}m remaining`;
          } else {
            workInfo = `✅ Available now (last <t:${Math.floor(profile.lastWork.getTime() / 1000)}:R>)`;
          }
        }

        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle(`${interaction.user.username}'s Economy Profile`)
          .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
          .addFields(
            { name: 'Wallet', value: `🪙 ${profile.balance.toLocaleString()}`, inline: true },
            { name: 'Bank', value: `🏦 ${profile.bank.toLocaleString()}`, inline: true },
            { name: 'Net Worth', value: `💰 ${total.toLocaleString()}`, inline: true },
            { name: 'Daily', value: dailyInfo, inline: true },
            { name: 'Work', value: workInfo, inline: true }
          );
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('profile command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = (args[0] || 'xp').toLowerCase();
      if (sub === 'xp') {
        const target = message.mentions.users.first() || message.author;
        const profile = await UserProfile.findOne({ userId: target.id, guildId: message.guild.id });
        if (!profile) return message.reply(`${target.username} has no XP data yet.`);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`${target.username}'s Profile`)
          .setThumbnail(target.displayAvatarURL())
          .addFields(
            { name: 'Level', value: `${profile.level}`, inline: true },
            { name: 'XP', value: `${profile.xp}`, inline: true },
            { name: 'Total Messages', value: `${profile.totalMessages || 0}`, inline: true }
          );
        await message.channel.send({ embeds: [embed] });
      } else if (sub === 'economy') {
        const profile = await UserProfile.findOne({ userId: message.author.id, guildId: message.guild.id });
        if (!profile) return message.reply('You have no economy data yet.');
        const total = profile.balance + profile.bank;

        let dailyInfo = 'Never claimed';
        if (profile.lastDaily) {
          const now = Date.now();
          const diff = now - profile.lastDaily.getTime();
          if (diff < 86400000) {
            dailyInfo = '✅ Claimed today';
          } else {
            dailyInfo = `<t:${Math.floor(profile.lastDaily.getTime() / 1000)}:R>`;
          }
        }

        let workInfo = 'Never worked';
        if (profile.lastWork) {
          const now = Date.now();
          const diff = now - profile.lastWork.getTime();
          if (diff < 3600000) {
            const mins = Math.floor((3600000 - diff) / 60000);
            workInfo = `⏳ Cooldown: ${mins}m remaining`;
          } else {
            workInfo = '✅ Available now';
          }
        }

        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle(`${message.author.username}'s Economy Profile`)
          .setThumbnail(message.author.displayAvatarURL({ size: 128 }))
          .addFields(
            { name: 'Wallet', value: `🪙 ${profile.balance.toLocaleString()}`, inline: true },
            { name: 'Bank', value: `🏦 ${profile.bank.toLocaleString()}`, inline: true },
            { name: 'Net Worth', value: `💰 ${total.toLocaleString()}`, inline: true },
            { name: 'Daily', value: dailyInfo, inline: true },
            { name: 'Work', value: workInfo, inline: true }
          );
        await message.channel.send({ embeds: [embed] });
      } else {
        await message.reply('Usage: !profile <xp|economy> [user]');
      }
    } catch (error) {
      console.error('profile prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
