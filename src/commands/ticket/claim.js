const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketService = require('../../services/ticketService');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketclaim')
    .setDescription('Claim the current ticket'),
  category: 'Ticket',
  usage: '/ticketclaim',
  description: 'Claim a support ticket to handle it',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
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
    } catch (error) {
      console.error('ticketclaim error:', error);
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
          return message.reply('You do not have permission to claim tickets.');
        }
      }

      const pseudo = { channel: message.channel, guild: message.guild, user: message.author };
      const result = await ticketService.claimTicket(pseudo);
      if (result.error) return message.reply(result.error);
      await message.reply('✅ Ticket claimed.');
    } catch (error) {
      console.error('ticketclaim prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
