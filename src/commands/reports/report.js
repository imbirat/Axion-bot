const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Report = require('../../models/Report');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Anonymously report a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('The user to report')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the report')
        .setRequired(true)),
  category: 'Reports',
  usage: '/report <user> <reason>',
  description: 'Submit an anonymous report against a user',
  permissions: ['Everyone'],
  cooldown: 30,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      if (target.id === interaction.user.id) {
        return interaction.reply({ content: 'You cannot report yourself.', ephemeral: true });
      }

      const report = await Report.create({
        guildId: interaction.guild.id,
        reportedUserId: target.id,
        reporterUserId: interaction.user.id,
        reason
      });

      const guildCfg = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (guildCfg?.reportChannel) {
        const channel = interaction.guild.channels.cache.get(guildCfg.reportChannel);
        if (channel) {
          const resolveBtn = new ButtonBuilder()
            .setCustomId(`report_resolve_${report._id}`)
            .setLabel('Resolve')
            .setStyle(ButtonStyle.Success);
          const dismissBtn = new ButtonBuilder()
            .setCustomId(`report_dismiss_${report._id}`)
            .setLabel('Dismiss')
            .setStyle(ButtonStyle.Danger);

          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('New Report')
            .addFields(
              { name: 'Reported User', value: `${target.tag} (<@${target.id}>)`, inline: true },
              { name: 'Reason', value: reason },
              { name: 'Report ID', value: report._id.toString() }
            )
            .setTimestamp();

          await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(resolveBtn, dismissBtn)]
          });
        }
      }

      await interaction.reply({ content: '✅ Your report has been submitted anonymously.', ephemeral: true });
    } catch (error) {
      console.error('report error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('Usage: report <@user> <reason>');
      if (target.id === message.author.id) return message.reply('You cannot report yourself.');

      const reason = args.slice(1).join(' ');
      if (!reason) return message.reply('Please provide a reason. Usage: report <@user> <reason>');

      const report = await Report.create({
        guildId: message.guild.id,
        reportedUserId: target.id,
        reporterUserId: message.author.id,
        reason
      });

      const guildCfg = await GuildConfig.findOne({ guildId: message.guild.id });
      if (guildCfg?.reportChannel) {
        const channel = message.guild.channels.cache.get(guildCfg.reportChannel);
        if (channel) {
          const resolveBtn = new ButtonBuilder()
            .setCustomId(`report_resolve_${report._id}`)
            .setLabel('Resolve')
            .setStyle(ButtonStyle.Success);
          const dismissBtn = new ButtonBuilder()
            .setCustomId(`report_dismiss_${report._id}`)
            .setLabel('Dismiss')
            .setStyle(ButtonStyle.Danger);

          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('New Report')
            .addFields(
              { name: 'Reported User', value: `${target.tag} (<@${target.id}>)`, inline: true },
              { name: 'Reason', value: reason },
              { name: 'Report ID', value: report._id.toString() }
            )
            .setTimestamp();

          await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(resolveBtn, dismissBtn)]
          });
        }
      }

      await message.reply('✅ Your report has been submitted anonymously.');
    } catch (error) {
      console.error('report prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
