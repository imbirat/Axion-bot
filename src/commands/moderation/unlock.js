const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to unlock')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  category: 'Moderation',
  usage: '/unlock [channel]',
  description: 'Unlock a channel by allowing send messages for @everyone',
  permissions: ['ManageChannels'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionsBitField.Flags.SendMessages]: null
      });

      const reply = await t(interaction.guild.id, 'moderation.unlock.success', {
        defaultValue: '🔓 Channel unlocked.'
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('unlock command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first() || message.channel;

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        [PermissionsBitField.Flags.SendMessages]: null
      });

      await message.channel.send('🔓 Channel unlocked.');
    } catch (error) {
      console.error('unlock prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
