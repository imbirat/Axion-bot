const ScheduledMessage = require('../models/ScheduledMessage');

const activeTimeouts = new Map();

async function loadScheduledMessages(client) {
  try {
    const messages = await ScheduledMessage.find({
      sent: false,
      scheduledFor: { $gte: new Date() }
    });

    for (const msg of messages) {
      scheduleMessageTimeout(msg, client);
    }

    return messages.length;
  } catch (error) {
    console.error('loadScheduledMessages error:', error);
    throw error;
  }
}

async function scheduleMessage(data, client) {
  try {
    const message = await ScheduledMessage.create({
      guildId: data.guildId,
      channelId: data.channelId,
      message: data.message,
      isEmbed: data.isEmbed || false,
      embedData: data.embedData || null,
      scheduledFor: data.scheduledFor,
      createdBy: data.createdBy
    });

    scheduleMessageTimeout(message, client);
    return message;
  } catch (error) {
    console.error('scheduleMessage error:', error);
    throw error;
  }
}

function scheduleMessageTimeout(message, client) {
  const now = Date.now();
  const delay = message.scheduledFor.getTime() - now;

  if (delay <= 0) {
    sendScheduledMessage(message, client);
    return;
  }

  const timeout = setTimeout(async () => {
    await sendScheduledMessage(message, client);
    activeTimeouts.delete(message._id.toString());
  }, delay);

  activeTimeouts.set(message._id.toString(), timeout);
}

async function sendScheduledMessage(message, client) {
  try {
    const guild = client.guilds.cache.get(message.guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(message.channelId);
    if (!channel) return;

    if (message.isEmbed && message.embedData) {
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder(message.embedData);
      await channel.send({ content: message.message || undefined, embeds: [embed] });
    } else {
      await channel.send(message.message);
    }

    message.sent = true;
    await message.save();
  } catch (error) {
    console.error('sendScheduledMessage error:', error);
  }
}

async function cancelMessage(id) {
  try {
    const timeout = activeTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      activeTimeouts.delete(id);
    }

    const message = await ScheduledMessage.findByIdAndUpdate(id, { sent: true }, { new: true });
    return message;
  } catch (error) {
    console.error('cancelMessage error:', error);
    throw error;
  }
}

async function listScheduled(guildId) {
  try {
    return await ScheduledMessage.find({ guildId, sent: false })
      .sort({ scheduledFor: 1 })
      .lean();
  } catch (error) {
    console.error('listScheduled error:', error);
    throw error;
  }
}

module.exports = { loadScheduledMessages, scheduleMessage, cancelMessage, listScheduled };
