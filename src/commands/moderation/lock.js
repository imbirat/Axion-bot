const { SlashCommandBuilder, ChannelType, PermissionsBitField , MessageFlags} = require('discord.js');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to lock')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  category: 'Moderation',
  usage: '/lock [channel]',
  description: 'Lock a channel by denying send messages for @everyone',
  permissions: ['ManageChannels'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionsBitField.Flags.SendMessages]: false
      });

      const reply = await t(interaction.guild.id, 'moderation.lock.success', {
        defaultValue: '🔒 Channel locked.'
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('lock command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first() || message.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionsBitField.Flags.SendMessages]: false
      });

      await message.channel.send('🔒 Channel locked.');
    } catch (error) {
      console.error('lock prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
