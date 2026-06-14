const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ticketService = require('../../services/ticketService');
const GuildConfig = require('../../models/GuildConfig');
const Ticket = require('../../models/Ticket');
const transcriptService = require('../../services/transcriptService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Post the ticket creation panel in a channel')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Channel for the ticket panel').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user to the current ticket')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to add').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('close')
        .setDescription('Close the current ticket')
        .addStringOption(opt =>
          opt.setName('reason').setDescription('Reason for closing').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('claim')
        .setDescription('Claim the current ticket'))
    .addSubcommand(sub =>
      sub.setName('unclaim')
        .setDescription('Unclaim the current ticket'))
    .addSubcommand(sub =>
      sub.setName('reopen')
        .setDescription('Reopen a closed ticket'))
    .addSubcommand(sub =>
      sub.setName('rename')
        .setDescription('Rename the current ticket channel')
        .addStringOption(opt =>
          opt.setName('name').setDescription('New channel name').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('blacklist')
        .setDescription('Blacklist a user from creating tickets')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to blacklist').setRequired(true))
        .addStringOption(opt =>
          opt.setName('reason').setDescription('Reason for blacklist').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('unblacklist')
        .setDescription('Remove a user from the ticket blacklist')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to unblacklist').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('Show ticket statistics for the server'))
    .addSubcommand(sub =>
      sub.setName('transcript')
        .setDescription('Generate and receive a transcript of this ticket')),
  category: 'Ticket',
  usage: '/ticket <setup|add|close|claim|unclaim|reopen|rename|blacklist|unblacklist|stats|transcript>',
  description: 'Full support ticket system',
  permissions: ['ManageChannels'],
  cooldown: 3,
  prefixAliases: ['ticketsetup', 'ticketadd', 'ticketclose', 'ticketclaim', 'ticketunclaim', 'ticketreopen', 'ticketrename', 'ticketblacklist', 'ticketunblacklist', 'ticketstats', 'tickettranscript'],
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      switch (sub) {
        case 'setup': {
          const channel = interaction.options.getChannel('channel');
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_create')
              .setLabel('Create Ticket')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('📩')
          );
          const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🎫 Support Ticket')
            .setDescription('Need help? Open a ticket and our support team will assist you.\n\nClick the button below to create a ticket.')
            .setFooter({ text: 'Axion — Ticketing without clutter', iconURL: client.user?.displayAvatarURL() });
          await channel.send({ embeds: [embed], components: [row] });
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { ticketChannel: channel.id } },
            { upsert: true }
          );
          await interaction.reply({ content: '✅ Ticket panel has been posted.', ephemeral: true });
          break;
        }
        case 'add': {
          const user = interaction.options.getUser('user');
          const result = await ticketService.addUserToTicket(interaction, user);
          if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
          await interaction.reply({ content: `✅ Added ${user}.`, ephemeral: true });
          break;
        }
        case 'close': {
          const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
          if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
          const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
          const isOwner = ticket.userId === interaction.user.id;
          const isSupport = guildConfig?.ticketSupportRole && interaction.member.roles.cache.has(guildConfig.ticketSupportRole);
          const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
          if (!isOwner && !isSupport && !isAdmin) {
            return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
          }
          const reason = interaction.options.getString('reason');
          const result = await ticketService.closeTicket(interaction, reason);
          if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
          await interaction.reply({ content: '✅ Ticket closed.', ephemeral: true });
          break;
        }
        case 'claim': {
          const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (guildConfig?.ticketSupportRole) {
            const hasRole = interaction.member.roles.cache.has(guildConfig.ticketSupportRole);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return interaction.reply({ content: 'You do not have permission to claim tickets.', ephemeral: true });
            }
          }
          const result = await ticketService.claimTicket(interaction);
          if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
          await interaction.reply({ content: '✅ Ticket claimed.', ephemeral: true });
          break;
        }
        case 'unclaim': {
          const guildConfig2 = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (guildConfig2?.ticketSupportRole) {
            const hasRole = interaction.member.roles.cache.has(guildConfig2.ticketSupportRole);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return interaction.reply({ content: 'You do not have permission to unclaim tickets.', ephemeral: true });
            }
          }
          const result2 = await ticketService.unclaimTicket(interaction);
          if (result2.error) return interaction.reply({ content: result2.error, ephemeral: true });
          await interaction.reply({ content: '✅ Ticket unclaimed.', ephemeral: true });
          break;
        }
        case 'reopen': {
          const guildConfig3 = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (guildConfig3?.ticketSupportRole) {
            const hasRole = interaction.member.roles.cache.has(guildConfig3.ticketSupportRole);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return interaction.reply({ content: 'You do not have permission to reopen tickets.', ephemeral: true });
            }
          }
          const result3 = await ticketService.reopenTicket(interaction);
          if (result3.error) return interaction.reply({ content: result3.error, ephemeral: true });
          await interaction.reply({ content: '✅ Ticket reopened.', ephemeral: true });
          break;
        }
        case 'rename': {
          const guildConfig4 = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (guildConfig4?.ticketSupportRole) {
            const hasRole = interaction.member.roles.cache.has(guildConfig4.ticketSupportRole);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return interaction.reply({ content: 'You do not have permission to rename tickets.', ephemeral: true });
            }
          }
          const newName = interaction.options.getString('name');
          const result4 = await ticketService.renameTicket(interaction, newName);
          if (result4.error) return interaction.reply({ content: result4.error, ephemeral: true });
          await interaction.reply({ content: `✅ Ticket renamed to ${newName}.`, ephemeral: true });
          break;
        }
        case 'blacklist': {
          const user = interaction.options.getUser('user');
          const guildConfig5 = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (!guildConfig5) return interaction.reply({ content: 'Server config not found.', ephemeral: true });
          if (!guildConfig5.ticketBlacklist) guildConfig5.ticketBlacklist = [];
          if (guildConfig5.ticketBlacklist.includes(user.id)) {
            return interaction.reply({ content: `${user} is already blacklisted.`, ephemeral: true });
          }
          guildConfig5.ticketBlacklist.push(user.id);
          await guildConfig5.save();
          await interaction.reply({ content: `✅ ${user} blacklisted.`, ephemeral: true });
          break;
        }
        case 'unblacklist': {
          const user2 = interaction.options.getUser('user');
          const guildConfig6 = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (!guildConfig6) return interaction.reply({ content: 'Server config not found.', ephemeral: true });
          if (!guildConfig6.ticketBlacklist) guildConfig6.ticketBlacklist = [];
          const index = guildConfig6.ticketBlacklist.indexOf(user2.id);
          if (index === -1) {
            return interaction.reply({ content: `${user2} is not blacklisted.`, ephemeral: true });
          }
          guildConfig6.ticketBlacklist.splice(index, 1);
          await guildConfig6.save();
          await interaction.reply({ content: `✅ ${user2} unblacklisted.`, ephemeral: true });
          break;
        }
        case 'stats': {
          const tickets = await Ticket.find({ guildId: interaction.guild.id });
          const total = tickets.length;
          const open = tickets.filter(t => t.status === 'open' || t.status === 'claimed').length;
          const closed = tickets.filter(t => t.status === 'closed').length;
          let avgResolution = 0;
          const closedTickets = tickets.filter(t => t.status === 'closed' && t.closedAt);
          if (closedTickets.length > 0) {
            const totalMs = closedTickets.reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0);
            avgResolution = Math.floor(totalMs / closedTickets.length / 1000);
          }
          const hours = Math.floor(avgResolution / 3600);
          const minutes = Math.floor((avgResolution % 3600) / 60);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Ticket Statistics')
            .addFields(
              { name: 'Total Tickets', value: String(total), inline: true },
              { name: 'Open', value: String(open), inline: true },
              { name: 'Closed', value: String(closed), inline: true },
              { name: 'Avg Resolution Time', value: avgResolution > 0 ? `${hours}h ${minutes}m` : 'N/A', inline: false }
            )
            .setTimestamp();
          await interaction.reply({ embeds: [embed] });
          break;
        }
        case 'transcript': {
          const guildConfig7 = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (guildConfig7?.ticketSupportRole) {
            const hasRole = interaction.member.roles.cache.has(guildConfig7.ticketSupportRole);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return interaction.reply({ content: 'You do not have permission to view transcripts.', ephemeral: true });
            }
          }
          await interaction.deferReply({ ephemeral: true });
          const html = await transcriptService.generateTranscript(interaction.channel);
          const buffer = Buffer.from(html, 'utf-8');
          try {
            await interaction.user.send({
              files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.html` }]
            });
            await interaction.editReply({ content: '✅ Transcript has been sent to your DMs.' });
          } catch (e) {
            await interaction.editReply({ content: '❌ Could not DM you. Please enable DMs.' });
          }
          break;
        }
      }
    } catch (error) {
      console.error(`ticket ${sub} error:`, error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    const rest = args.slice(1);
    try {
      switch (sub) {
        case 'setup': {
          const channel = message.mentions.channels.first();
          if (!channel) return message.reply('Usage: ticket setup <#channel>');
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_create')
              .setLabel('Create Ticket')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('📩')
          );
          const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🎫 Support Ticket')
            .setDescription('Need help? Open a ticket and our support team will assist you.\n\nClick the button below to create a ticket.')
            .setFooter({ text: 'Axion — Ticketing without clutter', iconURL: client.user?.displayAvatarURL() });
          await channel.send({ embeds: [embed], components: [row] });
          await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { $set: { ticketChannel: channel.id } },
            { upsert: true }
          );
          await message.reply('✅ Ticket panel has been posted.');
          break;
        }
        case 'add': {
          const user = message.mentions.users.first();
          if (!user) return message.reply('Usage: ticket add <@user>');
          const result = await ticketService.addUserToTicket(message, user);
          if (result.error) return message.reply(result.error);
          await message.reply(`✅ Added ${user}.`);
          break;
        }
        case 'close': {
          const ticket = await Ticket.findOne({ channelId: message.channel.id });
          if (!ticket) return message.reply('This is not a ticket channel.');
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          const isOwner = ticket.userId === message.author.id;
          const isSupport = guildConfig?.ticketSupportRole && message.member.roles.cache.has(guildConfig.ticketSupportRole);
          const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
          if (!isOwner && !isSupport && !isAdmin) {
            return message.reply('You do not have permission to close this ticket.');
          }
          const reason = rest.join(' ') || null;
          const pseudo = { channel: message.channel, guild: message.guild, user: message.author };
          const result = await ticketService.closeTicket(pseudo, reason);
          if (result.error) return message.reply(result.error);
          await message.reply('✅ Ticket closed.');
          break;
        }
        case 'claim': {
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (guildConfig?.ticketSupportRole) {
            const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return message.reply('You do not have permission to claim tickets.');
            }
          }
          const pseudo = { channel: message.channel, guild: message.guild, user: message.author };
          const result = await ticketService.claimTicket(pseudo);
          if (result.error) return message.reply(result.error);
          await message.reply('✅ Ticket claimed.');
          break;
        }
        case 'unclaim': {
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (guildConfig?.ticketSupportRole) {
            const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return message.reply('You do not have permission to unclaim tickets.');
            }
          }
          const pseudo = { channel: message.channel, guild: message.guild, user: message.author, member: message.member };
          const result = await ticketService.unclaimTicket(pseudo);
          if (result.error) return message.reply(result.error);
          await message.reply('✅ Ticket unclaimed.');
          break;
        }
        case 'reopen': {
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (guildConfig?.ticketSupportRole) {
            const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return message.reply('You do not have permission to reopen tickets.');
            }
          }
          const pseudo = { channel: message.channel, guild: message.guild, user: message.author };
          const result = await ticketService.reopenTicket(pseudo);
          if (result.error) return message.reply(result.error);
          await message.reply('✅ Ticket reopened.');
          break;
        }
        case 'rename': {
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (guildConfig?.ticketSupportRole) {
            const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return message.reply('You do not have permission to rename tickets.');
            }
          }
          const newName = rest.join('-');
          if (!newName) return message.reply('Usage: ticket rename <new-name>');
          const result = await ticketService.renameTicket(message, newName);
          if (result.error) return message.reply(result.error);
          await message.reply(`✅ Ticket renamed to ${newName}.`);
          break;
        }
        case 'blacklist': {
          const user = message.mentions.users.first();
          if (!user) return message.reply('Usage: ticket blacklist <@user> [reason]');
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (!guildConfig) return message.reply('Server config not found.');
          if (!guildConfig.ticketBlacklist) guildConfig.ticketBlacklist = [];
          if (guildConfig.ticketBlacklist.includes(user.id)) {
            return message.reply(`${user} is already blacklisted.`);
          }
          guildConfig.ticketBlacklist.push(user.id);
          await guildConfig.save();
          await message.reply(`✅ ${user} blacklisted.`);
          break;
        }
        case 'unblacklist': {
          const user = message.mentions.users.first();
          if (!user) return message.reply('Usage: ticket unblacklist <@user>');
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (!guildConfig) return message.reply('Server config not found.');
          if (!guildConfig.ticketBlacklist) guildConfig.ticketBlacklist = [];
          const index = guildConfig.ticketBlacklist.indexOf(user.id);
          if (index === -1) {
            return message.reply(`${user} is not blacklisted.`);
          }
          guildConfig.ticketBlacklist.splice(index, 1);
          await guildConfig.save();
          await message.reply(`✅ ${user} unblacklisted.`);
          break;
        }
        case 'stats': {
          const tickets = await Ticket.find({ guildId: message.guild.id });
          const total = tickets.length;
          const open = tickets.filter(t => t.status === 'open' || t.status === 'claimed').length;
          const closed = tickets.filter(t => t.status === 'closed').length;
          let avgResolution = 0;
          const closedTickets = tickets.filter(t => t.status === 'closed' && t.closedAt);
          if (closedTickets.length > 0) {
            const totalMs = closedTickets.reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0);
            avgResolution = Math.floor(totalMs / closedTickets.length / 1000);
          }
          const hours = Math.floor(avgResolution / 3600);
          const minutes = Math.floor((avgResolution % 3600) / 60);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Ticket Statistics')
            .addFields(
              { name: 'Total Tickets', value: String(total), inline: true },
              { name: 'Open', value: String(open), inline: true },
              { name: 'Closed', value: String(closed), inline: true },
              { name: 'Avg Resolution Time', value: avgResolution > 0 ? `${hours}h ${minutes}m` : 'N/A', inline: false }
            )
            .setTimestamp();
          await message.channel.send({ embeds: [embed] });
          break;
        }
        case 'transcript': {
          const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
          if (guildConfig?.ticketSupportRole) {
            const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!hasRole && !isAdmin) {
              return message.reply('You do not have permission to view transcripts.');
            }
          }
          const html = await transcriptService.generateTranscript(message.channel);
          const buffer = Buffer.from(html, 'utf-8');
          try {
            await message.author.send({
              files: [{ attachment: buffer, name: `transcript-${message.channel.name}.html` }]
            });
            await message.reply('✅ Transcript has been sent to your DMs.');
          } catch (e) {
            await message.reply('❌ Could not DM you. Please enable DMs.');
          }
          break;
        }
        default:
          await message.reply('Usage: ticket <setup|add|close|claim|unclaim|reopen|rename|blacklist|unblacklist|stats|transcript>');
      }
    } catch (error) {
      console.error(`ticket prefix ${sub} error:`, error);
      await message.reply('There was an error executing this command.');
    }
  },
};
