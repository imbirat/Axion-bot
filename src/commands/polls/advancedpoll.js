const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { modals, buttons } = require('../../handlers/componentHandler');

const polls = new Map();

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

function buildPollEmbed(state) {
  const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
  const embed = new EmbedBuilder()
    .setColor(state.active ? 0x5865F2 : 0xED4245)
    .setTitle(state.question)
    .setDescription(state.active
      ? `Poll ends <t:${Math.floor(state.endTime / 1000)}:R>`
      : 'This poll has ended.' + (state.winningOption !== null ? `\n**Winner:** ${state.options[state.winningOption].text}` : ''));
  for (let i = 0; i < state.options.length; i++) {
    const opt = state.options[i];
    const count = opt.votes.length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(pct / 10)));
    embed.addFields({ name: opt.text, value: `${bar} ${count} vote${count !== 1 ? 's' : ''} (${pct}%)`, inline: false });
  }
  embed.setFooter({ text: `Total votes: ${total}` });
  return embed;
}

function getResultEmbed(state) {
  const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
  const sorted = [...state.options].sort((a, b) => b.votes.length - a.votes.length);
  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle(`Poll Results: ${state.question}`)
    .setDescription(`Total votes: ${total}`);
  for (let i = 0; i < sorted.length; i++) {
    const opt = sorted[i];
    const count = opt.votes.length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(pct / 10)));
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    embed.addFields({ name: `${medal} ${opt.text}`, value: `${bar} ${count} vote${count !== 1 ? 's' : ''} (${pct}%)`, inline: false });
  }
  return embed;
}

function cleanupPoll(messageId) {
  const state = polls.get(messageId);
  if (state) {
    for (let i = 0; i < state.options.length; i++) {
      buttons.delete(`poll_vote_${messageId}_${i}`);
    }
    if (state.timeout) clearTimeout(state.timeout);
    polls.delete(messageId);
  }
}

async function endPollEarly(messageId, channel) {
  const state = polls.get(messageId);
  if (!state) return false;
  state.active = false;
  if (state.timeout) clearTimeout(state.timeout);
  const max = Math.max(...state.options.map(o => o.votes.length));
  state.winningOption = max > 0 ? state.options.findIndex(o => o.votes.length === max) : null;
  cleanupPoll(messageId);
  try {
    const msg = await channel.messages.fetch(messageId);
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
    await msg.edit({ embeds: [buildPollEmbed(state)], components: [disabledRow] });
  } catch (e) {
    console.error('Error updating ended poll message:', e);
  }
  return true;
}

function makeVoteHandler(messageId, row) {
  return {
    async execute(btnInteraction, client) {
      try {
        const pollState = polls.get(messageId);
        if (!pollState || !pollState.active) {
          return btnInteraction.reply({ content: 'This poll has ended.', ephemeral: true });
        }
        if (pollState.roleRestriction) {
          const member = await btnInteraction.guild.members.fetch(btnInteraction.user.id);
          if (!member.roles.cache.has(pollState.roleRestriction)) {
            return btnInteraction.reply({ content: 'You do not have the required role to vote.', ephemeral: true });
          }
        }
        const parts = btnInteraction.customId.split('_');
        const optionIndex = parseInt(parts[parts.length - 1]);
        for (const opt of pollState.options) {
          opt.votes = opt.votes.filter(id => id !== btnInteraction.user.id);
        }
        pollState.options[optionIndex].votes.push(btnInteraction.user.id);
        try {
          const msg = await btnInteraction.channel.messages.fetch(messageId);
          await msg.edit({ embeds: [buildPollEmbed(pollState)], components: [row] });
        } catch (e) {
          console.error('Error updating poll message:', e);
        }
        await btnInteraction.reply({ content: `Voted for: **${pollState.options[optionIndex].text}**`, ephemeral: true });
      } catch (err) {
        console.error('Poll vote error:', err);
        await btnInteraction.reply({ content: 'An error occurred while voting.', ephemeral: true });
      }
    }
  };
}

