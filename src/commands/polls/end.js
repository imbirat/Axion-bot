const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

const polls = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll-end')
    .setDescription('End a poll early')
    .addStringOption(opt =>
      opt.setName('message-id')
        .setDescription('Message ID of the poll')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Polls',
  description: 'Closes a poll and shows results',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const messageId = interaction.options.getString('message-id');
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const state = polls.get(messageId);
      if (!state) {
        const { default: advancedpoll } = require('./advancedpoll.js');
        const advPolls = advancedpoll.polls;
        if (!advPolls || !advPolls.get(messageId)) {
          return interaction.editReply({ content: 'Poll not found or already ended.' });
        }
      }

      if (state) {
        state.active = false;
        if (state.timeout) clearTimeout(state.timeout);
        const max = Math.max(...state.options.map(o => o.votes.length));
        state.winningOption = max > 0 ? state.options.findIndex(o => o.votes.length === max) : null;

        try {
          const msg = await interaction.channel.messages.fetch(messageId);
          const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
          const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle(`Poll Results: ${state.question}`)
            .setDescription(`Total votes: ${total}`);
          for (const opt of state.options) {
            const count = opt.votes.length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(pct / 10)));
            embed.addFields({ name: opt.text, value: `${bar} ${count} vote${count !== 1 ? 's' : ''} (${pct}%)`, inline: false });
          }

          const disabledRow = new ActionRowBuilder();
          for (let i = 0; i < state.options.length; i++) {
            disabledRow.addComponents(
              new ButtonBuilder()
                .setCustomId(`poll_disabled_${messageId}_${i}`)
                .setLabel(state.options[i].text)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            );
          }
          await msg.edit({ embeds: [embed], components: [disabledRow] });
        } catch {}

        if (state.timeout) clearTimeout(state.timeout);
        polls.delete(messageId);
      }

      await interaction.editReply({ content: '✅ Poll ended.' });
    } catch (error) {
      console.error('poll-end error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
      }
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const messageId = args[0];
      if (!messageId) return message.reply('Usage: poll-end <messageId>');

      const state = polls.get(messageId);
      if (!state) return message.reply('Poll not found or already ended.');

      state.active = false;
      if (state.timeout) clearTimeout(state.timeout);
      const max = Math.max(...state.options.map(o => o.votes.length));
      state.winningOption = max > 0 ? state.options.findIndex(o => o.votes.length === max) : null;

      try {
        const msg = await message.channel.messages.fetch(messageId);
        const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
        const embed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle(`Poll Results: ${state.question}`)
          .setDescription(`Total votes: ${total}`);
        for (const opt of state.options) {
          const count = opt.votes.length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(pct / 10)));
          embed.addFields({ name: opt.text, value: `${bar} ${count} vote${count !== 1 ? 's' : ''} (${pct}%)`, inline: false });
        }

        const disabledRow = new ActionRowBuilder();
        for (let i = 0; i < state.options.length; i++) {
          disabledRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`poll_disabled_${messageId}_${i}`)
              .setLabel(state.options[i].text)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );
        }
        await msg.edit({ embeds: [embed], components: [disabledRow] });
      } catch {}

      polls.delete(messageId);
      await message.reply('✅ Poll ended.');
    } catch (error) {
      console.error('poll-end prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
