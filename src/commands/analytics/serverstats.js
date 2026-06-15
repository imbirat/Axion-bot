const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('View server statistics'),
  category: 'Analytics',
  usage: '/serverstats',
  description: 'Shows basic server statistics and information',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      await guild.members.fetch();
      const totalMembers = guild.memberCount;
      const bots = guild.members.cache.filter(m => m.user.bot).size;
      const humans = totalMembers - bots;
      const channels = guild.channels.cache.size;
      const roles = guild.roles.cache.size;
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostLevel = guild.premiumTier;
      const owner = await guild.fetchOwner();
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name} Statistics`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: '👑 Owner', value: owner.user.tag, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Members', value: `Total: ${totalMembers}\nHumans: ${humans}\nBots: ${bots}`, inline: true },
          { name: '💬 Channels', value: `${channels}`, inline: true },
          { name: '🎭 Roles', value: `${roles}`, inline: true },
          { name: '🚀 Boosts', value: `${boosts} (Level ${boostLevel})`, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('serverstats command error:', error);
      await interaction.reply({ content: 'There was an error fetching server stats.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guild = message.guild;
      await guild.members.fetch();
      const totalMembers = guild.memberCount;
      const bots = guild.members.cache.filter(m => m.user.bot).size;
      const humans = totalMembers - bots;
      const channels = guild.channels.cache.size;
      const roles = guild.roles.cache.size;
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostLevel = guild.premiumTier;
      const owner = await guild.fetchOwner();
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name} Statistics`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: '👑 Owner', value: owner.user.tag, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Members', value: `Total: ${totalMembers}\nHumans: ${humans}\nBots: ${bots}`, inline: true },
          { name: '💬 Channels', value: `${channels}`, inline: true },
          { name: '🎭 Roles', value: `${roles}`, inline: true },
          { name: '🚀 Boosts', value: `${boosts} (Level ${boostLevel})`, inline: true }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('serverstats prefix error:', error);
      await message.reply('There was an error fetching server stats.');
    }
  },
};
