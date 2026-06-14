const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketService = require('../../services/ticketService');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketrename')
    .setDescription('Rename the current ticket channel')
    .addStringOption(option =>
      option.setName('new-name')
        .setDescription('New channel name')
        .setRequired(true)),
  category: 'Ticket',
  usage: '/ticketrename <new-name>',
  description: 'Change the name of the current ticket channel',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (guildConfig?.ticketSupportRole) {
        const hasRole = interaction.member.roles.cache.has(guildConfig.ticketSupportRole);
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!hasRole && !isAdmin) {
          return interaction.reply({ content: 'You do not have permission to rename tickets.', ephemeral: true });
        }
      }

      const newName = interaction.options.getString('new-name');
      const result = await ticketService.renameTicket(interaction, newName);
      if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
      await interaction.reply({ content: `✅ Ticket renamed to ${newName}.`, ephemeral: true });
    } catch (error) {
      console.error('ticketrename error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (guildConfig?.ticketSupportRole) {
        const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!hasRole && !isAdmin) {
          return message.reply('You do not have permission to rename tickets.');
        }
      }

      const newName = args.join('-');
      if (!newName) return message.reply('Usage: ticketrename <new-name>');
      const result = await ticketService.renameTicket(message, newName);
      if (result.error) return message.reply(result.error);
      await message.reply(`✅ Ticket renamed to ${newName}.`);
    } catch (error) {
      console.error('ticketrename prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
