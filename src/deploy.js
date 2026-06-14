require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const COMMAND_LIMIT = 100;

(async () => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();

  await loadCommands(client);

  const allCommands = [...client.commands.values()].map(c => c.data.toJSON());
  const names = allCommands.map(c => c.name);
  const unique = allCommands.filter((c, i) => names.indexOf(c.name) === i);

  console.log(`[Deploy] ${unique.length} unique commands loaded`);

  if (unique.length > COMMAND_LIMIT) {
    console.warn(`[Deploy] Truncating to ${COMMAND_LIMIT} (Discord limit)`);
    unique.length = COMMAND_LIMIT;
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: unique }
    );
    console.log(`[Deploy] Registered ${unique.length} commands to guild ${process.env.GUILD_ID}`);
  } else {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: unique }
    );
    console.log(`[Deploy] Registered ${unique.length} global commands`);
  }

  process.exit(0);
})().catch(err => {
  console.error('[Deploy] Failed:', err);
  process.exit(1);
});
