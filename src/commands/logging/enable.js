const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging-enable')
    .setDescription('Enable logging for the server'),
  category: 'Logging',
  usage: '/logging-enable',
  description: 'Enable logging after setting a logging channel with /setchannel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config || !config.loggingChannel) {
        return interaction.reply({ content: 'Please set a logging channel first using `/setchannel logging <#channel>`.', ephemeral: true });
      }
      const logChannel = interaction.guild.channels.cache.get(config.loggingChannel);
      if (!logChannel) {
        return interaction.reply({ content: 'The configured logging channel no longer exists. Please set a new one with `/setchannel logging <#channel>`.', ephemeral: true });
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { loggingEnabled: true } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ Logging enabled in ${logChannel}.` });
    } catch (error) {
      console.error('logging enable command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!config || !config.loggingChannel) {
        return message.reply('Please set a logging channel first using `setchannel logging <#channel>`.');
      }
      const logChannel = message.guild.channels.cache.get(config.loggingChannel);
      if (!logChannel) {
        return message.reply('The configured logging channel no longer exists. Please set a new one.');
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { loggingEnabled: true } },
        { upsert: true }
      );
      await message.channel.send(`✅ Logging enabled in ${logChannel}.`);
    } catch (error) {
      console.error('logging enable prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
