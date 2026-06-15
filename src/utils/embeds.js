const { EmbedBuilder } = require('discord.js');

function createEmbed(options = {}) {
  const embed = new EmbedBuilder();
  if (options.color) embed.setColor(options.color);
  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.footer && options.footer !== 'none') embed.setFooter({ text: options.footer });
  if (options.timestamp) embed.setTimestamp();
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.author) embed.setAuthor(options.author);
  if (options.url) embed.setURL(options.url);
  return embed;
}

function successEmbed(description) {
  return createEmbed({ color: '#57F287', description: `✅ ${description}` });
}

function errorEmbed(description) {
  return createEmbed({ color: '#ED4245', description: `❌ ${description}` });
}

function infoEmbed(description) {
  return createEmbed({ color: '#5865F2', description });
}

module.exports = { createEmbed, successEmbed, errorEmbed, infoEmbed };
