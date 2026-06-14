const cache = new Map();

module.exports = {
  set(channelId, data) {
    cache.set(channelId, data);
  },
  get(channelId) {
    return cache.get(channelId) || null;
  },
  delete(channelId) {
    cache.delete(channelId);
  },
  clear() {
    cache.clear();
  },
};
