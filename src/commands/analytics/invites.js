const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('View invite tracking')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to check invites for')
        .setRequired(false)),
  category: 'Analytics',
  usage: '/invites [user]',
  description: 'Shows invite counts for the server or a specific user',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const guild = interaction.guild;
      const invites = await guild.invites.fetch();
      if (target) {
        const userInvites = invites.filter(inv => inv.inviter?.id === target.id);
        const total = userInvites.reduce((sum, inv) => sum + (inv.uses || 0), 0);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`📨 Invites for ${target.username}`)
          .setDescription(`**Total invites:** ${total}`)
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } else {
        const topInvites = invites
          .filter(inv => inv.inviter)
          .reduce((acc, inv) => {
            const id = inv.inviter.id;
            acc[id] = (acc[id] || 0) + (inv.uses || 0);
            return acc;
          }, {});
        const sorted = Object.entries(topInvites).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (!sorted.length) {
          return interaction.reply({ content: 'No invites found.', flags: MessageFlags.Ephemeral });
        }
        const lines = sorted.map(([id, count], i) => {
          const member = guild.members.cache.get(id);
          return `**${i + 1}.** ${member ? member.displayName : id} — ${count} invites`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📨 Top Invites')
          .setDescription(lines.join('\n'))
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('invites command error:', error);
      await interaction.reply({ content: 'There was an error fetching invite data.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      const guild = message.guild;
      const invites = await guild.invites.fetch();
      if (target) {
        const userInvites = invites.filter(inv => inv.inviter?.id === target.id);
        const total = userInvites.reduce((sum, inv) => sum + (inv.uses || 0), 0);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`📨 Invites for ${target.username}`)
          .setDescription(`**Total invites:** ${total}`)
          .setTimestamp();
        await message.channel.send({ embeds: [embed] });
      } else {
        const topInvites = invites
          .filter(inv => inv.inviter)
          .reduce((acc, inv) => {
            const id = inv.inviter.id;
            acc[id] = (acc[id] || 0) + (inv.uses || 0);
            return acc;
          }, {});
        const sorted = Object.entries(topInvites).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (!sorted.length) return message.reply('No invites found.');
        const lines = sorted.map(([id, count], i) => {
          const member = guild.members.cache.get(id);
          return `**${i + 1}.** ${member ? member.displayName : id} — ${count} invites`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📨 Top Invites')
          .setDescription(lines.join('\n'))
          .setTimestamp();
        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('invites prefix error:', error);
      await message.reply('There was an error fetching invite data.');
    }
  },
};
