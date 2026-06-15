const { Events } = require('discord.js');
const Starboard = require('../../models/Starboard');
const ReactionRole = require('../../models/ReactionRole');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  name: Events.MessageReactionAdd,

  async execute(reaction, user, client) {
    if (user.bot) return;

    const guild = reaction.message.guild;
    if (!guild) return;

    // ── Starboard ─────────────────────────────────────────
    const starConfig = await Starboard.findOne({ guildId: guild.id, enabled: true });
    if (starConfig && reaction.emoji.name === starConfig.emoji) {
      const { checkStarboard } = require('../../services/starboardService');
      await checkStarboard(reaction, client);
    }

    // ── Reaction roles ────────────────────────────────────
    const rr = await ReactionRole.findOne({ guildId: guild.id, messageId: reaction.message.id, type: 'reaction' });
    if (rr) {
      const roleEntry = rr.roles.find(r => r.emoji === reaction.emoji.name);
      if (roleEntry) {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (member) {
          const role = guild.roles.cache.get(roleEntry.roleId);
          if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role).catch(() => {});
          }
        }
      }
    }

    // ── Reaction XP ───────────────────────────────────────
    await UserProfile.findOneAndUpdate(
      { userId: user.id, guildId: guild.id },
      { $inc: { xp: 1 } },
      { upsert: true }
    );
  },
};
