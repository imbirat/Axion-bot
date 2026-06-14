const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

const instances = new Map();

function getInstance(lng) {
  if (instances.has(lng)) return instances.get(lng);
  const instance = i18next.createInstance();
  instance.use(Backend).init({
    lng,
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '..', 'locales', '{{lng}}.json'),
    },
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
  instances.set(lng, instance);
  return instance;
}

async function t(guildId, key, vars = {}) {
  try {
    const instance = getInstance(guildId || 'en');
    return await instance.t(key, vars);
  } catch {
    return key;
  }
}

function clearCache(guildId) {
  instances.delete(guildId);
}

module.exports = { t, clearCache };
