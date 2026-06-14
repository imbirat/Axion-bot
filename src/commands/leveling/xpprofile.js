const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../../models/UserProfile');

function xpForLevel(level) {
  return level * 100;
}

function getLevelColor(level) {
  if (level <= 5) return 0x95a5a6;
  if (level <= 10) return 0x2ecc71;
  if (level <= 20) return 0x3498db;
  if (level <= 30) return 0x9b59b6;
  if (level <= 50) return 0xf1c40f;
  return 0xe74c3c;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xpprofile')
    .setDescription('View your XP profile')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view profile of')
        .setRequired(false)
    ),
  category: 'Leveling',
  usage: '/profile [user]',
  description: 'Shows XP profile card with level, XP, XP to next level, and rank',
  permissions: 'Everyone',
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user') || interaction.user;
      let profile = await UserProfile.findOne({ userId: target.id, guildId: interaction.guild.id });
      if (!profile) {
        profile = { xp: 0, level: 1 };
      }
      const xpNeeded = xpForLevel(profile.level || 1);
      const rank = await UserProfile.countDocuments({
        guildId: interaction.guild.id,
        $or: [
          { level: { $gt: profile.level || 1 } },
          { level: profile.level || 1, xp: { $gt: profile.xp || 0 } }
        ]
      }) + 1;
      const embed = new EmbedBuilder()
        .setColor(getLevelColor(profile.level || 1))
        .setTitle(`${target.username}'s XP Profile`)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'Level', value: `${profile.level || 1}`, inline: true },
          { name: 'XP', value: `${(profile.xp || 0).toLocaleString()} / ${xpNeeded.toLocaleString()}`, inline: true },
          { name: 'Rank', value: `#${rank}`, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('profile command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first() || message.author;
      let profile = await UserProfile.findOne({ userId: target.id, guildId: message.guild.id });
      if (!profile) {
        profile = { xp: 0, level: 1 };
      }
      const xpNeeded = xpForLevel(profile.level || 1);
      const rank = await UserProfile.countDocuments({
        guildId: message.guild.id,
        $or: [
          { level: { $gt: profile.level || 1 } },
          { level: profile.level || 1, xp: { $gt: profile.xp || 0 } }
        ]
      }) + 1;
      const embed = new EmbedBuilder()
        .setColor(getLevelColor(profile.level || 1))
        .setTitle(`${target.username}'s XP Profile`)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'Level', value: `${profile.level || 1}`, inline: true },
          { name: 'XP', value: `${(profile.xp || 0).toLocaleString()} / ${xpNeeded.toLocaleString()}`, inline: true },
          { name: 'Rank', value: `#${rank}`, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('profile prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
