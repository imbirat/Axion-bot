const { Events } = require('discord.js');
const ReactionRole = require('../../models/ReactionRole');
const GuildConfig = require('../../models/GuildConfig');
const logger = require('../../utils/logger');

module.exports = {
  name: Events.MessageReactionAdd,
  once: false,
  async execute(reaction, user, client) {
    if (user.bot) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        return;
      }
    }

    const message = reaction.message;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const emoji = reaction.emoji.id
      ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
      : reaction.emoji.name;

    try {
      const xpService = require('../../services/xpService');
      await xpService.addReactionXp(user.id, guildId);
    } catch (err) {}

    try {
      const reactionRoles = await ReactionRole.find({
        guildId,
        messageId: message.id,
        type: 'reaction',
      });

      for (const doc of reactionRoles) {
        for (const roleEntry of doc.roles) {
          if (roleEntry.emoji === emoji) {
            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (member) {
              const role = message.guild.roles.cache.get(roleEntry.roleId);
              if (role && role.editable) {
                await member.roles.add(role).catch(() => {});
              }
            }
          }
        }
      }
    } catch (err) {}

    try {
      const starboardService = require('../../services/starboardService');
      await starboardService.handleReaction(reaction, user, client);
    } catch (err) {}

    try {
      const config = await GuildConfig.findOne({ guildId });
      if (config && config.verifyEnabled && config.verifyMode === 'reaction' && config.verifyChannel === message.channel.id) {
        if (config.verifyRole) {
          const member = await message.guild.members.fetch(user.id).catch(() => null);
          if (member) {
            const role = message.guild.roles.cache.get(config.verifyRole);
            if (role && role.editable) {
              await member.roles.add(role).catch(() => {});
            }
          }
        }
      }
    } catch (err) {}
  },
};
