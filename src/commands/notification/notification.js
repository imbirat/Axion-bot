const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Notification = require('../../models/Notification');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notification')
    .setDescription('Manage YouTube/Twitch notifications')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup(group =>
      group.setName('youtube')
        .setDescription('YouTube notification settings')
        .addSubcommand(sub =>
          sub.setName('add')
            .setDescription('Add a YouTube channel to watch')
            .addStringOption(opt =>
              opt.setName('channel-id')
                .setDescription('YouTube channel ID (not handle/name)')
                .setRequired(true))
            .addChannelOption(opt =>
              opt.setName('channel')
                .setDescription('Discord channel to post notifications')
                .setRequired(true))
            .addStringOption(opt =>
              opt.setName('message')
                .setDescription('Custom announcement message (supports {channel} {title} {url})')
                .setRequired(false)))
        .addSubcommand(sub =>
          sub.setName('remove')
            .setDescription('Remove a YouTube notification')
            .addStringOption(opt =>
              opt.setName('channel-id')
                .setDescription('YouTube channel ID to stop watching')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('list')
            .setDescription('List all YouTube notifications')))
    .addSubcommandGroup(group =>
      group.setName('twitch')
        .setDescription('Twitch notification settings')
        .addSubcommand(sub =>
          sub.setName('add')
            .setDescription('Add a Twitch channel to watch')
            .addStringOption(opt =>
              opt.setName('channel-name')
                .setDescription('Twitch channel name (lowercase)')
                .setRequired(true))
            .addChannelOption(opt =>
              opt.setName('channel')
                .setDescription('Discord channel to post notifications')
                .setRequired(true))
            .addStringOption(opt =>
              opt.setName('message')
                .setDescription('Custom announcement message (supports {channel} {title} {url})')
                .setRequired(false)))
        .addSubcommand(sub =>
          sub.setName('remove')
            .setDescription('Remove a Twitch notification')
            .addStringOption(opt =>
              opt.setName('channel-name')
                .setDescription('Twitch channel name to stop watching')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('list')
            .setDescription('List all Twitch notifications'))),
  category: 'Config',
  usage: '/notification youtube add <channel-id> <#channel> [message]',
  description: 'Watch YouTube/Twitch channels and get notified on new content',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      if (group === 'youtube') {
        if (sub === 'add') {
          const targetId = interaction.options.getString('channel-id');
          const channel = interaction.options.getChannel('channel');
          const message = interaction.options.getString('message') || '📹 **{channel}** uploaded: **{title}**\n{url}';

          const existing = await Notification.findOne({ guildId, type: 'youtube', targetId });
          if (existing) {
            existing.channelId = channel.id;
            existing.message = message;
            existing.enabled = true;
            await existing.save();
          } else {
            await Notification.create({ guildId, channelId: channel.id, type: 'youtube', targetId, message });
          }

          await interaction.reply({ content: `✅ Now tracking YouTube channel \`${targetId}\`. Notifications will go to ${channel}.`, ephemeral: true });
        } else if (sub === 'remove') {
          const targetId = interaction.options.getString('channel-id');
          const result = await Notification.deleteOne({ guildId, type: 'youtube', targetId });
          if (result.deletedCount === 0) {
            return interaction.reply({ content: `❌ No YouTube notification found for \`${targetId}\`.`, ephemeral: true });
          }
          await interaction.reply({ content: `✅ Removed YouTube notification for \`${targetId}\`.`, ephemeral: true });
        } else if (sub === 'list') {
          const notifications = await Notification.find({ guildId, type: 'youtube' });
          if (notifications.length === 0) {
            return interaction.reply({ content: 'No YouTube notifications configured.', ephemeral: true });
          }
          const list = notifications.map(n => `• \`${n.targetId}\` → <#${n.channelId}> ${n.enabled ? '✅' : '❌'}`).join('\n');
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('📹 YouTube Notifications')
            .setDescription(list);
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } else if (group === 'twitch') {
        if (sub === 'add') {
          const targetId = interaction.options.getString('channel-name').toLowerCase();
          const channel = interaction.options.getChannel('channel');
          const message = interaction.options.getString('message') || '🔴 **{channel}** is live: **{title}**\n{url}';

          const existing = await Notification.findOne({ guildId, type: 'twitch', targetId });
          if (existing) {
            existing.channelId = channel.id;
            existing.message = message;
            existing.enabled = true;
            await existing.save();
          } else {
            await Notification.create({ guildId, channelId: channel.id, type: 'twitch', targetId, message });
          }

          await interaction.reply({ content: `✅ Now tracking Twitch channel \`${targetId}\`. Notifications will go to ${channel}.`, ephemeral: true });
        } else if (sub === 'remove') {
          const targetId = interaction.options.getString('channel-name').toLowerCase();
          const result = await Notification.deleteOne({ guildId, type: 'twitch', targetId });
          if (result.deletedCount === 0) {
            return interaction.reply({ content: `❌ No Twitch notification found for \`${targetId}\`.`, ephemeral: true });
          }
          await interaction.reply({ content: `✅ Removed Twitch notification for \`${targetId}\`.`, ephemeral: true });
        } else if (sub === 'list') {
          const notifications = await Notification.find({ guildId, type: 'twitch' });
          if (notifications.length === 0) {
            return interaction.reply({ content: 'No Twitch notifications configured.', ephemeral: true });
          }
          const list = notifications.map(n => `• \`${n.targetId}\` → <#${n.channelId}> ${n.enabled ? '✅' : '❌'}`).join('\n');
          const embed = new EmbedBuilder()
            .setColor(0x9146FF)
            .setTitle('🔴 Twitch Notifications')
            .setDescription(list);
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (error) {
      console.error('notification command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const subCmd = args[0]?.toLowerCase();

      if (subCmd === 'youtube' && args[1] === 'add') {
        const targetId = args[2];
        const channel = message.mentions.channels.first();
        if (!targetId || !channel) {
          return message.reply('Usage: notification youtube add <channel-id> <#channel> [message]');
        }
        const msg = args.slice(4).join(' ') || '📹 **{channel}** uploaded: **{title}**\n{url}';
        await Notification.create({ guildId: message.guild.id, channelId: channel.id, type: 'youtube', targetId, message: msg });
        await message.reply(`✅ Now tracking YouTube channel \`${targetId}\`.`);
      } else if (subCmd === 'youtube' && args[1] === 'remove') {
        const targetId = args[2];
        if (!targetId) return message.reply('Usage: notification youtube remove <channel-id>');
        const result = await Notification.deleteOne({ guildId: message.guild.id, type: 'youtube', targetId });
        await message.reply(result.deletedCount ? `✅ Removed YouTube notification.` : `❌ No YouTube notification found for \`${targetId}\`.`);
      } else if (subCmd === 'youtube' && args[1] === 'list') {
        const notifications = await Notification.find({ guildId: message.guild.id, type: 'youtube' });
        if (notifications.length === 0) return message.reply('No YouTube notifications.');
        const list = notifications.map(n => `• \`${n.targetId}\` → <#${n.channelId}>`).join('\n');
        const embed = new EmbedBuilder().setColor(0xFF0000).setTitle('📹 YouTube Notifications').setDescription(list);
        await message.channel.send({ embeds: [embed] });
      } else if (subCmd === 'twitch' && args[1] === 'add') {
        const targetId = args[2]?.toLowerCase();
        const channel = message.mentions.channels.first();
        if (!targetId || !channel) {
          return message.reply('Usage: notification twitch add <channel-name> <#channel> [message]');
        }
        const msg = args.slice(4).join(' ') || '🔴 **{channel}** is live: **{title}**\n{url}';
        await Notification.create({ guildId: message.guild.id, channelId: channel.id, type: 'twitch', targetId, message: msg });
        await message.reply(`✅ Now tracking Twitch channel \`${targetId}\`.`);
      } else if (subCmd === 'twitch' && args[1] === 'remove') {
        const targetId = args[2]?.toLowerCase();
        if (!targetId) return message.reply('Usage: notification twitch remove <channel-name>');
        const result = await Notification.deleteOne({ guildId: message.guild.id, type: 'twitch', targetId });
        await message.reply(result.deletedCount ? `✅ Removed Twitch notification.` : `❌ No Twitch notification found.`);
      } else if (subCmd === 'twitch' && args[1] === 'list') {
        const notifications = await Notification.find({ guildId: message.guild.id, type: 'twitch' });
        if (notifications.length === 0) return message.reply('No Twitch notifications.');
        const list = notifications.map(n => `• \`${n.targetId}\` → <#${n.channelId}>`).join('\n');
        const embed = new EmbedBuilder().setColor(0x9146FF).setTitle('🔴 Twitch Notifications').setDescription(list);
        await message.channel.send({ embeds: [embed] });
      } else {
        await message.reply('Usage:\n`notification youtube add <channel-id> <#channel> [message]`\n`notification youtube remove <channel-id>`\n`notification youtube list`\n`notification twitch add <channel-name> <#channel> [message]`\n`notification twitch remove <channel-name>`\n`notification twitch list`');
      }
    } catch (error) {
      console.error('notification prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
