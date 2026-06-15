const cron = require('node-cron');
const Giveaway = require('../models/Giveaway');

function startGiveawayService(client) {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expired = await Giveaway.find({ ended: false, endsAt: { $lte: now } });
    for (const giveaway of expired) {
      try {
        const channel = client.channels.cache.get(giveaway.channelId);
        if (!channel) {
          giveaway.ended = true;
          await giveaway.save();
          continue;
        }
        const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
        if (!message) {
          giveaway.ended = true;
          await giveaway.save();
          continue;
        }

        const validEntries = giveaway.entries.filter(e => e);
        let winners = [];
        if (validEntries.length > 0) {
          const shuffled = validEntries.sort(() => 0.5 - Math.random());
          winners = shuffled.slice(0, Math.min(giveaway.winners, shuffled.length));
        }

        const winnerMentions = winners.map(id => `<@${id}>`).join(', ') || 'No valid entries';
        await channel.send({
          content: `🎉 **Giveaway Ended!**\nPrize: **${giveaway.prize}**\nWinner(s): ${winnerMentions}\nHosted by: <@${giveaway.hostedBy}>`,
        });

        giveaway.ended = true;
        await giveaway.save();
      } catch (err) {
        console.error('[GIVEAWAY] Error ending giveaway:', err);
      }
    }
  });
  console.log('[GIVEAWAY] Service started');
}

module.exports = { startGiveawayService };
