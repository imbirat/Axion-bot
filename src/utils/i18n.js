const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');
const GuildConfig = require('../models/GuildConfig');

const langCache = new Map();

async function initI18n() {
  await i18next.use(Backend).init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}.json'),
    },
    interpolation: { escapeValue: false },
  });
}

async function t(guildId, key, vars = {}) {
  let lang = langCache.get(guildId);
  if (!lang) {
    try {
      const config = await GuildConfig.findOne({ guildId });
      lang = config?.language ?? 'en';
    } catch {
      lang = 'en';
    }
    langCache.set(guildId, lang);
  }
  return i18next.t(key, { lng: lang, ...vars, defaultValue: key });
}

function clearCache(guildId) {
  langCache.delete(guildId);
}

module.exports = { initI18n, t, clearCache };
