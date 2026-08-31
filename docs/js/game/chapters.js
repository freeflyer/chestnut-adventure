/* Chestnut Adventure — chapter flow, baselines, restart */
(function () {
  'use strict';
  const CH = window.CH;

  const DEFS = {
    1: { entry: 'desk', spot: 'start' },
    2: { entry: 'ductA', spot: 'fromStudy' },
    3: { entry: 'hallway', spot: 'fromVent' },
    4: { entry: 'hallway', spot: 'center' },
    5: { entry: 'corridor', spot: 'fromStairs' },
    6: { entry: 'dreamRoom', spot: 'start' },
    7: { entry: 'wall', spot: 'sill' },
  };

  // canonical state entering chapter n (lets any chapter start standalone)
  function baseline(n) {
    const b = { flags: {}, inv: [] };
    if (n >= 2) {
      Object.assign(b.flags, { awake: 1, deskDown: 1, floorFirst: 1, ventOpen: 1 });
      b.inv.push('coin');
    }
    if (n >= 3) {
      Object.assign(b.flags, { ductFirst: 1, blinkFree: 1, fanJammed: 1, fluffGone: 1, damperOpen: 1, blinkGone: 1, ductDone: 1 });
    }
    if (n >= 4) {
      Object.assign(b.flags, { doorTried: 1, hallFirst: 1, veraMet: 1, buttonDone: 1, veraHint: 1 });
    }
    if (n >= 5) {
      Object.assign(b.flags, { gotBrolly: 1, umbrellaRamp: 1, kitchenFirst: 1 });
      b.inv.push('brolly');
    }
    if (n >= 6) {
      Object.assign(b.flags, { bedFirst: 1, lampOn: 1, dreamEntered: 1 });
    }
    if (n >= 7) {
      Object.assign(b.flags, { dreamDone: 1, catchOpen: 1, windowOpen: 1 });
    }
    return b;
  }

  const CHAP = {
    DEFS,
    baseline,

    /** Start chapter n. opts.fresh → reset state to the chapter baseline.
        Natural progression (finishing chapter n-1) keeps everything earned. */
    async start(n, opts) {
      opts = opts || {};
      const st = CH.state;
      CH.ui.hideMenu();

      if (opts.fresh || !st.data.scene) {
        const keepMax = Math.max(st.data.maxChapter, n);
        const fin = st.data.finished;
        st.newGame();
        st.data.maxChapter = keepMax;
        st.data.finished = fin;
        const b = baseline(n);
        Object.assign(st.data.flags, b.flags);
        st.data.inv = b.inv.slice();
      }

      st.startChapter(n);
      if (opts.noCard) {
        await CH.engine.go(DEFS[n].entry, DEFS[n].spot);
      } else {
        // coming from the menu: let the house sit in view before the card
        if (CH.engine.sceneId === 'title') await CH.U.wait(3000);
        // the scene is built behind the opaque card, so it fades straight in
        await CH.ui.chapterCard(n, () => CH.engine.go(DEFS[n].entry, DEFS[n].spot, { instant: true }));
      }
      CH.ui.updateHud();
    },

    /** called by scenes when the chapter goal is reached */
    async complete(n) {
      if (n < 7) {
        await CHAP.start(n + 1);
      }
      // the last chapter ends inside the garden scene with the finale cutscene
    },

    restart() {
      const n = CH.state.data.chapter || 1;
      CHAP.start(n, { fresh: true, noCard: true });
    },
  };

  CH.chapters = CHAP;
})();
