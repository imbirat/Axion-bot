const { MessageFlags } = require('discord.js');
const path = require('path');
const fs   = require('fs');

const components = new Map();

function loadComponents() {
  const base = path.join(__dirname, '..', 'components');
  for (const folder of ['buttons', 'menus', 'modals']) {
    const dir = path.join(base, folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
      const comp = require(path.join(dir, file));
      if (comp?.customId) components.set(comp.customId, comp);
    }
  }
  console.log(`[COMP] Loaded ${components.size} components`);
}

async function handleComponent(interaction, client) {
  const id = interaction.customId;
  const handler = components.get(id)
    ?? [...components.entries()].find(([k]) => id.startsWith(k))?.[1];
  if (!handler) return;
  try {
    await handler.execute(interaction, client);
  } catch (err) {
    console.error(`[COMPONENT] Error in ${id}:`, err);
    const msg = { content: 'An error occurred while handling this interaction.', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
}

module.exports = { loadComponents, handleComponent, components, modals: components, buttons: components };
