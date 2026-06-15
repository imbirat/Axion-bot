const Ticket = require('../models/Ticket');
const GuildConfig = require('../models/GuildConfig');

async function createTicket(member, guild, subject) {
  const config = await GuildConfig.findOne({ guildId: guild.id });
  if (!config) return { error: 'Ticket system not configured.' };

  if (config.ticketBlacklist?.includes(member.id)) {
    return { error: 'You are blacklisted from opening tickets.' };
  }

  const existing = await Ticket.findOne({ guildId: guild.id, userId: member.id, status: { $ne: 'closed' } });
  if (existing) {
    return { error: 'You already have an open ticket.' };
  }

  const ticketNumber = (config.ticketCount || 0) + 1;
  config.ticketCount = ticketNumber;
  await config.save();

  return { ticketNumber };
}

async function getTicket(channelId) {
  return Ticket.findOne({ channelId });
}

module.exports = { createTicket, getTicket };
