const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Send an anonymous confession')
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Your confession')
        .setRequired(true)),
  category: 'Social',
  usage: '/confess <message>',
  description: 'Submit an anonymous confession to the server',
  permissions: [],
  cooldown: 30,
  async execute(interaction, client) {
    try {
      const text = interaction.options.getString('message');
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      const channelId = config?.confessChannel;
      const targetChannel = channelId ? interaction.guild.channels.cache.get(channelId) : null;
      if (!targetChannel) {
        return interaction.reply({ content: '❌ No confession channel has been configured.', flags: MessageFlags.Ephemeral });
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('💌 Anonymous Confession')
        .setDescription(text)
        .setTimestamp();
      await targetChannel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Your confession has been sent anonymously.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('confess command error:', error);
      await interaction.reply({ content: 'There was an error sending your confession.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Usage: confess <message>');
      const text = args.join(' ');
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      const channelId = config?.confessChannel;
      const targetChannel = channelId ? message.guild.channels.cache.get(channelId) : null;
      if (!targetChannel) return message.reply('❌ No confession channel has been configured.');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('💌 Anonymous Confession')
        .setDescription(text)
        .setTimestamp();
      await targetChannel.send({ embeds: [embed] });
      await message.reply('✅ Your confession has been sent anonymously.');
    } catch (error) {
      console.error('confess prefix error:', error);
      await message.reply('There was an error sending your confession.');
    }
  },
};
