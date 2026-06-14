const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd')
    .setDescription('Manage custom commands')
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Edit a custom command')
        .addStringOption(opt =>
          opt.setName('trigger')
            .setDescription('Command trigger to edit')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('new-response')
            .setDescription('New response text')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Custom Commands',
  usage: '/customcmd edit <trigger> <new-response>',
  description: 'Edit the response of an existing custom command',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const trigger = interaction.options.getString('trigger').toLowerCase();
      const newResponse = interaction.options.getString('new-response');

      const cmd = await CustomCommand.findOne({ guildId: interaction.guild.id, trigger });
      if (!cmd) {
        return interaction.reply({ content: `No custom command found with trigger \`${trigger}\`.`, ephemeral: true });
      }

      cmd.response = newResponse;
      await cmd.save();

      await interaction.reply({ content: `✅ Custom command \`${trigger}\` updated.`, ephemeral: true });
    } catch (error) {
      console.error('customcmd edit error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length < 2) {
        return message.reply('Usage: customcmd edit <trigger> <new-response>');
      }

      const trigger = args[0].toLowerCase();
      const newResponse = args.slice(1).join(' ');

      const cmd = await CustomCommand.findOne({ guildId: message.guild.id, trigger });
      if (!cmd) {
        return message.reply(`No custom command found with trigger \`${trigger}\`.`);
      }

      cmd.response = newResponse;
      await cmd.save();

      await message.reply(`✅ Custom command \`${trigger}\` updated.`);
    } catch (error) {
      console.error('customcmd edit prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
