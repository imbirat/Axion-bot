const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member, client) {
    if (member.user.bot) return;

    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config) return;

    const channel = config.farewellChannel ? member.guild.channels.cache.get(config.farewellChannel) : null;
    if (!channel) return;

    const msg = (config.farewellMessage || 'Goodbye {user}!')
      .replace(/{user}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, member.guild.memberCount);

    if (config.farewellEmbed) {
      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setDescription(msg)
        .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
        .setTimestamp();
      channel.send({ embeds: [embed] });
    } else {
      channel.send({ content: msg });
    }
  },
};
