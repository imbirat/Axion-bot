const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketService = require('../../services/ticketService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketadd')
    .setDescription('Add a user to the current ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to add')
        .setRequired(true)),
  category: 'Ticket',
  usage: '/ticketadd <user>',
  description: 'Grant a user access to the current ticket channel',
  permissions: ['ManageChannels'],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user');
      const result = await ticketService.addUserToTicket(interaction, user);
      if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
      await interaction.reply({ content: `✅ Added ${user}.`, ephemeral: true });
    } catch (error) {
      console.error('ticketadd error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const user = message.mentions.users.first();
      if (!user) return message.reply('Usage: ticketadd <@user>');
      const result = await ticketService.addUserToTicket(message, user);
      if (result.error) return message.reply(result.error);
      await message.reply(`✅ Added ${user}.`);
    } catch (error) {
      console.error('ticketadd prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
