const { EmbedBuilder } = require('discord.js');

async function generateTranscript(channel, ticketNumber) {
  const messages = [];
  let lastId = null;

  while (true) {
    const fetched = await channel.messages.fetch({ limit: 100, before: lastId });
    if (fetched.size === 0) break;
    const msgs = [...fetched.values()];
    messages.unshift(...msgs.reverse());
    lastId = msgs[0].id;
    if (fetched.size < 100) break;
  }

  let html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Ticket #${ticketNumber} Transcript</title>
<style>
  body { font-family: sans-serif; max-width: 800px; margin: auto; padding: 20px; background: #1a1a2e; color: #eee; }
  .msg { padding: 10px; margin: 5px 0; border-radius: 8px; background: #16213e; }
  .author { font-weight: bold; color: #0f3460; }
  .time { color: #aaa; font-size: 0.8em; }
  .content { margin-top: 5px; }
</style></head><body>
<h1>Ticket #${ticketNumber} Transcript</h1>
`;

  for (const msg of messages) {
    if (msg.author.bot) continue;
    html += `<div class="msg">
      <div class="author">${msg.author.username}</div>
      <div class="time">${msg.createdAt.toLocaleString()}</div>
      <div class="content">${msg.content || '(embed/sticker)'}</div>
    </div>`;
  }

  html += '</body></html>';
  return html;
}

module.exports = { generateTranscript };
