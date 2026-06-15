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
        const cmds = cat.commands.map(c => `• **${c.name}** — ${c.description}`).join('\n');
        return message.channel.send(`**${cat.emoji} ${cat.name}** • *${cat.description}*\n\n${cmds}`);
      }

      const totalPages = Math.ceil(helpCategories.length / CATS_PER_PAGE);
      const slice = helpCategories.slice(0, CATS_PER_PAGE);
      const categoryList = slice.map(c => `${c.emoji}  **${c.name}**`).join('\n');
      const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      const serverCount = client.guilds.cache.size;

      const msg = await message.channel.send(
        `## Hey, I'm Axion\n\n` +
        `Prefix: \`.\`\n` +
        `Serving **${totalUsers.toLocaleString()}** users in **${serverCount}** servers\n\n` +
        `__**Categories**__\n${categoryList}\n\n` +
        `Use \`.help <category>\` to see commands in that category.\n` +
        `-# Page 1 of ${totalPages}`
      );

      if (totalPages > 1) {
        await msg.react('⬅️');
        await msg.react('➡️');
        const collector = msg.createReactionCollector({ filter: (reaction, user) => user.id === message.author.id && ['⬅️', '➡️'].includes(reaction.emoji.name), time: 120000, dispose: true });
        let currentPage = 0;
        collector.on('collect', async (reaction) => {
          if (reaction.emoji.name === '➡️' && currentPage < totalPages - 1) currentPage++;
          else if (reaction.emoji.name === '⬅️' && currentPage > 0) currentPage--;
          else return;
          await reaction.users.remove(message.author.id);
          const newSlice = helpCategories.slice(currentPage * CATS_PER_PAGE, (currentPage + 1) * CATS_PER_PAGE);
          const newCategoryList = newSlice.map(c => `${c.emoji}  **${c.name}**`).join('\n');
          await msg.edit(
            `## Hey, I'm Axion\n\n` +
            `Prefix: \`.\`\n` +
            `Serving **${totalUsers.toLocaleString()}** users in **${serverCount}** servers\n\n` +
            `__**Categories**__\n${newCategoryList}\n\n` +
            `Use \`.help <category>\` to see commands in that category.\n` +
            `-# Page ${currentPage + 1} of ${totalPages}`
          );
        });
        collector.on('end', async () => {
          try { await msg.reactions.removeAll(); } catch {}
        });
      }
    } catch (error) {
      console.error('help prefix error:', error);
      await message.reply('There was an error executing the help command.');
    }
  },
};
