const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const helpCategories = require('../../utils/helpData');
const { buildMainPage, buildCategoryPage, setSession } = require('../../components/helpers/helpViews');

const CATS_PER_PAGE = 12;

function textCategoryList(page) {
  const totalPages = Math.ceil(helpCategories.length / CATS_PER_PAGE);
  const slice = helpCategories.slice(page * CATS_PER_PAGE, (page + 1) * CATS_PER_PAGE);
  return slice.map(c => `${c.emoji}  **${c.name}**`).join('\n');
}

function textCommandList(catName, page) {
  const cat = helpCategories.find(c => c.name === catName);
  if (!cat) return 'Category not found.';
  const CMDS_PER_PAGE = 6;
  const total = Math.ceil(cat.commands.length / CMDS_PER_PAGE);
  const slice = cat.commands.slice(page * CMDS_PER_PAGE, (page + 1) * CMDS_PER_PAGE);
  const list = slice.map(c => `• **${c.name}** — ${c.description}`).join('\n');
  return `**${cat.emoji} ${cat.name}** • *${cat.description}*\n\n${list}\n\nPage ${page + 1}/${total}`;
}

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
          return interaction.reply({ content: `Category "${categoryName}" not found.`, flags: MessageFlags.Ephemeral });
        }
        const reply = await interaction.reply({ ...buildCategoryPage(category, 0, false), fetchReply: true });
        setSession(interaction.user.id, reply.id, { userId: interaction.user.id, categoryName: category.name, page: 0, sorted: false });
      } else {
        const reply = await interaction.reply({ ...buildMainPage(interaction.client, interaction.guild, 0), fetchReply: true });
        setSession(interaction.user.id, reply.id, { userId: interaction.user.id, categoryName: null, page: 0, mainPage: 0, sorted: false });
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
        await message.channel.send(textCommandList(cat.name, 0));
      } else {
        const cats = textCategoryList(0);
        const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        const serverCount = client.guilds.cache.size;
        await message.channel.send(
          `## Hey, I'm Axion\nPrefix: \`.\`\nServing **${totalUsers.toLocaleString()}** users in **${serverCount}** servers\n\n__**Categories**__\n${cats}\n\nUse \`.help <category>\` to see commands in that category.`
        );
      }
    } catch (error) {
      console.error('help prefix error:', error);
      await message.reply('There was an error executing the help command.');
    }
  },
};
