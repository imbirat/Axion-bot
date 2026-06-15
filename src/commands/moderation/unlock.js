const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to unlock')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'Moderation',
  description: 'Unlock a channel by allowing send messages for @everyone',
  permissions: ['ManageChannels'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionFlagsBits.SendMessages]: null
      });

      await interaction.reply({ embeds: [successEmbed('Channel unlocked.')] });
    } catch (error) {
      console.error('unlock command error:', error);
      await interaction.reply({ embeds: [errorEmbed('There was an error executing this command.')], flags: MessageFlags.Ephemeral });
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first() || message.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionFlagsBits.SendMessages]: null
      });

      await message.channel.send({ embeds: [successEmbed('Channel unlocked.')] });
    } catch (error) {
      console.error('unlock prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
