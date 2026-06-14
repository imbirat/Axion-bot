const { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set a channel for various server features')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of channel to set')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome', value: 'welcome' },
          { name: 'Farewell', value: 'farewell' },
          { name: 'Booster', value: 'booster' },
          { name: 'Leveling', value: 'leveling' },
          { name: 'Logging', value: 'logging' }
        )
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to set')
        .setRequired(true)
    ),
  category: 'Config',
  usage: '/setchannel <type> <#channel>',
  description: 'Set a channel for welcome, farewell, booster, leveling, or logging messages',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const channel = interaction.options.getChannel('channel');
      const fieldMap = {
        welcome: 'welcomeChannel',
        farewell: 'farewellChannel',
        booster: 'boosterChannel',
        leveling: 'levelingChannel',
        logging: 'loggingChannel'
      };
      const field = fieldMap[type];
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { [field]: channel.id } },
        { upsert: true }
      );
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      await interaction.reply({ content: `✅ ${label} channel set to ${channel}.` });
    } catch (error) {
      console.error('setchannel command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const type = args[0]?.toLowerCase();
      const channel = message.mentions.channels.first();
      if (!type || !channel) return message.reply('Usage: setchannel <type> <#channel>');
      const validTypes = ['welcome', 'farewell', 'booster', 'leveling', 'logging'];
      if (!validTypes.includes(type)) return message.reply('Invalid type. Valid types: welcome, farewell, booster, leveling, logging');
      const fieldMap = {
        welcome: 'welcomeChannel',
        farewell: 'farewellChannel',
        booster: 'boosterChannel',
        leveling: 'levelingChannel',
        logging: 'loggingChannel'
      };
      const field = fieldMap[type];
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { [field]: channel.id } },
        { upsert: true }
      );
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      await message.channel.send(`✅ ${label} channel set to ${channel}.`);
    } catch (error) {
      console.error('setchannel prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
