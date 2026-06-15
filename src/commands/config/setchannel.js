const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

const TYPE_MAP = {
  welcome: 'welcomeChannel',
  farewell: 'farewellChannel',
  booster: 'boosterChannel',
  leveling: 'levelingChannel',
  logging: 'loggingChannel',
  birthday: 'birthdayChannel',
  confess: 'confessChannel',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set a channel for a specific feature')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Channel type')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome', value: 'welcome' },
          { name: 'Farewell', value: 'farewell' },
          { name: 'Booster', value: 'booster' },
          { name: 'Leveling', value: 'leveling' },
          { name: 'Logging', value: 'logging' },
          { name: 'Birthday', value: 'birthday' },
          { name: 'Confess', value: 'confess' }
        ))
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('The channel to set')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Config',
  usage: '/setchannel <type> <#channel>',
  description: 'Configure which channels are used for various features',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const channel = interaction.options.getChannel('channel');
      const field = TYPE_MAP[type];
      if (!field) {
        return interaction.reply({ content: '❌ Invalid channel type.', flags: MessageFlags.Ephemeral });
      }
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { [field]: channel.id } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ ${type.charAt(0).toUpperCase() + type.slice(1)} channel set to ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('setchannel command error:', error);
      await interaction.reply({ content: 'There was an error setting the channel.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const type = args[0]?.toLowerCase();
      const channel = message.mentions.channels.first();
      if (!type || !channel) return message.reply('Usage: setchannel <welcome|farewell|booster|leveling|logging|birthday|confess> <#channel>');
      const field = TYPE_MAP[type];
      if (!field) return message.reply('❌ Invalid channel type.');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { [field]: channel.id } },
        { upsert: true }
      );
      await message.reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} channel set to ${channel}.`);
    } catch (error) {
      console.error('setchannel prefix error:', error);
      await message.reply('There was an error setting the channel.');
    }
  },
};
