const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View leaderboards')
    .addSubcommand(sub => sub
      .setName('xp')
      .setDescription('XP leaderboard'))
    .addSubcommand(sub => sub
      .setName('economy')
      .setDescription('Economy leaderboard')),
  category: 'Leveling',
  usage: '/leaderboard <xp|economy>',
  description: 'Shows XP or economy leaderboard',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand(false) || 'xp';
      if (sub === 'xp') {
        const top = await UserProfile.find({ guildId: interaction.guild.id })
          .sort({ level: -1, xp: -1 })
          .limit(10);
        if (!top.length) {
          return interaction.reply({ content: 'No XP data in this server yet.', flags: MessageFlags.Ephemeral });
        }
        const lines = top.map((p, i) => {
          const member = interaction.guild.members.cache.get(p.userId);
          const name = member ? member.displayName : p.userId;
          return `**${i + 1}.** ${name} — Level ${p.level} (${p.xp} XP)`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🏆 XP Leaderboard')
          .setDescription(lines.join('\n'));
        await interaction.reply({ embeds: [embed] });
      } else if (sub === 'economy') {
        const allProfiles = await UserProfile.find({ guildId: interaction.guild.id })
          .sort({ balance: -1 })
          .lean();

        const pages = [];
        const pageSize = 10;
        for (let i = 0; i < allProfiles.length; i += pageSize) {
          pages.push(allProfiles.slice(i, i + pageSize));
        }

        if (pages.length === 0) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFFD700).setTitle('🏆 Economy Leaderboard').setDescription('No users found.')] });
        }

        let currentPage = 0;

        const buildEmbed = (page) => {
          const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🏆 Economy Leaderboard')
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` });

          const medals = ['🥇', '🥈', '🥉'];
          let description = '';
          const startRank = page * pageSize;
          for (let i = 0; i < pages[page].length; i++) {
            const p = pages[page][i];
            const rank = startRank + i + 1;
            const medal = medals[i] || `#${rank}`;
            description += `${medal} <@${p.userId}> — 🪙 ${p.balance.toLocaleString()}\n`;
          }
          embed.setDescription(description);
          return embed;
        };

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('◀ Previous')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(pages.length <= 1)
          );

        const reply = await interaction.reply({ embeds: [buildEmbed(0)], components: [row] });

        if (pages.length <= 1) return;

        const filter = i => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
          if (i.customId === 'prev') currentPage = Math.max(0, currentPage - 1);
          else currentPage = Math.min(pages.length - 1, currentPage + 1);

          const newRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀ Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === pages.length - 1)
            );

          await i.update({ embeds: [buildEmbed(currentPage)], components: [newRow] });
        });

        collector.on('end', async () => {
          const disabledRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀ Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            );
          await reply.edit({ components: [disabledRow] }).catch(() => {});
        });
      }
    } catch (error) {
      console.error('leaderboard command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = (args[0] || 'xp').toLowerCase();
      if (sub === 'xp') {
        const top = await UserProfile.find({ guildId: message.guild.id })
          .sort({ level: -1, xp: -1 })
          .limit(10);
        if (!top.length) return message.reply('No XP data in this server yet.');
        const lines = top.map((p, i) => {
          const member = message.guild.members.cache.get(p.userId);
          const name = member ? member.displayName : p.userId;
          return `**${i + 1}.** ${name} — Level ${p.level} (${p.xp} XP)`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🏆 XP Leaderboard')
          .setDescription(lines.join('\n'));
        await message.channel.send({ embeds: [embed] });
      } else if (sub === 'economy') {
        const allProfiles = await UserProfile.find({ guildId: message.guild.id })
          .sort({ balance: -1 })
          .lean();

        const pages = [];
        const pageSize = 10;
        for (let i = 0; i < allProfiles.length; i += pageSize) {
          pages.push(allProfiles.slice(i, i + pageSize));
        }

        if (pages.length === 0) {
          return message.channel.send({ embeds: [new EmbedBuilder().setColor(0xFFD700).setTitle('🏆 Economy Leaderboard').setDescription('No users found.')] });
        }

        let currentPage = 0;

        const buildEmbed = (page) => {
          const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🏆 Economy Leaderboard')
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` });

          const medals = ['🥇', '🥈', '🥉'];
          let description = '';
          const startRank = page * pageSize;
          for (let i = 0; i < pages[page].length; i++) {
            const p = pages[page][i];
            const rank = startRank + i + 1;
            const medal = medals[i] || `#${rank}`;
            description += `${medal} <@${p.userId}> — 🪙 ${p.balance.toLocaleString()}\n`;
          }
          embed.setDescription(description);
          return embed;
        };

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('◀ Previous')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(pages.length <= 1)
          );

        const reply = await message.channel.send({ embeds: [buildEmbed(0)], components: [row] });

        if (pages.length <= 1) return;

        const filter = i => i.user.id === message.author.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
          if (i.customId === 'prev') currentPage = Math.max(0, currentPage - 1);
          else currentPage = Math.min(pages.length - 1, currentPage + 1);

          const newRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀ Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === pages.length - 1)
            );

          await i.update({ embeds: [buildEmbed(currentPage)], components: [newRow] });
        });

        collector.on('end', async () => {
          const disabledRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀ Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            );
          await reply.edit({ components: [disabledRow] }).catch(() => {});
        });
      } else {
        await message.reply('Usage: !leaderboard <xp|economy>');
      }
    } catch (error) {
      console.error('leaderboard prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
