const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const TempVC = require('../../models/TempVC');

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState, client) {
    const guildId = newState.guild?.id || oldState.guild?.id;
    if (!guildId) return;

    const config = await TempVC.findOne({ guildId });

    // ── User joined a voice channel ───────────────────────
    if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
      if (config && newState.channelId === config.joinChannelId) {
        const member = newState.member;
        const count = config.activeChannels.length + 1;
        const channelName = config.nameTemplate
          .replace(/{user}/g, member.displayName)
          .replace(/{count}/g, count);

        const category = config.categoryId ? newState.guild.channels.cache.get(config.categoryId) : null;

        const vc = await newState.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: category?.id || newState.channel.parentId,
          userLimit: config.userLimit || 0,
          permissionOverwrites: [
            { id: member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.Connect] },
            { id: newState.guild.id, deny: [PermissionFlagsBits.ManageChannels] },
          ],
        });

        await member.voice.setChannel(vc);

        config.activeChannels.push({ channelId: vc.id, ownerId: member.id, createdAt: new Date() });
        await config.save();
      }

      // Voice XP tracking
      const { addVoiceXp } = require('../../services/xpService');
      addVoiceXp(member.id, guildId);
    }

    // ── User left a voice channel ─────────────────────────
    if (oldState.channelId && (!newState.channelId || newState.channelId !== oldState.channelId)) {
      if (config) {
        const activeEntry = config.activeChannels.find(c => c.channelId === oldState.channelId);
        if (activeEntry) {
          const vc = oldState.guild.channels.cache.get(oldState.channelId);
          if (vc && vc.members.size === 0) {
            setTimeout(async () => {
              try {
                const ch = await oldState.guild.channels.fetch(oldState.channelId).catch(() => null);
                if (ch && ch.members.size === 0) {
                  await ch.delete().catch(() => {});
                }
              } catch (_) {}
            }, 5000);

            config.activeChannels = config.activeChannels.filter(c => c.channelId !== oldState.channelId);
            await config.save();
          }
        }
      }
    }
  },
};
