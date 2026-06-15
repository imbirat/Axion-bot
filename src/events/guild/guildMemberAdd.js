const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member, client) {
    if (member.user.bot) return;

    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config) return;

    // Welcome message
    const channel = config.welcomeChannel ? member.guild.channels.cache.get(config.welcomeChannel) : null;
    if (channel) {
      const msg = (config.welcomeMessage || 'Welcome {user} to {server}!')
        .replace(/{user}/g, member.toString())
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount);

      if (config.welcomeEmbed) {
        const embed = new EmbedBuilder()
          .setColor('#57F287')
          .setDescription(msg)
          .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
          .setTimestamp();
        channel.send({ embeds: [embed] });
      } else {
        channel.send({ content: msg });
      }
    }

    // Create user profile
    await UserProfile.findOneAndUpdate(
      { userId: member.id, guildId: member.guild.id },
      { $setOnInsert: { userId: member.id, guildId: member.guild.id, joinDate: new Date() } },
      { upsert: true }
    );
  },
};
