/* Chestnut Adventure — rAF ticker + tween engine (grouped, promise-based) */
(function () {
  'use strict';
  const CH = window.CH;

  const E = {
    linear: (t) => t,
    quadIn: (t) => t * t,
    quadOut: (t) => t * (2 - t),
    quadInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    cubicOut: (t) => 1 + --t * t * t,
    cubicIn: (t) => t * t * t,
    sinInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    backOut: (t) => { const s = 1.70158; return 1 + (--t) * t * ((s + 1) * t + s); },
    backIn: (t) => { const s = 1.70158; return t * t * ((s + 1) * t - s); },
    bounceOut: (t) => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
    elasticOut: (t) => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
  };

  let tweens = [];
  let tickFns = [];
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    // permanent per-frame callbacks (hero idle, actors, parallax…)
    for (let i = 0; i < tickFns.length; i++) {
      const f = tickFns[i];
      if (f.dead) continue;
      try { f.fn(dt / 1000, now); } catch (err) { console.error('tick error', err); f.dead = true; }
    }
    tickFns = tickFns.filter((f) => !f.dead);

    for (let i = 0; i < tweens.length; i++) {
      const tw = tweens[i];
      if (tw.dead) continue;
      if (now < tw.start) continue;
      let t = (now - tw.start) / tw.dur;
      if (t >= 1) t = 1;
      const k = tw.ease(t);
      for (const p in tw.to) tw.target[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * k;
      if (tw.onUpdate) tw.onUpdate(k, tw.target);
      if (t === 1) { tw.dead = true; tw.resolve(true); }
    }
    tweens = tweens.filter((t) => !t.dead);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const TW = {
    ease: E,

    /** Tween numeric props of any object. Returns a promise (true = completed, false = killed). */
    to(target, to, opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        const from = {};
        for (const p in to) from[p] = target[p] != null ? target[p] : 0;
        tweens.push({
          target, to, from,
          dur: Math.max(1, opts.dur != null ? opts.dur : 400),
          start: performance.now() + (opts.delay || 0),
          ease: opts.ease || E.quadInOut,
          onUpdate: opts.onUpdate || null,
          group: opts.group || 'default',
          resolve,
          dead: false,
        });
        if (opts.onUpdate) opts.onUpdate(0, target); // apply initial state immediately
      });
    },

    /** Killable timer implemented as a tween (so group-kill cancels it). */
    delay(ms, group) {
      return TW.to({ v: 0 }, { v: 1 }, { dur: ms, group: group || 'default', ease: E.linear });
    },

    kill(group) {
      tweens.forEach((tw) => {
        if (!group || tw.group === group) { tw.dead = true; tw.resolve(false); }
      });
    },
    killAll() { TW.kill(null); },

    /** Register a per-frame callback; returns an unsubscribe fn. */
    tick(fn, group) {
      const rec = { fn, group: group || 'default', dead: false };
      tickFns.push(rec);
      return () => { rec.dead = true; };
    },
    killTicks(group) {
      tickFns.forEach((f) => { if (!group || f.group === group) f.dead = true; });
    },
  };

  CH.tw = TW;
})();
