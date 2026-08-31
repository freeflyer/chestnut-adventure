/* Chestnut Adventure 2.5D — speech / thought bubbles (HTML, floating over the 3D stage) */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U;

  let queue = Promise.resolve();
  let current = null; // { el, resolve, timer, anchor }

  // actors that get a name tag above their line (hero thinks silently)
  const NAMED = { ted: true, vera: true, dusty: true, cat: true, magpie: true, kid: true, teddy: true, dino: true, tree: true, blink: true, fluff: true };

  const VOICES = {
    teddy: () => CH.audio.sfx('tap', 0.6),
    blink: () => CH.audio.sfx('tap', 0.45),
    fluff: () => CH.audio.sfx('pop', 0.5),
    dino: () => CH.audio.sfx('boing', 0.6),
    tree: () => CH.audio.sfx('pluck', 0.8),
    hero: (len) => CH.audio.blips(len),
    ted: () => CH.audio.sfx('tap'),
    vera: (len) => CH.audio.blips(Math.min(len, 30)),
    cat: () => CH.audio.sfx('meow'),
    dusty: () => CH.audio.sfx('tap'),
    magpie: () => CH.audio.sfx('chirp'),
  };

  const TAILS = { blink: 'right' };   // Blink is small and bright: her bubbles hang to her left, the tail on her, so they never sit on top of her

  function anchorFor(who, opts) {
    if (opts && opts.at) return opts.at;
    if (who === 'hero' && CH.hero.attached) return { x: CH.hero.x, y: CH.hero.y - 74 * CH.hero.A.scale, z: 0 };
    const fn = CH.engine.inst && CH.engine.inst.anchors[who];
    if (fn) return fn();
    return { x: 800, y: 300, z: 0 };
  }

  function placeEl(el, a) {
    const scr = CH.engine.toScreen(a.x, a.y, a.z || 0);
    const bw = el.offsetWidth, bh = el.offsetHeight;
    const tf = el.classList.contains('tail-right') ? 0.86 : el.classList.contains('tail-left') ? 0.14 : 0.5;   // where along the bubble its tail sits
    const x = U.clamp(scr.x - (tf - 0.5) * bw, bw / 2 + 8, CH.engine.boxW - bw / 2 - 8);
    const y = U.clamp(scr.y, bh + 14, CH.engine.boxH - 10);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }

  function closeCurrent(byUser) {
    if (!current) return false;
    if (byUser && performance.now() - current.openedAt < 300) return false;
    clearTimeout(current.timer);
    if (current.el) current.el.remove();
    const res = current.resolve;
    current = null;
    res(true);
    return true;
  }

  // the bubble rides along with whoever is talking (the camera drifts, the hero rolls)
  CH.tw.tick(() => {
    if (!current || !current.el) return;
    const a = current.live ? anchorFor(current.who, current.opts) : current.anchor;
    placeEl(current.el, a);
  }, 'global');

  const D = {
    isOpen() { return !!current; },
    advance() { return closeCurrent(true); },
    flush() {
      closeCurrent();
      queue = Promise.resolve();
    },

    /**
     * Queue a line. who: 'hero'|'ted'|'vera'|'cat'|'dusty'|'magpie'|'kid'|…
     * opts: { at: {x,y,z}, think: bool, ms: override, tail: 'left'|'right' (the body hangs the other way) }
     */
    say(who, key, opts) {
      opts = opts || {};
      const gen0 = CH.engine.gen;
      const p = queue.then(() => new Promise((resolve) => {
        if (gen0 !== CH.engine.gen) { resolve(false); return; }

        const text = CH.t(key);
        const a = anchorFor(who, opts);

        const el = U.el('div', 'bubble' + (who === 'hero' || opts.think ? ' think' : ''), CH.engine.ui);
        const tail = opts.tail || TAILS[who];
        if (tail) el.classList.add('tail-' + tail);
        if (NAMED[who]) {
          U.el('span', 'speaker', el, CH.t('name.' + who));
        }
        U.el('span', '', el, text);
        if (who === 'hero' || opts.think) {
          const dots = U.el('div', 'dots', el);
          U.el('i', '', dots); U.el('i', '', dots);
        }
        placeEl(el, a);
        requestAnimationFrame(() => placeEl(el, current && current.el === el ? anchorFor(who, opts) : a));

        const voice = VOICES[who];
        if (voice) voice(text.length);

        const ms = opts.ms || Math.min(11000, Math.max(2600, 1400 + text.length * 78));
        current = { el, resolve, who, opts, anchor: a, live: !opts.at, openedAt: performance.now(), timer: setTimeout(closeCurrent, ms) };
        el.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); D.advance(); });
      }));
      queue = p.catch(() => {});
      return p;
    },

    think(key, opts) { return D.say('hero', key, Object.assign({ think: true }, opts)); },
  };

  CH.dialog = D;
})();
