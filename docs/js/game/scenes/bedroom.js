/* Chapter 4 — the Kid's bedroom: dark until the night-light, then the window. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  const WALL = -330;

  CH.defScene('bedroom', {
    chapter: 5,
    pageBg: '#121022',
    bg: '#0f0d1e',
    sneak: true, // someone is asleep in here — the hero tiptoes
    ambient: [],
    fill: 1.2, ambient2: 0.5,
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 150, x2: 1470, y: 800 },
      { id: 'blocks', x1: 470, x2: 596, y: 706, noWalk: true },
      { id: 'bed', x1: 620, x2: 1000, y: 648 },
      { id: 'stand', x1: 1060, x2: 1180, y: 600, noWalk: true },
      { id: 'sill', x1: 1230, x2: 1470, y: 546 },
    ],
    links: [
      { a: 'floor', b: 'blocks', ax: 530, bx: 530, type: 'hop' },
      { a: 'blocks', b: 'bed', ax: 560, bx: 660, type: 'hop' },
      { a: 'bed', b: 'stand', ax: 980, bx: 1100, type: 'hop' },
      { a: 'stand', b: 'sill', ax: 1150, bx: 1270, type: 'hop', when: (s) => s.has('lampOn') },
      { a: 'bed', b: 'floor', ax: 700, bx: 640, type: 'drop', dir: 'ab' },
      { a: 'sill', b: 'floor', ax: 1300, bx: 1240, type: 'drop', dir: 'ab' },
    ],
    spots: {
      enter: { x: 230, plat: 'floor' },
      sill: { x: 1350, plat: 'sill' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#2a2444'], [1, '#403860']],
        floorStops: [[0, '#66452c'], [1, '#422c19']],
        baseboard: '#2c2648',
      });

      // wall stars (kid stickers)
      const starMat = K.mat('#e8d88a', { rough: 0.9, emissive: '#e8d88a', ei: 0.15 });
      for (let i = 0; i < 12; i++) {
        const sx = U.rand(200, 1100), sy = U.rand(60, 320);
        const s2 = K.cut('M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', starMat, far, { x: sx, y: sy, z: WALL + 1.5, s: U.rand(0.7, 1.4), r: U.rand(0, 45) });
        s2.castShadow = false;
      }

      // door back to the corridor: a dark gap and the door edge
      const doorG = P.openDoor(mid, 110, 300, 120, 500, { z: WALL, hinge: 'right', angle: 64 });
      K.pad(90, 290, 170, 520, doorG, { d: 50, z: WALL + 30 });

      // ---------- toy blocks ----------
      const blocksG = K.g(main, { z: -60 });
      const block = (x, y, c, letter) => {
        K.rbox(x, y, 64, 64, 64, 8, c, blocksG);
        K.box(x + 6, y + 6, 52, 52, 4, K.mat(c, { rough: 0.9 }), blocksG, { z: 33 });
        K.box(x + 6, y + 6, 52, 3, 5, '#00000040', blocksG, { z: 33 });
        K.label(letter, { size: 34, color: '#fff6e4', x: x + 32, y: y + 34, z: 36, parent: blocksG });
      };
      block(470, 736, '#c96a5f', 'K');
      block(538, 736, '#5a9e8f', 'I');
      block(504, 670, '#e0a050', 'D');
      // scattered crayons
      [[380, 792, -20, '#e2635f', 40], [420, 798, 15, '#67b8a0', -30], [352, 800, 40, '#e8b64c', 10]].forEach((c) => {
        const g = K.g(main, { x: c[0], y: c[1] - 4, z: c[4], r: c[2] });
        K.rodX(-22, 22, 0, 4, K.mat(c[3], { rough: 0.7 }), g);
        const tip = K.cone(28, 0, 4, 10, c[3], g); K.tr(tip, { r: 90, x: 22, y: -5 });
      });

      // ---------- the bed ----------
      const bedG = K.g(mid, { z: -160 });
      const wood = P.woodMat('#8a6a42', '#6b4a33', 0.75);
      K.rbox(600, 420, 40, 380, 230, 10, wood, bedG);   // headboard
      K.rbox(990, 520, 34, 280, 230, 10, wood, bedG);   // footboard
      K.rbox(614, 640, 396, 140, 220, 10, '#6b4a33', bedG);  // frame
      K.pillow(618, 600, 390, 60, 214, '#e8e0cc', bedG);     // mattress
      // striped blanket, draped over the front
      const blanket = K.g(bedG);
      K.ext('M 620 640 L 1006 640 L 1006 700 Q 810 726 620 700 Z', 210, K.mat('#5a7ea0', { rough: 0.95 }), blanket, { bevel: 6, z: 0 });
      for (let i = 0; i < 5; i++) K.rbox(654 + i * 70, 640, 12, 58 - (i % 2) * 8, 214, 4, '#48688a', blanket, { z: 0 });
      K.pillow(640, 588, 120, 44, 150, '#f4ecd8', bedG, { z: -20 });   // pillow

      // the Kid, fast asleep — turned to the wall, tucked in to the ears
      const sleeper = K.g(bedG);
      const breath = K.g(sleeper);
      K.ext('M 684 640 C 690 600 722 570 780 568 C 818 567 838 580 858 588 C 900 596 950 620 986 640 Z', 150, K.mat('#5a7ea0', { rough: 0.95 }), breath, { bevel: 14, z: -10 });
      K.tube([[762, 572, 60], [770, 600, 66], [769, 640, 70]], 5.5, K.mat('#48688a', { rough: 0.95 }), breath, { seg: 8, radial: 6 });
      K.tube([[856, 590, 60], [862, 615, 64], [863, 640, 66]], 5, K.mat('#48688a', { rough: 0.95 }), breath, { seg: 8, radial: 6 });
      // the back of a tousled head on the pillow, turned to the wall: hair, an ear tip, no face
      K.sphere(690, 572, 28, K.mat('#4a3c56', { rough: 1 }), breath, { z: -26, seg: 28, sx: 1.1, sy: 0.95, sz: 1 });   // on the pillow, sinking a little into it
      K.ellipsoid(686, 560, 25, 14, 20, K.mat('#3c3048', { rough: 1 }), breath, { z: -20 });
      [[666, 552, -8], [678, 546, -6], [692, 544, -4], [706, 548, -6]].forEach((p) => K.tube([[p[0], p[1], p[2]], [p[0] + 4, p[1] - 9, p[2] + 2], [p[0] + 10, p[1] - 12, p[2] + 4]], 2.4, K.mat('#3c3048', { rough: 1 }), breath, { seg: 6, radial: 5 }));
      K.ellipsoid(707, 580, 6, 8, 3, K.mat('#e0b8a0', { rough: 0.9 }), breath, { z: -2 });
      K.ellipsoid(700, 598, 18, 12, 22, K.mat('#5a7ea0', { rough: 0.95 }), breath, { z: -14 });   // the shoulder under the blanket, up to the neck
      // blanket pulled right up over the shoulder
      K.ext('M 648 622 Q 700 594 756 604 L 756 640 L 648 640 Z', 160, K.mat('#5a7ea0', { rough: 0.95 }), breath, { bevel: 8, z: -6 });
      let bt = U.rand(0, 6);
      api.tick((dt) => {
        bt += dt;
        const ph = (Math.sin(bt * 1.3) + 1) / 2;
        const sy = 1 + 0.085 * ph;
        K.tr(breath, { y: 640 * (1 - sy), sx: 1, sy, sz: 1 });
      });
      // teddy on the bed
      const teddy = K.g(main, { z: -120 });
      CH.models.teddy(teddy, 940, 596, 0, 0.9);   // sitting on the mattress, not in it
      // the Kid's dream-cloud: it drifts above him once the night-light shows him
      const cloud = CH.dreamfx.cloud(main, 716, 512, 1, -100);
      cloud.g.visible = st.has('lampOn');

      // ---------- nightstand + star night-light ----------
      const standG = K.g(mid, { z: -120 });
      K.rbox(1060, 610, 120, 190, 120, 10, '#7e5a3c', standG);
      K.rbox(1072, 640, 96, 56, 8, 6, '#6b4a33', standG, { z: 62 });
      K.sphere(1120, 668, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), standG, { z: 68 });
      const lampG = K.g(main, { z: -110 });
      const starOn = K.mat('#ffd489', { emissive: '#ffd489', ei: 0.45, rough: 0.6 });
      const starOff = K.mat('#8a7a5c', { rough: 0.8, emissive: '#8a7a5c', ei: 0.16 });
      const star = K.ext('M 1120 560 L 1132 584 L 1158 588 L 1139 606 L 1144 632 L 1120 620 L 1096 632 L 1101 606 L 1082 588 L 1108 584 Z', 14, st.has('lampOn') ? starOn : starOff, lampG, { bevel: 3 });
      K.rbox(1112, 596, 16, 18, 14, 4, '#8a6a42', lampG, { z: -8 });
      const chain = K.g(lampG);
      K.cylUp(1140, 668, 1.5, 58, K.mat('#c9c4b4', { rough: 0.7 }), chain);
      K.sphere(1140, 674, 6, K.mat('#c9c4b4', { rough: 0.7 }), chain);
      K.pad(1076, 550, 90, 134, lampG, { d: 60 });
      const lampGlow = K.glow(main, 1120, 592, -100, 70, '#ffcf7a', 0.04);
      const lampLight = K.point(L, 1120, 570, -30, '#ffcf7a', 4.5, 1100, { shadow: true, decay: 1.7 });
      const lampWash = K.spot(L, 1120, 560, -60, 800, 700, -200, '#ffcf7a', 33, { angle: 80, penumbra: 0.9, decay: 1.4, shadow: false, dist: 1800 });
      const setLamp = (on) => { lampGlow.visible = on; lampLight.intensity = on ? 4.5 : 0; lampWash.intensity = on ? 33 : 0; star.material = on ? starOn : starOff; };
      setLamp(st.has('lampOn'));

      // ---------- the window ----------
      const winG = K.g(mid);
      // a deep frame standing proud of the wall, the night behind it, the sash in front
      K.vplane(1216, 1484, 130, 550, WALL + 2, K.mat('#0d1322', { rough: 1 }), winG);
      K.box(1216, 130, 268, 14, 26, '#20283e', winG, { z: WALL + 22 }); K.box(1216, 536, 268, 14, 26, '#20283e', winG, { z: WALL + 22 });
      K.box(1216, 130, 14, 420, 26, '#20283e', winG, { z: WALL + 22 }); K.box(1470, 130, 14, 420, 26, '#20283e', winG, { z: WALL + 22 });
      K.box(1230, 144, 240, 46, 4, '#0d1322', winG, { z: WALL + 6 });   // dark night gap when the sash tilts
      const glass = K.canvasTex(256, 256, (ctx, cw, ch) => {
        const gr = ctx.createLinearGradient(0, 0, cw * 0.6, ch);
        gr.addColorStop(0, '#5f7ea8'); gr.addColorStop(0.5, '#33507c'); gr.addColorStop(1, '#141f3a');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 14; i++) ctx.fillRect(Math.random() * cw, Math.random() * ch * 0.5, 2, 2);
      });
      const sash = K.g(winG, { z: WALL + 38 });
      const pane = K.vplane(1230, 1470, 144, 536, 0, new T.MeshStandardMaterial({ map: glass, emissiveMap: glass, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.6, roughness: 0.3 }), sash);
      pane.scale.y = -1; pane.userData.__disposeTex = glass;
      K.disc(1408, 240, 30, 3, K.mat('#f4ecd7', { emissive: '#f4ecd7', ei: 1.3 }), sash, { z: 3 }).castShadow = false;
      K.glow(sash, 1408, 240, 8, 90, '#dfe8ff', 0.25);
      const barMat = K.mat('#141a28', { rough: 1 });
      K.box(1345, 144, 10, 392, 12, barMat, sash, { z: 6 });
      K.box(1230, 335, 240, 10, 12, barMat, sash, { z: 6 });
      K.box(1230, 144, 240, 10, 12, barMat, sash, { z: 6 });
      K.box(1230, 526, 240, 10, 12, barMat, sash, { z: 6 });
      K.box(1230, 144, 10, 392, 12, barMat, sash, { z: 6 });
      K.box(1460, 144, 10, 392, 12, barMat, sash, { z: 6 });
      K.point(L, 1350, 340, WALL + 300, '#9db8d8', 1.2, 900);   // the moonlight in the room, well clear of the bars
      K.sun(L, 1350, 200, -150, '#9db8d8', 0.7, { tx: 900, ty: 800, tz: 0 });
      // the handle (tilt latch) on the sash bottom
      const handle = K.g(main, { z: WALL + 54 });
      K.rbox(1338, 500, 12, 40, 10, 5, K.mat('#c9d6da', { rough: 0.35, metal: 0.5 }), handle);
      K.sphere(1344, 500, 8, K.mat('#aebec4', { rough: 0.35, metal: 0.5 }), handle);
      // the child-safety catch on the frame
      const catchG = K.g(winG, { z: WALL + 52 });
      K.rbox(1238, 508, 24, 34, 10, 5, K.mat('#8a95ab', { rough: 0.4, metal: 0.6 }), catchG);
      const catchBolt = K.rbox(1246, 490, 8, 26, 6, 3, K.mat('#c9d6da', { rough: 0.35, metal: 0.5 }), catchG, { z: 6 });
      K.disc(1250, 526, 3.5, 2, '#1c2338', catchG, { z: 8 });
      if (st.has('catchOpen')) K.tr(catchBolt, { y: -18 });
      const setSash = (open) => {
        if (open) K.tr(sash, { z: WALL + 38, rx: 4.5, ox: 0, oy: 536, y: -4 });
        else K.tr(sash, { z: WALL + 38, rx: 0, y: 0 });
      };
      setSash(st.has('windowOpen'));
      // sill
      K.rbox(1210, 546, 290, 18, 80, 4, '#20283e', winG, { z: WALL + 60 });
      K.pad(1216, 130, 268, 420, winG, { d: 50, z: WALL + 58 });
      // curtain
      K.ext('M 1198 120 C 1230 300 1196 440 1226 560 L 1160 560 L 1160 120 Z', 22, K.mat('#54405c', { rough: 1 }), mid, { z: WALL + 40, bevel: 3 });

      // wardrobe far right
      const ward = K.g(far, { z: WALL + 60 });
      K.rbox(1500, 240, 90, 560, 120, 6, '#3c2f22', ward);
      K.box(1544, 252, 3, 536, 4, '#2a2018', ward, { z: 62 });
      K.sphere(1536, 520, 5, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), ward, { z: 64 });
      K.sphere(1554, 520, 5, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), ward, { z: 64 });

      // ---------- darkness veil (until the night-light) ----------
      const veil = K.vplane(-1500, 3100, -1500, 2400, 380, new T.MeshBasicMaterial({ color: new T.Color('#0a0820'), transparent: true, opacity: st.has('lampOn') ? 0 : 0.36, depthWrite: false, fog: false }), fg);
      veil.userData.noHit = true; veil.renderOrder = 20;

      // ================= hotspots =================

      api.hot(doorG, {
        id: 'b.door',
        near: { x: 220, plat: 'floor' },
        act: async () => { await api.go('corridor', 'fromBed'); },
      });

      api.hot(blocksG, {
        id: 'b.blocks',
        near: { x: 660, plat: 'bed' },
        act: async () => { await api.think('c4.blocks.look'); },
      });

      api.hot(teddy, {
        id: 'b.teddy',
        near: { x: 920, plat: 'bed' },
        act: async () => {
          const n = st.bumpClick('b.teddy');
          if (n === 1) await api.think('c4.teddy.look');
          else await api.think('c4.teddy.hug');
        },
      });

      api.hot(bedG, {
        id: 'b.bed',
        near: { x: 700, plat: 'bed' },
        act: async () => { await api.think('c4.bed.look'); },
      });
      // clicking the far half of the bed, or the nightstand, takes him across — that is the way to the lamp and the window
      const bedFar = K.g(mid, { z: -40 });
      K.pad(820, 556, 190, 96, bedFar, { d: 30 });
      api.hot(bedFar, {
        id: 'b.bed2',
        near: { x: 960, plat: 'bed' },
        act: async () => { await api.think('c4.bed.look'); },
      });
      const standPad = K.g(mid, { z: -170 });   // its own pad on the stand's body, behind and below the lamp's, so the star still takes the click
      K.pad(1060, 690, 120, 110, standPad, { d: 40 });
      api.hot(standPad, {
        id: 'b.stand',
        near: { x: 1120, plat: 'stand' },
        act: async () => { await api.think('c4.stand.look'); },
      });

      api.hot(lampG, {
        id: 'b.lamp',
        near: { x: 1110, plat: 'bed' },
        act: async () => {
          if (st.has('lampOn')) { await api.think('c4.lamp.on'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(985, () => true));
            api.hero.face(1);
            await ctx.run(api.hero.tailWhip(1140, 674));
            ctx.sfx('tap');
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 200, onUpdate: (k, o) => K.tr(chain, { y: 14 * Math.sin(o.t * Math.PI) }),
            });
            ctx.sfx('ui');
            st.flag('lampOn');
            setLamp(true);
            await ctx.tw({ v: 0.36 }, { v: 0 }, {
              dur: 900, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => { veil.material.opacity = o.v; },
            });
            cloud.g.visible = true;
            await ctx.w(300);
          }, { cinema: false, skippable: false });
          await api.hero.excite();
          await api.think('c4.lamp.lit');
        },
      });

      api.hot(winG, {
        id: 'b.window',
        near: { x: 1150, plat: 'stand' },
        act: async () => {
          if (!st.has('lampOn')) { await api.think('c4.win.dark'); return; }
          if (st.has('windowOpen')) { await api.think('c4.win.open'); return; }
          const n = st.bumpClick('b.window');
          if (n === 1) { await api.think('c4.win.look'); return; }
          if (!st.has('catchOpen')) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.hopTo(1300, 546, { h: 60, dur: 420 }));
              api.hero.plat = 'sill';
              ctx.sfx('boing', 1.1);
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 380, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => api.hero.place(U.lerp(1300, 1344, o.t), U.lerp(546, 560, o.t) - Math.sin(o.t * Math.PI) * 70, 'sill'),
              });
              api.hero.A.tailTx = 0; api.hero.A.tailTy = -60;
              for (let i = 0; i < 2; i++) {
                ctx.sfx('metal', 0.25);
                await ctx.tw(api.hero.A, { rock: 24 }, { dur: 260, ease: CH.tw.ease.quadInOut });
                await ctx.tw(api.hero.A, { rock: -24 }, { dur: 260, ease: CH.tw.ease.quadInOut });
              }
              await ctx.tw({ t: 0 }, { t: 1 }, { dur: 260, onUpdate: (k, o) => K.tr(sash, { rx: 1.4 * o.t, ox: 0, oy: 536 }) });
              ctx.sfx('metal', 0.9);
              await ctx.tw({ t: 0 }, { t: 1 }, { dur: 160, onUpdate: (k, o) => K.tr(sash, { rx: 1.4 * (1 - o.t), ox: 0, oy: 536 }) });
              api.hero.A.tailTx = null; api.hero.A.tailTy = null; api.hero.A.rock = 0;
              await ctx.run(api.hero.dropTo(1330, 546));
              api.hero.plat = 'sill';
            }, { cinema: false, skippable: false });
            await api.think('c5.win.catch1');
            await api.think('c5.win.catch2');
            return;
          }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.hopTo(1300, 546, { h: 60, dur: 420 }));
            api.hero.plat = 'sill';
            await ctx.w(200);
            await ctx.think('c4.win.grab');
            ctx.sfx('boing', 1.1);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 380, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => { api.hero.place(U.lerp(1300, 1344, o.t), U.lerp(546, 560, o.t) - Math.sin(o.t * Math.PI) * 70, 'sill'); },
            });
            api.hero.A.tailTx = 0; api.hero.A.tailTy = -60;
            for (let i = 0; i < 3; i++) {
              ctx.sfx('metal', 0.25);
              await ctx.tw(api.hero.A, { rock: 24 }, { dur: 260, ease: CH.tw.ease.quadInOut });
              await ctx.tw(api.hero.A, { rock: -24 }, { dur: 260, ease: CH.tw.ease.quadInOut });
            }
            ctx.sfx('metal', 0.6);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 400, onUpdate: (k, o) => K.tr(handle, { r: 88 * o.t, ox: 1344, oy: 500 }),
            });
            api.hero.A.tailTx = null; api.hero.A.tailTy = null;
            api.hero.A.rock = 0;
            await ctx.run(api.hero.dropTo(1330, 546));
            api.hero.plat = 'sill';
            ctx.sfx('pop', 0.7);
            setSash(true);
            CH.audio.sfx('slide', true);
            await ctx.w(500);
            await ctx.think('c4.win.opened');
            await ctx.run(api.hero.excite());
            await ctx.think('c4.win.smell');
          }, { cinema: false, skippable: false });
          st.flag('windowOpen');
          if (st.data.chapter < 7) await api.chapterDone(6);
        },
        item: {
          key: async () => {
            if (st.has('catchOpen')) { await api.think('c5.win.unlocked2'); return; }
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.hopTo(1300, 546, { h: 60, dur: 420 }));
              api.hero.plat = 'sill';
              api.hero.face(-1);
              await ctx.run(api.hero.tailWhip(1250, 526));
              ctx.sfx('metal', 0.5);
              await ctx.tw({ t: 0 }, { t: 1 }, { dur: 380, ease: CH.tw.ease.backOut, onUpdate: (k, o) => K.tr(catchBolt, { y: -18 * o.t }) });
              ctx.sfx('coin');
              await ctx.w(300);
            }, { cinema: false, skippable: false });
            st.flag('catchOpen');
            await api.hero.excite();
            await api.think('c5.win.unlock');
          },
        },
      });

      api.hot(cloud.g, {
        id: 'b.dream', near: { x: 700, plat: 'floor' },
        active: () => st.has('lampOn'),
        act: async () => {
          if (st.has('dreamDone')) { await api.think('c5.cloud.done'); return; }
          await api.cut(async (ctx) => {
            api.hero.face(1);
            await ctx.think('c4.cloud.look');
            await ctx.think('c4.cloud.dive');
            ctx.sfx('boing', 0.9);
            const h = api.hero, x0 = h.x, y0 = h.y;
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 1100, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => { h.place(U.lerp(x0, 716, o.t), U.lerp(y0, 520, o.t) - Math.sin(o.t * Math.PI) * 110, 'floor'); h.A.rock = o.t * 360; },
            });
            h.A.rock = 0;
            await ctx.run(cloud.puff());
            ctx.sfx('swoosh', 0.6);
            await ctx.w(200);
          }, { cinema: false, skippable: false });
          st.flag('dreamEntered');
          if (st.data.chapter === 5) await api.chapterDone(5);
          else await CH.dreamfx.veil(() => api.go('dreamRoom', 'start'));
        },
      });

      // under the bed — home of the Lost Sock
      const underBed = K.box(640, 760, 340, 40, 40, K.mat('#0c0a14', { rough: 1 }), mid, { z: -60 });
      api.hot(underBed, {
        id: 'b.under',
        near: { x: 620, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('b.under');
          if (n === 1) { await api.think('c4.under.look'); return; }
          if (!st.has('sockTaken')) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(700, 780));
              ctx.sfx('paper');
              await ctx.w(400);
              ctx.sfx('pop', 0.9);
            }, { cinema: false, skippable: false });
            st.flag('sockTaken');
            st.give('sock');
            await api.think('sd.sock.take');
            return;
          }
          await api.think('c4.under.look2');
        },
      });

      // ---------- red herring: a toy dinosaur ----------
      const dinoG = K.g(main, { z: -20 });
      CH.models.dino(dinoG, 0, 0, 0, 1);
      K.tr(dinoG, { x: 310, y: 796, z: -20, r: 3 });
      api.hot(dinoG, {
        id: 'b.dino',
        near: { x: 320, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 500, onUpdate: (k, o) => K.tr(dinoG, { x: 310, y: 796, r: 3 + Math.sin(o.t * Math.PI * 4) * 8 }),
            });
            ctx.sfx('sad');
            await ctx.tw(api.hero.A, { bounce: 14 }, { dur: 130, ease: CH.tw.ease.quadOut });
            await ctx.tw(api.hero.A, { bounce: 0 }, { dur: 240, ease: CH.tw.ease.bounceOut });
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('b.dino') % 2 ? 'sd.dino.roar' : 'sd.dino.brave');
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('bedFirst')) {
        st.flag('bedFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          if (!st.has('lampOn')) {
            await ctx.think('c4.dark1');
            await ctx.think('c4.dark2');
          }
        }, { cinema: false });
      }
    },
  });
})();
