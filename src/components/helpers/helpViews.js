const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const helpCategories = require('../../utils/helpData');

const CATS_PER_PAGE = 12;
const CMDS_PER_PAGE = 6;

function buildMainPage(client, guild, page) {
  const totalPages = Math.ceil(helpCategories.length / CATS_PER_PAGE);
  const slice = helpCategories.slice(page * CATS_PER_PAGE, (page + 1) * CATS_PER_PAGE);
  const categoryList = slice.map(c => `${c.emoji}  » **${c.name}**`).join('\n');
  const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
  const serverCount = client.guilds.cache.size;

  const container = new ContainerBuilder()
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## Hey, I'm Axion\n\n` +
            `• My prefix for this server is \`.\`\n` +
            `• Type \`.help\` for more\n` +
            `• Serving **${totalUsers.toLocaleString()}** users across **${serverCount}** servers`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ size: 128 }))
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(categoryList))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `__**Links**__\n` +
        `[Invite me](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) • ` +
        `[Support](https://discord.gg/axion)`
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_select_category')
          .setPlaceholder('Select a category...')
          .addOptions(
            helpCategories.map(c =>
              new StringSelectMenuOptionBuilder()
                .setLabel(c.name)
                .setValue(c.name)
                .setEmoji(c.emoji)
                .setDescription(c.description.slice(0, 50))
            )
          )
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_main_prev')
          .setLabel('<')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('help_main_page_label')
          .setLabel(`${page + 1} / ${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('help_main_next')
          .setLabel('>')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages - 1)
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('-# Powered By **Axion Team**')
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

function buildCategoryPage(category, page, sorted) {
  let cmds = sorted
    ? [...category.commands].sort((a, b) => a.name.localeCompare(b.name))
    : category.commands;
  const totalPages = Math.ceil(cmds.length / CMDS_PER_PAGE);
  const slice = cmds.slice(page * CMDS_PER_PAGE, (page + 1) * CMDS_PER_PAGE);
  const commandList = slice.map(c => `• **${c.name}** — ${c.description}`).join('\n');

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${category.emoji}  ${category.name}**\n*${category.description}*`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(commandList + `\n\n-# Page ${page + 1} of ${totalPages}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_switch_category')
          .setPlaceholder('Switch category...')
          .addOptions(
            helpCategories.map(c =>
              new StringSelectMenuOptionBuilder()
                .setLabel(c.name)
                .setValue(c.name)
                .setEmoji(c.emoji)
                .setDefault(c.name === category.name)
            )
          )
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_command_detail')
          .setPlaceholder('Select a command for details...')
          .addOptions(
            slice.map(c =>
              new StringSelectMenuOptionBuilder()
                .setLabel(c.name)
                .setValue(c.name)
                .setDescription(c.description.slice(0, 50))
            )
          )
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_cat_prev')
          .setLabel('<')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('help_cat_page_label')
          .setLabel(`${page + 1} / ${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('help_cat_next')
          .setLabel('>')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages - 1),
        new ButtonBuilder()
          .setCustomId('help_sort_toggle')
          .setLabel('↕')
          .setStyle(sorted ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_close')
          .setLabel('✖')
          .setStyle(ButtonStyle.Danger)
      )
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

function buildCommandDetail(category, command) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${category.emoji} ${command.name}**\n` +
        `*${command.description}*\n\n` +
        `**Usage:** \`${command.usage}\`\n` +
        `**Permission:** ${command.perms}\n` +
        `**Cooldown:** ${command.cooldown}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_detail_back')
          .setLabel('← Back')
          .setStyle(ButtonStyle.Secondary)
      )
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

const helpSessions = new Map();

function getSession(userId, messageId) {
  return helpSessions.get(`${userId}_${messageId}`);
}

function setSession(userId, messageId, data) {
  const key = `${userId}_${messageId}`;
  helpSessions.set(key, data);
  setTimeout(() => helpSessions.delete(key), 2 * 60 * 1000);
  return data;
}

function deleteSession(userId, messageId) {
  helpSessions.delete(`${userId}_${messageId}`);
}

async function handleHelpInteraction(interaction) {
  const session = getSession(interaction.user.id, interaction.message.id);
  if (!session || session.userId !== interaction.user.id) {
    return interaction.reply({ content: '❌ This menu is not for you.', ephemeral: true });
  }
  await interaction.deferUpdate();
  const { customId } = interaction;

  if (customId === 'help_select_category' || customId === 'help_switch_category') {
    const catName = interaction.values[0];
    const cat = helpCategories.find(c => c.name === catName);
    session.categoryName = catName;
    session.page = 0;
    session.sorted = false;
    await interaction.editReply(buildCategoryPage(cat, 0, false));
  } else if (customId === 'help_cat_prev') {
    session.page--;
    const cat = helpCategories.find(c => c.name === session.categoryName);
    await interaction.editReply(buildCategoryPage(cat, session.page, session.sorted));
  } else if (customId === 'help_cat_next') {
    session.page++;
    const cat = helpCategories.find(c => c.name === session.categoryName);
    await interaction.editReply(buildCategoryPage(cat, session.page, session.sorted));
  } else if (customId === 'help_sort_toggle') {
    session.sorted = !session.sorted;
    const cat = helpCategories.find(c => c.name === session.categoryName);
    await interaction.editReply(buildCategoryPage(cat, session.page, session.sorted));
  } else if (customId === 'help_command_detail') {
    const cmdName = interaction.values[0];
    const cat = helpCategories.find(c => c.name === session.categoryName);
    const cmd = cat.commands.find(c => c.name === cmdName);
    await interaction.editReply(buildCommandDetail(cat, cmd));
  } else if (customId === 'help_detail_back') {
    const cat = helpCategories.find(c => c.name === session.categoryName);
    await interaction.editReply(buildCategoryPage(cat, session.page, session.sorted));
  } else if (customId === 'help_main_prev') {
    session.mainPage = (session.mainPage ?? 0) - 1;
    await interaction.editReply(buildMainPage(interaction.client, interaction.guild, session.mainPage));
  } else if (customId === 'help_main_next') {
    session.mainPage = (session.mainPage ?? 0) + 1;
    await interaction.editReply(buildMainPage(interaction.client, interaction.guild, session.mainPage));
  } else if (customId === 'help_close') {
    deleteSession(interaction.user.id, interaction.message.id);
    await interaction.deleteReply();
  }
}

module.exports = { buildMainPage, buildCategoryPage, buildCommandDetail, helpSessions, getSession, setSession, deleteSession, handleHelpInteraction };
