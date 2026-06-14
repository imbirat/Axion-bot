const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Send an anonymous confession')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your confession message')
        .setRequired(true)),
  category: 'Social',
  usage: '/confess <message>',
  description: 'Send an anonymous confession to a configured channel',
  permissions: 'Everyone',
  cooldown: 30,
  async execute(interaction, client) {
    try {
      const confession = interaction.options.getString('message');
      const config = await GuildConfig.findOne({ guildId: interaction.guildId });
      const channelId = config?.confessionChannel;
      if (!channelId) {
        return interaction.reply({ content: 'Confession channel has not been configured. Ask an admin to set one up.', ephemeral: true });
      }
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({ content: 'The configured confession channel no longer exists.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Anonymous Confession')
        .setDescription(confession)
        .setTimestamp();
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Your confession has been sent anonymously.', ephemeral: true });
    } catch (error) {
      console.error('confess command error:', error);
      await interaction.reply({ content: 'There was an error sending your confession.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Please provide a confession message.');
      const confession = args.join(' ');
      const config = await GuildConfig.findOne({ guildId: message.guildId });
      const channelId = config?.confessionChannel;
      if (!channelId) {
        return message.reply('Confession channel has not been configured. Ask an admin to set one up.');
      }
      const channel = message.guild.channels.cache.get(channelId);
      if (!channel) {
        return message.reply('The configured confession channel no longer exists.');
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Anonymous Confession')
        .setDescription(confession)
        .setTimestamp();
      await message.delete();
      await channel.send({ embeds: [embed] });
      await message.author.send('✅ Your confession has been sent anonymously.').catch(() => {});
    } catch (error) {
      console.error('confess prefix error:', error);
      await message.reply('There was an error sending your confession.');
    }
  },
};
