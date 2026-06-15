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

async function registerSlashCommands(client, guildId) {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = [...client.commands.values()].map(c => c.data.toJSON());
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    }
    console.log('[CMD] Slash commands registered');
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
