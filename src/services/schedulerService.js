const { EmbedBuilder } = require('discord.js');
const ScheduledMessage = require('../models/ScheduledMessage');

async function loadScheduledMessages(client) {
  const pending = await ScheduledMessage.find({ sent: false, scheduledFor: { $gt: new Date() } });
  for (const msg of pending) {
    const delay = msg.scheduledFor.getTime() - Date.now();
    if (delay <= 0) {
      await ScheduledMessage.findByIdAndUpdate(msg._id, { sent: true });
      continue;
    }
    setTimeout(async () => {
      try {
        const channel = client.channels.cache.get(msg.channelId);
        if (!channel) return;
        if (msg.isEmbed && msg.embedData) {
          await channel.send({ embeds: [new EmbedBuilder(msg.embedData)] });
        } else {
          await channel.send(msg.message);
        }
        await ScheduledMessage.findByIdAndUpdate(msg._id, { sent: true });
      } catch (err) {
        console.error('[SCHEDULER] Error sending scheduled message:', err);
      }
    }, delay);
  }
  console.log(`[SCHEDULER] Loaded ${pending.length} scheduled messages`);
}

module.exports = { loadScheduledMessages };
