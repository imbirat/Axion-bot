const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Set the server prefix')
    .addStringOption(option =>
      option.setName('prefix')
        .setDescription('The new prefix (single character: ., /, ?, !, ,)')
        .setRequired(true)
    ),
  category: 'Config',
  usage: '/setprefix <prefix>',
  description: 'Set the custom prefix for the server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const prefix = interaction.options.getString('prefix');
      const validPrefixes = ['.', '/', '?', '!', ','];
      if (!validPrefixes.includes(prefix)) {
        return interaction.reply({ content: 'Invalid prefix. Valid prefixes: ., /, ?, !, ,', ephemeral: true });
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { prefix: [prefix, '/'] } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ Prefix set to ${prefix}` });
    } catch (error) {
      console.error('setprefix command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const prefix = args[0];
      if (!prefix) return message.reply('Usage: setprefix <prefix>');
      const validPrefixes = ['.', '/', '?', '!', ','];
      if (!validPrefixes.includes(prefix)) {
        return message.reply('Invalid prefix. Valid prefixes: ., /, ?, !, ,');
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { prefix: [prefix, '/'] } },
        { upsert: true }
      );
      await message.channel.send(`✅ Prefix set to ${prefix}`);
    } catch (error) {
      console.error('setprefix prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
