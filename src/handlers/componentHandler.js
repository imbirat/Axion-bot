const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const buttons = new Map();
const menus = new Map();
const modals = new Map();

function loadDirectory(map, dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const component = require(path.join(dirPath, file));
      const name = component.customId || path.basename(file, '.js');
      if (map.has(name)) {
        console.warn(chalk.yellow(`[Components] Duplicate customId: ${name} in ${file}`));
      }
      map.set(name, component);
      console.log(chalk.green(`[Components] Loaded: ${name}`));
    } catch (err) {
      console.error(chalk.red(`[Components] Failed to load ${file}:`), err);
    }
  }
}

function findHandler(map, customId) {
  const exact = map.get(customId);
  if (exact) return exact;
  for (const [key, handler] of map) {
    if (customId.startsWith(key)) return handler;
  }
  return null;
}

function loadComponents() {
  const basePath = path.join(__dirname, '..', 'components');
  loadDirectory(buttons, path.join(basePath, 'buttons'));
  loadDirectory(menus, path.join(basePath, 'menus'));
  loadDirectory(modals, path.join(basePath, 'modals'));
}

async function handleComponent(interaction, client) {
  let handler = null;

  if (interaction.isButton()) {
    handler = findHandler(buttons, interaction.customId);
  } else if (interaction.isAnySelectMenu()) {
    handler = findHandler(menus, interaction.customId);
  } else if (interaction.isModalSubmit()) {
    handler = findHandler(modals, interaction.customId);
  }

  if (!handler) {
    throw new Error(`Unknown component: ${interaction.customId}`);
  }

  return handler.execute(interaction, client);
}

module.exports = { loadComponents, handleComponent, buttons, menus, modals };