async function createPollSend(channel, question, options, durationMs, roleRestriction) {
  const endTime = Date.now() + durationMs;
  const state = {
    guildId: channel.guild.id,
    channelId: channel.id,
    messageId: null,
    question,
    options: options.map(opt => ({ text: opt, votes: [] })),
    roleRestriction,
    endTime,
    active: true,
    timeout: null,
    winningOption: null
  };
  const embed = buildPollEmbed(state);
  const row = new ActionRowBuilder();
  for (let i = 0; i < options.length; i++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`poll_vote_placeholder_${i}`)
        .setLabel(options[i])
        .setStyle(ButtonStyle.Primary)
    );
  }
  const msg = await channel.send({ content: roleRestriction ? `<@&${roleRestriction}>` : null, embeds: [embed], components: [row] });
  state.messageId = msg.id;
  polls.set(msg.id, state);

  // Update button customIds with actual messageId and register handlers
  const finalRow = new ActionRowBuilder();
  for (let i = 0; i < options.length; i++) {
    const customId = `poll_vote_${msg.id}_${i}`;
    finalRow.addComponents(
      new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(options[i])
        .setStyle(ButtonStyle.Primary)
    );
    buttons.set(customId, makeVoteHandler(msg.id, finalRow));
  }
  await msg.edit({ components: [finalRow] });

  state.timeout = setTimeout(async () => {
    const s = polls.get(msg.id);
    if (!s || !s.active) return;
    s.active = false;
    const max = Math.max(...s.options.map(o => o.votes.length));
    s.winningOption = max > 0 ? s.options.findIndex(o => o.votes.length === max) : null;
    try {
      const disabledRow = new ActionRowBuilder();
      for (let i = 0; i < options.length; i++) {
        disabledRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`poll_disabled_${msg.id}_${i}`)
            .setLabel(s.options[i].text)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );
      }
      await msg.edit({ embeds: [buildPollEmbed(s)], components: [disabledRow] });
    } catch (e) {
      console.error('Error ending poll:', e);
    }
    cleanupPoll(msg.id);
  }, durationMs);

  return msg;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('advancedpoll')
    .setDescription('Manage advanced polls')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a new poll'))
    .addSubcommand(sub =>
      sub.setName('end')
        .setDescription('End a poll early')
        .addStringOption(opt =>
          opt.setName('message-id')
            .setDescription('Message ID of the poll')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('results')
        .setDescription('View poll results')
        .addStringOption(opt =>
          opt.setName('message-id')
            .setDescription('Message ID of the poll')
            .setRequired(true))),
  category: 'Polls',
  usage: '/advancedpoll create|end|results',
  description: 'Create, end, or view results for advanced polls',
  permissions: 'Everyone',
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'create') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: 'You need Administrator permission to create polls.', ephemeral: true });
        }
        const modalId = `poll_create_${interaction.user.id}`;
        const modal = new ModalBuilder()
          .setCustomId(modalId)
          .setTitle('Create Advanced Poll')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('question')
                .setLabel('Poll Question')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('What is your question?')
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('options')
                .setLabel('Options (comma separated, max 6)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Option 1, Option 2, Option 3')
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('duration')
                .setLabel('Duration (e.g. 1h, 30m, 2d)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('1h')
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('role')
                .setLabel('Required Role (optional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('@role or role name')
                .setRequired(false)
            )
          );

        modals.set(modalId, {
          async execute(modalInteraction, client) {
            try {
              const question = modalInteraction.fields.getTextInputValue('question');
              const optionsRaw = modalInteraction.fields.getTextInputValue('options');
              const durationStr = modalInteraction.fields.getTextInputValue('duration');
              const roleStr = modalInteraction.fields.getTextInputValue('role') || null;

              const options = optionsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
              if (options.length < 2) {
                return modalInteraction.reply({ content: 'Please provide at least 2 options.', ephemeral: true });
              }
              if (options.length > 6) {
                return modalInteraction.reply({ content: 'Maximum 6 options allowed.', ephemeral: true });
              }

              const durationMs = parseDuration(durationStr);
              if (!durationMs) {
                return modalInteraction.reply({ content: 'Invalid duration. Use format like `1h`, `30m`, `2d`.', ephemeral: true });
              }

              let roleRestriction = null;
              if (roleStr) {
                const roleMatch = roleStr.match(/<@&(\d+)>/);
                if (roleMatch) {
                  roleRestriction = roleMatch[1];
                } else {
                  const role = modalInteraction.guild.roles.cache.find(r => r.name.toLowerCase() === roleStr.toLowerCase());
                  if (role) roleRestriction = role.id;
                }
              }

              await modalInteraction.deferReply({ ephemeral: true });
              await createPollSend(modalInteraction.channel, question, options, durationMs, roleRestriction);
              await modalInteraction.editReply({ content: '✅ Poll created!' });
            } catch (error) {
              console.error('Poll create modal error:', error);
              const reply = { content: 'An error occurred while creating the poll.', ephemeral: true };
              if (modalInteraction.deferred) {
                await modalInteraction.editReply(reply).catch(() => {});
              } else {
                await modalInteraction.reply(reply).catch(() => {});
              }
            } finally {
              modals.delete(modalId);
            }
          }
        });

        setTimeout(() => modals.delete(modalId), 5 * 60 * 1000);
        await interaction.showModal(modal);
        return;
      }

      if (sub === 'end') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: 'You need Administrator permission to end polls.', ephemeral: true });
        }
        const messageId = interaction.options.getString('message-id');
        const state = polls.get(messageId);
        if (!state) return interaction.reply({ content: 'Poll not found or already ended.', ephemeral: true });
        await endPollEarly(messageId, interaction.channel);
        await interaction.reply({ content: '✅ Poll ended.' });
        return;
      }

      if (sub === 'results') {
        const messageId = interaction.options.getString('message-id');
        const state = polls.get(messageId);
        if (!state) return interaction.reply({ content: 'Poll not found.', ephemeral: true });
        await interaction.reply({ embeds: [getResultEmbed(state)] });
        return;
      }
    } catch (error) {
      console.error('advancedpoll command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];
      if (!sub) return message.reply('Usage: advancedpoll create|end|results');

      if (sub === 'create') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return message.reply('You need Administrator permission to create polls.');
        }
        const fullArgs = args.slice(1).join(' ');
        const parts = fullArgs.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        const cleaned = parts.map(p => p.replace(/^["']|["']$/g, ''));
        if (cleaned.length < 3) {
          return message.reply('Usage: `advancedpoll create "Question" "opt1, opt2, opt3" 1h [@role]`');
        }
        const question = cleaned[0];
        const optionsRaw = cleaned[1];
        const durationStr = cleaned[2];
        const roleStr = cleaned[3] || null;

        const options = optionsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (options.length < 2) return message.reply('Please provide at least 2 options.');
        if (options.length > 6) return message.reply('Maximum 6 options allowed.');

        const durationMs = parseDuration(durationStr);
        if (!durationMs) return message.reply('Invalid duration. Use format like `1h`, `30m`, `2d`.');

        let roleRestriction = null;
        if (roleStr) {
          const roleMatch = roleStr.match(/<@&(\d+)>/);
          if (roleMatch) {
            roleRestriction = roleMatch[1];
          } else {
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleStr.toLowerCase());
            if (role) roleRestriction = role.id;
          }
        }

        await createPollSend(message.channel, question, options, durationMs, roleRestriction);
        await message.reply('✅ Poll created!');
        return;
      }

      if (sub === 'end') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return message.reply('You need Administrator permission to end polls.');
        }
        const messageId = args[1];
        if (!messageId) return message.reply('Usage: advancedpoll end <messageId>');
        const state = polls.get(messageId);
        if (!state) return message.reply('Poll not found or already ended.');
        await endPollEarly(messageId, message.channel);
        await message.reply('✅ Poll ended.');
        return;
      }

      if (sub === 'results') {
        const messageId = args[1];
        if (!messageId) return message.reply('Usage: advancedpoll results <messageId>');
        const state = polls.get(messageId);
        if (!state) return message.reply('Poll not found.');
        await message.channel.send({ embeds: [getResultEmbed(state)] });
        return;
      }

      await message.reply('Usage: advancedpoll create|end|results');
    } catch (error) {
      console.error('advancedpoll prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
