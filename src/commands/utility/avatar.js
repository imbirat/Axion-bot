const { SlashCommandBuilder, EmbedBuilder , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('View a user\'s avatar')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get the avatar of')
        .setRequired(false)
    ),
  category: 'Utilities',
  usage: '/avatar [target]',
  description: 'View a user\'s avatar in large format',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('target') || interaction.user;
      const avatarURL = target.displayAvatarURL({ size: 4096, extension: 'png' });

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}'s Avatar`)
        .setImage(avatarURL)
        .setURL(avatarURL);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('avatar command error:', error);
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

      const avatarURL = target.displayAvatarURL({ size: 4096, extension: 'png' });

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}'s Avatar`)
        .setImage(avatarURL)
        .setURL(avatarURL);

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('avatar prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
