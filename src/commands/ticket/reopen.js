const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketService = require('../../services/ticketService');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketreopen')
    .setDescription('Reopen a closed ticket'),
  category: 'Ticket',
  usage: '/ticketreopen',
  description: 'Reopen a previously closed support ticket',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (guildConfig?.ticketSupportRole) {
        const hasRole = interaction.member.roles.cache.has(guildConfig.ticketSupportRole);
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!hasRole && !isAdmin) {
          return interaction.reply({ content: 'You do not have permission to reopen tickets.', ephemeral: true });
        }
      }

      const result = await ticketService.reopenTicket(interaction);
      if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
      await interaction.reply({ content: '✅ Ticket reopened.', ephemeral: true });
    } catch (error) {
      console.error('ticketreopen error:', error);
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
          return message.reply('You do not have permission to reopen tickets.');
        }
      }

      const pseudo = { channel: message.channel, guild: message.guild, user: message.author };
      const result = await ticketService.reopenTicket(pseudo);
      if (result.error) return message.reply(result.error);
      await message.reply('✅ Ticket reopened.');
    } catch (error) {
      console.error('ticketreopen prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
