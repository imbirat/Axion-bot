const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging')
    .setDescription('Manage logging settings')
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable logging for the server'))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable logging for the server'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Logging',
  usage: '/logging <enable|disable>',
  description: 'Enable or disable server logging',
  permissions: ['Administrator'],
  cooldown: 5,
  prefixAliases: ['logging-enable', 'logging-disable'],
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'enable') {
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
      } else {
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { loggingEnabled: false } },
          { upsert: true }
        );
        await interaction.reply({ content: '✅ Logging disabled.' });
      }
    } catch (error) {
      console.error('logging command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    try {
      if (sub === 'enable' || !sub) {
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
      } else {
        await GuildConfig.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { loggingEnabled: false } },
          { upsert: true }
        );
        await message.channel.send('✅ Logging disabled.');
      }
    } catch (error) {
      console.error('logging prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
