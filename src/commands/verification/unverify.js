const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unverify')
    .setDescription('Remove verify role from a user')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to unverify').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Remove verify role from a user',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) {
      return interaction.reply({ content: 'Verification role not configured.', flags: MessageFlags.Ephemeral });
    }
    const member = await interaction.guild.members.fetch(target.id);
    await member.roles.remove(guildConfig.verifyRole).catch(() => {});
    await interaction.reply({ content: `✅ Removed verify role from ${target}.`, flags: MessageFlags.Ephemeral });
    if (guildConfig.verifyLogChannel) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0xED4245).setTitle('User Unverified')
          .setDescription(`<@${target.id}> was unverified by <@${interaction.user.id}>`)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  },
  async prefixExecute(message, args, client) {
    const target = message.mentions.members.first();
    if (!target) return message.reply('Usage: unverify <@user>');
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification role not configured.');
    await target.roles.remove(guildConfig.verifyRole).catch(() => {});
    await message.reply(`✅ Removed verify role from ${target.user}.`);
    if (guildConfig.verifyLogChannel) {
      const logChannel = message.guild.channels.cache.get(guildConfig.verifyLogChannel);
      if (logChannel) {
        const { EmbedBuilder } = require('discord.js');
        const logEmbed = new EmbedBuilder()
          .setColor(0xED4245).setTitle('User Unverified')
          .setDescription(`<@${target.id}> was unverified by <@${message.author.id}>`)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  },
};
