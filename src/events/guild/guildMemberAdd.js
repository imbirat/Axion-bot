const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const ReactionRole = require('../../models/ReactionRole');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
    if (member.user.bot) return;

    const guild = member.guild;
    let config;
    try {
      config = await GuildConfig.findOne({ guildId: guild.id });
    } catch (err) {
      return;
    }
    if (!config) return;

    if (config.welcomeChannel) {
      const channel = guild.channels.cache.get(config.welcomeChannel);
      if (channel) {
        const message = (config.welcomeMessage || 'Welcome {user} to {server}!')
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{server}/g, guild.name)
          .replace(/{membercount}/g, guild.memberCount);

        if (config.welcomeEmbed) {
          const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('Welcome!')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Member #${guild.memberCount}` })
            .setTimestamp();
          channel.send({ embeds: [embed] }).catch(() => {});
        } else {
          channel.send({ content: message }).catch(() => {});
        }
      }
    }

    try {
      const autoRoles = await ReactionRole.find({ guildId: guild.id, type: 'auto' });
      for (const doc of autoRoles) {
        for (const roleEntry of doc.roles) {
          const role = guild.roles.cache.get(roleEntry.roleId);
          if (role && role.editable) {
            await member.roles.add(role).catch(() => {});
          }
        }
      }
    } catch (err) {}

    if (config.verifyEnabled && config.verifyRole) {
      const role = guild.roles.cache.get(config.verifyRole);
      if (role && role.editable) {
        await member.roles.add(role).catch(() => {});
      }
    }
  },
};
