const { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reportsetup')
    .setDescription('Set the channel where reports will be posted')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to receive reports')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Reports',
  usage: '/reportsetup <#channel>',
  description: 'Set the channel where submitted reports appear',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');

      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { reportChannel: channel.id } },
        { upsert: true }
      );

      await interaction.reply({ content: `✅ Report channel set to ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('reportsetup error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('Usage: reportsetup <#channel>');

      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { reportChannel: channel.id } },
        { upsert: true }
      );

      await message.reply(`✅ Report channel set to ${channel}.`);
    } catch (error) {
      console.error('reportsetup prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
