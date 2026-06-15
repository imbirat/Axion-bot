const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-rename')
    .setDescription('Rename the current ticket channel')
    .addStringOption(opt =>
      opt.setName('name').setDescription('New channel name').setRequired(true)),
  category: 'Ticket',
  description: 'Rename the current ticket channel',
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
        return interaction.reply({ content: 'You do not have permission to rename tickets.', flags: MessageFlags.Ephemeral });
      }
    }
    const newName = interaction.options.getString('name').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    await interaction.channel.setName(newName);
    await interaction.reply({ content: `✅ Ticket renamed to **${newName}**.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const ticket = await Ticket.findOne({ channelId: message.channel.id });
    if (!ticket) return message.reply('This is not a ticket channel.');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (config?.ticketSupportRole) {
      const hasRole = message.member.roles.cache.has(config.ticketSupportRole);
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole && !isAdmin) {
        return message.reply('You do not have permission to rename tickets.');
      }
    }
    const newName = args.join('-').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    if (!newName) return message.reply('Usage: ticket-rename <new-name>');
    await message.channel.setName(newName);
    await message.reply(`✅ Ticket renamed to **${newName}**.`);
  },
};
