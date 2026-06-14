const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ServerStats = require('../../models/ServerStats');

const TEMPLATES = {
  members: 'Members: {count}',
  bots: 'Bots: {count}',
  boosts: 'Boosts: {count}',
  channels: 'Channels: {count}',
  roles: 'Roles: {count}',
  online: 'Online: {count}'
};

const TYPE_CHOICES = Object.keys(TEMPLATES).map(t => ({ name: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Manage server stats voice channels')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Create the Server Stats category'))
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a stat voice channel')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of stat to display')
            .setRequired(true)
            .addChoices(...TYPE_CHOICES)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a stat voice channel')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of stat to remove')
            .setRequired(true)
            .addChoices(...TYPE_CHOICES)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Server Stats',
  usage: '/serverstats setup | /serverstats add <type> | /serverstats remove <type>',
  description: 'Create and manage server stat voice channels',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'setup') {
        const existing = await ServerStats.findOne({ guildId: interaction.guild.id });
        if (existing?.categoryId) {
          const cat = interaction.guild.channels.cache.get(existing.categoryId);
          if (cat) {
            return interaction.reply({ content: `Server stats category already exists: ${cat.name}. Use /serverstats add to add stats.`, ephemeral: true });
          }
        }

        const category = await interaction.guild.channels.create({
          name: 'Server Stats',
          type: 4
        });

        await ServerStats.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { categoryId: category.id, enabled: true } },
          { upsert: true }
        );

        await interaction.reply({ content: `✅ Server stats category created! Use /serverstats add to add stats.`, ephemeral: true });
        return;
      }

      if (sub === 'add') {
        const type = interaction.options.getString('type');
        const doc = await ServerStats.findOne({ guildId: interaction.guild.id });
        if (!doc?.categoryId) {
          return interaction.reply({ content: 'Please run /serverstats setup first.', ephemeral: true });
        }

        const existingStat = doc.stats.find(s => s.type === type);
        if (existingStat) {
          return interaction.reply({ content: `**${type}** stat already exists.`, ephemeral: true });
        }

        const count = await getCount(interaction.guild, type, client);
        const template = TEMPLATES[type];
        const name = template.replace('{count}', String(count));

        const channel = await interaction.guild.channels.create({
          name,
          type: 2,
          parent: doc.categoryId
        });

        doc.stats.push({ type, channelId: channel.id, template });
        await doc.save();

        await interaction.reply({ content: `✅ Added **${type}** stat.`, ephemeral: true });
        return;
      }

      if (sub === 'remove') {
        const type = interaction.options.getString('type');
        const doc = await ServerStats.findOne({ guildId: interaction.guild.id });
        if (!doc) {
          return interaction.reply({ content: 'Server stats not configured.', ephemeral: true });
        }

        const stat = doc.stats.find(s => s.type === type);
        if (!stat) {
          return interaction.reply({ content: `**${type}** stat not found.`, ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(stat.channelId);
        if (channel) await channel.delete().catch(() => {});

        doc.stats = doc.stats.filter(s => s.type !== type);
        await doc.save();

        await interaction.reply({ content: `✅ Removed **${type}** stat.`, ephemeral: true });
      }
    } catch (error) {
      console.error('serverstats error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];

      if (sub === 'setup') {
        const existing = await ServerStats.findOne({ guildId: message.guild.id });
        if (existing?.categoryId) {
          const cat = message.guild.channels.cache.get(existing.categoryId);
          if (cat) {
            return message.reply(`Server stats category already exists: ${cat.name}. Use serverstats add <type> to add stats.`);
          }
        }

        const category = await message.guild.channels.create({
          name: 'Server Stats',
          type: 4
        });

        await ServerStats.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { categoryId: category.id, enabled: true } },
          { upsert: true }
        );

        await message.reply('✅ Server stats category created! Use /serverstats add to add stats.');
        return;
      }

      if (sub === 'add') {
        const type = args[1];
        if (!type || !TEMPLATES[type]) {
          return message.reply(`Usage: serverstats add <type>\nTypes: ${Object.keys(TEMPLATES).join(', ')}`);
        }

        const doc = await ServerStats.findOne({ guildId: message.guild.id });
        if (!doc?.categoryId) return message.reply('Please run serverstats setup first.');

        const existingStat = doc.stats.find(s => s.type === type);
        if (existingStat) return message.reply(`**${type}** stat already exists.`);

        const count = await getCount(message.guild, type, client);
        const template = TEMPLATES[type];
        const name = template.replace('{count}', String(count));

        const channel = await message.guild.channels.create({
          name,
          type: 2,
          parent: doc.categoryId
        });

        doc.stats.push({ type, channelId: channel.id, template });
        await doc.save();

        await message.reply(`✅ Added **${type}** stat.`);
        return;
      }

      if (sub === 'remove') {
        const type = args[1];
        if (!type || !TEMPLATES[type]) {
          return message.reply(`Usage: serverstats remove <type>\nTypes: ${Object.keys(TEMPLATES).join(', ')}`);
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
        return;
      }

      await message.reply('Usage: serverstats setup | serverstats add <type> | serverstats remove <type>');
    } catch (error) {
      console.error('serverstats prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};

async function getCount(guild, type, client) {
  try {
    await guild.members.fetch();
  } catch {}
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
