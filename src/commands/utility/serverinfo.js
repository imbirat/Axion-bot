const { SlashCommandBuilder, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');

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
    await interaction.deferReply();
    try {
      const guild = interaction.guild;
      await guild.members.fetch();
      await guild.channels.fetch();
      const owner = await guild.fetchOwner();
      const members = guild.members.cache;
      const channels = guild.channels.cache;
      const roles = guild.roles.cache;
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
      const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
      const categoryChannels = channels.filter(c => c.type === ChannelType.GuildCategory).size;
      const forumChannels = channels.filter(c => c.type === ChannelType.GuildForum).size;
      const announcementChannels = channels.filter(c => c.type === ChannelType.GuildAnnouncement).size;
      const stageChannels = channels.filter(c => c.type === ChannelType.GuildStageVoice).size;
      const totalHumans = members.filter(m => !m.user.bot).size;
      const totalBots = members.filter(m => m.user.bot).size;

      const verificationLevels = {
        0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High',
      };

      const boostTiers = {
        0: 'None', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3',
      };

      const features = guild.features?.length
        ? guild.features.map(f => `\`${f}\``).join(', ')
        : 'None';

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .addFields(
          { name: 'Owner', value: `${owner.user.tag} (${owner.id})`, inline: false },
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
          { name: 'Members', value: `**Total:** ${guild.memberCount}\n**Humans:** ${totalHumans}\n**Bots:** ${totalBots}`, inline: true },
          { name: 'Channels', value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Announcement:** ${announcementChannels}\n**Forum:** ${forumChannels}\n**Stage:** ${stageChannels}\n**Categories:** ${categoryChannels}`, inline: true },
          { name: 'Roles', value: `${roles.size}`, inline: true },
          { name: 'Boosts', value: `**Count:** ${boosts}\n**Tier:** ${boostTiers[boostTier] || 'None'}`, inline: true },
          { name: 'Verification Level', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true },
          { name: 'Emojis', value: guild.emojis.cache.size.toString(), inline: true },
          { name: 'Stickers', value: guild.stickers?.cache?.size?.toString() || '0', inline: true },
          { name: 'Features', value: features, inline: false }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('serverinfo command error:', error);
      await interaction.editReply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guild = message.guild;
      await guild.members.fetch();
      await guild.channels.fetch();
      const owner = await guild.fetchOwner();
      const members = guild.members.cache;
      const channels = guild.channels.cache;
      const roles = guild.roles.cache;
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
      const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
      const categoryChannels = channels.filter(c => c.type === ChannelType.GuildCategory).size;
      const forumChannels = channels.filter(c => c.type === ChannelType.GuildForum).size;
      const announcementChannels = channels.filter(c => c.type === ChannelType.GuildAnnouncement).size;
      const stageChannels = channels.filter(c => c.type === ChannelType.GuildStageVoice).size;
      const totalHumans = members.filter(m => !m.user.bot).size;
      const totalBots = members.filter(m => m.user.bot).size;

      const verificationLevels = {
        0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High',
      };

      const boostTiers = {
        0: 'None', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3',
      };

      const features = guild.features?.length
        ? guild.features.map(f => `\`${f}\``).join(', ')
        : 'None';

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .addFields(
          { name: 'Owner', value: `${owner.user.tag} (${owner.id})`, inline: false },
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
          { name: 'Members', value: `**Total:** ${guild.memberCount}\n**Humans:** ${totalHumans}\n**Bots:** ${totalBots}`, inline: true },
          { name: 'Channels', value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Announcement:** ${announcementChannels}\n**Forum:** ${forumChannels}\n**Stage:** ${stageChannels}\n**Categories:** ${categoryChannels}`, inline: true },
          { name: 'Roles', value: `${roles.size}`, inline: true },
          { name: 'Boosts', value: `**Count:** ${boosts}\n**Tier:** ${boostTiers[boostTier] || 'None'}`, inline: true },
          { name: 'Verification Level', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true },
          { name: 'Emojis', value: guild.emojis.cache.size.toString(), inline: true },
          { name: 'Stickers', value: guild.stickers?.cache?.size?.toString() || '0', inline: true },
          { name: 'Features', value: features, inline: false }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('serverinfo prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
