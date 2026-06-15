const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const helpCategories = require('../../utils/helpData');
const { buildMainPage, buildCategoryPage, setSession } = require('../../components/helpers/helpViews');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display the help menu'),
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
          return interaction.reply({ content: `Category "${categoryName}" not found.`, flags: MessageFlags.Ephemeral });
        }
        const reply = (await interaction.reply({ ...buildCategoryPage(category, 0, false), withResponse: true })).resource.message;
        setSession(client, interaction.user.id, reply.id, { userId: interaction.user.id, categoryName: category.name, page: 0, sorted: false });
      } else {
        const reply = (await interaction.reply({ ...buildMainPage(client, interaction.guild, 0), withResponse: true })).resource.message;
        setSession(client, interaction.user.id, reply.id, { userId: interaction.user.id, categoryName: null, page: 0, mainPage: 0, sorted: false });
      }
    } catch (error) {
      console.error('help command error:', error);
      await interaction.reply({ content: 'There was an error executing the help command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length > 0) {
        const categoryName = args.join(' ');
        const cat = helpCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!cat) {
          return message.reply(`Category "${categoryName}" not found.`);
        }
        const msg = await message.channel.send(buildCategoryPage(cat, 0, false));
        setSession(client, message.author.id, msg.id, { userId: message.author.id, categoryName: cat.name, page: 0, sorted: false });
        return;
      }

      const msg = await message.channel.send(buildMainPage(client, message.guild, 0));
      setSession(client, message.author.id, msg.id, { userId: message.author.id, categoryName: null, page: 0, mainPage: 0, sorted: false });
    } catch (error) {
      console.error('help prefix error:', error);
      await message.reply('There was an error executing the help command.');
    }
  },
};
