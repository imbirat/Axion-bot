const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');
const StickyMessage = require('../../models/StickyMessage');
const CountingChannel = require('../../models/CountingChannel');
const CustomCommand = require('../../models/CustomCommand');
const snipeCache = require('../../utils/snipeCache');
const logger = require('../../utils/logger');

const DISBOARD_ID = '302050872383242240';

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const channelId = message.channel.id;

    let config;
    try {
      config = await GuildConfig.findOne({ guildId });
      if (!config) {
        config = await GuildConfig.create({ guildId });
      }
    } catch (err) {
      return;
    }

    snipeCache.set(channelId, {
      content: message.content,
      author: message.author,
      createdAt: message.createdAt,
      attachments: [...message.attachments.values()],
    });

    try {
      await handleAFK(message, userId, guildId, config);
      await handleMentionAFK(message, client);
    } catch (err) {}

    try {
      const xpService = require('../../services/xpService');
      await xpService.addXp(userId, guildId, message);
    } catch (err) {}

    try {
      await handleSticky(message, guildId, channelId, client);
    } catch (err) {}

    try {
      await handleCounting(message, guildId, channelId);
    } catch (err) {}

    try {
      await handleBump(message, guildId);
    } catch (err) {}

    try {
      const prefixArray = config.prefix || ['.'];
      const startsWithPrefix = prefixArray.some(p => message.content.startsWith(p));
      if (config.aiChannel && channelId === config.aiChannel && !startsWithPrefix) {
        await handleAIChannel(message);
      }
    } catch (err) {}

    try {
      await handlePrefixCommand(message, config, client);
    } catch (err) {
      logger.error(`Prefix command error from ${message.author.tag}:`, err);
    }
  },
};

async function handleAFK(message, userId, guildId) {
  try {
    const profile = await UserProfile.findOne({ userId, guildId });
    if (profile && profile.afk) {
      profile.afk = false;
      profile.afkReason = null;
      profile.afkSince = null;
      await profile.save();
      await message.channel.send(`Welcome back ${message.author}, I removed your AFK status!`).catch(() => {});
    }
  } catch (err) {}
}

async function handleMentionAFK(message, client) {
  const afkUsers = new Map();
  for (const mentionedUser of message.mentions.users.values()) {
    if (mentionedUser.bot) continue;
    try {
      const profile = await UserProfile.findOne({ userId: mentionedUser.id, guildId: message.guild.id });
      if (profile && profile.afk) {
        const member = message.guild.members.cache.get(mentionedUser.id);
        const nickname = member ? member.displayName : mentionedUser.username;
        await message.channel.send(
          `${nickname} is currently AFK: ${profile.afkReason || 'No reason set'}`
        ).catch(() => {});
      }
    } catch (err) {}
  }
}

async function handleSticky(message, guildId, channelId) {
  try {
    const sticky = await StickyMessage.findOne({ guildId, channelId });
    if (!sticky) return;

    if (sticky.lastMessageId) {
      const oldMsg = await message.channel.messages.fetch(sticky.lastMessageId).catch(() => null);
      if (oldMsg) {
        await oldMsg.delete().catch(() => {});
      }
    }

    const newMsg = await message.channel.send(sticky.message).catch(() => null);
    if (newMsg) {
      sticky.lastMessageId = newMsg.id;
      await sticky.save();
    }
  } catch (err) {}
}

async function handleCounting(message, guildId, channelId) {
  try {
    const counting = await CountingChannel.findOne({ guildId, channelId });
    if (!counting || !counting.enabled) return;

    const num = parseInt(message.content, 10);
    if (isNaN(num)) return;

    const correct = counting.currentCount + 1;

    if (num === correct && message.author.id !== counting.lastUserId) {
      counting.currentCount = num;
      if (num > counting.record) {
        counting.record = num;
      }
      counting.lastUserId = message.author.id;
      await counting.save();

      if ((num % 100) === 0) {
        await message.react('🎉').catch(() => {});
        await message.channel.send(`🎉 **${num}** reached!`).catch(() => {});
      }
    } else {
      counting.lastBrokeBy = message.author.id;
      counting.currentCount = 0;
      counting.lastUserId = null;
      await counting.save();
      await message.reply(`Broken! The count was at **${correct - 1}**. Start again from **1**.`).catch(() => {});
    }
  } catch (err) {}
}

async function handleBump(message, guildId) {
  if (message.author.id !== DISBOARD_ID) return;
  if (!message.interaction) return;

  const content = message.content.toLowerCase();
  if (content.includes('bump done') || content.includes('bump done')) {
    try {
      const bumpService = require('../../services/bumpService');
      await bumpService.recordBump(guildId, message.channel.id);
    } catch (err) {}
  }
}

async function handleAIChannel(message) {
  try {
    const geminiService = require('../../services/geminiService');
    await message.channel.sendTyping();
    const response = await geminiService.ask(message.content);
    const chunks = response.match(/.{1,1900}/gs) || [response];
    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  } catch (error) {
    await message.reply('❌ AI request failed. Check GEMINI_API_KEY.');
  }
}

async function handlePrefixCommand(message, config, client) {
  const prefixes = config.prefix || ['.'];
  let usedPrefix = null;

  for (const prefix of prefixes) {
    if (message.content.startsWith(prefix)) {
      usedPrefix = prefix;
      break;
    }
  }

  if (!usedPrefix) return;

  const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  if (!commandName) return;

  let command = client.commands.get(commandName);

  if (!command) {
    for (const cmd of client.commands.values()) {
      if (cmd.data.name === commandName) {
        command = cmd;
        break;
      }
      if (cmd.prefixAliases && cmd.prefixAliases.includes(commandName)) {
        command = cmd;
        const baseName = cmd.data.name;
        if (commandName.startsWith(baseName)) {
          const sub = commandName.slice(baseName.length).replace(/^-/, '');
          if (sub) args.unshift(sub);
        } else {
          args.unshift(commandName);
        }
        break;
      }
    }
  }

  if (!command) {
    try {
      const customCmd = await CustomCommand.findOne({
        guildId: message.guild.id,
        trigger: commandName.toLowerCase(),
      });
      if (customCmd) {
        if (customCmd.isEmbed) {
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setDescription(customCmd.response);
          await message.channel.send({ embeds: [embed] });
        } else {
          await message.channel.send(customCmd.response);
        }
      }
    } catch (err) {}
    return;
  }

  if (command.permissions) {
    const missing = command.permissions.filter(p => {
      return !message.member.permissions.has(p);
    });
    if (missing.length > 0) {
      return message.reply(`You need the following permissions: ${missing.join(', ')}`);
    }
  }

  if (!client.cooldowns.has(command.data.name)) {
    client.cooldowns.set(command.data.name, new Map());
  }
  const timestamps = client.cooldowns.get(command.data.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  const now = Date.now();

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = Math.round((expirationTime - now) / 1000);
      return message.reply(`Please wait ${timeLeft}s before using this command again.`);
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    if (command.prefixExecute) {
      await command.prefixExecute(message, args, client);
    } else {
      await message.reply('This command is only available as a slash command.');
    }
  } catch (error) {
    logger.error(`Error executing prefix command ${commandName}:`, error);
    await message.reply('There was an error executing that command.').catch(() => {});
  }
}
