/* Chestnut Adventure — cutscene runner (skippable promise timelines) */
(function () {
  'use strict';
  const CH = window.CH;
  const tw = CH.tw;

  const SKIP = { skip: true };

  const C = {
    running: false,
    aborted: false,

    /**
     * Run a cutscene script: async (ctx) => { await ctx.w(600); await ctx.say(...); ... }
     * Every ctx helper throws SKIP once the scene is skipped, unwinding the script.
     * The caller applies the definitive end state after play() resolves.
     */
    async play(script, opts) {
      opts = opts || {};
      C.running = true;
      C.aborted = false;
      C.cinema = opts.cinema !== false;
      CH.engine.lock(true);
      const box = document.getElementById('stage-box');
      if (opts.cinema !== false) box.classList.add('cinema');
      if (opts.skippable !== false) CH.ui.showSkip(() => C.skip());

      const guard = (v) => { if (C.aborted) throw SKIP; return v; };
      // guarded promises throw on await after a skip, but fire-and-forget uses
      // must not surface as unhandled rejections — pre-attach a silent catch
      const safe = (p) => { const q = p.then(guard); q.catch(() => {}); return q; };
      const ctx = {
        layers: CH.engine.layers,
        K: CH.K,
        cam: CH.engine.cam,
        hero: CH.hero,
        sfx: (n, o) => CH.audio.sfx(n, o),
        loop: (n) => CH.audio.loop(n),
        t: CH.t,
        dead: () => C.aborted,
        w: (ms) => safe(tw.delay(ms, 'cut')),
        tw: (target, to, o) => safe(tw.to(target, to, Object.assign({ group: 'cut' }, o))),
        say: (who, key, o) => safe(CH.dialog.say(who, key, o)),
        think: (key, o) => safe(CH.dialog.think(key, o)),
        run: (p) => safe(Promise.resolve(p)),
      };

      try {
        await script(ctx);
      } catch (e) {
        if (e !== SKIP) { console.error('cutscene error', e); }
      }

      CH.ui.hideSkip();
      box.classList.remove('cinema');
      CH.dialog.flush();
      tw.kill('cut');
      CH.engine.lock(false);
      C.running = false;
      C.cinema = false;
    },

    skip() {
      if (!C.running || C.aborted) return;
      C.aborted = true;
      tw.kill('cut');
      CH.dialog.flush();
      CH.audio.sfx('ui');
    },

    clickSkipHint() { CH.ui.pulseSkip(); },
  };

  CH.cut = C;
})();
