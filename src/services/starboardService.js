const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Starboard = require('../models/Starboard');

async function checkStarboard(reaction, client) {
  const config = await Starboard.findOne({ guildId: reaction.message.guild.id, enabled: true });
  if (!config) return;

  const count = reaction.count;
  if (count < config.threshold) return;

  const entry = config.entries.find(e => e.originalMessageId === reaction.message.id);
  if (entry) {
    if (entry.starCount !== count) {
      entry.starCount = count;
      await config.save();
      const sbChannel = reaction.message.guild.channels.cache.get(config.channelId);
      if (sbChannel) {
        const msg = await sbChannel.messages.fetch(entry.starboardMessageId).catch(() => null);
        if (msg) {
          const embed = EmbedBuilder.from(msg.embeds[0]);
          embed.setFooter({ text: `⭐ ${count}  |  #${reaction.message.channel.name}` });
          await msg.edit({ embeds: [embed] });
        }
      }
    }
    return;
  }

  const content = reaction.message.content || '';
  const attachment = reaction.message.attachments?.first();

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setAuthor({ name: reaction.message.author?.username || 'Unknown', iconURL: reaction.message.author?.displayAvatarURL() })
    .setDescription(content.length > 1000 ? content.slice(0, 1000) + '...' : content)
    .setFooter({ text: `⭐ ${count}  |  #${reaction.message.channel.name}` });

  if (attachment) {
    embed.setImage(attachment.url);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Jump to Message')
      .setStyle(ButtonStyle.Link)
      .setURL(reaction.message.url)
  );

  const sbChannel = reaction.message.guild.channels.cache.get(config.channelId);
  if (!sbChannel) return;

  const sbMsg = await sbChannel.send({ embeds: [embed], components: [row] });

  config.entries.push({
    originalMessageId: reaction.message.id,
    starboardMessageId: sbMsg.id,
    channelId: reaction.message.channel.id,
    authorId: reaction.message.author?.id,
    starCount: count,
  });
  await config.save();
}

module.exports = { checkStarboard };
