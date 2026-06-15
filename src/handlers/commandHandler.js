const { REST, Routes, Collection } = require('discord.js');
const path = require('path');
const fs   = require('fs');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = getAllFiles(commandsPath);

  for (const file of commandFiles) {
    const command = require(file);
    if (!command?.data?.name) continue;
    client.commands.set(command.data.name, command);
  }

  console.log(`[CMD] Loaded ${client.commands.size} commands`);
}

const PRIORITY_CATEGORIES = ['Moderation', 'Config', 'Ticket', 'Utilities', 'Leveling', 'Economy', 'Starboard', 'Verification', 'Auto Role', 'Reaction Role'];

async function registerSlashCommands(client, guildId) {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const COMMAND_LIMIT = 100;
  let commands = [...client.commands.values()].map(c => c.data.toJSON());

  const names = commands.map(c => c.name);
  commands = commands.filter((c, i) => names.indexOf(c.name) === i);

  if (commands.length > COMMAND_LIMIT) {
    console.warn(`[CMD] Truncating ${commands.length} to ${COMMAND_LIMIT} by priority`);
    const cmdMap = new Map(client.commands.map(c => [c.data.name, c]));
    commands.sort((a, b) => {
      const catA = PRIORITY_CATEGORIES.indexOf(cmdMap.get(a.name)?.category);
      const catB = PRIORITY_CATEGORIES.indexOf(cmdMap.get(b.name)?.category);
      if (catA !== -1 && catB === -1) return -1;
      if (catA === -1 && catB !== -1) return 1;
      if (catA !== -1 && catB !== -1) return catA - catB;
      return 0;
    });
    commands.length = COMMAND_LIMIT;
  }

  try {
    if (guildId || process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId || process.env.GUILD_ID), { body: commands });
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    }
    console.log(`[CMD] Registered ${commands.length} slash commands`);
  } catch (err) {
    console.error('[CMD] Failed to register commands:', err);
  }
}

function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) results = results.concat(getAllFiles(full));
    else if (item.name.endsWith('.js')) results.push(full);
  }
  return results;
}

module.exports = { loadCommands, registerSlashCommands, getAllFiles };
