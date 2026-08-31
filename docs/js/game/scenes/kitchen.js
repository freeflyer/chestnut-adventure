/* Chapter 3 — the kitchen expedition: drawers or toaster, the jar, and Biscuit on patrol. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  const WALL = -330;

  CH.defScene('kitchen', {
    chapter: 4,
    pageBg: '#141e24',
    bg: '#10181e',
    ambient: [{ name: 'drip', every: [4200, 7000] }],
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: (st) => [
      { id: 'floor', x1: 140, x2: 1480, y: 800 },
      { id: 'stool', x1: 596, x2: 690, y: 646, noWalk: true },
      { id: 'drawer1', x1: 800, x2: 968, y: 722, noWalk: true },
      { id: 'drawer2', x1: 812, x2: 956, y: 630, noWalk: true },
      { id: 'counter', x1: 710, x2: 1490, y: 516 },
    ],
    links: (st) => [
      { a: 'floor', b: 'stool', ax: 640, bx: 640, type: 'hop' },
      { a: 'floor', b: 'drawer1', ax: 884, bx: 884, type: 'hop', when: (s) => s.has('drawersOut') },
      { a: 'drawer1', b: 'drawer2', ax: 884, bx: 884, type: 'hop', when: (s) => s.has('drawersOut') },
      { a: 'drawer2', b: 'counter', ax: 884, bx: 820, type: 'hop', when: (s) => s.has('drawersOut') },
      { a: 'counter', b: 'floor', ax: 730, bx: 700, type: 'drop', dir: 'ab' },
      { a: 'stool', b: 'floor', ax: 640, bx: 600, type: 'hop' },
    ],
    spots: {
      enter: { x: 240, plat: 'floor' },
      wake: { x: 660, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#1e3038'], [1, '#2c444e']],
        floorStops: [[0, '#8a6a4a'], [1, '#5e4630']],
        baseboard: '#1c2c34',
        tiles: true,
      });
      // a cool ceiling light over the middle of the room
      K.spot(L, 800, -260, 160, 800, 640, -220, '#dfe6ff', 60, { angle: 84, penumbra: 1, decay: 1.4, mapSize: 2048, dist: 2000 });

      // ---------- the under-stairs door (back to the hallway), inside face ----------
      const backDoor = K.g(mid);
      K.point(L, 150, 640, -200, '#9db8d8', 2.4, 700, { decay: 1.6 });   // a little cool spill so the way back reads
      K.ext('M 60 812 L 60 560 L 208 668 L 208 812 Z', 30, K.mat('#26314d', { rough: 0.9 }), backDoor, { z: WALL + 15, bevel: 2 });
      K.ext('M 72 806 L 72 574 L 196 664 L 196 806 Z', 12, P.woodMat('#8e6a48', '#6a4c30', 0.7), backDoor, { z: WALL + 26, bevel: 1 });
      const kflapG = K.g(main);
      K.box(100, 712, 78, 88, 10, '#3c2a18', kflapG, { z: WALL + 34 });
      const kflapDoor = K.rbox(108, 720, 62, 74, 5, 3, '#4e3826', kflapG, { z: WALL + 40, ox: 139, oy: 720 });

      // ---------- fridge ----------
      const fridgeG = K.g(mid, { z: -220 });
      const steel = K.mat('#d6e0e4', { rough: 0.55, metal: 0.08 });
      K.rbox(250, 220, 240, 580, 220, 14, steel, fridgeG);
      K.box(249, 440, 242, 10, 224, '#93a5ac', fridgeG);   // a hair wider than the body: its end faces were coplanar with the sides and z-fought
      K.rbox(462, 300, 12, 90, 14, 6, K.mat('#8a9aa0', { rough: 0.4, metal: 0.5 }), fridgeG, { z: 116 });
      K.rbox(462, 470, 12, 120, 14, 6, K.mat('#8a9aa0', { rough: 0.4, metal: 0.5 }), fridgeG, { z: 116 });
      // magnets + kid's drawing
      const redMag = K.disc(310, 300, 9, 6, K.mat('#e2635f', { rough: 0.5 }), fridgeG, { z: 113 });
      K.disc(420, 340, 9, 6, K.mat('#67b8a0', { rough: 0.5 }), fridgeG, { z: 113 });
      K.disc(360, 520, 9, 6, K.mat('#e8b64c', { rough: 0.5 }), fridgeG, { z: 113 });
      const drawing = K.g(fridgeG, { z: 111 });
      const drawTex = K.canvasTex(220, 180, (ctx, w, h) => {
        ctx.fillStyle = '#fdf7e8'; ctx.fillRect(0, 0, w, h); ctx.scale(2, 2);
        ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.strokeStyle = '#e2635f'; ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(20, 36); ctx.lineTo(36, 24); ctx.lineTo(52, 36); ctx.lineTo(52, 60); ctx.closePath(); ctx.stroke();
        ctx.strokeStyle = '#8a6a42'; ctx.beginPath(); ctx.moveTo(68, 60); ctx.lineTo(68, 42); ctx.stroke();
        ctx.strokeStyle = '#67b8a0'; ctx.beginPath(); ctx.arc(68, 36, 10, 0, 6.28); ctx.stroke();
        ctx.strokeStyle = '#e8b64c'; ctx.beginPath(); ctx.arc(92, 14, 7, 0, 6.28); ctx.stroke();
      });
      const drawM = K.vplane(330, 440, 270, 360, 0, new T.MeshStandardMaterial({ map: drawTex, roughness: 0.9 }), drawing);
      drawM.scale.y = -1; drawM.userData.__disposeTex = drawTex;
      K.tr(drawing, { z: 111, r: -3, ox: 385, oy: 315 });

      // ---------- cat bowl ----------
      const bowlG = K.g(main, { z: -50 });
      K.cylUp(562, 800, 34, 24, K.mat('#4a6a8a', { rough: 0.5 }), bowlG, { rTop: 40 });
      K.cylUp(562, 777, 34, 2, K.mat('#2c3a4c', { rough: 0.7 }), bowlG);
      K.label(CH.t('name.cat').toUpperCase(), { size: 11, color: '#d8e4ec', x: 562, y: 790, z: 40, parent: bowlG });
      K.pad(512, 762, 100, 42, bowlG, { d: 90 });

      // ---------- stool + toaster ----------
      const stoolG = K.g(mid, { z: -60 });
      K.cylUp(643, 652, 46, 12, K.mat('#7c4a48', { rough: 0.8 }), stoolG, { rTop: 52, seg: 28 });
      [[612, 40], [674, 40], [612, -40], [674, -40]].forEach((l) => K.cylUp(l[0], 800, 6, 136, K.mat('#513029', { rough: 0.8 }), stoolG, { z: l[1] }));
      const toasterG = K.g(main, { z: -40 });
      K.ext('M 596 646 L 596 596 A 20 20 0 0 1 616 578 L 668 578 A 20 20 0 0 1 688 596 L 688 646 Z', 60, K.mat('#d8e2e6', { rough: 0.3, metal: 0.4 }), toasterG, { bevel: 4 });
      K.box(614, 572, 56, 12, 20, '#37444c', toasterG, { z: 0 });
      const lever = K.g(toasterG);
      K.rbox(690, 600, 16, 10, 12, 4, '#e2635f', lever, { z: 8 });
      K.disc(642, 622, 6, 4, K.mat('#c9d6da', { rough: 0.4 }), toasterG, { z: 32 });

      // ---------- the counter ----------
      const counterG = K.g(mid);
      for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 14; tx++) {
        K.box(706 + tx * 58, 380 + ty * 46, 54, 42, 6, ty % 2 === tx % 2 ? '#2c464e' : '#294048', counterG, { z: WALL + 4, round: 2 });
      }
      K.rbox(696, 516, 904, 26, 300, 6, K.mat('#d8cdb4', { rough: 0.6 }), counterG, { z: -180 });
      K.box(710, 550, 880, 250, 280, '#3f6b6b', counterG, { z: -190 });
      // the drawers stack
      const drawerFront = (y) => {
        const g = K.g(main);
        K.rbox(790, y, 190, 78, 260, 8, '#4a7d7d', g, { z: -170 });
        K.box(804, y + 12, 162, 54, 4, '#38605f', g, { z: -38 });
        K.box(808, y + 16, 154, 46, 6, '#4a7d7d', g, { z: -37 });
        K.rbox(856, y + 34, 60, 12, 10, 6, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), g, { z: -30 });
        return g;
      };
      const dr1 = drawerFront(716);
      const dr2 = drawerFront(626);
      drawerFront(540);
      const setDrawers = (out) => {
        if (out) {
          // staircase: the bottom drawer sticks out the most, toward us
          K.tr(dr1, { x: 52, z: 40 });
          K.tr(dr2, { x: 26, z: 20 });
        }
      };
      setDrawers(st.has('drawersOut'));
      // cupboard doors right of drawers
      K.rbox(1010, 566, 200, 224, 8, 8, '#4a7d7d', counterG, { z: -44 });
      K.sphere(1190, 680, 8, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), counterG, { z: -36 });
      K.rbox(1230, 566, 200, 224, 8, 8, '#4a7d7d', counterG, { z: -44 });
      K.sphere(1250, 680, 8, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), counterG, { z: -36 });

      // ---------- sink + tap (on the counter) ----------
      const sinkG = K.g(mid, { z: -200 });
      K.rbox(920, 514, 220, 8, 160, 3, K.mat('#aebec4', { rough: 0.3, metal: 0.5 }), sinkG);
      K.box(936, 512.5, 188, 2, 130, K.mat('#3a4f5a', { rough: 0.55, metal: 0.3 }), sinkG, { z: 0 });   // the dark basin seen through the opening in the steel surround
      K.tube([[1010, 516, -60], [1010, 470, -60], [1018, 452, -60], [1040, 452, -60], [1052, 466, -60], [1053, 480, -60]], 6, K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 }), sinkG, { seg: 24 });
      K.rodX(1000, 1020, 512, 5, K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 }), sinkG, { z: -60 });
      K.pad(998, 440, 78, 84, sinkG, { d: 60, z: -60 });
      const dripDot = K.sphere(1053, 480, 4, K.mat('#9fd4e8', { rough: 0.2, opacity: 0.9 }), sinkG, { z: -60 });
      let dripT = 0;
      api.tick((dt) => {
        dripT += dt;
        const ph = (dripT % 3) / 3;
        dripDot.visible = ph > 0.7;
        K.tr(dripDot, { x: 1053, y: 470 + (ph - 0.7) * 140, z: -60 });
      });

      // window above the sink
      P.windowNight(far, 880, 130, 300, 240, { moon: true });
      K.sun(L, 1030, 100, -100, '#9db8d8', 0.7, { tx: 900, ty: 800, tz: 0 });

      // ---------- THE JAR of cocktail umbrellas ----------
      const jarG = K.g(main, { z: -100 });
      const glass = new T.MeshPhysicalMaterial({ color: new T.Color('#cfe4ea'), transparent: true, opacity: 0.35, roughness: 0.1, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
      const jar = K.cylUp(1310, 516, 40, 108, glass, jarG, { seg: 32 });
      jar.castShadow = false;
      const lid = K.g(jarG);
      K.cylUp(1310, 412, 46, 20, K.mat('#c9762e', { rough: 0.45, metal: 0.3 }), lid);
      K.cylUp(1310, 392, 46, 8, K.mat('#a85c22', { rough: 0.45, metal: 0.3 }), lid);
      const brollyMini = (x, y, r, c) => {
        const g = K.g(jarG, { x, y, r, z: U.rand(-14, 14) });
        K.cone(0, 12, 14, 12, K.mat(c, { rough: 0.8, side: 'double' }), g);
        K.cylUp(0, 54, 1.5, 44, K.mat('#c99358', { rough: 0.6 }), g);
        return g;
      };
      const redMini = brollyMini(1292, 428, -14, '#e2635f');   // the one he takes
      brollyMini(1316, 420, 4, '#67b8a0');
      brollyMini(1334, 430, 16, '#e8b64c');
      if (st.has('gotBrolly')) { jarG.remove(redMini); K.tr(lid, { x: 60, y: -30, z: 30, r: 160, ox: 1310, oy: 400 }); }   // taken already: the red one gone, the lid off
      K.pad(1260, 386, 100, 132, jarG, { d: 90 });

      // ---------- mixing bowl + flour (counter flavour) ----------
      const bowlGeo = new T.SphereGeometry(46, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const mixBowl = K.mesh(bowlGeo, K.mat('#e2635f', { rough: 0.5, side: 'double' }), mid);
      K.tr(mixBowl, { x: 1466, y: 470, z: -150, sx: 1, sy: 1, sz: 1 });
      K.torus(1466, 470, 46, 3, K.mat('#c0504e', { rough: 0.5 }), mid, { z: -150, rx: 90 });
      const flourG = K.g(mid, { z: -240 });
      K.rbox(740, 470, 70, 46, 50, 5, '#d8cdb4', flourG);
      K.label('FLOUR', { size: 12, color: '#8a7a5c', x: 775, y: 494, z: 26, parent: flourG });

      // ---------- Biscuit on patrol ----------
      const catHome = { x: 480, y: 800 };
      const cat = CH.actors.cat(K.g(main, { z: -30 }), catHome.x, catHome.y, 0.95);
      api.anchor('cat', cat.anchor);
      const catAsleep = st.data.chapter >= 6 || st.has('dreamDone');
      let catAlert = false, alertTimer = 0, stirTimer = U.rand(14, 22);
      if (catAsleep) {
        let zt = 1.5;
        api.tick((dt) => {
          zt += dt;
          if (zt > 3.4) { zt = 0; CH.fx.floaties(api, catHome.x - 40 + U.rand(-8, 8), catHome.y - 120, 'z', '#cbd6ff'); }
        });
      }
      const alertMark = K.label('!', { size: 40, color: '#e8b64c', x: catHome.x - 40, y: catHome.y - 130, z: 20, parent: fg });
      alertMark.material.opacity = 0;

      function catNoise() {
        if (catAsleep) return;
        if (catAlert) { alertTimer = 6; return; }
        catAlert = true;
        alertTimer = 6;
        cat.wake(true);
        CH.audio.sfx('meow');
      }
      api.tick((dt) => {
        if (catAsleep) return;
        alertMark.material.opacity = catAlert ? 0.9 : 0;
        if (catAlert) {
          alertTimer -= dt;
          if (alertTimer <= 0) { catAlert = false; cat.wake(false); }
          if (!CH.engine._respawning && !CH.engine.locked && api.hero.attached
            && api.hero.plat === 'floor' && Math.abs(api.hero.x - (api.hero.__lastX || api.hero.x)) > 0.6
            && api.hero.x > 320) {
            catAlert = false; cat.wake(false);
            pounce();
          }
        } else {
          stirTimer -= dt;
          if (stirTimer <= 0) { stirTimer = U.rand(16, 26); catNoise(); }
        }
        api.hero.__lastX = api.hero.x;
      });

      async function pounce() {
        if (CH.engine._respawning) return;
        CH.engine.lock(true);
        CH.audio.sfx('meow');
        const hx = api.hero.x;
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 380, group: 'scene', ease: CH.tw.ease.quadIn,
          onUpdate: (k, o) => cat.setPos(U.lerp(catHome.x, hx - 60, o.t), catHome.y),
        });
        CH.audio.sfx('boing', 0.7);
        api.cam.bump(0.6);
        CH.engine.lock(false);
        await api.respawn();
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 700, group: 'scene', ease: CH.tw.ease.quadInOut,
          onUpdate: (k, o) => cat.setPos(U.lerp(hx - 60, catHome.x, o.t), catHome.y),
        });
        await api.think('c3.cat.batted');
      }

      // ---------- red herrings: a seed packet + a movable fridge magnet ----------
      const packG = K.g(main, { z: 24 });
      K.rbox(-16, -22, 32, 40, 4, 3, '#e8d05f', packG);
      K.ellipsoid(0, -6, 6, 9, 2, '#4a3a2c', packG, { z: 3 });
      K.box(-12, 7, 24, 2, 1, '#c9b34a', packG, { z: 3 });
      K.pad(-24, -30, 48, 56, packG, { d: 40 });
      K.tr(packG, { x: 572, y: 782, z: 24, r: 8 });
      if (st.hasItem('seed') || st.has('seedTaken')) main.remove(packG);

      const magHot = K.pad(286, 276, 48, 48, main, { d: 30, z: -100 });

      api.hot(packG, {
        id: 'k.pack',
        near: { x: 600, plat: 'floor' },
        active: () => !!packG.parent,
        act: async () => {
          api.sfx('paper');
          st.flag('seedTaken');
          st.give('seed');
          main.remove(packG);
          await api.think('sd.pack.take');
        },
      });
      api.hot(magHot, {
        id: 'k.magnet',
        near: { x: 520, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.tailWhip(360, 420));
            ctx.sfx('metal', 0.1);
            const cx0 = redMag.__t.x, cy0 = redMag.__t.y;
            const nx = 300 + U.rand(0, 140), ny = 280 + U.rand(0, 220);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 420, ease: CH.tw.ease.quadInOut,
              onUpdate: (k, o) => {
                K.tr(redMag, { x: U.lerp(cx0, nx, o.t), y: U.lerp(cy0, ny, o.t) });
                K.tr(magHot, { x: U.lerp(cx0, nx, o.t), y: U.lerp(cy0, ny, o.t) });
              },
            });
            ctx.sfx('tap');
          }, { cinema: false, skippable: false });
          catNoise();
          await api.think(st.bumpClick('k.magnet') % 2 ? 'sd.magnet.move' : 'sd.magnet.art');
        },
      });

      // ================= hotspots =================

      api.hot(kflapG, {
        id: 'k.flap',
        near: { x: 210, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(150, () => true));
            ctx.sfx('boing');
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 300, onUpdate: (k, o) => K.tr(kflapDoor, { rx: 60 * o.t }),
            });
          }, { cinema: false, skippable: false });
          await api.go('hallway', 'fromKitchen');
        },
      });

      api.hot(fridgeG, {
        id: 'k.fridge',
        near: { x: 520, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('k.fridge');
          if (n === 1) await api.think('c3.fridge.look');
          else if (n === 2) { await api.think('c3.fridge.drawing'); }
          else await api.think('c3.fridge.hum');
        },
      });

      api.hot(bowlG, {
        id: 'k.bowl',
        near: { x: 620, plat: 'floor' },
        act: async () => {
          api.sfx('tap');
          catNoise();
          await api.think(st.bumpClick('k.bowl') % 2 ? 'c3.bowl.look' : 'c3.bowl.risky');
        },
      });

      api.hot(cat.el, {
        id: 'k.cat',
        near: { x: 380, plat: 'floor' },
        act: async () => {
          if (catAsleep) { await api.think(st.bumpClick('k.cat') % 2 ? 'c5.cat.asleep' : 'c5.cat.asleep2'); return; }
          await api.think(st.bumpClick('k.cat') % 2 ? 'c3.cat.look' : 'c3.cat.look2');
        },
      });

      const drawersZone = K.pad(786, 550, 200, 250, main, { d: 60, z: -30 });
      api.hot(drawersZone, {
        id: 'k.drawers',
        near: { x: 1000, plat: 'floor' },
        active: () => !st.has('drawersOut'),
        act: async () => {
          const n = st.bumpClick('k.drawers');
          if (n === 1) { await api.think('c3.drawers.look'); return; }
          await api.cut(async (ctx) => {
            api.hero.face(-1);
            await ctx.run(api.hero.tailWhip(916, 754));
            ctx.sfx('slide', false);
            await ctx.tw({ t: 0 }, { t: 1 }, { dur: 420, ease: CH.tw.ease.backOut, onUpdate: (k, o) => K.tr(dr1, { x: 52 * o.t, z: 40 * o.t }) });
            await ctx.w(200);
            await ctx.run(api.hero.tailWhip(942, 664));
            ctx.sfx('slide', false);
            await ctx.tw({ t: 0 }, { t: 1 }, { dur: 420, ease: CH.tw.ease.backOut, onUpdate: (k, o) => K.tr(dr2, { x: 26 * o.t, z: 20 * o.t }) });
            ctx.sfx('tap');
          }, { cinema: false, skippable: false });
          st.flag('drawersOut');
          setDrawers(true);
          await api.hero.excite();
          await api.think('c3.drawers.stairs');
        },
      });

      api.hot(toasterG, {
        id: 'k.toaster',
        near: { x: 640, plat: 'stool' },
        act: async () => {
          const n = st.bumpClick('k.toaster');
          if (n === 1) { await api.think('c3.toaster.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.hopTo(698, 604, { h: 40, dur: 350 }));
            ctx.sfx('slide', false);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 300, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => {
                K.tr(lever, { y: 34 * o.t });
                api.hero.place(698, 604 + 34 * o.t, 'stool');
              },
            });
            await ctx.w(420);
            ctx.sfx('spring');
            K.tr(lever, { y: 0 });
            catNoise();
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 800, ease: CH.tw.ease.linear,
              onUpdate: (k, o) => {
                const x = U.lerp(698, 860, o.t);
                const y = U.lerp(638, 516, o.t) - Math.sin(o.t * Math.PI) * 220;
                api.hero.place(x, y, 'counter');
                api.hero.A.rock = o.t * 360 * 2;
              },
            });
            api.hero.A.rock = 0;
            ctx.sfx('thud');
            await ctx.run(api.hero.landSquash(1.4));
            CH.props.dust(api, 860, 520, 6);
          }, { cinema: false, skippable: false });
          if (!st.has('toasterDone')) {
            st.flag('toasterDone');
            await api.think('c3.toaster.fly');
          }
        },
      });

      api.hot(sinkG, {
        id: 'k.tap',
        near: { x: 980, plat: 'counter' },
        act: async () => {
          api.sfx('drip');
          const n = st.bumpClick('k.tap');
          if (n === 1) { await api.think('c3.tap.look'); }
          else {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(1046, () => true));
              api.hero.face(1);
              await ctx.tw(api.hero.A, { lid: 0.6 }, { dur: 200 });
              ctx.sfx('drip');
              await ctx.w(600);
              await ctx.tw(api.hero.A, { lid: 0, lidLo: 0.5 }, { dur: 250 });
              await ctx.w(500);
              await ctx.tw(api.hero.A, { lidLo: 0 }, { dur: 200 });
            }, { cinema: false, skippable: false });
            await api.think('c3.tap.drink');
          }
        },
      });

      api.hot(jarG, {
        id: 'k.jar',
        near: { x: 1230, plat: 'counter' },
        act: async () => {
          if (st.has('gotBrolly')) { await api.think('c3.jar.done'); return; }
          const n = st.bumpClick('k.jar');
          if (n === 1) { await api.think('c3.jar.look'); return; }
          await api.think('c3.jar.stuck');
          api.toast('c3.jar.toast');
        },
        item: {
          coin: async () => {
            if (st.has('gotBrolly')) { await api.think('c3.jar.done'); return; }
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(1290, 400));
              await ctx.run(api.hero.spin(2));
              ctx.sfx('metal', 0.4);
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => K.tr(lid, { x: 60 * o.t, y: -90 * o.t + 60 * o.t * o.t, z: 30 * o.t, r: 160 * o.t, ox: 1310, oy: 400 }),
              });
              ctx.sfx('tap');
              await ctx.run(api.hero.tailWhip(1310, 430));
              jarG.remove(redMini);   // out of the jar and into his pocket; the others stay
              ctx.sfx('coin');
              await ctx.w(300);
            }, { cinema: false, skippable: false });
            st.flag('gotBrolly');
            st.give('brolly');
            await api.hero.excite();
            await api.think('c3.jar.got');
            await api.think('c3.jar.plan');
          },
        },
      });

      api.hot(counterG, {
        id: 'k.counter',
        near: { x: 1100, plat: 'floor' },
        active: () => !st.has('drawersOut') && !st.has('toasterDone'),
        act: async () => {
          const n = st.bumpClick('k.counter');
          if (n === 1) await api.think('c3.counter.high');
          else { await api.think('c3.counter.high2'); api.toast('c3.counter.toast'); }
        },
      });

      api.hot(drawing, {
        id: 'k.drawing',
        near: { x: 520, plat: 'floor' },
        act: async () => { await api.think('c3.drawing.look'); },
      });
    },

    enter(api) {
      const st = api.state;
      if (st.has('justWoke')) {
        st.flag('justWoke', false);
        api.cut(async (ctx) => {
          const h = api.hero;
          h.A.rock = 86;
          await ctx.w(900);
          ctx.sfx('tap');
          await ctx.tw(h.A, { rock: 0 }, { dur: 700, ease: CH.tw.ease.bounceOut });
          await ctx.run(h.slowBlink());
          await ctx.run(h.lookAround());
          h.face(-1);
          await ctx.think('c5.wake1');
          await ctx.think('c5.wake2');
        }, { cinema: false }).then(() => api.toast('c5.goal'));
        return;
      }
      if (!st.has('kitchenFirst')) {
        st.flag('kitchenFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          await ctx.think('c3.first1');
          await ctx.run(api.hero.lookAround());
          await ctx.think('c3.first2');
        }, { cinema: false });
      }
    },
  });
})();
