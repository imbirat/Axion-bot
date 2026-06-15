const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const ServerStats = require('../../models/ServerStats');

const TEMPLATES = {
  members: 'Members: {count}',
  bots: 'Bots: {count}',
  boosts: 'Boosts: {count}',
  channels: 'Channels: {count}',
  roles: 'Roles: {count}',
  online: 'Online: {count}',
};

const TYPE_CHOICES = Object.keys(TEMPLATES).map(t => ({ name: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats-remove')
    .setDescription('Remove a stat voice channel')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of stat to remove')
        .setRequired(true)
        .addChoices(...TYPE_CHOICES))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Server Stats',
  description: 'Deletes the voice channel for the specified stat type',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const doc = await ServerStats.findOne({ guildId: interaction.guild.id });
      if (!doc) {
        return interaction.reply({ content: 'Server stats not configured.', flags: MessageFlags.Ephemeral });
      }

      const stat = doc.stats.find(s => s.type === type);
      if (!stat) {
        return interaction.reply({ content: `**${type}** stat not found.`, flags: MessageFlags.Ephemeral });
      }

      const channel = interaction.guild.channels.cache.get(stat.channelId);
      if (channel) await channel.delete().catch(() => {});

      doc.stats = doc.stats.filter(s => s.type !== type);
      await doc.save();

      await interaction.reply({ content: `✅ Removed **${type}** stat.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('serverstats-remove error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const type = args[0];
      if (!type || !TEMPLATES[type]) {
        return message.reply(`Usage: serverstats-remove <type>\nTypes: ${Object.keys(TEMPLATES).join(', ')}`);
      }

      const doc = await ServerStats.findOne({ guildId: message.guild.id });
      if (!doc) return message.reply('Server stats not configured.');

      const stat = doc.stats.find(s => s.type === type);
      if (!stat) return message.reply(`**${type}** stat not found.`);

      const channel = message.guild.channels.cache.get(stat.channelId);
      if (channel) await channel.delete().catch(() => {});

      doc.stats = doc.stats.filter(s => s.type !== type);
      await doc.save();

      await message.reply(`✅ Removed **${type}** stat.`);
    } catch (error) {
      console.error('serverstats-remove prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
