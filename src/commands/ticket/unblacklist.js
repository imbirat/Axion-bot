const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketunblacklist')
    .setDescription('Remove a user from the ticket blacklist')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unblacklist')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  usage: '/ticketunblacklist <user>',
  description: 'Allow a previously blacklisted user to create tickets again',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user');
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) return interaction.reply({ content: 'Server config not found.', ephemeral: true });

      if (!guildConfig.ticketBlacklist) guildConfig.ticketBlacklist = [];
      const index = guildConfig.ticketBlacklist.indexOf(user.id);
      if (index === -1) {
        return interaction.reply({ content: `${user} is not blacklisted.`, ephemeral: true });
      }

      guildConfig.ticketBlacklist.splice(index, 1);
      await guildConfig.save();

      await interaction.reply({ content: `✅ ${user} unblacklisted.`, ephemeral: true });
    } catch (error) {
      console.error('ticketunblacklist error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const user = message.mentions.users.first();
      if (!user) return message.reply('Usage: ticketunblacklist <@user>');

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
    } catch (error) {
      console.error('ticketunblacklist prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
