const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Show server activity stats'),
  category: 'Analytics',
  usage: '/activity',
  description: 'Show server activity stats including messages today and active voice users',
  permissions: 'Everyone',
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const channels = guild.channels.cache;

      const textChannels = channels.filter(c => c.isTextBased());
      const voiceChannels = channels.filter(c => c.isVoice());

      const activeVoice = voiceChannels.reduce((count, c) => count + c.members.size, 0);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name} Activity Stats`)
        .addFields(
          { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Online Members', value: `${guild.members.cache.filter(m => m.presence?.status !== 'offline').size}`, inline: true },
          { name: 'Voice Users', value: `${activeVoice}`, inline: true },
          { name: 'Text Channels', value: `${textChannels.size}`, inline: true },
          { name: 'Voice Channels', value: `${voiceChannels.size}`, inline: true },
          { name: 'Total Channels', value: `${guild.channels.cache.size}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('activity error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guild = message.guild;
      const channels = guild.channels.cache;

      const textChannels = channels.filter(c => c.isTextBased());
      const voiceChannels = channels.filter(c => c.isVoice());

      const activeVoice = voiceChannels.reduce((count, c) => count + c.members.size, 0);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name} Activity Stats`)
        .addFields(
          { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Online Members', value: `${guild.members.cache.filter(m => m.presence?.status !== 'offline').size}`, inline: true },
          { name: 'Voice Users', value: `${activeVoice}`, inline: true },
          { name: 'Text Channels', value: `${textChannels.size}`, inline: true },
          { name: 'Voice Channels', value: `${voiceChannels.size}`, inline: true },
          { name: 'Total Channels', value: `${guild.channels.cache.size}`, inline: true }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('activity prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
