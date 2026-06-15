const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Starboard = require('../../models/Starboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard-config')
    .setDescription('View or update starboard configuration')
    .addStringOption(opt =>
      opt.setName('emoji')
        .setDescription('Change the trigger emoji')
        .setRequired(false))
    .addBooleanOption(opt =>
      opt.setName('disable')
        .setDescription('Disable the starboard')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Starboard',
  description: 'Shows current starboard config or updates emoji/disabled state',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const emoji = interaction.options.getString('emoji');
      const disable = interaction.options.getBoolean('disable');

      const config = await Starboard.findOne({ guildId: interaction.guild.id });
      if (!config) {
        return interaction.reply({ content: 'Starboard is not configured. Use `/starboard-setup` to configure it.', flags: MessageFlags.Ephemeral });
      }

      if (emoji) {
        config.emoji = emoji;
        await config.save();
        await interaction.reply({ content: `⭐ Starboard emoji changed to ${emoji}.`, flags: MessageFlags.Ephemeral });
        return;
      }

      if (disable !== null) {
        config.enabled = !disable;
        await config.save();
        await interaction.reply({ content: `⭐ Starboard ${disable ? 'disabled' : 'enabled'}.`, flags: MessageFlags.Ephemeral });
        return;
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
    } catch (error) {
      console.error('starboard-config error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const config = await Starboard.findOne({ guildId: message.guild.id });
      if (!config) return message.reply('Starboard not configured. Use `starboard-setup <#channel> [threshold]`.');

      const emojiArg = args.find(a => a.startsWith('emoji:'));
      if (emojiArg) {
        config.emoji = emojiArg.replace('emoji:', '');
        await config.save();
        await message.reply(`⭐ Starboard emoji changed to ${config.emoji}.`);
        return;
      }

      if (args.includes('disable')) {
        config.enabled = false;
        await config.save();
        await message.reply('⭐ Starboard disabled.');
        return;
      }

      if (args.includes('enable')) {
        config.enabled = true;
        await config.save();
        await message.reply('⭐ Starboard enabled.');
        return;
      }

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
    } catch (error) {
      console.error('starboard-config prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
