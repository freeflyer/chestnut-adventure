/* Chestnut Adventure — tiny utilities + global namespace */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});

  const U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    rand: (a, b) => a + Math.random() * (b - a),
    randi: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    uid: (() => { let n = 0; return (p) => (p || 'id') + (++n); })(),

    // DOM helper for the HTML UI layer
    el(tag, cls, parent, html) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      if (parent) parent.appendChild(e);
      return e;
    },

    // cancellable sleep: resolves with true if it ran to the end,
    // false if the generation changed (scene switched / cutscene skipped)
    wait(ms, genGetter) {
      const g0 = genGetter ? genGetter() : null;
      return new Promise((res) => setTimeout(() => {
        res(genGetter ? genGetter() === g0 : true);
      }, ms));
    },
  };

  // tiny event bus
  const listeners = {};
  CH.bus = {
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return fn; },
    off(ev, fn) { const l = listeners[ev]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } },
    emit(ev, data) { (listeners[ev] || []).slice().forEach((fn) => fn(data)); },
  };

  CH.U = U;
})();
