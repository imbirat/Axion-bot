const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setaichannel')
    .setDescription('Set the AI channel (messages here auto-respond without /ask)')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel for AI auto-responses')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Config',
  usage: '/setaichannel <#channel>',
  description: 'Set a channel where every message is auto-answered by Gemini AI',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { aiChannel: channel.id } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ AI channel set to ${channel}. Messages there will be auto-answered by Gemini.`, ephemeral: true });
    } catch (error) {
      console.error('setaichannel error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('Usage: setaichannel <#channel>');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { aiChannel: channel.id } },
        { upsert: true }
      );
      await message.reply(`✅ AI channel set to ${channel}. Messages there will be auto-answered by Gemini.`);
    } catch (error) {
      console.error('setaichannel prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
