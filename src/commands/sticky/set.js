const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const StickyMessage = require('../../models/StickyMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky-set')
    .setDescription('Set a sticky message for this channel')
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('The message content to sticky')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Sticky',
  description: 'Creates a sticky message that stays at the bottom of the channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const content = interaction.options.getString('message');

      const msg = await interaction.channel.send({ content: `📌 **Sticky:** ${content}` });

      await StickyMessage.findOneAndUpdate(
        { guildId: interaction.guild.id, channelId: interaction.channel.id },
        { $set: { message: content, lastMessageId: msg.id } },
        { upsert: true }
      );

      await interaction.reply({ content: '✅ Sticky message set.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('sticky-set error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const content = args.join(' ');
      if (!content) return message.reply('Usage: sticky-set <message>');

      const msg = await message.channel.send({ content: `📌 **Sticky:** ${content}` });

      await StickyMessage.findOneAndUpdate(
        { guildId: message.guild.id, channelId: message.channel.id },
        { $set: { message: content, lastMessageId: msg.id } },
        { upsert: true }
      );

      await message.reply('✅ Sticky message set.');
    } catch (error) {
      console.error('sticky-set prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
