const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Add a user to the current ticket')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to add').setRequired(true)),
  category: 'Ticket',
  description: 'Add a user to the current ticket',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = interaction.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return interaction.reply({ content: 'You do not have permission to add users.', flags: MessageFlags.Ephemeral });
      }
    }
    const user = interaction.options.getUser('user');
    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    await interaction.reply({ content: `✅ ${user} has been added to this ticket.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = message.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return message.reply('You do not have permission to add users.');
      }
    }
    const user = message.mentions.users.first();
    if (!user) return message.reply('Usage: ticket-add <@user>');
    await message.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    await message.reply(`✅ ${user} has been added to this ticket.`);
  },
};
