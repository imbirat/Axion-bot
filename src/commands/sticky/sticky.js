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
          opt.setName('message').setDescription('The message content to sticky').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove the sticky message from this channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Sticky',
  usage: '/sticky <set|remove>',
  description: 'Create or remove sticky messages that stay at the bottom of a channel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      if (sub === 'set') {
        const message = interaction.options.getString('message');
        await StickyMessage.findOneAndUpdate(
          { guildId: interaction.guild.id, channelId: interaction.channel.id },
          { $set: { message } },
          { upsert: true }
        );
        await interaction.reply({ content: '✅ Sticky message set.', ephemeral: true });
      } else {
        const result = await StickyMessage.findOneAndDelete({
          guildId: interaction.guild.id, channelId: interaction.channel.id
        });
        if (!result) return interaction.reply({ content: 'No sticky message set in this channel.', ephemeral: true });
        await interaction.reply({ content: '✅ Sticky message removed.', ephemeral: true });
      }
    } catch (error) {
      console.error(`sticky ${sub} error:`, error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    const rest = args.slice(1);
    try {
      if (sub === 'set' || !sub) {
        const content = rest.join(' ');
        if (!content) return message.reply('Usage: sticky set <message>');
        await StickyMessage.findOneAndUpdate(
          { guildId: message.guild.id, channelId: message.channel.id },
          { $set: { message: content } },
          { upsert: true }
        );
        await message.reply('✅ Sticky message set.');
      } else {
        const result = await StickyMessage.findOneAndDelete({
          guildId: message.guild.id, channelId: message.channel.id
        });
        if (!result) return message.reply('No sticky message set in this channel.');
        await message.reply('✅ Sticky message removed.');
      }
    } catch (error) {
      console.error(`sticky prefix ${sub} error:`, error);
      await message.reply('There was an error executing this command.');
    }
  },
};
