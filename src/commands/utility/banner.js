const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('View a user\'s banner')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get the banner of')
        .setRequired(false)
    ),
  category: 'Utilities',
  usage: '/banner [target]',
  description: 'View a user\'s banner image if they have one',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('target') || interaction.user;
      const user = await client.users.fetch(target.id, { force: true });
      const bannerURL = user.bannerURL({ size: 4096 });

      if (!bannerURL) {
        return interaction.reply({ content: `${target.username} does not have a banner.`, flags: MessageFlags.Ephemeral });
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}'s Banner`)
        .setImage(bannerURL)
        .setURL(bannerURL);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('banner command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      let target = message.author;
      if (args.length > 0) {
        const mention = message.mentions.users.first();
        if (mention) target = mention;
      }

      const user = await client.users.fetch(target.id, { force: true });
      const bannerURL = user.bannerURL({ size: 4096 });

      if (!bannerURL) {
        return message.reply(`${target.username} does not have a banner.`);
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}'s Banner`)
        .setImage(bannerURL)
        .setURL(bannerURL);

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('banner prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
