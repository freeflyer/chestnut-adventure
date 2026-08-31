/* Chapter 5 — the outside wall: first breath of night air, and the way down. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  CH.defScene('wall', {
    chapter: 7,
    pageBg: '#0e1424',
    bg: '#0b1020',
    fogNear: 22, fogFar: 60,
    ambient: [],
    fill: 1.6, ambient2: 0.7, skyLight: '#4a5a8a', groundLight: '#1a2014',
    camera: { x: 800, y: 380, z: 1590, tx: 800, ty: 470, follow: 0.05, parallax: 1.2 },

    platforms: [
      { id: 'sill', x1: 170, x2: 430, y: 260 },
    ],
    links: [],
    spots: {
      sill: { x: 300, plat: 'sill' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      // night sky
      const skyTex = K.canvasTex(64, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0d1226'); g.addColorStop(0.6, '#1c2743'); g.addColorStop(1, '#33323f');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      const sky = K.vplane(-3000, 6000, -1800, 1600, -2600, new T.MeshBasicMaterial({ map: skyTex, fog: false }), far);
      sky.scale.y = -1; sky.userData.__disposeTex = skyTex;
      for (let i = 0; i < 50; i++) K.glow(far, U.rand(500, 3200), U.rand(-900, 600), -2500, U.rand(5, 12), '#e8ecff', U.rand(0.3, 0.8));
      P.moon(far, 1500, 90, 110, { z: -2400, sky: '#141b30' });
      K.sun(L, 1500, -300, 900, '#9db8d8', 1.6, { tx: 400, ty: 500, tz: 0, shadow: true, size: 1400 });   // the moon is out front, so the wall face catches it

      // the garden below, far down: a lawn, bushes, and THE flowerbed glowing softly
      K.hplane(-1000, 3600, 880, -1800, 600, K.mat('#1b2618', { rough: 1, fog: false }), far);
      const bush = K.mat('#22361c', { rough: 1, fog: false });
      [[700, 880, 90, -700], [900, 880, 70, -900], [1150, 880, 110, -600], [1420, 880, 80, -800], [500, 880, 60, -1100]].forEach((b) => {
        K.ellipsoid(b[0], b[1] - b[2] * 0.5, b[2], b[2] * 0.75, b[2] * 0.8, bush, far, { z: b[3], seg: 20 });
      });
      const bed = K.cut(K.ellipseShape(0, 0, 130, 60), K.mat('#241a10', { rough: 1, fog: false }), far, { rx: 90 });
      K.tr(bed, { x: 1150, y: 879, z: -700, rx: 90 });
      K.glow(far, 1150, 860, -690, 110, '#8aa86a', 0.12);

      // ---------- the house wall (left side) ----------
      const wallG = K.g(mid);
      const siding = new T.MeshStandardMaterial({ map: K.canvasTex(256, 512, (ctx, w, h) => {
        ctx.fillStyle = '#3a3142'; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, i * 64 + 58, w, 6); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, i * 64, w, 3); }
      }, { repeat: [4, 4] }), roughness: 0.95 });
      K.vplane(-400, 500, -600, 1200, -100, siding, wallG);
      K.box(492, -600, 18, 1800, 60, '#241e2c', wallG, { z: -100 });   // the corner board
      K.sidewall(510, -600, 1200, -100, 400, K.mat('#2a2432', { rough: 1 }), wallG, { facing: 'left' }); // the wall turns the corner
      // the tilted-open window above the sill, warm light spilling
      const winG = K.g(mid);
      const WX = 174, WY = -50, WW = 252, WH = 262, JT = 14, JD = 34, JZ = -83;   // the opening; the jambs' thickness and depth (they stand from the siding, -100, out to -66)
      const jambMat = K.mat('#20283e', { rough: 0.8 });
      [[WX - JT, WY - JT, WW + 2 * JT, JT], [WX - JT, WY + WH, WW + 2 * JT, JT], [WX - JT, WY, JT, WH], [WX + WW, WY, JT, WH]]
        .forEach((b) => { K.box(b[0], b[1], b[2], b[3], JD, jambMat, winG, { z: JZ }).castShadow = false; });   // head, foot, and the two jambs of the reveal
      K.box(WX, WY, WW, WH, 4, K.mat('#7a4e2c', { emissive: '#ffb454', ei: 0.35, rough: 0.9 }), winG, { z: -98 }).castShadow = false;   // the lamp-lit room, at the back of the reveal: it shows over the top of the leaning sash
      // the sash: glazed, hinged at its foot, its top leaning into the room — the way it was opened from inside
      const sash = K.g(winG, { z: -68, rx: -6.5, ox: 0, oy: WY + WH });
      const warm = K.mat('#ffd489', { emissive: '#ffb454', ei: 1.1, rough: 0.5 });
      K.vplane(WX, WX + WW, WY, WY + WH, 0, warm, sash).castShadow = false;
      [[WX + WW / 2 - 4.5, WY, 9, WH], [WX, WY, WW, 8], [WX, WY + WH - 8, WW, 8], [WX, WY, 8, WH], [WX + WW - 8, WY, 8, WH]]
        .forEach((b) => { K.box(b[0], b[1], b[2], b[3], 8, jambMat, sash, { z: 4 }).castShadow = false; });   // its frame and mullion: thin members, they cut no wedges out of the light
      K.glow(mid, 300, 230, -60, 200, '#ffb454', 0.16);
      // the room's light out through the opening: one soft, wide pool from the opening itself (only the hero and the pigeon throw shadows in it)
      K.spot(L, 300, 100, -64, 320, 420, 60, '#ffcf7a', 90, { angle: 70, penumbra: 0.9, decay: 1.4, dist: 1400 });
      // sill slab: the hero's whole world for a moment
      K.rbox(150, 260, 300, 22, 150, 4, '#241e2c', winG, { z: -30 });
      K.box(150, 282, 300, 8, 150, '#191423', winG, { z: -30 });
      K.pad(160, -60, 280, 290, winG, { d: 60, z: -70 });

      // drainpipe (right of the window)
      const pipeG = K.g(mid, { z: -60 });
      const pipeMat = K.mat('#4a4256', { rough: 0.55, metal: 0.4 });
      K.cylUp(481, 810, 11, 850, pipeMat, pipeG, { seg: 20 });
      K.rbox(462, 120, 38, 20, 34, 6, '#3c3648', pipeG, { z: -10 });
      K.rbox(462, 480, 38, 20, 34, 6, '#3c3648', pipeG, { z: -10 });

      // a sleepy pigeon on the gutter above
      const perch = K.g(main, { x: -80, z: -40 });
      K.rodX(500, 620, 88, 4, K.mat('#3c3648', { rough: 0.6, metal: 0.3 }), perch);
      K.tube([[590, 92, 0], [578, 108, 0], [566, 124, 0]], 3, K.mat('#3c3648', { rough: 0.6 }), perch, { seg: 6 });
      const pigeon = K.g(main, { x: -80, z: -40 });
      CH.models.pigeon(pigeon, 562, 86, 0);
      // wind streaks
      // they blow in from the right and disappear behind the house (the wall's face is at z -100; they fly deeper)
      const winds = [];
      const windMat = new T.MeshBasicMaterial({ color: new T.Color('#ffffff'), transparent: true, opacity: 0.12, fog: false });
      for (let i = 0; i < 3; i++) {
        const w = K.tube([[0, 0, 0], [40, -8, 0], [80, 0, 0], [110, 6, 0], [140, 0, 0]], 1.6, windMat, far, { seg: 24, radial: 4 });
        w.castShadow = false; w.userData.noHit = true;
        winds.push({ el: w, x: U.rand(500, 1500), y: U.rand(150, 600), z: U.rand(-360, -240), sp: U.rand(60, 120) });
      }
      // light, uneven gusts: a slow breath with the odd stronger puff, never a steady sine — and a quiet breeze to match
      const gust = { v: 0, target: 0.15, next: 2 };
      const breeze = CH.audio.loop('breeze');
      let gt = 0;
      api.tick((dt) => {
        gt += dt;
        gust.next -= dt;
        if (gust.next <= 0) { gust.target = U.rand(0.04, 0.55) * (Math.random() < 0.3 ? 1.7 : 1); gust.next = U.rand(2.5, 6.5); }
        gust.v += (gust.target - gust.v) * Math.min(1, dt * (gust.target > gust.v ? 1.4 : 0.45));
        const g = Math.max(0, gust.v + Math.sin(gt * 0.7) * 0.05 + Math.sin(gt * 1.9 + 1) * 0.03);
        api._gust = g;
        breeze.set(g);
        windMat.opacity = 0.06 + g * 0.16;
        winds.forEach((w) => {
          w.x -= (w.sp * (0.5 + g * 1.6)) * dt;
          if (w.x < -200) { w.x = 1700; w.y = U.rand(120, 640); }
          K.tr(w.el, { x: w.x, y: w.y + Math.sin(gt * 1.3 + w.z) * 4 * g, z: w.z, r: -g * 3 });
        });
      });

      // ================= hotspots =================

      api.hot(winG, {
        id: 'w.window',
        near: { x: 240, plat: 'sill' },
        act: async () => { await api.think('c5.win.back'); },
      });

      api.hot(pigeon, {
        id: 'w.pigeon',
        near: { x: 400, plat: 'sill' },
        act: async () => {
          const n = st.bumpClick('w.pigeon');
          api.sfx('chirp');
          if (st.has('pigeonFed')) { await api.think('sd.pigeon.full'); return; }
          if (n === 1) await api.think('c5.pigeon.look');
          else await api.think('c5.pigeon.coo');
        },
        item: {
          seed: async () => {
            await api.cut(async (ctx) => {
              api.hero.face(1);
              await ctx.run(api.hero.tailWhip(430, 220));
              const seedEl = K.ellipsoid(0, 0, 4, 6, 3, '#4a3a2c', api.layers.fx);
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 700, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => K.tr(seedEl, { x: U.lerp(420, 476, o.t), y: U.lerp(240, 84, o.t) - Math.sin(o.t * Math.PI) * 60, z: -30, r: o.t * 300 }),
              });
              seedEl.parent.remove(seedEl);
              for (let i = 0; i < 3; i++) {
                await ctx.tw({ t: 0 }, { t: 1 }, {
                  dur: 220, onUpdate: (k, o) => K.tr(pigeon, { x: -80, y: Math.sin(o.t * Math.PI) * 6, z: -40 }),
                });
              }
              ctx.sfx('chirp');
              CH.fx.floaties(api, 476, 40, '♥', '#e2938a', -30);
              await ctx.w(500);
            }, { cinema: false, skippable: false });
            st.take('seed');
            st.flag('pigeonFed');
            await api.think('sd.pigeon.fed');
          },
        },
      });

      // ---------- red herring: a satellite dish on the wall ----------
      const dishG = K.g(mid, { z: -70 });
      const dishMetal = K.mat('#5a6478', { rough: 0.5, metal: 0.4 });
      K.rbox(40, 426, 34, 80, 10, 4, '#4a4256', dishG, { z: -26 });                                    // the wall plate
      K.rbox(48, 436, 18, 60, 6, 3, '#3a3446', dishG, { z: -20 });
      K.tube([[57, 466, -18], [96, 460, 16], [132, 448, 50]], 5, dishMetal, dishG, { seg: 10 });          // the mount arm out from the wall
      const dishOval = K.g(dishG, { x: 134, y: 446, z: 52 });                                          // the back of the dish, where the arm holds it
      const dishGeo = new T.SphereGeometry(92, 36, 16, 0, Math.PI * 2, 0, Math.PI * 0.27);
      dishGeo.translate(0, -92, 0);                                                                       // its back apex at the origin; the bowl opens toward -y
      const dish = K.mesh(dishGeo, K.mat('#c8d2dc', { rough: 0.4, metal: 0.4, side: 'double' }), dishOval);
      K.tr(dish, { rx: -30, ry: 53 });                                                                   // the bowl turned up and out at the sky
      // the feed arm, in the dish's own frame: from the lower lip of the bowl to the LNB hanging at the focus
      K.tube([[0, -31, 66], [0, -44, 40], [0, -52, 10]], 3.2, dishMetal, dish, { seg: 10 });
      K.cylUp(0, -38, 5.5, 16, dishMetal, dish, { z: 6, seg: 10 });
      K.pad(-90, -96, 180, 180, dishOval, { d: 80 });
      api.hot(dishG, {
        id: 'w.dish',
        near: { x: 220, plat: 'sill' },
        act: async () => { await api.think(st.bumpClick('w.dish') % 2 ? 'sd.dish.look' : 'sd.dish.look2'); },
      });

      // the view / the goal
      const viewZone = K.pad(600, 600, 900, 300, main, { d: 400, z: -600 });
      api.hot(viewZone, {
        id: 'w.view',
        near: { x: 400, plat: 'sill' },
        act: async () => {
          const n = st.bumpClick('w.view');
          if (n === 1) { await api.think('c5.view.bed'); }
          else await api.think('c5.view.high');
        },
        item: {   // the garden is where he wants to go, so the gear works on it as well as on the edge
          brolly: () => descend.brolly(),
          floss: () => descend.floss(),
        },
      });

      // the edge — jumping without gear is politely declined
      const edge = K.pad(380, 200, 90, 90, main, { d: 160 });
      const descend = {
        brolly: async () => {
          st.flag('descended', 'brolly');
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(410, () => true));
            api.hero.face(1);
            ctx.sfx('paper');
            const um = K.g(main, { z: 10 });
            const canopy = K.mesh(new T.SphereGeometry(48, 28, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), K.mat('#e2635f', { rough: 0.7, side: 'double' }), um);
            K.tr(canopy, { y: 38 });
            for (let i = 0; i < 6; i++) { const rib = K.rodX(0, 46, 0, 1.2, K.mat('#f7d9c4', { rough: 0.8 }), um); K.tr(rib, { y: 36, ry: i * 60, x: 0 }); }
            K.cylUp(0, 74, 2, 36, K.mat('#c99358', { rough: 0.6 }), um);
            K.sphere(0, -10, 3, '#f7d9c4', um);
            const place = (x, y, r) => K.tr(um, { x, y: y - 128, z: 10, r });
            place(410, 260, 0);
            await ctx.w(400);
            await ctx.think('c5.jump.brolly');
            ctx.sfx('boing', 1.1);
            const sway = { t: 0 };
            const windLoop = CH.audio.loop('wind');
            await ctx.tw(sway, { t: 1 }, {
              dur: 6400, ease: CH.tw.ease.linear,
              onUpdate: () => {
                const t = sway.t;
                const x = 410 + t * 640 + Math.sin(t * 7.4) * 90;
                const y = 260 + t * 500;
                const r = Math.sin(t * 7.4 + 1.2) * 16;
                api.hero.place(x, y);
                api.hero.A.rock = r;
                place(x, y, r);
              },
            });
            windLoop.stop();
            api.hero.A.rock = 0;
            ctx.sfx('thud');
            um.parent.remove(um);
            await ctx.run(api.hero.landSquash());
            await ctx.w(300);
          }, { cinema: true, skippable: false });
          await api.go('garden', 'enter');
        },
        floss: async () => {
          st.flag('descended', 'floss');
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(420, () => true));
            api.hero.face(1);
            await ctx.run(api.hero.tailWhip(478, 130));
            ctx.sfx('pluck', 1.1);
            const rope = K.box(479.5, 132, 3, 1, 3, K.mat('#eafcff', { rough: 0.8 }), main, { z: -40 });
            const setRope = (len) => K.tr(rope, { x: 481, y: 132 + len / 2, z: -40, sy: Math.max(1, len), sx: 1, sz: 1 });
            await ctx.think('c5.jump.floss');
            for (let i = 1; i <= 5; i++) {
              const ty = 132 + i * 128;
              ctx.sfx('pluck', 1.3 - i * 0.12);
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 420, ease: CH.tw.ease.quadInOut,
                onUpdate: (k, o) => {
                  const yy = U.lerp(132 + (i - 1) * 128, ty, o.t) + 120;
                  api.hero.place(460 + Math.sin(o.t * Math.PI) * 46, yy);
                  api.hero.A.rock = Math.sin(o.t * Math.PI) * -20;
                  setRope(yy - 132 - 40);
                },
              });
            }
            api.hero.A.rock = 0;
            ctx.sfx('thud');
            await ctx.run(api.hero.landSquash());
            st.take('floss');
            await ctx.w(300);
          }, { cinema: true, skippable: false });
          await api.go('garden', 'enter');
        },
      };
      api.hot(edge, {
        id: 'w.edge',
        near: { x: 410, plat: 'sill' },
        act: async () => {
          const n = st.bumpClick('w.edge');
          if (st.hasItem('brolly') || st.hasItem('floss')) {
            await api.think('c5.edge.ready');
            api.toast('c5.edge.toast');
            return;
          }
          await api.hero.headShake();
          await api.think(n % 2 ? 'c5.edge.high' : 'c5.edge.high2');
        },
        item: {
          brolly: (ctx) => descend.brolly(),
          floss: (ctx) => descend.floss(),
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('outFirst')) {
        st.flag('outFirst');
        api.cut(async (ctx) => {
          await ctx.w(600);
          await ctx.run(api.hero.lookAround());
          await ctx.think('c5.out1');
          await ctx.run(api.hero.excite());
          await ctx.think('c5.out2');
          await ctx.think('c5.out3');
        }, { cinema: false });
      }
    },
  });
})();
