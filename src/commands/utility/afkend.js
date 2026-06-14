const { SlashCommandBuilder } = require('discord.js');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afkend')
    .setDescription('Remove your AFK status manually'),
  category: 'Utilities',
  usage: '/afkend',
  description: 'Manually remove your AFK status',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const profile = await UserProfile.findOne({ userId, guildId });
      if (!profile || !profile.afk) {
        return interaction.reply({ content: 'You are not currently AFK.', ephemeral: true });
      }

      profile.afk = false;
      profile.afkReason = null;
      profile.afkSince = null;
      await profile.save();

      await interaction.reply({ content: '✅ Welcome back, AFK has been removed.' });
    } catch (error) {
      console.error('afkend command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const userId = message.author.id;
      const guildId = message.guild.id;

      const profile = await UserProfile.findOne({ userId, guildId });
      if (!profile || !profile.afk) {
        return message.reply('You are not currently AFK.');
      }

      profile.afk = false;
      profile.afkReason = null;
      profile.afkSince = null;
      await profile.save();

      await message.channel.send('✅ Welcome back, AFK has been removed.');
    } catch (error) {
      console.error('afkend prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
