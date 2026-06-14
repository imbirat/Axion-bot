const { EmbedBuilder } = require('discord.js');

function successEmbed(message) {
  return new EmbedBuilder()
    .setColor(0x57F287)
    .setDescription(`✅ ${message}`);
}

function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(0xED4245)
    .setDescription(`❌ ${message}`);
}

function warnEmbed(message) {
  return new EmbedBuilder()
    .setColor(0xFEE75C)
    .setDescription(`⚠️ ${message}`);
}

function infoEmbed(message) {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setDescription(`ℹ️ ${message}`);
}

module.exports = { successEmbed, errorEmbed, warnEmbed, infoEmbed };
