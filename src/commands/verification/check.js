const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifycheck')
    .setDescription('Check if a user is verified')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)),
  category: 'Verification',
  usage: '/verifycheck [user]',
  description: 'Check whether a user has the verified role',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user') || interaction.user;
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
      }

      const member = await interaction.guild.members.fetch(target.id);
      const verified = member.roles.cache.has(guildConfig.verifyRole);
      await interaction.reply({ content: verified ? `✅ ${target} is verified` : `❌ Not verified.`, ephemeral: true });
    } catch (error) {
      console.error('verifycheck error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const target = message.mentions.members.first() || message.member;
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return message.reply('Verification role not configured.');
      }

      const verified = target.roles.cache.has(guildConfig.verifyRole);
      await message.reply(verified ? `✅ ${target.user} is verified` : `❌ Not verified.`);
    } catch (error) {
      console.error('verifycheck prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
