/* Chestnut Adventure — game state, checkpoints, saves (localStorage) */
(function () {
  'use strict';
  const CH = window.CH;

  const SAVE_KEY = 'chestnutAdventure.save.v1';
  const SETTINGS_KEY = 'chestnutAdventure.settings.v1';

  const defaults = () => ({
    chapter: 1,
    maxChapter: 1,
    finished: false,
    scene: null,
    spot: null,
    flags: {},
    inv: [],
    clicks: {},
  });

  const deep = (o) => JSON.parse(JSON.stringify(o));

  const ST = {
    data: defaults(),
    settings: { sound: true, lang: null },
    chapterSnap: null,          // state snapshot at the start of the current chapter
    checkpoint: null,           // { scene, spot } — respawn point, position only

    // ---------- settings ----------
    loadSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) Object.assign(ST.settings, JSON.parse(raw));
      } catch (e) {}
    },
    saveSettings() {
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(ST.settings)); } catch (e) {}
    },

    // ---------- save / load ----------
    hasSave() {
      try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    },
    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          data: ST.data,
          chapterSnap: ST.chapterSnap,
          checkpoint: ST.checkpoint,
        }));
      } catch (e) {}
    },
    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const obj = JSON.parse(raw);
        if (!obj || !obj.data || !obj.data.scene) return false;
        ST.data = Object.assign(defaults(), obj.data);
        ST.chapterSnap = obj.chapterSnap || null;
        ST.checkpoint = obj.checkpoint || null;
        return true;
      } catch (e) { return false; }
    },
    clearSave() {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    },
    newGame() {
      ST.data = defaults();
      ST.chapterSnap = null;
      ST.checkpoint = null;
    },

    // ---------- flags & inventory ----------
    flag(k, v) {
      ST.data.flags[k] = v === undefined ? true : v;
      ST.save();
    },
    has(k) { return !!ST.data.flags[k]; },
    val(k) { return ST.data.flags[k]; },

    give(id) {
      if (!ST.data.inv.includes(id)) {
        ST.data.inv.push(id);
        ST.save();
        CH.bus.emit('inv', { added: id });
      }
    },
    take(id) {
      const i = ST.data.inv.indexOf(id);
      if (i >= 0) { ST.data.inv.splice(i, 1); ST.save(); CH.bus.emit('inv', { removed: id }); }
    },
    hasItem(id) { return ST.data.inv.includes(id); },

    // escalating-hint click counter
    bumpClick(id) {
      ST.data.clicks[id] = (ST.data.clicks[id] || 0) + 1;
      return ST.data.clicks[id];
    },

    // ---------- checkpoints / chapters ----------
    setCheckpoint(scene, spot) {
      ST.checkpoint = { scene, spot };
      ST.save();
    },
    startChapter(n) {
      ST.data.chapter = n;
      ST.data.maxChapter = Math.max(ST.data.maxChapter, n);
      ST.chapterSnap = deep(ST.data);
      ST.save();
    },
    chapterRestartData() {
      return ST.chapterSnap ? deep(ST.chapterSnap) : null;
    },
  };

  ST.loadSettings();
  CH.state = ST;
})();
