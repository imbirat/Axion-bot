const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd')
    .setDescription('Manage custom commands')
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a custom command')
        .addStringOption(opt =>
          opt.setName('trigger')
            .setDescription('Command trigger to remove')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Custom Commands',
  usage: '/customcmd remove <trigger>',
  description: 'Remove a custom command from the server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const trigger = interaction.options.getString('trigger').toLowerCase();

      const result = await CustomCommand.findOneAndDelete({ guildId: interaction.guild.id, trigger });

      if (!result) {
        return interaction.reply({ content: `No custom command found with trigger \`${trigger}\`.`, ephemeral: true });
      }

      await interaction.reply({ content: `✅ Custom command \`${trigger}\` removed.`, ephemeral: true });
    } catch (error) {
      console.error('customcmd remove error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!args.length) {
        return message.reply('Usage: customcmd remove <trigger>');
      }

      const trigger = args[0].toLowerCase();

      const result = await CustomCommand.findOneAndDelete({ guildId: message.guild.id, trigger });

      if (!result) {
        return message.reply(`No custom command found with trigger \`${trigger}\`.`);
      }

      await message.reply(`✅ Custom command \`${trigger}\` removed.`);
    } catch (error) {
      console.error('customcmd remove prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
