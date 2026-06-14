const Ticket = require('../models/Ticket');

async function generateTranscript(channel) {
  try {
    const messages = [];
    let lastId = null;
    let fetchedCount = 0;

    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;

      const fetched = await channel.messages.fetch(options);
      if (fetched.size === 0) break;

      fetchedCount += fetched.size;
      messages.push(...fetched.values());
      lastId = fetched.last().id;
    }

    messages.reverse();

    const html = buildTranscriptHTML(messages, channel);

    return html;
  } catch (error) {
    console.error('generateTranscript error:', error);
    throw error;
  }
}

function buildTranscriptHTML(messages, channel) {
  const lines = messages.map(msg => {
    const timestamp = msg.createdAt.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    const avatarUrl = msg.author.displayAvatarURL({ dynamic: true, size: 32 });
    const content = escapeHtml(msg.content || '');
    const authorTag = escapeHtml(msg.author.tag);
    const authorId = msg.author.id;

    let attachmentsHtml = '';
    if (msg.attachments.size > 0) {
      attachmentsHtml = msg.attachments.map(att => {
        if (att.contentType?.startsWith('image/')) {
          return `<br><img src="${att.url}" alt="${escapeHtml(att.name)}" style="max-width:400px;max-height:300px;">`;
        }
        return `<br><a href="${att.url}" target="_blank">📎 ${escapeHtml(att.name)}</a>`;
      }).join('');
    }

    let embedsHtml = '';
    if (msg.embeds.length > 0) {
      embedsHtml = '<div class="embeds">' + msg.embeds.map(embed => {
        let html = '<div class="embed">';
        if (embed.title) html += `<strong>${escapeHtml(embed.title)}</strong><br>`;
        if (embed.description) html += `${escapeHtml(embed.description)}<br>`;
        if (embed.image?.url) html += `<img src="${embed.image.url}" style="max-width:300px;max-height:200px;">`;
        if (embed.thumbnail?.url) html += `<img src="${embed.thumbnail.url}" style="max-width:100px;max-height:100px;float:right;">`;
        html += '</div>';
        return html;
      }).join('') + '</div>';
    }

    const stickerHtml = msg.stickers.size > 0
      ? `<br><img src="${msg.stickers.first().url}" style="max-width:160px;max-height:160px;">`
      : '';

    return `
      <div class="message">
        <img class="avatar" src="${avatarUrl}" alt="">
        <div class="message-content">
          <span class="author" data-id="${authorId}">${authorTag}</span>
          <span class="timestamp">${timestamp}</span>
          <div class="text">${content}${attachmentsHtml}${embedsHtml}${stickerHtml}</div>
        </div>
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcript - #${escapeHtml(channel.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #2c2f33; color: #dcddde; padding: 20px; }
    .header { text-align: center; padding: 20px; border-bottom: 1px solid #4f545c; margin-bottom: 20px; }
    .header h1 { font-size: 24px; color: #fff; }
    .header p { color: #b9bbbe; margin-top: 5px; }
    .message { display: flex; padding: 10px 0; border-bottom: 1px solid #40444b; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
    .message-content { flex: 1; min-width: 0; }
    .author { font-weight: 600; color: #fff; cursor: pointer; }
    .author:hover { text-decoration: underline; }
    .timestamp { font-size: 11px; color: #72767d; margin-left: 8px; }
    .text { margin-top: 4px; word-wrap: break-word; }
    .embeds { margin-top: 8px; }
    .embed { background: #32353b; border-left: 4px solid #5865f2; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px; }
    img { border-radius: 4px; margin-top: 4px; }
    a { color: #00b0f4; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Transcript - #${escapeHtml(channel.name)}</h1>
    <p>${messages.length} messages | ${new Date().toLocaleString()}</p>
  </div>
  ${lines}
</body>
</html>`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function saveTranscript(ticket) {
  try {
    const { channelId } = ticket;
    const { Client } = require('discord.js');
    const html = await generateTranscript({ messages: { fetch: async () => new Map() }, name: 'unknown' });

    await Ticket.findByIdAndUpdate(ticket._id || ticket.id, { transcript: html });
    return html;
  } catch (error) {
    console.error('saveTranscript error:', error);
    throw error;
  }
}

module.exports = { generateTranscript, saveTranscript };
