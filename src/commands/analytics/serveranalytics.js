const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serveranalytics')
    .setDescription('Show server growth statistics'),
  category: 'Analytics',
  usage: '/serverstats',
  description: 'Show server growth stats including member count and join/leave ratio',
  permissions: 'Everyone',
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const memberCount = guild.memberCount;
      const premiumCount = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const createdDate = Math.floor(guild.createdTimestamp / 1000);
      const joinedDate = Math.floor(interaction.member.joinedTimestamp / 1000);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name} Server Stats`)
        .addFields(
          { name: 'Total Members', value: `${memberCount}`, inline: true },
          { name: 'Boosts', value: `${premiumCount} (Tier ${boostTier})`, inline: true },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Created', value: `<t:${createdDate}:D>`, inline: true },
          { name: 'You Joined', value: `<t:${joinedDate}:D>`, inline: true },
          { name: 'Role Count', value: `${guild.roles.cache.size}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('serverstats error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guild = message.guild;
      const memberCount = guild.memberCount;
      const premiumCount = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const createdDate = Math.floor(guild.createdTimestamp / 1000);
      const joinedDate = Math.floor(message.member.joinedTimestamp / 1000);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${guild.name} Server Stats`)
        .addFields(
          { name: 'Total Members', value: `${memberCount}`, inline: true },
          { name: 'Boosts', value: `${premiumCount} (Tier ${boostTier})`, inline: true },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Created', value: `<t:${createdDate}:D>`, inline: true },
          { name: 'You Joined', value: `<t:${joinedDate}:D>`, inline: true },
          { name: 'Role Count', value: `${guild.roles.cache.size}`, inline: true }
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('serverstats prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
