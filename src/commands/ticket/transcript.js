const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const transcriptService = require('../../services/transcriptService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickettranscript')
    .setDescription('Generate and receive a transcript of this ticket'),
  category: 'Ticket',
  usage: '/tickettranscript',
  description: 'Generate a transcript of the current ticket and DM it to you',
  permissions: ['ManageChannels'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (guildConfig?.ticketSupportRole) {
        const hasRole = interaction.member.roles.cache.has(guildConfig.ticketSupportRole);
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!hasRole && !isAdmin) {
          return interaction.reply({ content: 'You do not have permission to view transcripts.', ephemeral: true });
        }
      }

      await interaction.deferReply({ ephemeral: true });
      const html = await transcriptService.generateTranscript(interaction.channel);
      const buffer = Buffer.from(html, 'utf-8');

      try {
        await interaction.user.send({
          files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.html` }]
        });
        await interaction.editReply({ content: '✅ Transcript has been sent to your DMs.' });
      } catch (e) {
        await interaction.editReply({ content: '❌ Could not DM you. Please enable DMs.' });
      }
    } catch (error) {
      console.error('tickettranscript error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
      }
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (guildConfig?.ticketSupportRole) {
        const hasRole = message.member.roles.cache.has(guildConfig.ticketSupportRole);
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!hasRole && !isAdmin) {
          return message.reply('You do not have permission to view transcripts.');
        }
      }

      const html = await transcriptService.generateTranscript(message.channel);
      const buffer = Buffer.from(html, 'utf-8');

      try {
        await message.author.send({
          files: [{ attachment: buffer, name: `transcript-${message.channel.name}.html` }]
        });
        await message.reply('✅ Transcript has been sent to your DMs.');
      } catch (e) {
        await message.reply('❌ Could not DM you. Please enable DMs.');
      }
    } catch (error) {
      console.error('tickettranscript prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
