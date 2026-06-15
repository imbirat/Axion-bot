const ms = require('ms');

function formatDuration(msValue) {
  if (!msValue || msValue <= 0) return '0s';
  const seconds = Math.floor(msValue / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatNumber(num) {
  if (!num) return '0';
  return num.toLocaleString();
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return `<t:${Math.floor(d.getTime() / 1000)}:F>`;
}

function formatRelative(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return `<t:${Math.floor(d.getTime() / 1000)}:R>`;
}

function parseTime(input) {
  if (!input) return null;
  const parsed = ms(input);
  if (parsed) return parsed;
  const date = new Date(input);
  if (!isNaN(date.getTime())) return date.getTime() - Date.now();
  return null;
}

module.exports = { formatDuration, formatNumber, formatDate, formatRelative, parseTime };
