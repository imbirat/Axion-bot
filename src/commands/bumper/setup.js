const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const BumpReminder = require('../../models/BumpReminder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bumper')
    .setDescription('Manage bump reminders')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Configure bump reminder channel and optional ping role')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel to post bump reminders')
            .setRequired(true))
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription('Role to ping when bump is ready')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable bump reminders'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Bumper',
  usage: '/bumper setup <#channel> [role] | /bumper disable',
  description: 'Set up or disable bump reminders (every 2 hours)',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'setup') {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');

        const update = { channelId: channel.id, enabled: true };
        if (role) update.pingRoleId = role.id;

        await BumpReminder.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: update },
          { upsert: true }
        );

        await interaction.reply({ content: `✅ Bump reminder configured! I'll remind you every 2 hours.`, ephemeral: true });
        return;
      }

      if (sub === 'disable') {
        await BumpReminder.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { enabled: false } }
        );

        await interaction.reply({ content: '✅ Bump reminders disabled.', ephemeral: true });
      }
    } catch (error) {
      console.error('bumper error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];

      if (sub === 'setup') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('Usage: bumper setup <#channel> [@role]');

        const role = message.mentions.roles.first();
        const update = { channelId: channel.id, enabled: true };
        if (role) update.pingRoleId = role.id;

        await BumpReminder.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: update },
          { upsert: true }
        );

        await message.reply(`✅ Bump reminder configured! I'll remind you every 2 hours.`);
        return;
      }

      if (sub === 'disable') {
        await BumpReminder.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { enabled: false } }
        );

        await message.reply('✅ Bump reminders disabled.');
        return;
      }

      await message.reply('Usage: bumper setup <#channel> [@role] | bumper disable');
    } catch (error) {
      console.error('bumper prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
