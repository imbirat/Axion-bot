const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
    return;
  }
  const eventFiles = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        eventFiles.push(fullPath);
      }
    }
  }
  walk(eventsPath);
  for (const filePath of eventFiles) {
    try {
      const event = require(filePath);
      const eventName = event.name || path.basename(filePath, '.js');
      if (event.once) {
        client.once(eventName, (...args) => event.execute(...args, client));
      } else {
        client.on(eventName, (...args) => event.execute(...args, client));
      }
      console.log(chalk.green(`[Events] Loaded: ${eventName}`));
    } catch (err) {
      console.error(chalk.red(`[Events] Failed to load ${filePath}:`), err);
    }
  }
}

module.exports = { loadEvents };
