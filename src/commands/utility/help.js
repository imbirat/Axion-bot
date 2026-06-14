const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { helpCategories } = require('../../utils/helpData');

const CATEGORIES_PER_PAGE = 6;
const COMMANDS_PER_PAGE = 5;

function buildMainPage(categories, page) {
  const start = page * CATEGORIES_PER_PAGE;
  const end = start + CATEGORIES_PER_PAGE;
  const pageCategories = categories.slice(start, end);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Axion Help Menu')
    .setDescription('Select a category below to view its commands.')
    .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

  for (const cat of pageCategories) {
    embed.addFields({
      name: `${cat.emoji} ${cat.name}`,
      value: `${cat.description}\n\`/${cat.commands.length} commands\``,
      inline: true,
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_select_category')
    .setPlaceholder('Select a category...')
    .addOptions(
      pageCategories.map(cat => ({
        label: cat.name,
        value: cat.name,
        description: cat.description,
        emoji: cat.emoji,
      }))
    );

  const row1 = new ActionRowBuilder().addComponents(selectMenu);
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_main_prev')
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('help_main_next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId('help_close')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖')
  );

  return { embeds: [embed], components: [row1, row2] };
}

function buildCategoryPage(category, page, sortAlpha) {
  const commands = sortAlpha
    ? [...category.commands].sort((a, b) => a.name.localeCompare(b.name))
    : category.commands;
  const start = page * COMMANDS_PER_PAGE;
  const end = start + COMMANDS_PER_PAGE;
  const pageCommands = commands.slice(start, end);
  const totalPages = Math.ceil(commands.length / COMMANDS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`${category.emoji} ${category.name} Commands`)
    .setDescription(category.description)
    .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

  for (const cmd of pageCommands) {
    embed.addFields({
      name: cmd.usage,
      value: `${cmd.description}\nCooldown: ${cmd.cooldown}s${cmd.perms.length ? ` | Perms: ${cmd.perms.join(', ')}` : ''}`,
      inline: false,
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_command_detail')
    .setPlaceholder('View command details...')
    .addOptions(
      pageCommands.map(cmd => ({
        label: cmd.name,
        value: cmd.name,
        description: cmd.description.substring(0, 100),
      }))
    );

  const row1 = new ActionRowBuilder().addComponents(selectMenu);
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_cat_prev')
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('help_cat_next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId('help_sort_toggle')
      .setLabel(sortAlpha ? 'Sort: A-Z' : 'Sort: Default')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔤'),
    new ButtonBuilder()
      .setCustomId('help_detail_back')
      .setLabel('Back')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('↩')
  );

  return { embeds: [embed], components: [row1, row2] };
}

function buildCommandDetail(command, category) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`${category?.emoji || ''} ${command.name}`)
    .setDescription(command.description)
    .addFields(
      { name: 'Usage', value: `\`${command.usage}\``, inline: false },
      { name: 'Category', value: category?.name || 'N/A', inline: true },
      { name: 'Cooldown', value: `${command.cooldown}s`, inline: true },
      { name: 'Permissions', value: command.perms.length ? command.perms.join(', ') : 'None', inline: true }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_detail_back')
      .setLabel('Back')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('↩'),
    new ButtonBuilder()
      .setCustomId('help_close')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖')
  );

  return { embeds: [embed], components: [row] };
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
      if (!client.helpSessions) client.helpSessions = new Map();

      const existing = client.helpSessions.get(interaction.user.id);
      if (existing && existing.timeout) clearTimeout(existing.timeout);

      const categoryName = interaction.options.getString('category');

      if (categoryName) {
        const category = helpCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          return interaction.reply({ content: `Category "${categoryName}" not found.`, ephemeral: true });
        }

        const session = { category: category.name, categoryPage: 0, sortAlphabetical: false, timeout: null };
        session.timeout = setTimeout(() => client.helpSessions.delete(interaction.user.id), 120000);
        client.helpSessions.set(interaction.user.id, session);

        await interaction.reply(buildCategoryPage(category, 0, false));
      } else {
        const session = { mainPage: 0, timeout: null };
        session.timeout = setTimeout(() => client.helpSessions.delete(interaction.user.id), 120000);
        client.helpSessions.set(interaction.user.id, session);

        await interaction.reply(buildMainPage(helpCategories, 0));
      }
    } catch (error) {
      console.error('help command error:', error);
      await interaction.reply({ content: 'There was an error executing the help command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (!client.helpSessions) client.helpSessions = new Map();

      const userId = message.author.id;
      const existing = client.helpSessions.get(userId);
      if (existing && existing.timeout) clearTimeout(existing.timeout);

      if (args.length > 0) {
        const categoryName = args.join(' ');
        const category = helpCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          return message.reply(`Category "${categoryName}" not found. Use .help to see all categories.`);
        }

        const session = { category: category.name, categoryPage: 0, sortAlphabetical: false, timeout: null };
        session.timeout = setTimeout(() => client.helpSessions.delete(userId), 120000);
        client.helpSessions.set(userId, session);

        await message.channel.send(buildCategoryPage(category, 0, false));
      } else {
        const session = { mainPage: 0, timeout: null };
        session.timeout = setTimeout(() => client.helpSessions.delete(userId), 120000);
        client.helpSessions.set(userId, session);

        await message.channel.send(buildMainPage(helpCategories, 0));
      }
    } catch (error) {
      console.error('help prefix error:', error);
      await message.reply('There was an error executing the help command.');
    }
  },
};
