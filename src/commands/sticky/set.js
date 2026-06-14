const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const StickyMessage = require('../../models/StickyMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Manage sticky messages')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set a sticky message for this channel')
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('The message content to sticky')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Sticky',
  usage: '/sticky set <message>',
  description: 'Create or update a sticky message that will stay at the bottom of the channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const message = interaction.options.getString('message');

      await StickyMessage.findOneAndUpdate(
        { guildId: interaction.guild.id, channelId: interaction.channel.id },
        { $set: { message } },
        { upsert: true }
      );

      await interaction.reply({ content: '✅ Sticky message set.', ephemeral: true });
    } catch (error) {
      console.error('sticky set error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) {
        return message.reply('Usage: sticky set <message>');
      }

      const content = args.join(' ');

      await StickyMessage.findOneAndUpdate(
        { guildId: message.guild.id, channelId: message.channel.id },
        { $set: { message: content } },
        { upsert: true }
      );

      await message.reply('✅ Sticky message set.');
    } catch (error) {
      console.error('sticky set prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
