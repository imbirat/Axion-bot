const snipeCache = {};

function push(channelId, messageData) {
  if (!snipeCache[channelId]) snipeCache[channelId] = [];
  snipeCache[channelId].unshift({
    ...messageData,
    deletedAt: new Date(),
  });
  if (snipeCache[channelId].length > 10) snipeCache[channelId].pop();
}

function get(channelId) {
  return snipeCache[channelId] || [];
}

function getLatest(channelId) {
  const messages = snipeCache[channelId];
  return messages?.[0] || null;
}

function clear(channelId) {
  delete snipeCache[channelId];
}

module.exports = { snipeCache, push, get, getLatest, clear };
