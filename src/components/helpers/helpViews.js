const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { helpCategories } = require('../../utils/helpData');

const CATEGORIES_PER_PAGE = 6;
const COMMANDS_PER_PAGE = 5;

function buildMainEmbed(categories, page) {
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
      inline: true
    });
  }

  return embed;
}

function buildMainComponents(categories, page, session) {
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
  const start = page * CATEGORIES_PER_PAGE;
  const end = start + CATEGORIES_PER_PAGE;
  const pageCategories = categories.slice(start, end);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_select_category')
    .setPlaceholder('Select a category...')
    .addOptions(
      pageCategories.map(cat => ({
        label: cat.name,
        value: cat.name,
        description: cat.description,
        emoji: cat.emoji
      }))
    );

  const row1 = new ActionRowBuilder().addComponents(selectMenu);
  const row2 = new ActionRowBuilder();

  row2.addComponents(
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

  return [row1, row2];
}

function buildCategoryEmbed(category, commands, page) {
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
      inline: false
    });
  }

  return embed;
}

function buildCategoryComponents(category, commands, session) {
  const totalPages = Math.ceil(commands.length / COMMANDS_PER_PAGE);
  const start = session.categoryPage * COMMANDS_PER_PAGE;
  const end = start + COMMANDS_PER_PAGE;
  const pageCommands = commands.slice(start, end);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_command_detail')
    .setPlaceholder('View command details...')
    .addOptions(
      pageCommands.map(cmd => ({
        label: cmd.name,
        value: cmd.name,
        description: cmd.description.substring(0, 100)
      }))
    );

  const row1 = new ActionRowBuilder().addComponents(selectMenu);
  const row2 = new ActionRowBuilder();

  row2.addComponents(
    new ButtonBuilder()
      .setCustomId('help_cat_prev')
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(session.categoryPage === 0),
    new ButtonBuilder()
      .setCustomId('help_cat_next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(session.categoryPage >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId('help_sort_toggle')
      .setLabel(session.sortAlphabetical ? 'Sort: A-Z' : 'Sort: Default')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔤'),
    new ButtonBuilder()
      .setCustomId('help_detail_back')
      .setLabel('Back')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('↩')
  );

  return [row1, row2];
}

function buildDetailEmbed(command, category) {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`${category?.emoji || ''} ${command.name}`)
    .setDescription(command.description)
    .addFields(
      { name: 'Usage', value: `\`${command.usage}\``, inline: false },
      { name: 'Category', value: category?.name || 'N/A', inline: true },
      { name: 'Cooldown', value: `${command.cooldown}s`, inline: true },
      { name: 'Permissions', value: command.perms.length ? command.perms.join(', ') : 'None', inline: true }
    )
    .setTimestamp();
}

function buildDetailComponents() {
  return [
    new ActionRowBuilder().addComponents(
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
    )
  ];
}

module.exports = {
  buildMainEmbed, buildMainComponents, buildCategoryEmbed,
  buildCategoryComponents, buildDetailEmbed, buildDetailComponents,
  CATEGORIES_PER_PAGE, COMMANDS_PER_PAGE
};
