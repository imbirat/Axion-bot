const path = require('path');
const fs   = require('fs');

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = getAllFiles(eventsPath);
  let count = 0;

  for (const file of eventFiles) {
    const event = require(file);
    if (!event?.name) continue;
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else            client.on(event.name,   (...args) => event.execute(...args, client));
    count++;
  }

  console.log(`[EVT] Loaded ${count} events`);
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

module.exports = { loadEvents };
