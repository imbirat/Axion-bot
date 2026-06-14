const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const giveawayService = require('../../services/giveawayService');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Start a new giveaway')
        .addStringOption(opt =>
          opt.setName('prize').setDescription('The prize to give away').setRequired(true))
        .addStringOption(opt =>
          opt.setName('duration').setDescription('Duration (e.g. 1h, 2d, 30m)').setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('winners').setDescription('Number of winners').setRequired(true))
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Channel to post the giveaway').setRequired(true))
        .addRoleOption(opt =>
          opt.setName('role-requirement').setDescription('Required role to enter').setRequired(false))
        .addIntegerOption(opt =>
          opt.setName('invite-requirement').setDescription('Minimum invites required').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('end')
        .setDescription('End a giveaway early')
        .addStringOption(opt =>
          opt.setName('message-id').setDescription('Message ID of the giveaway').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('reroll')
        .setDescription('Reroll a giveaway')
        .addStringOption(opt =>
          opt.setName('message-id').setDescription('Message ID of the giveaway').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Giveaway',
  usage: '/giveaway start|end|reroll',
  description: 'Start, end, or reroll giveaways',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'start') {
        const prize = interaction.options.getString('prize');
        const durationStr = interaction.options.getString('duration');
        const winners = interaction.options.getInteger('winners');
        const channel = interaction.options.getChannel('channel');
        const roleRequirement = interaction.options.getRole('role-requirement')?.id || null;
        const inviteRequirement = interaction.options.getInteger('invite-requirement') || null;

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
          return interaction.reply({ content: 'Invalid duration. Use format like `1h`, `2d`, `30m`.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        await giveawayService.startGiveaway({
          guildId: interaction.guild.id,
          channelId: channel.id,
          prize,
          winners,
          duration: durationMs,
          hostedBy: interaction.user.id,
          roleRequirement,
          inviteRequirement,
          client
        });

        await interaction.editReply({ content: `✅ Giveaway started in ${channel}!` });
        return;
      }

      if (subcommand === 'end') {
        const messageId = interaction.options.getString('message-id');
        await interaction.deferReply({ ephemeral: true });
        const result = await giveawayService.endGiveaway(messageId);
        if (!result) return interaction.editReply({ content: 'Giveaway not found or already ended.' });
        await interaction.editReply({ content: '✅ Giveaway ended.' });
        return;
      }

      if (subcommand === 'reroll') {
        const messageId = interaction.options.getString('message-id');
        await interaction.deferReply({ ephemeral: true });
        const result = await giveawayService.rerollGiveaway(messageId);
        if (!result) return interaction.editReply({ content: 'Giveaway not found.' });
        await interaction.editReply({ content: '✅ Giveaway rerolled.' });
        return;
      }
    } catch (error) {
      console.error('giveaway error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
      }
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const subcommand = args[0];

      if (subcommand === 'start') {
        const prize = args.slice(1).join(' ');
        if (!prize) return message.reply('Usage: giveaway start <prize> [winners] [duration] [#channel]');
        return message.reply('Please use `/giveaway start` for full configuration.');
      }

      if (subcommand === 'end') {
        const messageId = args[1];
        if (!messageId) return message.reply('Usage: giveaway end <messageId>');
        const result = await giveawayService.endGiveaway(messageId);
        if (!result) return message.reply('Giveaway not found or already ended.');
        await message.reply('✅ Giveaway ended.');
        return;
      }

      if (subcommand === 'reroll') {
        const messageId = args[1];
        if (!messageId) return message.reply('Usage: giveaway reroll <messageId>');
        const result = await giveawayService.rerollGiveaway(messageId);
        if (!result) return message.reply('Giveaway not found.');
        await message.reply('✅ Giveaway rerolled.');
        return;
      }

      await message.reply('Usage: giveaway start|end|reroll');
    } catch (error) {
      console.error('giveaway prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}
