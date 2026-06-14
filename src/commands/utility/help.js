const { SlashCommandBuilder } = require('discord.js');
const helpCategories = require('../../utils/helpData');
const { buildMainPage, buildCategoryPage, setSession } = require('../../components/helpers/helpViews');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display the help menu')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category to view')
        .setRequired(false)
    ),
  category: 'Utilities',
  usage: '/help [category]',
  description: 'Display the interactive help menu with all commands',
  permissions: [],
  cooldown: 3,
  async execute(interaction, client) {
    try {
      const categoryName = interaction.options.getString('category');

      if (categoryName) {
        const category = helpCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          return interaction.reply({ content: `Category "${categoryName}" not found.`, ephemeral: true });
        }
        const reply = await interaction.reply({ ...buildCategoryPage(category, 0, false), fetchReply: true });
        setSession(interaction.user.id, reply.id, { userId: interaction.user.id, categoryName: category.name, page: 0, sorted: false });
      } else {
        const reply = await interaction.reply({ ...buildMainPage(interaction.client, interaction.guild, 0), fetchReply: true });
        setSession(interaction.user.id, reply.id, { userId: interaction.user.id, categoryName: null, page: 0, mainPage: 0, sorted: false });
      }
    } catch (error) {
      console.error('help command error:', error);
      await interaction.reply({ content: 'There was an error executing the help command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length > 0) {
        const categoryName = args.join(' ');
        const category = helpCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          return message.reply(`Category "${categoryName}" not found. Use .help to see all categories.`);
        }
        const msg = await message.channel.send(buildCategoryPage(category, 0, false));
        setSession(message.author.id, msg.id, { userId: message.author.id, categoryName: category.name, page: 0, sorted: false });
      } else {
        const msg = await message.channel.send(buildMainPage(client, message.guild, 0));
        setSession(message.author.id, msg.id, { userId: message.author.id, categoryName: null, page: 0, mainPage: 0, sorted: false });
      }
    } catch (error) {
      console.error('help prefix error:', error);
      await message.reply('There was an error executing the help command.');
    }
  },
};
