const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags} = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd')
    .setDescription('Manage custom commands')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a custom command')
        .addStringOption(opt =>
          opt.setName('trigger').setDescription('Command trigger').setRequired(true))
        .addStringOption(opt =>
          opt.setName('response').setDescription('Command response').setRequired(true))
        .addStringOption(opt =>
          opt.setName('embed-yes-no').setDescription('Send as embed? (yes/no)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Edit a custom command')
        .addStringOption(opt =>
          opt.setName('trigger').setDescription('Command trigger to edit').setRequired(true))
        .addStringOption(opt =>
          opt.setName('new-response').setDescription('New response text').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all custom commands'))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a custom command')
        .addStringOption(opt =>
          opt.setName('trigger').setDescription('Command trigger to remove').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Custom Commands',
  usage: '/customcmd <add|edit|list|remove>',
  description: 'Create, edit, list, and remove custom server commands',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      switch (sub) {
        case 'add': {
          const trigger = interaction.options.getString('trigger').toLowerCase();
          const response = interaction.options.getString('response');
          const existing = await CustomCommand.findOne({ guildId: interaction.guild.id, trigger });
          if (existing) return interaction.reply({ content: `A custom command with trigger \`${trigger}\` already exists.`, flags: MessageFlags.Ephemeral });
          await CustomCommand.create({ guildId: interaction.guild.id, trigger, response, createdBy: interaction.user.id });
          await interaction.reply({ content: `✅ Custom command \`${trigger}\` added.`, flags: MessageFlags.Ephemeral });
          break;
        }
        case 'edit': {
          const trigger = interaction.options.getString('trigger').toLowerCase();
          const newResponse = interaction.options.getString('new-response');
          const cmd = await CustomCommand.findOne({ guildId: interaction.guild.id, trigger });
          if (!cmd) return interaction.reply({ content: `No custom command found with trigger \`${trigger}\`.`, flags: MessageFlags.Ephemeral });
          cmd.response = newResponse;
          await cmd.save();
          await interaction.reply({ content: `✅ Custom command \`${trigger}\` updated.`, flags: MessageFlags.Ephemeral });
          break;
        }
        case 'list': {
          const commands = await CustomCommand.find({ guildId: interaction.guild.id }).sort({ trigger: 1 });
          if (commands.length === 0) return interaction.reply({ content: 'No custom commands set for this server.', flags: MessageFlags.Ephemeral });
          const itemsPerPage = 10;
          const totalPages = Math.ceil(commands.length / itemsPerPage);
          const page = 0;
          const start = page * itemsPerPage;
          const end = start + itemsPerPage;
          const pageItems = commands.slice(start, end);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Custom Commands')
            .setDescription(pageItems.map(c => `**\`${c.trigger}\`** → ${c.response.substring(0, 50)}`).join('\n'))
            .setFooter({ text: `Page ${page + 1} of ${totalPages} • ${commands.length} total` });
          await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
          break;
        }
        case 'remove': {
          const trigger = interaction.options.getString('trigger').toLowerCase();
          const result = await CustomCommand.findOneAndDelete({ guildId: interaction.guild.id, trigger });
          if (!result) return interaction.reply({ content: `No custom command found with trigger \`${trigger}\`.`, flags: MessageFlags.Ephemeral });
          await interaction.reply({ content: `✅ Custom command \`${trigger}\` removed.`, flags: MessageFlags.Ephemeral });
          break;
        }
      }
    } catch (error) {
      console.error(`customcmd ${sub} error:`, error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    const rest = args.slice(1);
    try {
      switch (sub) {
        case 'add': {
          if (rest.length < 2) return message.reply('Usage: customcmd add <trigger> <response>');
          const trigger = rest[0].toLowerCase();
          const response = rest.slice(1).join(' ');
          const existing = await CustomCommand.findOne({ guildId: message.guild.id, trigger });
          if (existing) return message.reply(`A custom command with trigger \`${trigger}\` already exists.`);
          await CustomCommand.create({ guildId: message.guild.id, trigger, response, createdBy: message.author.id });
          await message.reply(`✅ Custom command \`${trigger}\` added.`);
          break;
        }
        case 'edit': {
          if (rest.length < 2) return message.reply('Usage: customcmd edit <trigger> <new-response>');
          const trigger = rest[0].toLowerCase();
          const newResponse = rest.slice(1).join(' ');
          const cmd = await CustomCommand.findOne({ guildId: message.guild.id, trigger });
          if (!cmd) return message.reply(`No custom command found with trigger \`${trigger}\`.`);
          cmd.response = newResponse;
          await cmd.save();
          await message.reply(`✅ Custom command \`${trigger}\` updated.`);
          break;
        }
        case 'list': {
          const commands = await CustomCommand.find({ guildId: message.guild.id }).sort({ trigger: 1 });
          if (commands.length === 0) return message.reply('No custom commands set for this server.');
          const itemsPerPage = 10;
          const totalPages = Math.ceil(commands.length / itemsPerPage);
          const page = 0;
          const start = page * itemsPerPage;
          const end = start + itemsPerPage;
          const pageItems = commands.slice(start, end);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Custom Commands')
            .setDescription(pageItems.map(c => `**\`${c.trigger}\`** → ${c.response.substring(0, 50)}`).join('\n'))
            .setFooter({ text: `Page ${page + 1} of ${totalPages} • ${commands.length} total` });
          await message.channel.send({ embeds: [embed] });
          break;
        }
        case 'remove': {
          if (!rest.length) return message.reply('Usage: customcmd remove <trigger>');
          const trigger = rest[0].toLowerCase();
          const result = await CustomCommand.findOneAndDelete({ guildId: message.guild.id, trigger });
          if (!result) return message.reply(`No custom command found with trigger \`${trigger}\`.`);
          await message.reply(`✅ Custom command \`${trigger}\` removed.`);
          break;
        }
        default:
          await message.reply('Usage: customcmd <add|edit|list|remove>');
      }
    } catch (error) {
      console.error(`customcmd prefix ${sub} error:`, error);
      await message.reply('There was an error executing this command.');
    }
  },
};
