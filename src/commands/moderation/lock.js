const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to lock')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'Moderation',
  description: 'Lock a channel by denying send messages for @everyone',
  permissions: ['ManageChannels'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionFlagsBits.SendMessages]: false
      });

      await interaction.reply({ embeds: [successEmbed(`Channel locked.`)] });
    } catch (error) {
      console.error('lock command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first() || message.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionFlagsBits.SendMessages]: false
      });

      await message.channel.send({ embeds: [successEmbed('Channel locked.')] });
    } catch (error) {
      console.error('lock prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
