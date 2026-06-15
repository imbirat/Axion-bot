const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging')
    .setDescription('Server logging settings')
    .addSubcommand(sub => sub.setName('enable').setDescription('Enable server logging'))
    .addSubcommand(sub => sub.setName('disable').setDescription('Disable server logging'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Logging',
  usage: '/logging <enable|disable>',
  description: 'Enable or disable server logging features',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      const val = sub === 'enable';
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: { loggingEnabled: val } },
        { upsert: true }
      );
      await interaction.reply({ content: `✅ Logging ${val ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      console.error('logging command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    try {
      const val = sub === 'enable';
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { loggingEnabled: val } },
        { upsert: true }
      );
      await message.channel.send(`✅ Logging ${val ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      console.error('logging prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
