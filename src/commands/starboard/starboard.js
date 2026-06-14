const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags} = require('discord.js');
const Starboard = require('../../models/Starboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Manage starboard')
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('View current starboard configuration'))
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Configure the starboard')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Starboard channel').setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('threshold').setDescription('Reaction threshold').setRequired(false).setMinValue(1)))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable the starboard'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Starboard',
  usage: '/starboard <config|setup|disable>',
  description: 'Starboard system to highlight popular messages',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      switch (sub) {
        case 'config': {
          const config = await Starboard.findOne({ guildId: interaction.guild.id });
          if (!config) {
            return interaction.reply({ content: 'Starboard is not configured. Use `/starboard setup` to configure it.', flags: MessageFlags.Ephemeral });
          }
          const channel = interaction.guild.channels.cache.get(config.channelId);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2).setTitle('Starboard Configuration')
            .addFields(
              { name: 'Channel', value: channel ? `${channel}` : '`#deleted-channel`', inline: true },
              { name: 'Threshold', value: `${config.threshold} ⭐`, inline: true },
              { name: 'Emoji', value: config.emoji || '⭐', inline: true },
              { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
              { name: 'Starred Messages', value: `${config.entries?.length || 0}`, inline: true }
            );
          await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
          break;
        }
        case 'setup': {
          const channel = interaction.options.getChannel('channel');
          const threshold = interaction.options.getInteger('threshold') || 3;
          await Starboard.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { channelId: channel.id, threshold, enabled: true } },
            { upsert: true }
          );
          await interaction.reply({ content: `⭐ Starboard configured! Channel: ${channel}, Threshold: ${threshold}`, flags: MessageFlags.Ephemeral });
          break;
        }
        case 'disable': {
          const config = await Starboard.findOne({ guildId: interaction.guild.id });
          if (!config) return interaction.reply({ content: 'Starboard is not configured.', flags: MessageFlags.Ephemeral });
          config.enabled = false;
          await config.save();
          await interaction.reply({ content: '⭐ Starboard disabled.', flags: MessageFlags.Ephemeral });
          break;
        }
      }
    } catch (error) {
      console.error(`starboard ${sub} error:`, error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    const rest = args.slice(1);
    try {
      switch (sub) {
        case 'config': {
          const config = await Starboard.findOne({ guildId: message.guild.id });
          if (!config) return message.reply('Starboard not configured. Use `starboard setup <#channel> [threshold]`.');
          const channel = message.guild.channels.cache.get(config.channelId);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2).setTitle('Starboard Configuration')
            .addFields(
              { name: 'Channel', value: channel ? `${channel}` : '`#deleted-channel`', inline: true },
              { name: 'Threshold', value: `${config.threshold} ⭐`, inline: true },
              { name: 'Emoji', value: config.emoji || '⭐', inline: true },
              { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
              { name: 'Starred Messages', value: `${config.entries?.length || 0}`, inline: true }
            );
          await message.channel.send({ embeds: [embed] });
          break;
        }
        case 'setup': {
          const channel = message.mentions.channels.first();
          if (!channel) return message.reply('Usage: starboard setup <#channel> [threshold]');
          const threshold = parseInt(rest[0], 10) || 3;
          await Starboard.findOneAndUpdate(
            { guildId: message.guild.id },
            { $set: { channelId: channel.id, threshold, enabled: true } },
            { upsert: true }
          );
          await message.reply(`⭐ Starboard configured! Channel: ${channel}, Threshold: ${threshold}`);
          break;
        }
        case 'disable': {
          const config = await Starboard.findOne({ guildId: message.guild.id });
          if (!config) return message.reply('Starboard is not configured.');
          config.enabled = false;
          await config.save();
          await message.reply('⭐ Starboard disabled.');
          break;
        }
        default:
          await message.reply('Usage: starboard <config|setup|disable>');
      }
    } catch (error) {
      console.error(`starboard prefix ${sub} error:`, error);
      await message.reply('There was an error executing this command.');
    }
  },
};
