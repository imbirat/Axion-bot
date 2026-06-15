const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-unblacklist')
    .setDescription('Remove a user from the ticket blacklist')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to unblacklist').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  description: 'Remove a user from the ticket blacklist',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) return interaction.reply({ content: 'Server config not found.', flags: MessageFlags.Ephemeral });
    if (!config.ticketBlacklist) config.ticketBlacklist = [];
    const index = config.ticketBlacklist.indexOf(user.id);
    if (index === -1) {
      return interaction.reply({ content: `${user} is not blacklisted.`, flags: MessageFlags.Ephemeral });
    }
    config.ticketBlacklist.splice(index, 1);
    await config.save();
    await interaction.reply({ content: `✅ ${user} has been unblacklisted.`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const user = message.mentions.users.first();
    if (!user) return message.reply('Usage: ticket-unblacklist <@user>');
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!config) return message.reply('Server config not found.');
    if (!config.ticketBlacklist) config.ticketBlacklist = [];
    const index = config.ticketBlacklist.indexOf(user.id);
    if (index === -1) {
      return message.reply(`${user} is not blacklisted.`);
    }
    config.ticketBlacklist.splice(index, 1);
    await config.save();
    await message.reply(`✅ ${user} has been unblacklisted.`);
  },
};
