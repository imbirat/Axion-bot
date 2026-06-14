const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Show invite counts for the server or a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to check invites for')
        .setRequired(false)),
  category: 'Analytics',
  usage: '/invites [user]',
  description: 'Show invite counts grouped by inviter',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const invites = await interaction.guild.invites.fetch();

      const inviteMap = new Map();
      for (const invite of invites.values()) {
        if (!invite.inviter) continue;
        if (target && invite.inviter.id !== target.id) continue;

        const existing = inviteMap.get(invite.inviter.id) || { user: invite.inviter, total: 0, fake: 0, left: 0 };
        existing.total += invite.uses;
        inviteMap.set(invite.inviter.id, existing);
      }

      if (inviteMap.size === 0) {
        return interaction.reply({ content: target ? 'That user has no invites.' : 'No invites found.', ephemeral: true });
      }

      const sorted = [...inviteMap.values()].sort((a, b) => b.total - a.total);
      const description = sorted.map((entry, i) =>
        `**${i + 1}.** ${entry.user} — **${entry.total}** invites`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(target ? `${target.username}'s Invites` : `${interaction.guild.name} Invites`)
        .setDescription(description);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('invites error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      const invites = await message.guild.invites.fetch();

      const inviteMap = new Map();
      for (const invite of invites.values()) {
        if (!invite.inviter) continue;
        if (target && invite.inviter.id !== target.id) continue;

        const existing = inviteMap.get(invite.inviter.id) || { user: invite.inviter, total: 0, fake: 0, left: 0 };
        existing.total += invite.uses;
        inviteMap.set(invite.inviter.id, existing);
      }

      if (inviteMap.size === 0) {
        return message.reply(target ? 'That user has no invites.' : 'No invites found.');
      }

      const sorted = [...inviteMap.values()].sort((a, b) => b.total - a.total);
      const description = sorted.map((entry, i) =>
        `**${i + 1}.** ${entry.user} — **${entry.total}** invites`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(target ? `${target.username}'s Invites` : `${message.guild.name} Invites`)
        .setDescription(description);

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('invites prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
