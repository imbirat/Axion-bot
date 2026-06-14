const { EmbedBuilder } = require('discord.js');
const Starboard = require('../models/Starboard');

async function handleReaction(reaction, user) {
  try {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const guild = reaction.message.guild;
    if (!guild) return;

    const config = await Starboard.findOne({ guildId: guild.id });
    if (!config || !config.enabled || !config.channelId) return;

    if (reaction.emoji.toString() !== config.emoji) return;

    const starboardChannel = guild.channels.cache.get(config.channelId);
    if (!starboardChannel) return;

    const message = reaction.message;
    const reactionCount = reaction.count;

    if (reactionCount < config.threshold) return;

    const existingEntry = config.entries.find(
      e => e.originalMessageId === message.id
    );

    const author = message.author;

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setAuthor({
        name: author?.tag || 'Unknown User',
        iconURL: author?.displayAvatarURL({ dynamic: true })
      })
      .setDescription(message.content ? message.content.slice(0, 1000) : '')
      .setTimestamp(message.createdAt)
      .setFooter({
        text: `${reactionCount} ${config.emoji} | #${message.channel.name}`
      });

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.contentType?.startsWith('image/')) {
        embed.setImage(attachment.url);
      }
    }

    if (message.url) {
      embed.setURL(message.url);
    }

    if (existingEntry) {
      const starboardMsg = await starboardChannel.messages.fetch(existingEntry.starboardMessageId).catch(() => null);
      if (starboardMsg) {
        embed.setFooter({
          text: `${reactionCount} ${config.emoji} | #${message.channel.name}`
        });
        await starboardMsg.edit({ embeds: [embed] });
        existingEntry.starCount = reactionCount;
        await config.save();
      }
    } else {
      const starboardMsg = await starboardChannel.send({ embeds: [embed] });
      config.entries.push({
        originalMessageId: message.id,
        starboardMessageId: starboardMsg.id,
        channelId: message.channel.id,
        authorId: author?.id,
        starCount: reactionCount
      });
      await config.save();
    }
  } catch (error) {
    console.error('handleReaction error:', error);
  }
}

module.exports = { handleReaction };
