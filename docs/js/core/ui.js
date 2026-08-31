/* Chestnut Adventure — HTML UI: menu, modals, HUD, inventory, cards */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U;

  let ui, hud, invBar, toastEl, cardEl, curtain, skipEl, ghostEl, creditsEl, menuEl;
  let openOverlay = null;
  let ghostMove = null;

  const UI = {
    selectedItem: null,
    paused: false,

    init() {
      ui = document.getElementById('ui');
      const box = document.getElementById('stage-box');

      curtain = U.el('div', '', box); curtain.id = 'curtain';
      U.el('div', 'cinema-bar top', ui);
      U.el('div', 'cinema-bar bottom', ui);

      hud = U.el('div', '', ui); hud.id = 'hud';
      const pauseBtn = U.el('button', 'btn icon', hud, '&#10073;&#10073;');
      pauseBtn.title = '';
      pauseBtn.setAttribute('data-i18n-title', 'ui.pause');
      pauseBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
      pauseBtn.addEventListener('click', (e) => { e.stopPropagation(); UI.togglePause(); });

      invBar = U.el('div', '', ui); invBar.id = 'inventory';
      toastEl = U.el('div', '', ui); toastEl.id = 'toast';
      cardEl = U.el('div', '', ui); cardEl.id = 'chapter-card';
      creditsEl = U.el('div', '', ui); creditsEl.id = 'credits';
      skipEl = U.el('div', '', ui); skipEl.id = 'skip-hint'; skipEl.style.display = 'none';
      ghostEl = U.el('div', '', ui); ghostEl.id = 'item-ghost'; ghostEl.style.display = 'none';

      CH.bus.on('inv', (ev) => { UI.renderInventory(ev && ev.added); });
      CH.bus.on('lang', () => UI.refreshLabels());
      CH.bus.on('scene', () => { UI.renderInventory(); UI.updateHud(); });

      window.addEventListener('pointermove', (ev) => {
        if (ghostMove) ghostMove(ev);
      });
    },

    // ---------------------------------------------------------- helpers
    refreshLabels() {
      document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = CH.t(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = CH.t(el.getAttribute('data-i18n-title')); });
    },

    label(el, key) {
      el.setAttribute('data-i18n', key);
      el.textContent = CH.t(key);
      return el;
    },

    updateHud() {
      const inGame = CH.engine.def && !CH.engine.def.noHero;
      hud.style.display = inGame ? 'flex' : 'none';
      invBar.style.display = inGame ? 'flex' : 'none';
    },

    // ---------------------------------------------------------- main menu
    async showMenu() {
      UI.closeOverlay();
      UI.selectItem(null);
      await CH.engine.go('title', null, { instant: false });
      if (menuEl) menuEl.remove();
      menuEl = U.el('div', '', ui); menuEl.id = 'menu';

      const logo = U.el('div', 'logo', menuEl);
      U.el('div', 'logo-top', logo).textContent = CH.t('ui.a_tiny_tale');
      logo.querySelector('.logo-top').setAttribute('data-i18n', 'ui.a_tiny_tale');
      U.el('h1', '', logo, 'Chestnut<br>Adventure');

      const btns = U.el('div', 'menu-buttons', menuEl);

      if (CH.state.hasSave()) {
        const cont = UI.label(U.el('button', 'btn', btns), 'ui.continue');
        cont.addEventListener('click', () => { CH.audio.sfx('ui'); UI.continueGame(); });
      }
      const ng = UI.label(U.el('button', 'btn', btns), 'ui.new_game');
      ng.addEventListener('click', async () => {
        CH.audio.sfx('ui');
        if (CH.state.hasSave()) {
          const ok = await UI.confirm('ui.new_game_confirm');
          if (!ok) return;
        }
        UI.hideMenu();
        CH.state.clearSave();
        CH.state.newGame();
        CH.chapters.start(1);
      });
      if (CH.state.hasSave() || CH.state.data.maxChapter > 1 || CH.state.data.finished) {
        const chb = UI.label(U.el('button', 'btn', btns), 'ui.chapters');
        chb.addEventListener('click', () => { CH.audio.sfx('ui'); UI.chaptersModal(); });
      }
      const st = UI.label(U.el('button', 'btn', btns), 'ui.settings');
      st.addEventListener('click', () => { CH.audio.sfx('ui'); UI.settingsModal(); });

      const note = U.el('div', 'menu-note', menuEl);
      note.setAttribute('data-i18n', 'ui.menu_note');
      note.textContent = CH.t('ui.menu_note');

      requestAnimationFrame(() => menuEl.classList.add('show'));
      UI.updateHud();
    },

    hideMenu() {
      if (menuEl) { menuEl.remove(); menuEl = null; }
    },

    continueGame() {
      if (!CH.state.load()) { UI.toast('ui.no_save'); return; }
      UI.hideMenu();
      const d = CH.state.data;
      if (d.finished && !d.scene) { CH.chapters.start(1); return; }
      CH.engine.go(d.scene, d.spot, { noCheckpoint: false });
      UI.updateHud();
    },

    // ---------------------------------------------------------- modals
    buildOverlay() {
      UI.closeOverlay();
      const ov = U.el('div', 'overlay', ui);
      openOverlay = ov;
      requestAnimationFrame(() => ov.classList.add('show'));
      ov.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      return ov;
    },
    closeOverlay() {
      if (openOverlay) { openOverlay.remove(); openOverlay = null; }
    },

    confirm(key) {
      return new Promise((res) => {
        const ov = UI.buildOverlay();
        const m = U.el('div', 'modal', ov);
        U.el('h2', '', m).textContent = CH.t(key);
        const bs = U.el('div', 'buttons', m);
        const yes = UI.label(U.el('button', 'btn', bs), 'ui.yes');
        const no = UI.label(U.el('button', 'btn', bs), 'ui.no');
        yes.addEventListener('click', () => { CH.audio.sfx('ui'); UI.closeOverlay(); res(true); });
        no.addEventListener('click', () => { CH.audio.sfx('ui'); UI.closeOverlay(); res(false); });
      });
    },

    settingsModal(onClose) {
      const ov = UI.buildOverlay();
      const m = U.el('div', 'modal', ov);
      UI.label(U.el('h2', '', m), 'ui.settings');

      // sound toggle
      const r1 = U.el('div', 'row', m);
      UI.label(U.el('span', '', r1), 'ui.sound');
      const tog = U.el('div', 'toggle' + (CH.state.settings.sound ? ' on' : ''), r1);
      tog.addEventListener('click', () => {
        CH.state.settings.sound = !CH.state.settings.sound;
        CH.state.saveSettings();
        tog.classList.toggle('on', CH.state.settings.sound);
        CH.audio.unlock();
        CH.audio.applyVolume();
        CH.audio.sfx('ui');
      });

      // language
      const r2 = U.el('div', 'row', m);
      UI.label(U.el('span', '', r2), 'ui.language');
      const sel = U.el('select', '', r2);
      CH.i18n.LANGS.forEach((l) => {
        const o = U.el('option', '', sel, l.name);
        o.value = l.code;
        if (l.code === CH.i18n.lang) o.selected = true;
      });
      sel.addEventListener('change', () => { CH.i18n.setLang(sel.value); });

      const bs = U.el('div', 'buttons', m);
      const back = UI.label(U.el('button', 'btn', bs), 'ui.back');
      back.addEventListener('click', () => {
        CH.audio.sfx('ui');
        UI.closeOverlay();
        if (onClose) onClose();
      });
    },

    chaptersModal(onClose) {
      const ov = UI.buildOverlay();
      const m = U.el('div', 'modal', ov);
      UI.label(U.el('h2', '', m), 'ui.chapters');
      const grid = U.el('div', 'chapters-grid', m);
      const total = Object.keys(CH.chapters.DEFS).length;
      const max = CH.state.data.finished ? total : CH.state.data.maxChapter;
      for (let n = 1; n <= total; n++) {
        const b = U.el('button', 'btn' + (n > max ? ' locked' : ''), grid);
        b.textContent = n + '. ' + CH.t('ch.' + n + '.title');
        b.setAttribute('data-ch', n);
        if (n > max) { b.disabled = true; }
        else b.addEventListener('click', () => {
          CH.audio.sfx('ui');
          UI.closeOverlay();
          UI.hideMenu();
          CH.chapters.start(n, { fresh: true });
        });
      }
      const bs = U.el('div', 'buttons', m);
      const back = UI.label(U.el('button', 'btn', bs), 'ui.back');
      back.addEventListener('click', () => { CH.audio.sfx('ui'); UI.closeOverlay(); if (onClose) onClose(); });
    },

    // ---------------------------------------------------------- pause
    togglePause() {
      if (CH.cut.running) return;
      if (!CH.engine.def || CH.engine.def.noHero) return;
      if (UI.paused) { UI.resume(); return; }
      UI.paused = true;
      CH.engine.lock(true);
      const ov = UI.buildOverlay();
      const m = U.el('div', 'modal', ov);
      UI.label(U.el('h2', '', m), 'ui.paused');
      const bs = U.el('div', 'buttons', m);

      const cont = UI.label(U.el('button', 'btn', bs), 'ui.resume');
      cont.addEventListener('click', () => { CH.audio.sfx('ui'); UI.resume(); });

      const rst = UI.label(U.el('button', 'btn', bs), 'ui.restart_chapter');
      rst.addEventListener('click', async () => {
        CH.audio.sfx('ui');
        const ok = await UI.confirm('ui.restart_confirm');
        if (!ok) { UI.togglePauseReopen(); return; }
        UI.resume();
        CH.chapters.restart();
      });

      const st = UI.label(U.el('button', 'btn', bs), 'ui.settings');
      st.addEventListener('click', () => {
        CH.audio.sfx('ui');
        UI.settingsModal(() => UI.togglePauseReopen());
      });

      const mm = UI.label(U.el('button', 'btn', bs), 'ui.main_menu');
      mm.addEventListener('click', () => {
        CH.audio.sfx('ui');
        UI.resume();
        UI.showMenu();
      });
    },
    togglePauseReopen() {
      UI.paused = false;
      CH.engine.lock(false);
      UI.togglePause();
    },
    resume() {
      UI.paused = false;
      UI.closeOverlay();
      CH.engine.lock(false);
    },

    // ---------------------------------------------------------- inventory
    renderInventory(popId) {
      if (!invBar) return;
      invBar.innerHTML = '';
      CH.state.data.inv.forEach((id) => {
        const slot = U.el('div', 'inv-slot' + (UI.selectedItem === id ? ' selected' : '') + (popId === id ? ' pop' : ''), invBar);
        const svg = document.createElementNS(CH.S.NS, 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        slot.appendChild(svg);
        if (CH.items && CH.items[id]) CH.items[id](svg);
        slot.addEventListener('pointerenter', (ev) => CH.engine.showLabel(CH.t('item.' + id), ev.clientX, ev.clientY));
        slot.addEventListener('pointermove', (ev) => CH.engine.showLabel(CH.t('item.' + id), ev.clientX, ev.clientY));
        slot.addEventListener('pointerleave', () => CH.engine.hideLabel());
        slot.addEventListener('pointerdown', (ev) => {
          ev.stopPropagation();
          CH.audio.sfx('tap');
          UI.selectItem(UI.selectedItem === id ? null : id, ev);
        });
      });
    },

    selectItem(id, ev) {
      UI.selectedItem = id;
      UI.renderInventory();
      if (id && CH.items[id]) {
        ghostEl.style.display = 'block';
        ghostEl.innerHTML = '';
        const svg = document.createElementNS(CH.S.NS, 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        ghostEl.appendChild(svg);
        CH.items[id](svg);
        ghostMove = (e) => {
          const r = CH.engine.box.getBoundingClientRect();
          ghostEl.style.left = (e.clientX - r.left) + 'px';
          ghostEl.style.top = (e.clientY - r.top) + 'px';
        };
        // place it immediately (touch devices get no hover-move until the next tap)
        if (ev) ghostMove(ev);
      } else {
        ghostEl.style.display = 'none';
        ghostMove = null;
      }
    },

    // ---------------------------------------------------------- toast / cards
    toast(key) {
      toastEl.textContent = CH.t(key);
      toastEl.classList.add('show');
      clearTimeout(toastEl.__t);
      toastEl.__t = setTimeout(() => toastEl.classList.remove('show'), 2800);
    },

    /** whileCovered: runs while the card is still fully opaque, so whatever it
        swaps in is revealed by the fade-out instead of the old scene flashing */
    chapterCard(n, whileCovered) {
      return new Promise((res) => {
        cardEl.innerHTML = '';
        U.el('div', 'ch-num', cardEl).textContent = CH.t('ui.chapter') + ' ' + n;
        U.el('div', 'ch-title', cardEl).textContent = CH.t('ch.' + n + '.title');
        const orn = document.createElementNS(CH.S.NS, 'svg');
        orn.setAttribute('viewBox', '0 0 160 20');
        orn.classList.add('ch-orn');
        orn.innerHTML = '<path d="M5 10 H60 M100 10 H155" stroke="#e08b2d" stroke-width="2" stroke-linecap="round"/>'
          + '<circle cx="80" cy="10" r="6" fill="#7aa348"/><circle cx="80" cy="10" r="2.6" fill="#8a4a22"/>';
        cardEl.appendChild(orn);
        cardEl.classList.add('show');
        CH.audio.sfx('bell');
        setTimeout(async () => {
          if (whileCovered) { try { await whileCovered(); } catch (e) { console.error(e); } }
          cardEl.classList.remove('show');
          setTimeout(res, 700);
        }, 2400);
      });
    },

    /** the end card never outlives the scene it was shown over */
    hideCredits() { if (creditsEl) creditsEl.classList.remove('show'); },

    async credits() {
      creditsEl.innerHTML = '';
      U.el('div', 'big', creditsEl).textContent = CH.t('ui.the_end');
      U.el('div', 'line', creditsEl).textContent = CH.t('ui.credits_line1');
      U.el('div', 'line', creditsEl).textContent = CH.t('ui.credits_line2');
      const b = UI.label(U.el('button', 'btn', creditsEl), 'ui.main_menu');
      creditsEl.classList.add('show');
      await new Promise((res) => b.addEventListener('click', res, { once: true }));
      CH.audio.sfx('ui');
      creditsEl.classList.remove('show');
      UI.showMenu();
    },

    // ---------------------------------------------------------- skip button
    showSkip(fn) {
      skipEl.style.display = 'block';
      skipEl.innerHTML = '';
      const b = U.el('button', 'btn small', skipEl);
      b.setAttribute('data-i18n', 'ui.skip');
      b.textContent = CH.t('ui.skip');
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    },
    hideSkip() { skipEl.style.display = 'none'; },
    pulseSkip() {
      const b = skipEl.querySelector('.btn');
      if (!b) return;
      b.style.transform = 'scale(1.12)';
      setTimeout(() => { b.style.transform = ''; }, 160);
    },
  };

  CH.ui = UI;
})();
