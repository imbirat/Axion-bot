const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyall')
    .setDescription('Assign verify role to all current members')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Assign verify role to all current members',
  permissions: ['Administrator'],
  cooldown: 60,
  async execute(interaction, client) {
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) {
      return interaction.reply({ content: 'Verification role not configured.', flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply();
    const members = await interaction.guild.members.fetch();
    const role = interaction.guild.roles.cache.get(guildConfig.verifyRole);
    if (!role) return interaction.editReply({ content: 'Verify role not found.' });
    let count = 0;
    for (const [, m] of members) {
      if (!m.roles.cache.has(role.id) && !m.user.bot) {
        await m.roles.add(role.id).catch(() => {});
        count++;
      }
    }
    await interaction.editReply({ content: `✅ Verified ${count} members.` });
    if (guildConfig.verifyLogChannel) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
      if (logChannel) {
        const { EmbedBuilder } = require('discord.js');
        const logEmbed = new EmbedBuilder()
          .setColor(0x57F287).setTitle('Mass Verification')
          .setDescription(`<@${interaction.user.id}> verified ${count} members via /verifyall`)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  },
  async prefixExecute(message, args, client) {
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification role not configured.');
    const members = await message.guild.members.fetch();
    const role = message.guild.roles.cache.get(guildConfig.verifyRole);
    if (!role) return message.reply('Verify role not found.');
    let count = 0;
    for (const [, m] of members) {
      if (!m.roles.cache.has(role.id) && !m.user.bot) {
        await m.roles.add(role.id).catch(() => {});
        count++;
      }
    }
    await message.reply(`✅ Verified ${count} members.`);
    if (guildConfig.verifyLogChannel) {
      const logChannel = message.guild.channels.cache.get(guildConfig.verifyLogChannel);
      if (logChannel) {
        const { EmbedBuilder } = require('discord.js');
        const logEmbed = new EmbedBuilder()
          .setColor(0x57F287).setTitle('Mass Verification')
          .setDescription(`<@${message.author.id}> verified ${count} members via prefix verifyall`)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  },
};
