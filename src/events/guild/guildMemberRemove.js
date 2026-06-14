const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    if (member.user.bot) return;

    let config;
    try {
      config = await GuildConfig.findOne({ guildId: member.guild.id });
    } catch (err) {
      return;
    }
    if (!config) return;

    if (config.farewellChannel) {
      const channel = member.guild.channels.cache.get(config.farewellChannel);
      if (channel) {
        const message = (config.farewellMessage || 'Goodbye {user}, we will miss you!')
          .replace(/{user}/g, member.user.tag)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, member.guild.memberCount);

        if (config.farewellEmbed) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('Goodbye!')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Member #${member.guild.memberCount}` })
            .setTimestamp();
          channel.send({ embeds: [embed] }).catch(() => {});
        } else {
          channel.send({ content: message }).catch(() => {});
        }
      }
    }
  },
};
