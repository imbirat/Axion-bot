const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../models/Giveaway');

const activeTimers = new Map();

async function startGiveaway(options) {
  try {
    const { guildId, channelId, prize, winners, duration, hostedBy, roleRequirement, inviteRequirement, bonusEntries } = options;
    const endsAt = new Date(Date.now() + duration);

    const giveaway = await Giveaway.create({
      guildId,
      channelId,
      prize,
      winners,
      endsAt,
      hostedBy,
      roleRequirement,
      inviteRequirement,
      bonusEntries: bonusEntries || []
    });

    const channel = options.client.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway')
      .setDescription(`**Prize:** ${prize}\n**Hosted by:** <@${hostedBy}>\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n\nReact with 🎉 to enter!`)
      .setColor(0x5865F2)
      .setFooter({ text: `ID: ${giveaway._id}` })
      .setTimestamp(endsAt);

    if (roleRequirement) {
      embed.addFields({ name: 'Role Required', value: `<@&${roleRequirement}>`, inline: true });
    }
    if (inviteRequirement) {
      embed.addFields({ name: 'Invites Required', value: `${inviteRequirement}`, inline: true });
    }

    const message = await channel.send({ embeds: [embed] });
    await message.react('🎉');

    giveaway.messageId = message.id;
    await giveaway.save();

    scheduleEnd(giveaway);

    return giveaway;
  } catch (error) {
    console.error('startGiveaway error:', error);
    throw error;
  }
}

async function endGiveaway(messageId) {
  try {
    const giveaway = await Giveaway.findOne({ messageId });
    if (!giveaway || giveaway.ended) return null;

    giveaway.ended = true;
    await giveaway.save();

    const timer = activeTimers.get(giveaway._id.toString());
    if (timer) {
      clearTimeout(timer);
      activeTimers.delete(giveaway._id.toString());
    }

    const channel = await global.client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return giveaway;

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return giveaway;

    const reaction = message.reactions.cache.get('🎉');
    let entries = [];
    if (reaction) {
      const users = await reaction.users.fetch();
      entries = users.filter(u => !u.bot).map(u => u.id);
    }

    const validEntries = entries.filter(e => !isBlacklisted(e, giveaway));
    const shuffled = validEntries.sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, giveaway.winners);

    if (selectedWinners.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('🎉 Giveaway Ended')
        .setDescription(`**Prize:** ${giveaway.prize}\nNo valid entries.`)
        .setColor(0xED4245);
      await message.edit({ embeds: [embed] });
      await channel.send('No valid entries, giveaway cancelled.');
      return giveaway;
    }

    giveaway.entries = entries;
    await giveaway.save();

    const winnerMentions = selectedWinners.map(w => `<@${w}>`).join(', ');
    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway Ended')
      .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winnerMentions}\n**Hosted by:** <@${giveaway.hostedBy}>`)
      .setColor(0x57F287);

    await message.edit({ embeds: [embed] });
    await channel.send(`Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);

    return giveaway;
  } catch (error) {
    console.error('endGiveaway error:', error);
    throw error;
  }
}

async function rerollGiveaway(messageId) {
  try {
    const giveaway = await Giveaway.findOne({ messageId });
    if (!giveaway) return null;

    const validEntries = giveaway.entries.filter(e => !isBlacklisted(e, giveaway));
    if (validEntries.length === 0) return giveaway;

    const shuffled = validEntries.sort(() => Math.random() - 0.5);
    const newWinners = shuffled.slice(0, giveaway.winners);

    const channel = await global.client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return giveaway;

    const winnerMentions = newWinners.map(w => `<@${w}>`).join(', ');
    await channel.send(`🎉 Reroll! New winners: ${winnerMentions} for **${giveaway.prize}**!`);

    return giveaway;
  } catch (error) {
    console.error('rerollGiveaway error:', error);
    throw error;
  }
}

async function checkExpiredGiveaways(client) {
  try {
    const expired = await Giveaway.find({
      ended: false,
      endsAt: { $lte: new Date() }
    });

    for (const giveaway of expired) {
      await endGiveaway(giveaway.messageId);
    }
  } catch (error) {
    console.error('checkExpiredGiveaways error:', error);
  }
}

function scheduleEnd(giveaway) {
  const now = Date.now();
  const timeUntilEnd = giveaway.endsAt.getTime() - now;

  if (timeUntilEnd <= 0) {
    endGiveaway(giveaway.messageId);
    return;
  }

  const timer = setTimeout(async () => {
    await endGiveaway(giveaway.messageId);
    activeTimers.delete(giveaway._id.toString());
  }, timeUntilEnd);

  activeTimers.set(giveaway._id.toString(), timer);
}

function isBlacklisted(userId, giveaway) {
  return false;
}

module.exports = { startGiveaway, endGiveaway, rerollGiveaway, checkExpiredGiveaways, scheduleEnd };
