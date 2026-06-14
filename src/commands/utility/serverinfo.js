const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('View information about the server'),
  category: 'Utilities',
  usage: '/serverinfo',
  description: 'View detailed information about the current server',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const owner = await guild.fetchOwner();
      const members = guild.members.cache;
      const channels = guild.channels.cache;
      const roles = guild.roles.cache;
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const textChannels = channels.filter(c => c.type === 0).size;
      const voiceChannels = channels.filter(c => c.type === 2).size;
      const categoryChannels = channels.filter(c => c.type === 4).size;
      const totalHumans = members.filter(m => !m.user.bot).size;
      const totalBots = members.filter(m => m.user.bot).size;

      const verificationLevels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High',
      };

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .addFields(
          { name: 'Owner', value: `${owner.user.tag}`, inline: true },
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
          { name: 'Members', value: `**Total:** ${guild.memberCount}\n**Humans:** ${totalHumans}\n**Bots:** ${totalBots}`, inline: true },
          { name: 'Channels', value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categoryChannels}`, inline: true },
          { name: 'Roles', value: `${roles.size}`, inline: true },
          { name: 'Boosts', value: `**Count:** ${boosts}\n**Tier:** ${boostTier}`, inline: true },
          { name: 'Verification Level', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('serverinfo command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guild = message.guild;
      const owner = await guild.fetchOwner();
      const members = guild.members.cache;
      const channels = guild.channels.cache;
      const roles = guild.roles.cache;
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const textChannels = channels.filter(c => c.type === 0).size;
      const voiceChannels = channels.filter(c => c.type === 2).size;
      const categoryChannels = channels.filter(c => c.type === 4).size;
      const totalHumans = members.filter(m => !m.user.bot).size;
      const totalBots = members.filter(m => m.user.bot).size;

      const verificationLevels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High',
      };

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .addFields(
          { name: 'Owner', value: `${owner.user.tag}`, inline: true },
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
          { name: 'Members', value: `**Total:** ${guild.memberCount}\n**Humans:** ${totalHumans}\n**Bots:** ${totalBots}`, inline: true },
          { name: 'Channels', value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categoryChannels}`, inline: true },
          { name: 'Roles', value: `${roles.size}`, inline: true },
          { name: 'Boosts', value: `**Count:** ${boosts}\n**Tier:** ${boostTier}`, inline: true },
          { name: 'Verification Level', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('serverinfo prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
