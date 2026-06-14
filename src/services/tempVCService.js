const { PermissionsBitField } = require('discord.js');
const TempVC = require('../models/TempVC');

async function createTempVoiceChannel(member, channel) {
  try {
    const config = await TempVC.findOne({ guildId: member.guild.id, joinChannelId: channel.id });
    if (!config) return null;

    const categoryId = config.categoryId || channel.parentId;
    const name = (config.nameTemplate || "{user}'s VC")
      .replace('{user}', member.displayName)
      .replace('{username}', member.user.username);

    const vc = await member.guild.channels.create({
      name,
      type: 2,
      parent: categoryId || undefined,
      userLimit: config.userLimit || 0,
      permissionOverwrites: [
        {
          id: member.guild.id,
          deny: [PermissionsBitField.Flags.Connect],
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MuteMembers,
            PermissionsBitField.Flags.DeafenMembers,
            PermissionsBitField.Flags.MoveMembers,
          ],
        },
      ],
    });

    await member.voice.setChannel(vc);

    config.activeChannels.push({
      channelId: vc.id,
      ownerId: member.id,
      createdAt: new Date()
    });
    await config.save();

    return vc;
  } catch (error) {
    console.error('createTempVoiceChannel error:', error);
    throw error;
  }
}

async function deleteTempVoiceChannel(channelId) {
  try {
    const config = await TempVC.findOne({ 'activeChannels.channelId': channelId });
    if (!config) return;

    config.activeChannels = config.activeChannels.filter(
      ac => ac.channelId !== channelId
    );
    await config.save();
  } catch (error) {
    console.error('deleteTempVoiceChannel error:', error);
    throw error;
  }
}

module.exports = { createTempVoiceChannel, deleteTempVoiceChannel };
