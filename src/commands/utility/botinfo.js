const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('View information about the bot'),
  category: 'Utilities',
  usage: '/botinfo',
  description: 'View detailed information about Axion bot',
  permissions: [],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const owner = await client.application.fetch();
      const ownerTag = owner.owner ? `${owner.owner.username}` : 'Unknown';
      const serverCount = client.guilds.cache.size;
      const ping = client.ws.ping;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Axion')
        .setDescription(`Axion is an all-in-one bot providing premium features for free.\n\nNode.js (22.x.x)     Ping: ${ping}ms\nOwner: @${ownerTag}    Servers: ${serverCount}`)
        .setFooter({ text: 'made by Axion-team' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Support')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/axion'),
        new ButtonBuilder()
          .setLabel('Invite Bot')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('botinfo command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const owner = await client.application.fetch();
      const ownerTag = owner.owner ? `${owner.owner.username}` : 'Unknown';
      const serverCount = client.guilds.cache.size;
      const ping = client.ws.ping;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Axion')
        .setDescription(`Axion is an all-in-one bot providing premium features for free.\n\nNode.js (22.x.x)     Ping: ${ping}ms\nOwner: @${ownerTag}    Servers: ${serverCount}`)
        .setFooter({ text: 'made by Axion-team' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Support')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/axion'),
        new ButtonBuilder()
          .setLabel('Invite Bot')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
      );

      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('botinfo prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
