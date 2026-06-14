const { Events, ChannelType, PermissionsBitField } = require('discord.js');
const TempVC = require('../../models/TempVC');
const UserProfile = require('../../models/UserProfile');
const logger = require('../../utils/logger');

const voiceXpTracking = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState, newState, client) {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;
    const guild = member.guild;

    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    if (oldChannelId !== newChannelId) {
      if (newChannelId) {
        await handleTempVcJoin(newState, member, guild, client);
      }
      if (oldChannelId) {
        await handleTempVcLeave(oldState, member, guild);
        await handleVoiceXpLeave(member, guild);
      }
      if (newChannelId && !oldChannelId) {
        await handleVoiceXpJoin(member, guild);
      }
    }
  },
};

async function handleTempVcJoin(state, member, guild) {
  try {
    const tempVcConfig = await TempVC.findOne({ guildId: guild.id });
    if (!tempVcConfig) return;
    if (state.channelId !== tempVcConfig.joinChannelId) return;

    const channelName = tempVcConfig.nameTemplate
      .replace(/{user}/g, member.displayName)
      .replace(/{username}/g, member.user.username);

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: tempVcConfig.categoryId || state.channel.parentId,
      userLimit: tempVcConfig.userLimit || 0,
      permissionOverwrites: [
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MuteMembers,
            PermissionsBitField.Flags.DeafenMembers,
            PermissionsBitField.Flags.MoveMembers,
          ],
        },
        {
          id: guild.id,
          allow: [PermissionsBitField.Flags.Connect],
        },
      ],
    });

    await member.voice.setChannel(channel);

    tempVcConfig.activeChannels.push({
      channelId: channel.id,
      ownerId: member.id,
      createdAt: new Date(),
    });
    await tempVcConfig.save();
  } catch (err) {
    logger.error('Error creating temp VC:', err);
  }
}

async function handleTempVcLeave(state, member, guild) {
  try {
    const tempVcConfig = await TempVC.findOne({ guildId: guild.id });
    if (!tempVcConfig) return;

    const activeEntry = tempVcConfig.activeChannels.find(
      entry => entry.channelId === state.channelId
    );
    if (!activeEntry) return;

    const channel = guild.channels.cache.get(state.channelId);
    if (channel && channel.members.size === 0) {
      await channel.delete().catch(() => {});
    }

    tempVcConfig.activeChannels = tempVcConfig.activeChannels.filter(
      entry => entry.channelId !== state.channelId
    );
    await tempVcConfig.save();
  } catch (err) {
    logger.error('Error cleaning up temp VC:', err);
  }
}

async function handleVoiceXpJoin(member, guild) {
  const key = `${member.id}-${guild.id}`;
  voiceXpTracking.set(key, Date.now());
}

async function handleVoiceXpLeave(member, guild) {
  const key = `${member.id}-${guild.id}`;
  const joinTime = voiceXpTracking.get(key);
  if (!joinTime) return;

  voiceXpTracking.delete(key);

  const timeSpent = Date.now() - joinTime;
  const minutes = Math.floor(timeSpent / 60000);
  if (minutes < 1) return;

  try {
    const xpService = require('../../services/xpService');
    await xpService.addVoiceXp(member.id, guild.id, minutes);
  } catch (err) {}
}
