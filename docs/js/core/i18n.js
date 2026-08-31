/* Chestnut Adventure — localization (English is default + fallback) */
(function () {
  'use strict';
  const CH = window.CH;

  const LANGS = [
    { code: 'en', name: 'English' },
    { code: 'uk', name: 'Українська' },
    { code: 'pl', name: 'Polski' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'cs', name: 'Čeština' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'fi', name: 'Suomi' },
    { code: 'sv', name: 'Svenska' },
  ];

  const dicts = {};

  CH.i18n = {
    LANGS,
    lang: 'en',
    dicts,

    register(code, dict) { dicts[code] = Object.assign(dicts[code] || {}, dict); },

    t(key, vars) {
      const d = dicts[CH.i18n.lang] || {};
      const en = dicts.en || {};
      let s = d[key] != null ? d[key] : en[key];
      if (s == null) { console.warn('[i18n] missing key:', key); return key; }
      if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
      return s;
    },

    setLang(code) {
      if (!LANGS.some((l) => l.code === code)) code = 'en';
      CH.i18n.lang = code;
      document.documentElement.lang = code;
      if (CH.state) { CH.state.settings.lang = code; CH.state.saveSettings(); }
      CH.bus.emit('lang');
    },

    detect() {
      const known = LANGS.map((l) => l.code);
      const prefs = navigator.languages || [navigator.language || 'en'];
      for (const p of prefs) {
        const base = String(p).toLowerCase().split('-')[0];
        if (known.includes(base)) return base;
      }
      return 'en';
    },
  };

  // shorthand used all over the game code
  CH.t = (key, vars) => CH.i18n.t(key, vars);
})();
