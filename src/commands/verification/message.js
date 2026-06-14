const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifymessage')
    .setDescription('Set the verification embed message')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The verification message')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifymessage <text>',
  description: 'Update the message shown on the verification panel',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const text = interaction.options.getString('text');
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { verifyMessage: text } }
      );
      await interaction.reply({ content: '✅ Verify message updated.', ephemeral: true });
    } catch (error) {
      console.error('verifymessage error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const text = args.join(' ');
      if (!text) return message.reply('Usage: verifymessage <text>');
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { verifyMessage: text } }
      );
      await message.reply('✅ Verify message updated.');
    } catch (error) {
      console.error('verifymessage prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
