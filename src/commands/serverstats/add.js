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
    .setName('serverstats-add')
    .setDescription('Add a stat voice channel')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of stat to display')
        .setRequired(true)
        .addChoices(...TYPE_CHOICES))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Server Stats',
  description: 'Creates a voice channel with the specified stat type',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const doc = await ServerStats.findOne({ guildId: interaction.guild.id });
      if (!doc?.categoryId) {
        return interaction.reply({ content: 'Please run /serverstats-setup first.', flags: MessageFlags.Ephemeral });
      }

      const existingStat = doc.stats.find(s => s.type === type);
      if (existingStat) {
        return interaction.reply({ content: `**${type}** stat already exists.`, flags: MessageFlags.Ephemeral });
      }

      const count = await getCount(interaction.guild, type, client);
      const template = TEMPLATES[type];
      const name = template.replace('{count}', String(count));

      const channel = await interaction.guild.channels.create({
        name,
        type: 2,
        parent: doc.categoryId,
      });

      doc.stats.push({ type, channelId: channel.id, template });
      await doc.save();

      await interaction.reply({ content: `✅ Added **${type}** stat.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('serverstats-add error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const type = args[0];
      if (!type || !TEMPLATES[type]) {
        return message.reply(`Usage: serverstats-add <type>\nTypes: ${Object.keys(TEMPLATES).join(', ')}`);
      }

      const doc = await ServerStats.findOne({ guildId: message.guild.id });
      if (!doc?.categoryId) return message.reply('Please run serverstats-setup first.');

      const existingStat = doc.stats.find(s => s.type === type);
      if (existingStat) return message.reply(`**${type}** stat already exists.`);

      const count = await getCount(message.guild, type, client);
      const template = TEMPLATES[type];
      const name = template.replace('{count}', String(count));

      const channel = await message.guild.channels.create({
        name,
        type: 2,
        parent: doc.categoryId,
      });

      doc.stats.push({ type, channelId: channel.id, template });
      await doc.save();

      await message.reply(`✅ Added **${type}** stat.`);
    } catch (error) {
      console.error('serverstats-add prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};

async function getCount(guild, type, client) {
  try { await guild.members.fetch(); } catch {}
  switch (type) {
    case 'members': return guild.members.cache.filter(m => !m.user.bot).size;
    case 'bots': return guild.members.cache.filter(m => m.user.bot).size;
    case 'boosts': return guild.premiumSubscriptionCount || 0;
    case 'channels': return guild.channels.cache.size;
    case 'roles': return guild.roles.cache.size;
    case 'online': return guild.members.cache.filter(m => m.presence?.status === 'online').size;
    default: return 0;
  }
}
