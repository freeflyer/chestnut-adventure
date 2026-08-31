/* Chapter 1 — the study floor. Find the coin, open the vent, squeeze out. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  CH.defScene('study', {
    chapter: 1,
    pageBg: '#181f30',
    bg: '#141a2c',
    ambient: [{ name: 'tick', every: [1600, 1700] }],
    fill: 0.79, ambient2: 0.32,

    platforms: [
      { id: 'floor', x1: 120, x2: 1430, y: 800 },
    ],
    links: [],
    spots: {
      fromRamp: { x: 820, plat: 'floor' },
      fromCable: { x: 600, plat: 'floor' },
      fromVent: { x: 1150, plat: 'floor' },
      enter: { x: 800, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#202942'], [1, '#33405c']],
        floorStops: [[0, '#5e4028'], [1, '#3c2817']],
        baseboard: '#232c48',
      });

      // window (high, partial) + moon glow
      P.windowNight(far, 90, 60, 250, 330, { moon: true, moonX: 0.68, moonY: 0.3, lightI: 1.0 });
      {   // the snow globe on the sill's left corner, the same one as on the desk (the room is drawn at 0.79 of that scale)
        const globeG = K.g(far, { z: -262 });
        K.cylUp(132, 404, 20, 9, K.mat('#3c2f22', { rough: 0.6 }), globeG);
        const glass = new T.MeshPhysicalMaterial({ color: new T.Color('#cfe4ea'), transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
        K.sphere(132, 382, 19, glass, globeG, { seg: 32 }).castShadow = false;
        K.cone(129, 390, 5.5, 14, '#557f3e', globeG);
        K.box(135, 384, 5, 6, 5, '#7a5230', globeG);
      }
      P.glow(far, 210, 220, 200, '#9db8d8', 0.08, -300);
      K.sun(L, 200, 100, -100, '#9db8d8', 0.4, { tx: 700, ty: 800, tz: 0 });

      // a dim, cool ceiling light for the rest of the room; the desk lamp (below) is the real light
      K.spot(L, 900, -300, 100, 900, 800, -60, '#c9b8e8', 48, { angle: 60, penumbra: 0.9, decay: 1.4, mapSize: 2048, dist: 2400 });
      // the lamp's warm bounce off the desk, spilling onto the floor in front of it
      K.point(L, 520, 400, 90, '#ffc27a', 4.5, 900, { decay: 1.5 });

      // ---------- the desk seen from the floor (left) ----------
      const wood = P.woodMat('#7a5230', '#5a3a20', 0.65);
      const deskG = K.g(mid);
      // the desk top sits below the window sill (390), as a desk under a window does
      K.box(60, 410, 600, 46, 300, wood, deskG, { z: -180 });
      K.box(60, 410, 600, 4, 6, '#a8763f', deskG, { z: -29 });
      K.box(70, 456, 34, 344, 40, '#4a2e18', deskG, { z: -60 });       // front legs, at the corners, behind his line
      K.box(616, 456, 34, 344, 40, '#4a2e18', deskG, { z: -60 });
      K.box(70, 456, 34, 344, 40, '#3a2212', deskG, { z: -300 });      // back legs
      K.box(616, 456, 34, 344, 40, '#3a2212', deskG, { z: -300 });
      K.box(170, 476, 374, 150, 24, '#7a5030', deskG, { z: -70 });      // drawer front
      K.sphere(357, 550, 8, K.mat('#a8823c', { metal: 0.3, rough: 0.6 }), deskG, { z: -54 });

      // ---- the desk top, exactly as the hero left it (≈2/3 scale, edge at x660) ----
      const deskTop = K.g(mid, { y: 80 });   // everything on the desk rides down with it
      // the desk lamp, right where it stands upstairs (≈2/3 scale), its shade turned down the desk
      const lampG = K.g(deskTop, { z: -170 });
      K.ellipsoid(44, 328, 41, 6, 30, K.mat('#3a2313', { rough: 0.6, metal: 0.3 }), lampG);
      K.tube([[44, 325, 0], [40, 276, 0], [56, 236, 0], [90, 214, 0], [118, 192, 0]], 4, K.mat('#c9762e', { rough: 0.5, metal: 0.4 }), lampG, { seg: 24 });
      const shadeG = K.g(lampG, { x: 116, y: 188, r: -52 });
      const shade = K.mesh(new T.CylinderGeometry(6, 30, 52, 28, 1, true), K.mat('#d9822a', { rough: 0.55, metal: 0.15 }), shadeG);
      K.tr(shade, { y: 26, r: 180 });
      const shadeIn = K.mesh(new T.CylinderGeometry(5.6, 29.4, 51.4, 28, 1, true), K.mat('#5a3410', { rough: 0.7, side: 'back' }), shadeG);
      K.tr(shadeIn, { y: 26, r: 180 }); shadeIn.castShadow = false;
      K.cylUp(0, 1, 7, 3, K.mat('#b86a20', { rough: 0.5, metal: 0.2 }), shadeG);
      K.sphere(0, 20, 5, new T.MeshStandardMaterial({ color: new T.Color('#fff2c8'), emissive: new T.Color('#ffe2a0'), emissiveIntensity: 1.6, roughness: 0.4 }), shadeG).castShadow = false;
      // its light: from the mouth of the shade down the desk and over the edge — this is what throws the shadows
      // the axis of the shade (52° off vertical) is the axis of the light and of the drawn beam
      K.spot(L, 155, 302, -170, 471, 550, -60, '#ffcf7a', 54, { angle: 28, penumbra: 0.7, decay: 1.5, mapSize: 2048, dist: 1800 });
      K.point(L, 162, 310, -140, '#ffb454', 1.4, 700);
      K.glow(mid, 158, 308, -130, 34, '#ffb454', 0.1);
      K.rbox(250, 322, 40, 6, 40, 2, '#f0dc74', deskTop, { z: -180, r: 3 });
      K.rodX(232, 286, 326, 2.8, K.mat('#e8a13c', { rough: 0.6 }), deskTop, { z: -100, r: -6 });
      const tedMini = CH.actors.ted(K.g(deskTop, { z: -60 }), 256, 330, 0.9);   // right of the lamp, as on the desk; his pot narrower than the mug
      api.anchor('ted', tedMini.anchor);
      K.cylUp(366, 330, 28, 50, K.mat('#b5525c', { rough: 0.45 }), deskTop, { rTop: 31, z: -70 });   // the mug at two thirds of the one upstairs
      K.torus(400, 306, 13, 4.5, K.mat('#b5525c', { rough: 0.45 }), deskTop, { z: -70 });
      if (!st.has('cableDown')) {
        const pts = K.pathPoints('M 400 322 C 424 300 456 302 466 318 C 472 330 436 332 444 314', 24).map((p, i) => [p[0], p[1], 40 + Math.sin(i * 0.5) * 8]);
        K.tube(pts, 2.8, K.mat('#d8d4c8', { rough: 0.6 }), deskTop, { seg: 40, radial: 6 });
      }
      // the tape and the books sit back from the front edge, leaving the front strip for the cable to lie on
      K.ext('M 486 330 L 486 312 A 17 17 0 0 1 520 312 L 520 330 Z', 26, K.mat('#4a6a8a', { rough: 0.55 }), deskTop, { z: -110, bevel: 2 });
      K.disc(503, 312, 10, 28, K.mat('#7fa8c9', { rough: 0.5 }), deskTop, { z: -110 });
      K.rbox(520, 314, 130, 16, 106, 3, '#4a6a5a', deskTop, { z: -130 });
      K.rbox(532, 298, 118, 16, 106, 3, '#5a4a7a', deskTop, { z: -130 });
      if (!st.has('bookRamp')) K.rbox(526, 282, 126, 16, 106, 3, '#8a4a52', deskTop, { z: -130 });

      // chair
      const chairG = K.g(mid, { z: -110 });
      K.rbox(716, 498, 200, 26, 170, 10, '#7c4a48', chairG);
      K.rbox(892, 294, 24, 204, 170, 8, '#6a3f3d', chairG);
      K.cylUp(816, 740, 10, 216, K.mat('#513029', { rough: 0.5, metal: 0.3 }), chairG);
      K.cylUp(816, 752, 16, 14, K.mat('#4a2b24', { rough: 0.6 }), chairG);                 // the hub
      for (let i = 0; i < 5; i++) {
        // five arms sloping from the hub down to their casters, casters on the floor
        const a = (i * 72 + 18) * K.DEG, ex = Math.cos(a) * 74, ez = -Math.sin(a) * 74;
        K.tube([[816, 748, 0], [816 + ex * 0.55, 768, ez * 0.55], [816 + ex, 786, ez]], 4.5, K.mat('#4a2b24', { rough: 0.6 }), chairG, { seg: 8, radial: 8 });
        K.sphere(816 + ex, 792, 7, K.mat('#4a4048', { rough: 0.5 }), chairG, { z: ez });
      }
      K.pad(710, 484, 212, 50, chairG);

      // return routes: the fallen book ramp / the hanging cable
      if (st.has('bookRamp')) {
        const bookG = K.g(mid, { z: -110 });
        K.rbox(0, 0, 130, 16, 106, 3, '#8a4a52', bookG);
        K.box(8, 3, 114, 10, 4, '#c98a63', bookG, { z: 54 });
        K.tr(bookG, { x: 666, y: 393, r: 46, ox: 0, oy: 0 });   // underside over the desk's edge corner (660,410), lower end on the seat
      }
      const cableG = K.g(mid, { z: -14 });
      if (st.has('cableDown')) {
        // over the front edge of the desk, then straight down to the floor
        // it lies along the desk top's front strip, in front of the books, folds over the edge and hangs
        // on his plane — not dead straight: a cable keeps a little of its coil
        const pts = [[400, 406, -44], [470, 405, -44], [540, 406, -44], [600, 406, -44], [640, 406, -42], [656, 407, -36], [664, 410, -30], [669, 424, -24], [670, 460, -18], [668, 520, -14], [664, 590, -12], [666, 660, -14], [670, 720, -16], [666, 770, -14], [666, 800, -14]];   // along the front strip, a clear gap in front of the books, like upstairs
        K.tube(pts, 4.5, K.mat('#d8d4c8', { rough: 0.6 }), cableG, { seg: 120, radial: 8 });
        const plug = K.g(cableG);
        K.rbox(-9, -7, 24, 14, 14, 3, '#b8b4a8', plug);
        K.tr(plug, { x: 666, y: 792, r: 90 });
        K.pad(600, 396, 92, 410, cableG, { d: 60 });
      }

      // ---------- bookshelf (backdrop, right of chair) ----------
      const shelfG = K.g(far, { z: -300 });
      K.box(950, 210, 230, 590, 60, '#3c2f22', shelfG);
      K.box(950, 210, 12, 590, 66, '#2e2418', shelfG, { z: 3 });
      K.box(1168, 210, 12, 590, 66, '#2e2418', shelfG, { z: 3 });
      for (let r = 0; r < 3; r++) {
        K.box(962, 260 + r * 180, 206, 12, 62, '#2a2018', shelfG, { z: 4 });
        let bx = 972;
        while (bx < 1140) {
          const bw = U.randi(22, 44), bh = U.randi(90, 150);
          K.rbox(bx, 260 + r * 180 - bh, bw, bh, 50, 2, U.pick(['#6a4a5a', '#4a5e52', '#5a4a72', '#7a5a3c', '#4a4a66']), shelfG, { z: 6, r: 0 });
          bx += bw + 4;
        }
      }

      // ---------- the door (right, firmly shut) ----------
      const doorG = P.door(mid, 1310, 300, 180, 500, {});

      // ---------- the vent grate (between shelf and door) ----------
      const ventG = K.g(main, { z: -300 });
      K.box(1194, 706, 96, 94, 40, K.mat('#0b0f1a', { rough: 1 }), ventG, { z: -30 });
      const grate = K.g(ventG);
      const gm = K.mat('#6a7890', { rough: 0.5, metal: 0.5 });
      // a little cool spill by the door so the grate and the socket read in the dark corner
      K.point(L, 1240, 690, -190, '#9db8d8', 2.6, 700, { decay: 1.6 });
      K.point(L, 1400, 520, -190, '#c9b8e8', 2.4, 700, { decay: 1.6 });   // and the door beside it
      K.rbox(1188, 702, 108, 8, 8, 2, gm, grate);
      K.rbox(1188, 794, 108, 8, 8, 2, gm, grate);
      K.rbox(1188, 702, 8, 100, 8, 2, gm, grate);
      K.rbox(1288, 702, 8, 100, 8, 2, gm, grate);
      for (let i = 0; i < 5; i++) K.rbox(1196, 716 + i * 16, 92, 7, 6, 3, K.mat('#3c4a68', { rough: 0.5, metal: 0.4 }), grate, { r: 0 });
      const screwMat = K.mat('#8a95ab', { rough: 0.35, metal: 0.7 });
      const screwA = K.g(grate);
      K.disc(1197, 712, 6, 4, screwMat, screwA, { z: 6 });
      K.box(1193, 711, 8, 2, 2, '#2c3550', screwA, { z: 9 });
      const screwB = K.g(grate);
      K.disc(1287, 792, 6, 4, screwMat, screwB, { z: 6 });
      K.box(1283, 791, 8, 2, 2, '#2c3550', screwB, { z: 9 });
      const setVent = (open) => {
        if (open) K.tr(grate, { x: -6, y: -4, r: -78, ox: 1188, oy: 802 });
        else K.tr(grate, { x: 0, y: 0, r: 0 });
      };
      setVent(st.has('ventOpen'));

      // ---------- dust bunnies + the coin under the desk ----------
      const dustG = K.g(main);
      const dustMat = K.mat('#a7a4ae', { rough: 1, opacity: 0.75, flat: true });
      for (let i = 0; i < 4; i++) {
        const dx = 210 + i * 60 + U.rand(-10, 10), dz = U.rand(-160, 60);
        for (let k = 0; k < 4; k++) K.sphere(dx + U.rand(-14, 14), 794 - U.rand(0, 8), U.rand(5, 9), dustMat, dustG, { z: dz + U.rand(-10, 10) });
      }
      const coinG = K.g(main, { z: -30 });
      const coin = K.cylUp(370, 795, 15, 3, K.mat('#e8b64c', { rough: 0.3, metal: 0.8, emissive: '#e8b64c', ei: 0.35 }), coinG, { seg: 32 });
      K.cylUp(370, 792.5, 12, 1, K.mat('#f4cc66', { rough: 0.3, metal: 0.8, emissive: '#f4cc66', ei: 0.4 }), coinG, { seg: 32 });
      const coinGlint = K.glow(coinG, 370, 790, 12, 26, '#fff6d8', 0.3);
      K.pad(338, 768, 64, 44, coinG, { d: 60 });
      if (st.hasItem('coin') || st.has('coinTaken')) main.remove(coinG);
      let glintT = 0;
      api.tick((dt) => {
        if (!coinG.parent) return;
        glintT += dt;
        coinGlint.material.opacity = 0.1 + 0.25 * (Math.sin(glintT * 3) + 1) / 2;
      });
      void coin;

      // ---------- red herrings: a paper basket + a wall socket ----------
      const basketG = K.g(main, { z: -70 });
      K.cylUp(260, 800, 48, 148, K.mat('#4a566e', { rough: 0.6, metal: 0.3 }), basketG, { rTop: 64, seg: 28 });
      K.torus(260, 668, 62, 3, K.mat('#37415a', { rough: 0.6 }), basketG, { rx: 90 });
      K.torus(260, 696, 56, 3, K.mat('#37415a', { rough: 0.6 }), basketG, { rx: 90 });
      K.sphere(260, 664, 15, K.mat('#8f8878', { rough: 1, flat: true }), basketG, { sx: 1.2, sy: 0.8, sz: 1, seg: 7 });
      K.sphere(236, 668, 11, K.mat('#8f8878', { rough: 1, flat: true }), basketG, { seg: 7 });
      const ballG = K.g(main, { z: -20 });
      K.sphere(0, 0, 9, K.mat('#e8e0cc', { rough: 0.95, flat: true }), ballG, { seg: 7 });
      K.pad(-22, -22, 44, 44, ballG, { d: 44 });
      ballG.visible = false;
      let ballX = 340, ballOut = false;
      K.tr(ballG, { x: ballX, y: 791 });

      const socketG = K.g(mid, { z: -324 });
      K.rbox(1238, 596, 30, 40, 8, 4, '#3c465e', socketG);
      K.disc(1253, 610, 3, 3, '#1c2338', socketG, { z: 5 });
      K.disc(1253, 622, 3, 3, '#1c2338', socketG, { z: 5 });
      K.pad(1228, 586, 50, 60, socketG, { d: 30 });

      api.hot(basketG, {
        id: 's.basket',
        near: { x: 360, plat: 'floor' },
        act: async () => {
          if (!ballOut) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(260, 686));
              ctx.sfx('paper');
              ballOut = true;
              ballG.visible = true;
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => { K.tr(ballG, { x: U.lerp(260, ballX, o.t), y: 791 - Math.sin(o.t * Math.PI) * 50, r: o.t * 260 }); },
              });
            }, { cinema: false, skippable: false });
            await api.think('sd.basket.knock');
          } else await api.think('sd.basket.look');
        },
      });
      api.hot(ballG, {
        id: 's.ball',
        near: null,
        active: () => ballOut,
        act: async () => {
          const from = ballX;
          const to = U.clamp(from + U.rand(160, 300) * (from > 800 ? -1 : 1), 200, 1350);
          await api.walkTo(from - 40, 'floor');
          await api.cut(async (ctx) => {
            ctx.sfx('boing', 1.2);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 700, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => K.tr(ballG, { x: U.lerp(from, to, o.t), y: 791 - Math.sin(o.t * Math.PI) * 90, r: o.t * 540 }),
            });
            ballX = to;
          }, { cinema: false, skippable: false });
          if (st.bumpClick('s.ball') === 1) await api.think('sd.ball.kick');
        },
      });
      api.hot(socketG, {
        id: 's.socket',
        near: { x: 1230, plat: 'floor' },
        act: async () => { await api.think(st.bumpClick('s.socket') % 2 ? 'sd.socket.look' : 'sd.socket.look2'); },
      });

      // ================= hotspots =================

      api.hot(coinG, {
        id: 's.coin',
        near: { x: 420, plat: 'floor' },
        active: () => !!coinG.parent,
        act: async () => {
          api.sfx('coin');
          st.flag('coinTaken');
          st.give('coin');
          main.remove(coinG);
          await api.think('c1.coin.take');
        },
      });

      api.hot(dustG, {
        id: 's.dust',
        near: { x: 300, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('s.dust');
          if (n === 1) { CH.props.dust(api, 280, 780, 6); api.sfx('paper'); await api.think('c1.dust.look'); }
          else await api.think('c1.dust.look2');
        },
      });

      api.hot(chairG, {
        id: 's.chair', near: { x: 760, plat: 'floor' },
        act: async () => { await api.think('c1.chair.look'); },
      });

      api.hot(shelfG, {
        id: 's.shelf', near: { x: 1050, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('s.shelf');
          await api.think(n % 2 ? 'c1.shelf.look' : 'c1.shelf.look2');
        },
      });

      api.hot(doorG, {
        id: 's.door',
        near: { x: 1270, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('s.door');
          if (n === 1) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(1180, () => true));
              api.hero.face(1);
              await ctx.w(200);
              await ctx.run(api.hero.hopTo(1290, 800, { h: 26, dur: 300 }));
              ctx.sfx('doorThud');
              api.cam.bump(1);
              await ctx.tw(api.hero.A, { rock: -18 }, { dur: 90 });
              await ctx.run(api.hero.hopTo(1210, 800, { h: 40, dur: 340 }));
              await ctx.tw(api.hero.A, { rock: 0 }, { dur: 140 });
              await ctx.run(api.hero.dizzy(900));
            }, { cinema: false, skippable: false });
            await api.think('c1.door.bonk');
          } else if (n === 2) await api.think('c1.door.look2');
          else await api.think('c1.door.look3');
        },
      });

      api.hot(ventG, {
        id: 's.vent',
        near: { x: 1130, plat: 'floor' },
        act: async () => {
          if (st.has('ventOpen')) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(1242, () => true));   // square in front of the open vent
              api.hero.face(1);
              await ctx.w(160);
              // in he goes: two hops away from us, up to the wall, then a squeeze through the opening
              await ctx.run(api.hero.hopTo(1242, 800, { h: 30, dur: 360, z: -130 }));
              await ctx.run(api.hero.hopTo(1242, 800, { h: 30, dur: 360, z: -262 }));   // and in: the perspective does the shrinking
              await ctx.w(160);
            }, { cinema: false, skippable: false });
            if (st.data.chapter === 1) await api.chapterDone(1);
            else { await CH.dialog.think('c1.vent.shortcut', { ms: 2400 }); await api.go('hallway', 'fromVent'); }
            return;
          }
          const n = st.bumpClick('s.vent');
          if (n === 1) { await api.think('c1.vent.look'); }
          else if (n === 2) { await api.think('c1.vent.look2'); api.toast('c1.vent.hinttoast'); }
          else await api.think('c1.vent.look2');
        },
        item: {
          clip: async () => {
            if (st.has('ventOpen')) { await api.think('c1.vent.already'); return; }
            await api.hero.tailWhip(1197, 712);
            api.sfx('metal', 0.15);
            await api.think('sd.vent.clip');
          },
          coin: async () => {
            if (st.has('ventOpen')) { await api.think('c1.vent.already'); return; }
            await api.cut(async (ctx) => {
              api.hero.face(1);
              await ctx.run(api.hero.tailWhip(1197, 712));
              await ctx.run(api.hero.spin(2));
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 400, onUpdate: (k, o) => K.tr(screwA, { x: -30 * o.t, y: -60 * o.t, z: 30 * o.t, r: 200 * o.t, ox: 1197, oy: 712 }),
              });
              grate.remove(screwA);
              ctx.sfx('coin');
              await ctx.run(api.hero.tailWhip(1287, 792));
              await ctx.run(api.hero.spin(2));
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 400, onUpdate: (k, o) => K.tr(screwB, { x: 30 * o.t, y: -50 * o.t, z: 30 * o.t, r: -220 * o.t, ox: 1287, oy: 792 }),
              });
              grate.remove(screwB);
              ctx.sfx('metal', 0.5);
              setVent(true);
              CH.props.dust(api, 1210, 790, 7, -280);
              await ctx.w(300);
            }, { cinema: false, skippable: false });
            st.flag('ventOpen');
            await api.hero.excite();
            await api.think('c1.vent.open');
          },
        },
      });

      if (st.has('cableDown')) {
        api.hot(cableG, {
          id: 's.cableUp',
          near: { x: 620, plat: 'floor' },
          act: async () => {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.climbUp(646, 356));
            }, { cinema: false, skippable: false });
            await api.go('desk', 'fromReturn');
          },
        });
      }

      // under-desk shadow zone (flavour)
      const underDesk = K.hplane(110, 612, 799, -250, 40, new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false }), mid);
      api.hot(underDesk, {
        id: 's.under',
        near: { x: 320, plat: 'floor' },
        act: async () => { await api.think('c1.under.look'); },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('floorFirst')) {
        st.flag('floorFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          await ctx.think('c1.floor.first');
          await ctx.say('ted', 'c1.ted.fromAbove');
        }, { cinema: false });
      }
    },
  });
})();
