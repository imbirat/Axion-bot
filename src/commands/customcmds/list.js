const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd')
    .setDescription('Manage custom commands')
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all custom commands'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Custom Commands',
  usage: '/customcmd list',
  description: 'List all custom commands for the server (paginated)',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const commands = await CustomCommand.find({ guildId: interaction.guild.id }).sort({ trigger: 1 });

      if (commands.length === 0) {
        return interaction.reply({ content: 'No custom commands set for this server.', ephemeral: true });
      }

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

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('customcmd list error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const commands = await CustomCommand.find({ guildId: message.guild.id }).sort({ trigger: 1 });

      if (commands.length === 0) {
        return message.reply('No custom commands set for this server.');
      }

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
    } catch (error) {
      console.error('customcmd list prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
