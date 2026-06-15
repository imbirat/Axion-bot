const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-blacklist')
    .setDescription('Blacklist a user from creating tickets')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to blacklist').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for blacklist').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Ticket',
  description: 'Blacklist a user from creating tickets',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) return interaction.reply({ content: 'Server config not found.', flags: MessageFlags.Ephemeral });
    if (!config.ticketBlacklist) config.ticketBlacklist = [];
    if (config.ticketBlacklist.includes(user.id)) {
      return interaction.reply({ content: `${user} is already blacklisted.`, flags: MessageFlags.Ephemeral });
    }
    config.ticketBlacklist.push(user.id);
    await config.save();
    await interaction.reply({ content: `✅ ${user} has been blacklisted. Reason: ${reason}`, flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const user = message.mentions.users.first();
    if (!user) return message.reply('Usage: ticket-blacklist <@user> [reason]');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!config) return message.reply('Server config not found.');
    if (!config.ticketBlacklist) config.ticketBlacklist = [];
    if (config.ticketBlacklist.includes(user.id)) {
      return message.reply(`${user} is already blacklisted.`);
    }
    config.ticketBlacklist.push(user.id);
    await config.save();
    await message.reply(`✅ ${user} has been blacklisted. Reason: ${reason}`);
  },
};
