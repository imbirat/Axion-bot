const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

const polls = new Map();

function buildPollEmbed(state) {
  const total = state.options.reduce((sum, o) => sum + o.votes.length, 0);
  const embed = new EmbedBuilder()
    .setColor(state.active ? 0x5865F2 : 0xED4245)
    .setTitle(state.question)
    .setDescription(state.active
      ? `Poll ends <t:${Math.floor(state.endTime / 1000)}:R>`
      : 'This poll has ended.');
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

function makeVoteHandler(messageId, row) {
  return async (btnInteraction, client) => {
    try {
      const pollState = polls.get(messageId);
      if (!pollState || !pollState.active) {
        return btnInteraction.reply({ content: 'This poll has ended.', flags: MessageFlags.Ephemeral });
      }
      if (pollState.roleRestriction) {
        const member = await btnInteraction.guild.members.fetch(btnInteraction.user.id);
        if (!member.roles.cache.has(pollState.roleRestriction)) {
          return btnInteraction.reply({ content: 'You do not have the required role to vote.', flags: MessageFlags.Ephemeral });
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
      } catch {}
      await btnInteraction.reply({ content: `Voted for: **${pollState.options[optionIndex].text}**`, flags: MessageFlags.Ephemeral });
    } catch (err) {
      console.error('Poll vote error:', err);
      await btnInteraction.reply({ content: 'An error occurred while voting.', flags: MessageFlags.Ephemeral });
    }
  };
}

function cleanupPoll(messageId) {
  const state = polls.get(messageId);
  if (state) {
    if (state.timeout) clearTimeout(state.timeout);
    polls.delete(messageId);
  }
}

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll-create')
    .setDescription('Create a new advanced poll')
    .addStringOption(opt =>
      opt.setName('question')
        .setDescription('Poll question')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('options')
        .setDescription('Comma-separated options (max 6)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('duration')
        .setDescription('Duration (e.g. 1h, 30m, 2d)')
        .setRequired(false))
    .addRoleOption(opt =>
      opt.setName('role')
        .setDescription('Required role to vote')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Polls',
  description: 'Create an advanced poll with buttons',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');
      const optionsRaw = interaction.options.getString('options');
      const durationStr = interaction.options.getString('duration');
      const role = interaction.options.getRole('role');

      const options = optionsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (options.length < 2) {
        return interaction.reply({ content: 'Please provide at least 2 options.', flags: MessageFlags.Ephemeral });
      }
      if (options.length > 6) {
        return interaction.reply({ content: 'Maximum 6 options allowed.', flags: MessageFlags.Ephemeral });
      }

      const durationMs = durationStr ? parseDuration(durationStr) : 86400000;
      if (!durationMs) {
        return interaction.reply({ content: 'Invalid duration. Use format like `1h`, `30m`, `2d`.', flags: MessageFlags.Ephemeral });
      }

      const endTime = Date.now() + durationMs;
      const state = {
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
        messageId: null,
        question,
        options: options.map(opt => ({ text: opt, votes: [] })),
        roleRestriction: role?.id || null,
        endTime,
        active: true,
        timeout: null,
        winningOption: null,
      };

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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
      const msg = await interaction.channel.send({
        content: role ? `<@&${role.id}>` : null,
        embeds: [embed],
        components: [row],
      });

      state.messageId = msg.id;
      polls.set(msg.id, state);

      const finalRow = new ActionRowBuilder();
      for (let i = 0; i < options.length; i++) {
        const customId = `poll_vote_${msg.id}_${i}`;
        finalRow.addComponents(
          new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(options[i])
            .setStyle(ButtonStyle.Primary)
        );
        if (!client.buttons) client.buttons = new Map();
        client.buttons.set(customId, makeVoteHandler(msg.id, finalRow));
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
        } catch {}
        cleanupPoll(msg.id);
      }, durationMs);

      await interaction.editReply({ content: '✅ Poll created!' });
    } catch (error) {
      console.error('poll-create error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
      }
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const fullArgs = args.join(' ');
      const parts = fullArgs.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const cleaned = parts.map(p => p.replace(/^["']|["']$/g, ''));
      if (cleaned.length < 2) {
        return message.reply('Usage: `poll-create "Question" "opt1, opt2, opt3" [1h] [@role]`');
      }
      const question = cleaned[0];
      const optionsRaw = cleaned[1];
      const durationStr = cleaned[2] || null;
      const role = message.mentions.roles.first();

      const options = optionsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (options.length < 2) return message.reply('Please provide at least 2 options.');
      if (options.length > 6) return message.reply('Maximum 6 options allowed.');

      const durationMs = durationStr ? parseDuration(durationStr) : 86400000;
      if (!durationMs) return message.reply('Invalid duration. Use format like `1h`, `30m`, `2d`.');

      const endTime = Date.now() + durationMs;
      const state = {
        guildId: message.guild.id,
        channelId: message.channel.id,
        messageId: null,
        question,
        options: options.map(opt => ({ text: opt, votes: [] })),
        roleRestriction: role?.id || null,
        endTime,
        active: true,
        timeout: null,
        winningOption: null,
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
      const msg = await message.channel.send({
        content: role ? `<@&${role.id}>` : null,
        embeds: [embed],
        components: [row],
      });

      state.messageId = msg.id;
      polls.set(msg.id, state);

      const finalRow = new ActionRowBuilder();
      for (let i = 0; i < options.length; i++) {
        const customId = `poll_vote_${msg.id}_${i}`;
        finalRow.addComponents(
          new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(options[i])
            .setStyle(ButtonStyle.Primary)
        );
        if (!client.buttons) client.buttons = new Map();
        client.buttons.set(customId, makeVoteHandler(msg.id, finalRow));
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
        } catch {}
        cleanupPoll(msg.id);
      }, durationMs);

      await message.reply('✅ Poll created!');
    } catch (error) {
      console.error('poll-create prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
