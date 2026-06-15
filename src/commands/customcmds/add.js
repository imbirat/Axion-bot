const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd-add')
    .setDescription('Add a custom command')
    .addStringOption(opt =>
      opt.setName('trigger')
        .setDescription('Command trigger')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('response')
        .setDescription('Command response')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Custom Commands',
  description: 'Creates a new custom command with trigger and response',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const trigger = interaction.options.getString('trigger').toLowerCase();
      const response = interaction.options.getString('response');

      const existing = await CustomCommand.findOne({ guildId: interaction.guild.id, trigger });
      if (existing) {
        return interaction.reply({ content: `A custom command with trigger \`${trigger}\` already exists.`, flags: MessageFlags.Ephemeral });
      }

      await CustomCommand.create({ guildId: interaction.guild.id, trigger, response, createdBy: interaction.user.id });
      await interaction.reply({ content: `✅ Custom command \`${trigger}\` added.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('customcmd-add error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length < 2) return message.reply('Usage: customcmd-add <trigger> <response>');
      const trigger = args[0].toLowerCase();
      const response = args.slice(1).join(' ');

      const existing = await CustomCommand.findOne({ guildId: message.guild.id, trigger });
      if (existing) return message.reply(`A custom command with trigger \`${trigger}\` already exists.`);

      await CustomCommand.create({ guildId: message.guild.id, trigger, response, createdBy: message.author.id });
      await message.reply(`✅ Custom command \`${trigger}\` added.`);
    } catch (error) {
      console.error('customcmd-add prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
