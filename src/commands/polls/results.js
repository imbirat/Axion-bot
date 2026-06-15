const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const polls = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll-results')
    .setDescription('Show live poll results')
    .addStringOption(opt =>
      opt.setName('message-id')
        .setDescription('Message ID of the poll')
        .setRequired(true)),
  category: 'Polls',
  description: 'Shows live results for a poll',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const messageId = interaction.options.getString('message-id');
      const state = polls.get(messageId);
      if (!state) {
        return interaction.reply({ content: 'Poll not found.', flags: MessageFlags.Ephemeral });
      }

      const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
      const sorted = [...state.options].sort((a, b) => b.votes.length - a.votes.length);
      const embed = new EmbedBuilder()
        .setColor(state.active ? 0x5865F2 : 0x57F287)
        .setTitle(`Poll Results: ${state.question}`)
        .setDescription(`Total votes: ${total} | Status: ${state.active ? 'Active' : 'Ended'}`);

      for (let i = 0; i < sorted.length; i++) {
        const opt = sorted[i];
        const count = opt.votes.length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(pct / 10)));
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        embed.addFields({
          name: `${medal} ${opt.text}`,
          value: `${bar} ${count} vote${count !== 1 ? 's' : ''} (${pct}%)`,
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('poll-results error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const messageId = args[0];
      if (!messageId) return message.reply('Usage: poll-results <messageId>');

      const state = polls.get(messageId);
      if (!state) return message.reply('Poll not found.');

      const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
      const sorted = [...state.options].sort((a, b) => b.votes.length - a.votes.length);
      const embed = new EmbedBuilder()
        .setColor(state.active ? 0x5865F2 : 0x57F287)
        .setTitle(`Poll Results: ${state.question}`)
        .setDescription(`Total votes: ${total} | Status: ${state.active ? 'Active' : 'Ended'}`);

      for (let i = 0; i < sorted.length; i++) {
        const opt = sorted[i];
        const count = opt.votes.length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(pct / 10)));
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        embed.addFields({
          name: `${medal} ${opt.text}`,
          value: `${bar} ${count} vote${count !== 1 ? 's' : ''} (${pct}%)`,
          inline: false,
        });
      }

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('poll-results prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
