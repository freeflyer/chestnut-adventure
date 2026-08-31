/* Chapters 2–3 — the hallway: the Big Door, the stairs, Vera's nook, the kitchen flap. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  // staircase geometry (shared by drawing and walking)
  const STEP_W = 68, STEP_H = 52, STEP_X0 = 1010, FLOOR_Y = 800, STEPS = 8;
  const stepTop = (k) => FLOOR_Y - k * STEP_H;
  const stepX = (k) => STEP_X0 + (k - 1) * STEP_W;
  const WALL = -330;
  let meetVera = null;   // the first meeting with Vera, set up by build(): the arch and the passing-by tick both use it

  CH.defScene('hallway', {
    chapter: 3,
    pageBg: '#161c2c',
    bg: '#12172a',
    ambient: [{ name: 'tick', every: [1500, 1600] }],
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 90, x2: 1580, y: FLOOR_Y },
      { id: 'step3', x1: stepX(3) + 6, x2: stepX(3) + STEP_W - 6, y: stepTop(3), z: -170, noWalk: true },   // the treads' middle depth
      { id: 'landing', x1: 1480, x2: 1580, y: stepTop(8), z: -175, noWalk: true },
    ],
    links: (st) => [
      // the fallen umbrella: its handle lies by the wall (z -240), its tip on the third tread in the middle of the stair's depth
      { a: 'floor', b: 'step3', ax: 900, az: -240, bx: stepX(3) + 30, bz: -170, type: 'ramp', when: (s) => s.has('umbrellaRamp') },
      { a: 'step3', b: 'landing', ax: stepX(3) + 40, bx: 1520, type: 'hops', steps: 5 },
    ],
    spots: {
      fromVent: { x: 210, plat: 'floor' },
      center: { x: 750, plat: 'floor' },
      fromLiving: { x: 1480, plat: 'floor' },
      fromKitchen: { x: 1160, plat: 'floor' },
      fromStairs: { x: 1420, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: FLOOR_Y,
        wallStops: [[0, '#232b46'], [1, '#374260']],
        floorStops: [[0, '#66452c'], [1, '#422c19']],
        baseboard: '#252e4c',
      });

      // ---------- hanging ceiling lamp + warm pool ----------
      const lampG = K.g(far, { z: -100 });
      K.cylUp(742, 118, 2.2, 200, K.mat('#1c2338', { rough: 0.8 }), lampG);
      const shade = K.mesh(new T.CylinderGeometry(14, 46, 44, 28, 1, true), K.mat('#c9762e', { rough: 0.5, metal: 0.15, side: 'double' }), lampG);
      K.tr(shade, { x: 742, y: 138, r: 180 });
      const shadeIn = K.mesh(new T.CylinderGeometry(13.5, 45, 43, 28, 1, true), K.mat('#5a3410', { rough: 0.7, side: 'back' }), lampG);
      K.tr(shadeIn, { x: 742, y: 138, r: 180 });
      K.sphere(742, 152, 9, K.mat('#ffe2a0', { emissive: '#ffe2a0', ei: 1.5 }), lampG).castShadow = false;
      K.spot(L, 742, 150, -100, 742, 800, -40, '#ffcf7a', 130, { angle: 64, penumbra: 0.7, decay: 1.5, mapSize: 2048, dist: 1800 });
      K.glow(far, 742, 175, -90, 60, '#ffb454', 0.14);

      // ---------- the vent (way back to the study) ----------
      const ventG = K.g(main, { z: -300 });
      K.box(116, 706, 100, 94, 40, K.mat('#0b0f1a', { rough: 1 }), ventG, { z: -30 });
      const hallGrate = K.g(ventG);
      const gm = K.mat('#4a566e', { rough: 0.5, metal: 0.5 });
      K.rbox(110, 702, 112, 8, 8, 2, gm, hallGrate);
      K.rbox(110, 794, 112, 8, 8, 2, gm, hallGrate);
      K.rbox(110, 702, 8, 100, 8, 2, gm, hallGrate);
      K.rbox(214, 702, 8, 100, 8, 2, gm, hallGrate);
      for (let i = 0; i < 5; i++) K.rbox(118, 716 + i * 16, 96, 7, 6, 3, K.mat('#2c3550', { rough: 0.5, metal: 0.4 }), hallGrate);
      K.tr(hallGrate, { x: 20, y: -4, rx: -82, ox: 110, oy: 802 }); // taken off and laid flat on the floor in front of the vent

      // ---------- THE BIG DOOR ----------
      const doorG = K.g(mid);
      K.box(286, 106, 368, 706, 30, '#20273e', doorG, { z: WALL + 15 });
      K.box(306, 126, 328, 686, 14, P.woodMat('#6e4c2e', '#523823', 0.7), doorG, { z: WALL + 18 });
      // tall panels, set into the door
      [[336, 160, 120, 260], [486, 160, 120, 260], [336, 460, 120, 200], [486, 460, 120, 200]].forEach((p) => {
        K.box(p[0], p[1], p[2], p[3], 6, '#4a3220', doorG, { z: WALL + 24 });
        K.box(p[0] + 8, p[1] + 8, p[2] - 16, p[3] - 16, 8, '#5c3f26', doorG, { z: WALL + 27 });
      });
      // the huge handle, hopelessly high
      const gold = K.mat('#c9a24b', { rough: 0.35, metal: 0.6 });
      K.rodX(556, 606, 440, 6, gold, doorG, { z: WALL + 34 });
      K.sphere(602, 440, 17, gold, doorG, { z: WALL + 40 });
      K.disc(602, 490, 7, 4, '#1c1408', doorG, { z: WALL + 26 });
      K.box(599, 494, 6, 14, 4, '#1c1408', doorG, { z: WALL + 26 });
      // the bolted cat flap
      const flapG = K.g(mid);
      K.box(428, 690, 104, 122, 10, '#3c2a18', flapG, { z: WALL + 26 });
      K.box(440, 702, 80, 110, 6, '#2a1c0e', flapG, { z: WALL + 31 });
      K.box(440, 702, 80, 4, 8, '#1a1008', flapG, { z: WALL + 33 });
      K.box(440, 758, 80, 4, 8, '#1a1008', flapG, { z: WALL + 33 });
      // padlock
      const steel = K.mat('#a8b2c4', { rough: 0.4, metal: 0.7 });
      K.torus(480, 754, 12, 3.5, K.mat('#8a95ab', { rough: 0.4, metal: 0.7 }), flapG, { z: WALL + 38, arc: Math.PI, r: 180 });
      K.rbox(458, 754, 44, 34, 12, 7, steel, flapG, { z: WALL + 38 });
      K.disc(480, 770, 5, 4, '#3c465e', flapG, { z: WALL + 45 });
      // doormat
      const mat = K.g(main);
      const matM = K.cut(K.ellipseShape(0, 0, 170, 70), K.mat('#8a4a52', { rough: 1 }), mat, { rx: 90 });
      K.tr(matM, { x: 470, y: FLOOR_Y - 1.5, z: -30, rx: 90 });
      const matRing = K.cut(K.ellipseShape(0, 0, 140, 52), K.mat('#c98a63', { rough: 1 }), mat, { rx: 90 });
      K.tr(matRing, { x: 470, y: FLOOR_Y - 2, z: -30, rx: 90 });
      const matIn = K.cut(K.ellipseShape(0, 0, 126, 44), K.mat('#8a4a52', { rough: 1 }), mat, { rx: 90 });
      K.tr(matIn, { x: 470, y: FLOOR_Y - 2.5, z: -30, rx: 90 });
      K.pad(300, 780, 340, 40, mat, { d: 160, z: -30 });
      // the cap hides under the mat
      const capG = K.g(main, { z: -30 });
      K.cylUp(600, 800, 11, 3, K.mat('#d8dee6', { rough: 0.4, metal: 0.4 }), capG);
      K.cylUp(600, 797, 6.4, 1.2, K.mat('#c23f4a', { rough: 0.5 }), capG);
      capG.visible = false;
      if (st.hasItem('cap') || st.has('capTaken')) main.remove(capG);

      // ---------- coat stand + umbrella ----------
      const coatG = K.g(mid, { x: 50, z: -200 });   // a little right of the door
      const dark = K.mat('#3c2f22', { rough: 0.8 });
      K.cylUp(701, 800, 7, 500, dark, coatG);
      K.cylUp(701, 800, 42, 8, K.mat('#2a2018', { rough: 0.8 }), coatG);
      K.tube([[701, 320, 0], [668, 332, 10], [656, 366, 14]], 5, dark, coatG, { seg: 12 });
      K.tube([[701, 320, 0], [734, 332, 10], [746, 366, 14]], 5, dark, coatG, { seg: 12 });
      K.tube([[701, 320, 0], [704, 334, -30], [712, 366, -40]], 5, dark, coatG, { seg: 12 });
      K.sphere(701, 300, 9, dark, coatG);
      // hanging coat
      K.ext('M 660 360 C 630 420 632 540 650 620 L 700 620 C 712 540 708 420 690 366 Z', 36, K.mat('#5a6a8a', { rough: 0.9 }), coatG, { bevel: 8, z: 14 });
      K.tube([[660, 360, 34], [675, 380, 36], [690, 364, 34]], 2.5, K.mat('#48566e', { rough: 0.9 }), coatG, { seg: 8 });
      // scarf
      K.ext('M 742 366 C 748 420 744 470 738 500 L 758 502 C 766 460 764 410 756 366 Z', 14, K.mat('#c98a63', { rough: 0.95 }), coatG, { bevel: 4, z: 14 });

      // umbrella (standing or fallen as the stair ramp)
      const umbG = K.g(main);
      const umbBody = K.g(umbG);
      K.ext('M 0 0 C -13 -40 -13 -150 0 -190 C 13 -150 13 -40 0 0 Z', 24, K.mat('#7c4a48', { rough: 0.8 }), umbBody, { bevel: 6, seg: 14 });
      K.tube([[0, -12, 13], [-6, -60, 15], [-9, -110, 15], [-4, -160, 14], [0, -182, 13]], 1.6, K.mat('#94605c', { rough: 0.8 }), umbBody, { seg: 16, radial: 5 });
      K.cylUp(0, -190, 2.5, 22, K.mat('#8a6a42', { rough: 0.5 }), umbBody);
      K.tube([[0, 0, 0], [0, 14, 0], [0, 26, 0], [-8, 34, 0], [-18, 34, 0], [-26, 30, 0]], 3.5, K.mat('#8a6a42', { rough: 0.5 }), umbBody, { seg: 16, radial: 7 });
      K.pad(-34, -220, 68, 250, umbBody, { d: 60 });
      // one size standing or fallen (1.5): lying, it reaches from the floor over the boots on the bottom steps up to
      // the third tread, down the middle of the stair's depth
      const setUmb = (fallen) => {
        // fallen, it lies from the bucket by the wall out across the boots in the middle of the stair's depth: a slight diagonal
        if (fallen) K.tr(umbG, { x: 896, y: 796, z: -250, r: 58, rx: -15, ox: 0, oy: 0, s: 1.5 });
        else K.tr(umbG, { x: 846, y: 766, z: -240, r: 8, rx: 0, ox: 0, oy: 0, s: 1.5 });
      };
      setUmb(st.has('umbrellaRamp'));
      // umbrella stand basket
      const basket = K.g(mid, { z: -250 });   // close by the wall
      K.cylUp(846, 800, 28, 100, K.mat('#4a566e', { rough: 0.6, metal: 0.3 }), basket, { rTop: 36, seg: 24 });
      K.torus(846, 700, 36, 3, K.mat('#37415a', { rough: 0.6 }), basket, { rx: 90 });

      // ---------- the way to the living room: on under the stairs and off the right edge ----------
      const archMark = CH.props.exitMark(api, 1540, 700, 'right', 40, { margin: 44, pad: true });   // the pad rides with the arrow (60 short of it, out past the edge): Vera's web beside it is never part of the way out
      const archG = archMark.pad;
      K.point(L, 1560, 600, -120, '#ffb454', 3, 700, { decay: 1.6 });   // a little of the living room's lamplight reaching round the corner

      // ---------- staircase ----------
      const stairsG = K.g(mid);
      const treadMat = P.woodMat('#6a4a2c', '#553a23', 0.75);
      for (let k = 1; k <= STEPS; k++) {
        K.box(stepX(k), stepTop(k), 1900 - stepX(k), STEP_H, 310, treadMat, stairsG, { z: -175 });
        K.box(stepX(k), stepTop(k), 1900 - stepX(k), 6, 310, '#7c5836', stairsG, { z: -175 });
        // carpet runner: along the flight, tread and riser
        K.box(stepX(k), stepTop(k) - 1, STEP_W, 5, 200, '#8a4a52', stairsG, { z: -175 });
        K.box(stepX(k) - 3, stepTop(k), 5, STEP_H, 200, '#7c414a', stairsG, { z: -175 });
      }
      // a pair of big muddy boots kicked off on the bottom two steps — the reason a chestnut cannot simply roll up:
      // it needs the fallen umbrella as a bridge over them onto the third tread
      const bootMat = K.mat('#7a5236', { rough: 0.85 }), bootDeep = K.mat('#4a3222', { rough: 0.9 });
      [[stepX(1) + 6, stepTop(1), -4], [stepX(2) + 4, stepTop(2), 6]].forEach(([bx, by, tilt]) => {
        const bg = K.g(stairsG, { x: bx, y: by, z: -175, r: tilt, ox: 0, oy: 0 });
        K.rbox(0, -18, 62, 18, 24, 5, bootDeep, bg);                    // the sole and welt, lying along the tread
        K.rbox(4, -40, 30, 26, 22, 6, bootMat, bg);                     // the shaft, fallen over
        K.rbox(30, -30, 30, 14, 22, 5, bootMat, bg);                    // the toe
        K.torus(19, -40, 11, 2.2, bootDeep, bg, { rx: 90 });            // the cuff
      });
      // banister on the near edge
      const rail = K.g(stairsG, { z: -24 });
      const railPts = [];
      for (let k = 0; k <= STEPS; k++) railPts.push([stepX(k) + 34, stepTop(k) - 100, 0]);
      K.tube(railPts, 6, dark, rail, { seg: 40, radial: 8, straight: true });
      for (let k = 1; k <= STEPS; k++) K.box(stepX(k) + 31, stepTop(k) - 100, 6, 100, 6, K.mat('#4a3a28', { rough: 0.8 }), rail);
      K.cylUp(1044, 800, 9, 130, dark, rail);
      K.sphere(1044, 668, 14, dark, rail);

      // family photos climbing the stair wall
      P.picture(far, 1080, 340, 90, 110, (ctx, w, h) => {
        ctx.fillStyle = '#c9a284'; ctx.beginPath(); ctx.arc(w / 2, h * 0.4, 20, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#7a90ae'; ctx.beginPath(); ctx.moveTo(w / 2 - 24, h); ctx.bezierCurveTo(w / 2 - 16, h * 0.62, w / 2 + 16, h * 0.62, w / 2 + 24, h); ctx.fill();
      });
      P.picture(far, 1210, 250, 100, 80, (ctx, w, h) => {
        ctx.fillStyle = '#e8a256'; ctx.beginPath(); ctx.ellipse(w * 0.4, h * 0.6, 24, 14, 0, 0, 6.28); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.62, h * 0.44, 10, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#c77f3a'; ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.36); ctx.lineTo(w * 0.56 - 5, h * 0.36 - 8); ctx.lineTo(w * 0.56 + 3, h * 0.36 - 5); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.36); ctx.lineTo(w * 0.68 + 5, h * 0.36 - 8); ctx.lineTo(w * 0.68 - 3, h * 0.36 - 5); ctx.fill();
      });
      P.picture(far, 1340, 170, 90, 100, (ctx, w, h) => {
        ctx.fillStyle = '#557f3e'; ctx.beginPath(); ctx.moveTo(12, h - 12); ctx.lineTo(w / 2, 14); ctx.lineTo(w - 12, h - 12); ctx.closePath(); ctx.fill();
      });

      // ---------- under-stairs: kitchen door + Vera ----------
      const kdoorG = K.g(mid);
      K.ext('M 1054 800 L 1054 668 L 1198 560 L 1198 800 Z', 10, K.mat('#26314d', { rough: 0.9 }), kdoorG, { z: -16, bevel: 1 });
      K.ext('M 1064 800 L 1064 674 L 1188 582 L 1188 800 Z', 8, P.woodMat('#7e5a3c', '#5f412a', 0.7), kdoorG, { z: -8, bevel: 1 });
      K.sphere(1172, 700, 6, gold, kdoorG, { z: 0 });
      // the WORKING cat flap — the one thing under the stairs that must catch the eye: its little door does not quite reach
      // the sill, and the kitchen's warm light leaks through the gap under it and faintly onto the boards in front
      const kflapG = K.g(main);
      K.box(1092, 712, 78, 88, 8, '#3c2a18', kflapG, { z: -4 });
      K.vplane(1102, 1160, 798, 800, 0.5, K.mat('#ffc873', { emissive: '#ffa64a', ei: 0.9, rough: 1 }), kflapG).castShadow = false;   // the lit kitchen, in the hairline gap under the door
      const kflapDoor = K.rbox(1100, 720, 62, 78, 5, 3, '#4e3826', kflapG, { z: 2, ox: 1131, oy: 720 });   // down to 798: two units short of the sill
      K.disc(1131, 780, 4, 3, '#2a1c0e', kflapG, { z: 6 });
      K.glow(main, 1131, 798, 12, 30, '#ffb454', 0.1);    // a soft haze at the sill
      K.point(L, 1131, 792, 30, '#ffcf7a', 1.3, 240);     // and a faint spill onto the floor in front

      // Vera's corner — web + the lady herself, hanging from the stair underside
      const webG = K.g(far, { z: -14 });
      const wx = 1330, wy = 558;
      const webMat = new T.LineBasicMaterial({ color: new T.Color('#d8d4c8'), transparent: true, opacity: 0.45 });
      const seg = (pts) => { const g = new T.BufferGeometry().setFromPoints(pts.map((p) => new T.Vector3(p[0], p[1], p[2] || 0))); const l = new T.Line(g, webMat); l.userData.noHit = true; webG.add(l); };
      for (let i = 0; i < 5; i++) seg([[wx, wy], [wx - 90 + i * 45, wy + 130]]);
      for (let r = 1; r <= 3; r++) {
        const pts = [];
        for (let t = 0; t <= 8; t++) { const u = t / 8; const x0 = wx - 66 + r * 8, x1 = wx + 66 - r * 8; pts.push([U.lerp(x0, x1, u), wy + 34 * r + Math.sin(u * Math.PI) * 8]); }
        seg(pts);
      }
      const veraG = K.g(main, { z: 10 });
      const vera = CH.actors.vera(veraG, 1330, 660, 1, 100);
      api.anchor('vera', vera.anchor);

      // ---------- red herrings: a hat on the stand + a purring radiator ----------
      const hatG = K.g(main);
      K.cylUp(0, 0, 30, 3, K.mat('#4a3a52', { rough: 0.9 }), hatG);
      K.ellipsoid(0, -6, 18, 12, 18, K.mat('#5a4a64', { rough: 0.9 }), hatG);
      K.cylUp(0, -4, 18.6, 5, K.mat('#37304a', { rough: 0.9 }), hatG);
      K.pad(-30, -26, 60, 32, hatG, { d: 60 });
      let hatDown = st.has('hatDown');
      const placeHat = () => K.tr(hatG, hatDown ? { x: 798, y: 792, z: -60, r: -8 } : { x: 776, y: 316, z: -186, r: -14 });
      placeHat();

      const radG = K.g(mid, { z: WALL + 20 });   // in the corner by the vent, clear of the door
      K.box(-70, 638, 126, 156, 26, '#4a566e', radG);
      for (let i = 0; i < 6; i++) K.rbox(-58 + i * 19.5, 646, 14, 140, 34, 5, '#5a6880', radG, { z: 4 });
      K.rodX(-76, 60, 786, 5, '#4a566e', radG, { z: 8 });
      K.pad(-70, 638, 126, 156, radG, { d: 40 });

      api.hot(hatG, {
        id: 'h.hat',
        near: { x: 700, plat: 'floor' },
        act: async () => {
          if (!hatDown) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(766, 340));
              ctx.sfx('paper');
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 640, ease: CH.tw.ease.quadIn,
                onUpdate: (k, o) => K.tr(hatG, { x: U.lerp(776, 798, o.t), y: U.lerp(316, 792, o.t), z: U.lerp(-186, -60, o.t), r: -14 + o.t * 200 }),
              });
              ctx.sfx('tap');
              hatDown = true; st.flag('hatDown'); placeHat();
            }, { cinema: false, skippable: false });
            await api.think('sd.hat.down');
          } else {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(810, () => true));
              ctx.sfx('boing', 0.9);
              const hx = api.hero.x;
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 400, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => K.tr(hatG, { x: U.lerp(798, hx, o.t), y: U.lerp(792, 706, o.t), z: U.lerp(-60, 0, o.t), r: -8 * (1 - o.t) }),
              });
              await ctx.w(1400);
              ctx.sfx('slide');
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, ease: CH.tw.ease.bounceOut,
                onUpdate: (k, o) => K.tr(hatG, { x: hx + 34 * o.t, y: U.lerp(706, 792, o.t), z: U.lerp(0, -60, o.t), r: 20 * o.t }),
              });
              K.tr(hatG, { x: hx + 34, y: 792, z: -60, r: 20 });
            }, { cinema: false, skippable: false });
            await api.think(st.bumpClick('h.hat') % 2 ? 'sd.hat.try' : 'sd.hat.slip');
          }
        },
      });
      api.hot(radG, {
        id: 'h.radiator',
        near: { x: 150, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(140, () => true));
            api.hero.face(-1);
            await ctx.tw(api.hero.A, { rock: -12 }, { dur: 300 });
            await ctx.w(900);
            await ctx.tw(api.hero.A, { rock: 0 }, { dur: 250 });
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('h.radiator') % 2 ? 'sd.rad.hug' : 'sd.rad.purr');
        },
      });

      // ================= hotspots =================

      api.hot(ventG, {
        id: 'h.vent',
        near: { x: 250, plat: 'floor' },
        act: async () => {
          await CH.dialog.think('c1.vent.shortcut', { ms: 2400 });
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(170, () => true));
            ctx.sfx('slide', false);
          }, { cinema: false, skippable: false });
          await api.go('study', 'fromVent');
        },
      });

      // a low warm fill by the foot of the front door, so the flap and the lock box are not lost in the coat's shadow
      K.point(api.layers.lights, 640, 720, -200, '#ffcf7a', 1.8, 600, { decay: 1.6 });
      K.point(api.layers.lights, 300, 690, -190, '#9db8d8', 1.6, 600, { decay: 1.6 });   // and a cool one by the open vent
      api.hot(doorG, {
        id: 'h.door',
        near: { x: 690, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('h.door');
          if (n === 1) {
            await api.think('c2.door.awe');
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(620, () => true));
              api.hero.face(-1);
              await ctx.tw(api.hero.A, { rock: -14 }, { dur: 300 });
              ctx.sfx('doorThud'); api.cam.bump(0.8);
              await ctx.tw(api.hero.A, { rock: 0 }, { dur: 200 });
              await ctx.w(250);
              await ctx.tw(api.hero.A, { rock: -14 }, { dur: 300 });
              ctx.sfx('doorThud'); api.cam.bump(0.8);
              await ctx.tw(api.hero.A, { rock: 0 }, { dur: 200 });
            }, { cinema: false, skippable: false });
            await api.think('c2.door.push');
            st.flag('doorTried');
          } else if (n === 2) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(600, () => true));
              api.hero.face(-1);
              await ctx.run(api.hero.hopTo(590, FLOOR_Y, { h: 120, dur: 600 }));
              await ctx.run(api.hero.hopTo(600, FLOOR_Y, { h: 150, dur: 700 }));
              ctx.sfx('sad');
            }, { cinema: false, skippable: false });
            await api.think('c2.door.handle');
          } else {
            await api.think(U.pick(['c2.door.stubborn', 'c2.door.stubborn2']));
          }
        },
      });

      api.hot(flapG, {
        id: 'h.flap',
        near: { x: 560, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('h.flap');
          api.sfx('metal', 0.2);
          if (n === 1) await api.think('c2.flap.look');
          else if (n === 2) await api.think('c2.flap.look2');
          else await api.think('c2.flap.look3');
        },
      });

      api.hot(mat, {
        id: 'h.mat',
        near: { x: 620, plat: 'floor' },
        act: async () => {
          if (st.has('capTaken')) { await api.think('c2.mat.done'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.tailWhip(560, 810));
            ctx.sfx('paper');
            capG.visible = true;
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 350, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => { K.tr(mat, { x: -40 * o.t, y: -18 * o.t, r: -6 * o.t, ox: 300, oy: 816 }); },
            });
            await ctx.w(500);
            ctx.sfx('coin');
          }, { cinema: false, skippable: false });
          st.flag('capTaken');
          st.give('cap');
          main.remove(capG);
          CH.tw.to({ t: 0 }, { t: 1 }, { dur: 300, group: 'scene', onUpdate: (k, o) => K.tr(mat, { x: -40 * (1 - o.t), y: -18 * (1 - o.t), r: -6 * (1 - o.t), ox: 300, oy: 816 }) });
          await api.think('c2.mat.cap');
        },
      });

      api.hot(coatG, {
        id: 'h.coat', near: { x: 660, plat: 'floor' },
        act: async () => { await api.think(st.bumpClick('h.coat') % 2 ? 'c2.coat.look' : 'c2.coat.look2'); },
      });

      // up to the landing: from the fallen umbrella, from any step, or from the landing itself — one climb for all three
      let climbing = false;
      const climb = async () => {
        if (climbing) return;
        climbing = true;
        try {
          if (!(await api.walkTo(1540, 'landing'))) return;
          if (!st.has('gotBrolly')) {
            await api.think('c3.up.notyet');
            await api.walkTo(1420, 'floor');
            return;
          }
          if (st.data.chapter === 4) { await api.chapterDone(4); return; }
          await api.go('corridor', 'fromStairs');
        } finally { climbing = false; }
      };

      api.hot(umbG, {
        id: 'h.umbrella',
        get near() { return st.has('umbrellaRamp') ? null : { x: 800, plat: 'floor' }; },   // fallen, it is the way up: no detour to the bucket first
        act: async () => {
          if (st.has('umbrellaRamp')) { await climb(); return; }
          const n = st.bumpClick('h.umbrella');
          if (n === 1) { await api.think('c2.umb.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.tailWhip(840, 740));
            ctx.sfx('metal', 0.3);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 260, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => K.tr(umbG, { x: U.lerp(846, 866, o.t), y: U.lerp(766, 772, o.t), z: U.lerp(-240, -245, o.t), r: U.lerp(8, 26, o.t), rx: 0, s: 1.5 }),
            });
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 480, ease: CH.tw.ease.bounceOut,
              onUpdate: (k, o) => K.tr(umbG, { x: U.lerp(866, 896, o.t), y: U.lerp(772, 796, o.t), z: U.lerp(-245, -250, o.t), r: U.lerp(26, 58, o.t), rx: -15 * o.t, s: 1.5 }),
            });
            ctx.sfx('doorThud'); api.cam.bump(0.9);
            CH.props.dust(api, 1000, 740, 8, -60);
            setUmb(true);
            await ctx.w(300);
          }, { cinema: false, skippable: false });
          st.flag('umbrellaRamp');
          await api.hero.excite();
          await api.think('c2.umb.fell');
        },
      });

      // the first meeting: she calls after him as he passes her nook. Once only — on the way to the living room the arch
      // waits for it and then carries on with the exit, so one click on the arrow is still one trip
      meetVera = async () => {
        st.flag('veraMet');
        api.hero.face(1330 - api.hero.x);
        await api.cut(async (ctx) => {
          ctx.sfx('pluck', 0.8);
          await ctx.say('vera', 'c2.vera.meet1');
          await ctx.run(api.hero.lookAround());
          await ctx.think('c2.hero.who');
          await ctx.say('vera', 'c2.vera.meet2');
          await ctx.say('vera', 'c2.vera.meet3');
          await ctx.say('vera', 'c2.vera.ask');
          await ctx.think('c2.hero.deal');
        });
      };

      api.hot(archG, {
        id: 'h.arch',
        near: { x: 1470, plat: 'floor' },
        act: async () => {
          if (!st.has('veraMet')) await meetVera();
          await api.cut(async (ctx) => { await ctx.run(api.hero.rollTo(1560, () => true)); }, { cinema: false, skippable: false });
          await api.go('living', 'enter');
        },
      });

      api.hot(kflapG, {
        id: 'h.kflap',
        near: { x: 1140, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(1131, () => true));
            api.hero.face(1);
            ctx.sfx('boing');
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 300, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => K.tr(kflapDoor, { rx: 60 * o.t }),   // pushed open into the kitchen
            });
            await ctx.run(api.hero.rollTo(1200, () => true));
          }, { cinema: false, skippable: false });
          await api.go('kitchen', 'enter');
        },
      });

      api.hot(kdoorG, {
        id: 'h.kdoor',
        near: { x: 1150, plat: 'floor' },
        act: async () => { await api.think('c2.kdoor.look'); },
      });

      api.hot(vera.el, {
        id: 'h.vera',
        near: { x: 1280, plat: 'floor' },
        act: async () => {
          if (!st.has('veraMet')) return;
          if (!st.has('buttonDone')) {
            if (st.hasItem('button')) { await api.say('vera', 'c2.vera.haveit'); return; }
            await api.say('vera', U.pick(['c2.vera.remind', 'c2.vera.remind2']));
          } else if (!st.has('gotBrolly')) {
            await api.say('vera', U.pick(['c3.vera.kitchen', 'c3.vera.kitchen2']));
          } else if (!st.has('umbrellaRamp')) {
            await api.say('vera', 'c3.vera.umbrella');
          } else {
            await api.say('vera', U.pick(['c3.vera.up', 'c3.vera.up2']));
          }
        },
        item: {
          button: async () => {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(1310, 680));
              ctx.sfx('coin');
              st.take('button');
              await ctx.say('vera', 'c2.vera.thanks1');
              await ctx.say('vera', 'c2.vera.thanks2');
              await ctx.think('c2.hero.blush');
              await ctx.say('vera', 'c2.vera.plan1');
              await ctx.say('vera', 'c2.vera.plan2');
              await ctx.say('vera', 'c2.vera.plan3');
            });
            st.flag('buttonDone');
            st.flag('veraHint');
            if (st.data.chapter === 3) await api.chapterDone(3);
          },
          '*': async () => { await api.say('vera', 'c2.vera.notthat'); },
        },
      });

      const landingZone = K.pad(1480, stepTop(8) - 140, 110, 150, main, { d: 300 });
      api.hot(landingZone, {
        id: 'h.upstairs',
        active: () => st.has('umbrellaRamp'),
        act: climb,
      });

      // the flight itself: a pad over every tread and riser (in front of the steps, so the boots and the banister count too)
      const stairsHot = K.g(mid);
      for (let k = 1; k <= STEPS; k++) K.pad(stepX(k) - 3, stepTop(k) - 26, STEP_W + 6, STEP_H + 26, stairsHot, { d: 306, z: -177 });   // the tread's whole depth (z -330..-24): the kitchen door and its flap stand in front, so they still win their own patch
      api.hot(stairsHot, {
        id: 'h.stairs',
        get near() { return st.has('umbrellaRamp') ? null : { x: 950, plat: 'floor' }; },
        act: async () => {
          if (st.has('umbrellaRamp')) { await climb(); return; }
          const n = st.bumpClick('h.stairs');
          if (n === 1) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(990, () => true));
              api.hero.face(1);
              await ctx.run(api.hero.hopTo(1000, FLOOR_Y, { h: 60, dur: 420 }));
              ctx.sfx('thud');
              await ctx.run(api.hero.dizzy(700));
            }, { cinema: false, skippable: false });
            await api.think('c2.stairs.tall');
          } else await api.think('c2.stairs.tall2');
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('hallFirst')) {
        st.flag('hallFirst');
        api.cut(async (ctx) => {
          await ctx.w(500);
          await ctx.run(api.hero.lookAround());
          await ctx.think('c2.first1');
          await ctx.think('c2.first2');
        }, { cinema: false });
      }
      if (!st.has('veraMet')) {
        // walking past her nook on a plain floor click: he stops where he is and she calls after him. While a hotspot is at
        // work (the arch, the kitchen flap) the tick stays out of it — the arch holds the meeting itself, then carries on
        const un = api.tick(() => {
          if (st.has('veraMet')) { un(); return; }
          if (CH.engine.locked || CH.engine.hotspots.some((h) => h.busy)) return;
          if (api.hero.x > 1150 && api.hero.plat === 'floor') {
            un();
            CH.engine.walkToken++; CH.tw.kill('hero');   // the walk ends here: she is talking to him
            meetVera();
          }
        });
      }
    },
  });
})();
