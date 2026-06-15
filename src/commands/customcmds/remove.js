const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd-remove')
    .setDescription('Remove a custom command')
    .addStringOption(opt =>
      opt.setName('trigger')
        .setDescription('Command trigger to remove')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Custom Commands',
  description: 'Deletes a custom command by trigger',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const trigger = interaction.options.getString('trigger').toLowerCase();

      const result = await CustomCommand.findOneAndDelete({ guildId: interaction.guild.id, trigger });
      if (!result) {
        return interaction.reply({ content: `No custom command found with trigger \`${trigger}\`.`, flags: MessageFlags.Ephemeral });
      }

      await interaction.reply({ content: `✅ Custom command \`${trigger}\` removed.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('customcmd-remove error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) return message.reply('Usage: customcmd-remove <trigger>');
      const trigger = args[0].toLowerCase();

      const result = await CustomCommand.findOneAndDelete({ guildId: message.guild.id, trigger });
      if (!result) return message.reply(`No custom command found with trigger \`${trigger}\`.`);

      await message.reply(`✅ Custom command \`${trigger}\` removed.`);
    } catch (error) {
      console.error('customcmd-remove prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
