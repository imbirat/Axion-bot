const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const chalk = require('chalk');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
    return;
  }
  const commandFiles = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        commandFiles.push(fullPath);
      }
    }
  }
  walk(commandsPath);
  for (const filePath of commandFiles) {
    try {
      const command = require(filePath);
      if (!command.data || !command.execute) {
        console.warn(chalk.yellow(`[Commands] Skipping ${filePath}: missing data or execute`));
        continue;
      }
      client.commands.set(command.data.name, command);
      console.log(chalk.green(`[Commands] Loaded: ${command.data.name}`));
    } catch (err) {
      console.error(chalk.red(`[Commands] Failed to load ${filePath}:`), err);
    }
  }
}

async function deployCommands(client) {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = [];
    for (const command of client.commands.values()) {
      commands.push(command.data.toJSON());
    }
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(chalk.green(`[Deploy] Deployed ${commands.length} commands to guild ${process.env.GUILD_ID}`));
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(chalk.green(`[Deploy] Deployed ${commands.length} global commands`));
    }
  } catch (err) {
    console.error(chalk.red('[Deploy] Failed:'), err);
  }
}

module.exports = { loadCommands, deployCommands };
