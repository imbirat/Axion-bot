const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyall')
    .setDescription('Verify all current members')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  usage: '/verifyall',
  description: 'Assign the verify role to every current server member',
  permissions: ['Administrator'],
  cooldown: 60,
  async execute(interaction, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
      }

      await interaction.deferReply();
      const members = await interaction.guild.members.fetch();
      const role = interaction.guild.roles.cache.get(guildConfig.verifyRole);
      if (!role) return interaction.editReply({ content: 'Verify role not found.' });

      let count = 0;
      for (const [, member] of members) {
        if (!member.roles.cache.has(role.id) && !member.user.bot) {
          await member.roles.add(role.id).catch(() => {});
          count++;
        }
      }

      await interaction.editReply({ content: `✅ Verified ${count} members.` });
    } catch (error) {
      console.error('verifyall error:', error);
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
      if (!guildConfig || !guildConfig.verifyRole) {
        return message.reply('Verification role not configured.');
      }

      const members = await message.guild.members.fetch();
      const role = message.guild.roles.cache.get(guildConfig.verifyRole);
      if (!role) return message.reply('Verify role not found.');

      let count = 0;
      for (const [, member] of members) {
        if (!member.roles.cache.has(role.id) && !member.user.bot) {
          await member.roles.add(role.id).catch(() => {});
          count++;
        }
      }

      await message.reply(`✅ Verified ${count} members.`);
    } catch (error) {
      console.error('verifyall prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
