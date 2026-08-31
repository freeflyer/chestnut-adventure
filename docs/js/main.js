/* Chestnut Adventure — boot */
(function () {
  'use strict';
  const CH = window.CH;

  CH.engine.init();
  CH.ui.init();

  // pick up the saved progress before the menu is built, so Chapters and the
  // finished-game title reflect it right away (Continue re-loads and navigates)
  CH.state.load();

  const lang = CH.state.settings.lang || CH.i18n.detect();
  CH.i18n.setLang(lang);

  CH.ui.showMenu();

  // debug / test API (also handy for curious players)
  CH.debug = {
    state: () => CH.state.data,
    go: (scene, spot) => { CH.ui.hideMenu(); const p = CH.engine.go(scene, spot); CH.ui.updateHud(); return p; },
    chapter: (n) => CH.chapters.start(n, { fresh: true, noCard: true }),
    give: (id) => CH.state.give(id),
    flag: (k, v) => CH.state.flag(k, v),
    flags: () => CH.state.data.flags,
    lang: (c) => CH.i18n.setLang(c),
    reset: () => { CH.state.clearSave(); location.reload(); },
  };
})();
