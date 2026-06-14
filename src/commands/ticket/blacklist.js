const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketblacklist')
    .setDescription('Blacklist a user from creating tickets')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to blacklist')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for blacklist')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  usage: '/ticketblacklist <user> [reason]',
  description: 'Prevent a user from creating support tickets',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user');
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) return interaction.reply({ content: 'Server config not found.', ephemeral: true });

      if (!guildConfig.ticketBlacklist) guildConfig.ticketBlacklist = [];
      if (guildConfig.ticketBlacklist.includes(user.id)) {
        return interaction.reply({ content: `${user} is already blacklisted.`, ephemeral: true });
      }

      guildConfig.ticketBlacklist.push(user.id);
      await guildConfig.save();

      await interaction.reply({ content: `✅ ${user} blacklisted.`, ephemeral: true });
    } catch (error) {
      console.error('ticketblacklist error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const user = message.mentions.users.first();
      if (!user) return message.reply('Usage: ticketblacklist <@user> [reason]');

      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig) return message.reply('Server config not found.');

      if (!guildConfig.ticketBlacklist) guildConfig.ticketBlacklist = [];
      if (guildConfig.ticketBlacklist.includes(user.id)) {
        return message.reply(`${user} is already blacklisted.`);
      }

      guildConfig.ticketBlacklist.push(user.id);
      await guildConfig.save();

      await message.reply(`✅ ${user} blacklisted.`);
    } catch (error) {
      console.error('ticketblacklist prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
