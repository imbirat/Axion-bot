const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const UserProfile = require('../../models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for going AFK')
        .setRequired(false)
    ),
  category: 'Utilities',
  usage: '/afk [reason]',
  description: 'Set your AFK status so others know you are away',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const reason = interaction.options.getString('reason') || 'No reason set';
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      let profile = await UserProfile.findOne({ userId, guildId });
      if (!profile) {
        profile = new UserProfile({ userId, guildId });
      }

      profile.afk = true;
      profile.afkReason = reason;
      profile.afkSince = new Date();
      await profile.save();

      await interaction.reply({ content: `${interaction.user} I've set your AFK as: ${reason}` });
    } catch (error) {
      console.error('afk command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const reason = args.join(' ') || 'No reason set';
      const userId = message.author.id;
      const guildId = message.guild.id;

      let profile = await UserProfile.findOne({ userId, guildId });
      if (!profile) {
        profile = new UserProfile({ userId, guildId });
      }

      profile.afk = true;
      profile.afkReason = reason;
      profile.afkSince = new Date();
      await profile.save();

      await message.channel.send(`${message.author} I've set your AFK as: ${reason}`);
    } catch (error) {
      console.error('afk prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
