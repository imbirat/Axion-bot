const { Events, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');
const CustomCommand = require('../../models/CustomCommand');
const CountingChannel = require('../../models/CountingChannel');
const BumpReminder = require('../../models/BumpReminder');
const StickyMessage = require('../../models/StickyMessage');
const { push } = require('../../utils/snipeCache');
const geminiService = require('../../services/geminiService');

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (message.author.bot) return;

    const guildId = message.guild?.id;
    if (!guildId) return;

    const config = await GuildConfig.findOne({ guildId });
    const prefixes = config?.prefix ?? ['.', '/'];

    // ── Snipe cache ────────────────────────────────────────
    push(message.channelId, {
      content: message.content,
      author: message.author,
      attachments: [...message.attachments.values()],
      createdAt: message.createdTimestamp,
    });

    // ── XP system ──────────────────────────────────────────
    const profile = await UserProfile.findOneAndUpdate(
      { userId: message.author.id, guildId },
      { $inc: { xp: 1, totalMessages: 1 } },
      { upsert: true, new: true }
    );

    const xpNeeded = profile.level * 100;
    if (profile.xp >= xpNeeded) {
      profile.xp -= xpNeeded;
      profile.level += 1;
      await profile.save();
      const levelChannel = config?.levelingChannel
        ? message.guild.channels.cache.get(config.levelingChannel)
        : message.channel;
      if (levelChannel) {
        levelChannel.send({ content: `🎉 ${message.author} just reached **Level ${profile.level}**!` });
      }
    }

    // ── AFK check ──────────────────────────────────────────
    if (profile.afk) {
      profile.afk = false;
      profile.afkReason = undefined;
      profile.afkSince = undefined;
      await profile.save();
      message.reply({ content: `✅ Welcome back ${message.author}! Your AFK has been removed.` });
    }

    if (message.mentions.users.size > 0) {
      for (const [id, user] of message.mentions.users) {
        const mentionedProfile = await UserProfile.findOne({ userId: id, guildId });
        if (mentionedProfile?.afk) {
          message.reply({ content: `💤 **${user.username}** is AFK: ${mentionedProfile.afkReason || 'No reason set'}` });
        }
      }
    }

    // ── Counting channel ───────────────────────────────────
    const countingConfig = await CountingChannel.findOne({ guildId, channelId: message.channelId, enabled: true });
    if (countingConfig) {
      const num = parseInt(message.content, 10);
      if (isNaN(num) || num !== countingConfig.currentCount + 1 || message.author.id === countingConfig.lastUserId) {
        await message.delete().catch(() => {});
        const warnMsg = await message.channel.send({
          content: `❌ ${message.author} ruined it at **${countingConfig.currentCount}**! The count resets to 0.`,
        });
        countingConfig.currentCount = 0;
        countingConfig.lastBrokeBy = message.author.id;
        countingConfig.lastUserId = null;
        await countingConfig.save();
        setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
        return;
      }

      await message.react('✅');
      countingConfig.currentCount = num;
      if (num > countingConfig.record) countingConfig.record = num;
      countingConfig.lastUserId = message.author.id;
      await countingConfig.save();

      if (num % 100 === 0) {
        message.channel.send({ content: `🎉 The count has reached **${num}**! Well done everyone!` });
      }
      return;
    }

    // ── Bump detection (Disboard) ──────────────────────────
    if (message.author.id === '302050872383242240' && message.embeds[0]?.description?.includes('Bump done!')) {
      const bumpConfig = await BumpReminder.findOne({ guildId, enabled: true });
      if (bumpConfig) {
        bumpConfig.lastBumpAt = new Date();
        await bumpConfig.save();
      }
    }

    // ── Sticky messages ────────────────────────────────────
    const sticky = await StickyMessage.findOne({ guildId, channelId: message.channelId });
    if (sticky && sticky.lastMessageId) {
      try {
        const oldMsg = await message.channel.messages.fetch(sticky.lastMessageId);
        await oldMsg.delete().catch(() => {});
      } catch (_) {}
      const newSticky = await message.channel.send({ content: sticky.message });
      sticky.lastMessageId = newSticky.id;
      await sticky.save();
    }

    // ── AI channel auto-response ───────────────────────────
    if (config?.aiChannel && message.channelId === config.aiChannel) {
      const prefixMatch = prefixes.find(p => message.content.startsWith(p));
      if (prefixMatch) {
        const cmdName = message.content.slice(prefixMatch.length).trim().split(/ +/)[0]?.toLowerCase();
        const cmd = client.commands.get(cmdName);
        if (cmd?.prefixExecute) return;
      }
      await message.channel.sendTyping();
      const result = await geminiService.ask(message.content);
      if (!result.error) {
        const text = typeof result?.text === 'string' ? result.text : '';
        const truncated = text.length > 2000 ? text.substring(0, 1997) + '...' : text;
        if (truncated) await message.reply({ content: truncated, allowedMentions: { repliedUser: false } });
      }
      return;
    }

    // ── Prefix command check ───────────────────────────────
    const usedPrefix = prefixes.find(p => message.content.startsWith(p));
    if (!usedPrefix) return;

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check custom commands first
    const custom = await CustomCommand.findOne({ guildId, trigger: commandName });
    if (custom) {
      if (custom.isEmbed) {
        try {
          const data = JSON.parse(custom.response);
          return message.channel.send({ embeds: [new EmbedBuilder(data)] });
        } catch (_) {
          return message.channel.send(custom.response);
        }
      }
      return message.channel.send(custom.response);
    }

    const command = client.commands.get(commandName);
    if (!command || !command.prefixExecute) return;

    try {
      await command.prefixExecute(message, args, client);
    } catch (err) {
      console.error(`[CMD] Error in ${commandName}:`, err);
      message.reply({ content: 'An error occurred while running this command.' });
    }
  },
};
