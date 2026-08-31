/* Chapter 4 — the upstairs corridor. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  const WALL = -330;

  CH.defScene('corridor', {
    chapter: 5,
    pageBg: '#171526',
    bg: '#131120',
    ambient: [{ name: 'tick', every: [1800, 1900] }],
    fill: 0.85, ambient2: 0.4,
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 150, x2: 1480, y: 800 },
    ],
    links: [],
    spots: {
      fromStairs: { x: 470, plat: 'floor' },
      fromBath: { x: 900, plat: 'floor' },
      fromBed: { x: 1240, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#241f38'], [1, '#3a3354']],
        floorStops: [[0, '#66452c'], [1, '#422c19']],
        baseboard: '#282244',
        holes: [K.rectShape(690, 310, 190, 492, 0), K.rectShape(1160, 310, 190, 492, 0)],   // the doorways are cut through the wall
        floorHole: { x1: -240, x2: 190, z1: -330, z2: -50 },                                  // the stairwell: a hole in the floor behind the balustrade
      });

      // runner rug down the corridor
      const runner = K.cut(K.rectShape(-500, -120, 1000, 240, 18), K.mat('#6a3f4d', { rough: 1 }), far, { rx: 90 });
      K.tr(runner, { x: 800, y: 798.6, z: -60, rx: 90 });
      const runnerIn = K.cut(K.rectShape(-480, -104, 960, 208, 14), K.mat('#c98a63', { rough: 1 }), far, { rx: 90 });
      K.tr(runnerIn, { x: 800, y: 798.2, z: -60, rx: 90 });
      const runnerIn2 = K.cut(K.rectShape(-470, -96, 940, 192, 12), K.mat('#6a3f4d', { rough: 1 }), far, { rx: 90 });
      K.tr(runnerIn2, { x: 800, y: 797.8, z: -60, rx: 90 });

      // moon window at the end of the corridor
      P.windowNight(far, 60, 120, 200, 320, { moon: true });
      K.sun(L, 160, 200, -100, '#9db8d8', 0.9, { tx: 700, ty: 800, tz: 0 });

      // night-light plugged into a socket — the brightest thing in the corridor, so it answers a click
      const nlG = K.g(far);
      K.rbox(1024, 692, 46, 60, 8, 6, '#585078', nlG, { z: WALL + 4 });
      K.sphere(1047, 716, 9, K.mat('#ffd489', { emissive: '#ffd489', ei: 1.4 }), nlG, { z: WALL + 12 }).castShadow = false;
      K.pad(1004, 676, 86, 92, nlG, { d: 40, z: WALL + 24 });
      P.glow(far, 1047, 716, 90, '#ffb454', 0.12, WALL + 16);
      K.point(L, 1047, 716, WALL + 30, '#ffb454', 12, 600);
      // a dim ceiling light down the corridor
      K.spot(L, 800, -260, 100, 820, 800, -120, '#c9b8e8', 60, { angle: 70, penumbra: 0.8, decay: 1.4, mapSize: 2048, dist: 2000 });

      // ---------- the stairwell (left): a hole in the floor right behind the balustrade, from the newel to the wall and
      // off the left edge, with the flight we came up dropping away down it to the left ----------
      const stairsDown = K.g(mid);
      const railWood = K.mat('#3c2f22', { rough: 0.8 }), balWood = K.mat('#4a3a28', { rough: 0.8 });
      const treadMat = P.woodMat('#6a4a2c', '#553a23', 0.75), riserMat = K.mat('#4a3a28', { rough: 0.9 });
      const WX1 = -240, WX2 = 190, WZ1 = -330, WZ2 = -50, SW = 68, SH = 52;
      K.vplane(WX1, WX2, 800, 1400, WZ1, K.mat('#141020', { rough: 1 }), stairsDown);                            // the well's back wall, below the floor
      K.sidewall(WX1, 800, 1400, WZ1, WZ2, K.mat('#100c1a', { rough: 1 }), stairsDown, { facing: 'right' });      // its far-left wall
      K.sidewall(WX2, 800, 1400, WZ1, WZ2, K.mat('#1c1628', { rough: 1 }), stairsDown, { facing: 'left' });       // its right wall, under the newel
      K.box(WX1, 800, WX2 - WX1, 10, 6, K.mat('#2a2018', { rough: 0.9 }), stairsDown, { z: WZ2 + 3 });            // the nosing along the near edge of the hole
      for (let k = 1; k <= 8; k++) {   // the flight: treads stepping down to the left, risers facing us, the runner down the middle
        const tx = WX2 - SW * k, ty = 800 + SH * k, zc = (WZ1 + WZ2) / 2, zd = WZ2 - WZ1 - 20;
        K.box(tx, ty, SW, 10, zd, treadMat, stairsDown, { z: zc });
        K.box(tx + SW - 8, ty - SH, 8, SH, zd, riserMat, stairsDown, { z: zc });
        K.box(tx, ty - 1, SW, 5, zd * 0.6, '#8a4a52', stairsDown, { z: zc });
        K.box(tx + SW - 3, ty - SH, 5, SH, zd * 0.6, '#7c414a', stairsDown, { z: zc });
      }
      K.point(L, 0, 980, (WZ1 + WZ2) / 2, '#ffcf7a', 6, 900, { decay: 1.6 });   // the hall's lamp-light coming up the well
      // the balustrade at the head of the flight: the newel, the handrail sloping down and off the screen, balusters
      K.cylUp(176, 812, 10, 300, railWood, stairsDown, { z: -40 });
      K.sphere(176, 504, 16, balWood, stairsDown, { z: -40 });
      K.tube([[176, 520, -40], [40, 624, -40], [-120, 746, -40]], 6, railWood, stairsDown, { seg: 8, radial: 8 });
      [[124, 560], [72, 600], [20, 640], [-32, 680], [-84, 720]].forEach((p, i) => K.cylUp(p[0], 812 + i * 40, 2.6, 812 + i * 40 - p[1], balWood, stairsDown, { z: -40 }));
      K.pad(0, 500, 260, 312, stairsDown, { d: 60 });

      // ---------- the ficus ----------
      const ficus = P.pottedPlant(K.g(mid, { z: -140 }), 560, 800, 1.7);

      // ---------- bathroom door (ajar) ----------
      const bathG = K.g(mid);
      const reveal = (x, y, w, h) => {   // the dark room beyond the opening, with the reveal's jambs and head, and a flush architrave round it
        K.box(x - 6, y - 6, w + 12, h + 8, 90, '#0f1420', mid, { z: WALL - 50 });
        K.box(x - 6, y - 6, 6, h + 6, 60, '#1c2138', mid, { z: WALL - 30 });
        K.box(x + w, y - 6, 6, h + 6, 60, '#1c2138', mid, { z: WALL - 30 });
        K.box(x - 6, y - 6, w + 12, 6, 60, '#161a2e', mid, { z: WALL - 30 });
        K.box(x - 14, y - 14, w + 28, 12, 8, '#26314d', mid, { z: WALL + 2 });
        K.box(x - 14, y - 14, 12, h + 16, 8, '#26314d', mid, { z: WALL + 2 });
        K.box(x + w + 2, y - 14, 12, h + 16, 8, '#26314d', mid, { z: WALL + 2 });
      };
      reveal(690, 310, 190, 492);
      const bdoor = K.g(bathG, { x: 690, y: 310, z: WALL - 4, ry: -24 });
      K.box(0, 0, 186, 492, 10, P.woodMat('#6e4c2e', '#57422e', 0.7), bdoor);
      K.sphere(168, 256, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), bdoor, { z: 10 });
      // little duck sign on the door
      K.disc(90, 84, 17, 4, K.mat('#e8d05f', { rough: 0.6 }), bdoor, { z: 7 });
      K.ext('M 104 80 l 12 4 l -12 4 Z', 4, K.mat('#e08b2d', { rough: 0.6 }), bdoor, { z: 8, bevel: 0.5 });
      K.sphere(96, 79, 2.3, '#3c2c16', bdoor, { z: 9 });

      // ---------- bedroom door (ajar, warm inside if lamp is on) ----------
      const bedG = K.g(mid);
      reveal(1160, 310, 190, 492);
      if (st.has('lampOn')) { K.box(1166, 316, 178, 480, 2, K.mat('#54452e', { emissive: '#8a6a30', ei: 0.5 }), bedG, { z: WALL - 88 }); K.point(bedG, 1250, 500, WALL - 40, '#ffcf7a', 5, 400); }   // the lamp-lit room glimpsed past the door
      const bddoor = K.g(bedG, { x: 1164, y: 310, z: WALL - 4, ry: 18, ox: 186, oy: 0 });
      K.box(0, 0, 186, 492, 10, P.woodMat('#7e5a3c', '#5f412a', 0.7), bddoor);
      K.sphere(16, 256, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), bddoor, { z: 10 });
      // wooden letters on the door: K I D, spread across the leaf
      K.label('K', { size: 40, color: '#e2635f', x: 52, y: 96, z: 8, parent: bddoor });
      K.label('I', { size: 40, color: '#e8e0cc', x: 98, y: 104, z: 8, parent: bddoor });
      K.label('D', { size: 40, color: '#e8b64c', x: 140, y: 94, z: 8, parent: bddoor });

      // picture
      P.picture(far, 900, 260, 140, 100, (ctx, w, h) => {
        ctx.strokeStyle = '#7a90ae'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(10, h - 10); ctx.quadraticCurveTo(w / 2, 10, w - 10, h - 10); ctx.stroke();
        ctx.fillStyle = '#e8d8a8'; ctx.beginPath(); ctx.arc(w / 2, h - 34, 10, 0, 6.28); ctx.fill();
      });

      // ---------- red herrings: the attic hatch + a light switch ----------
      const hatchG = K.g(mid, { z: WALL + 20 });
      K.rbox(880, 30, 150, 44, 16, 6, '#3c2f22', hatchG);
      K.rbox(890, 38, 130, 28, 6, 4, '#5a4430', hatchG, { z: 10 });
      K.cylUp(955, 150, 1.5, 76, K.mat('#8a8296', { rough: 0.7 }), hatchG, { z: 14 });
      K.sphere(955, 156, 6, K.mat('#8a8296', { rough: 0.7 }), hatchG, { z: 14 });
      K.pad(870, 20, 170, 150, hatchG, { d: 40 });

      const switchG = K.g(mid, { z: WALL + 4 });
      K.rbox(604, 500, 30, 42, 8, 5, '#6a6490', switchG);
      K.rbox(614, 512, 10, 18, 6, 3, '#8a8296', switchG, { z: 6 });
      K.pad(594, 490, 50, 62, switchG, { d: 30 });
      const flashVeil = K.vplane(-1500, 3100, -1500, 2400, 380, new T.MeshBasicMaterial({ color: new T.Color('#0a0820'), transparent: true, opacity: 0, depthWrite: false, fog: false }), fg);
      flashVeil.userData.noHit = true;
      flashVeil.renderOrder = 20;

      api.hot(nlG, {
        id: 'co.nightlight',
        near: { x: 990, plat: 'floor' },
        act: async () => { await api.think(st.bumpClick('co.nightlight') % 2 ? 'sd.nightlight.look' : 'sd.nightlight.look2'); },
      });

      api.hot(hatchG, {
        id: 'co.hatch',
        near: { x: 950, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('co.hatch');
          if (n === 1) { await api.think('sd.hatch.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.hopTo(950, 800, { h: 90, dur: 480 }));
            await ctx.run(api.hero.hopTo(952, 800, { h: 120, dur: 560 }));
            ctx.sfx('sad');
          }, { cinema: false, skippable: false });
          await api.think(n === 2 ? 'sd.hatch.jump' : 'sd.hatch.giveup');
        },
      });
      api.hot(switchG, {
        id: 'co.switch',
        near: { x: 700, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.tailWhip(651, 520));
            ctx.sfx('tap');
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 160, onUpdate: (k, o) => { flashVeil.material.opacity = o.t * 0.85; },
            });
            ctx.sfx('tap');
            await ctx.w(350);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 260, onUpdate: (k, o) => { flashVeil.material.opacity = 0.85 * (1 - o.t); },
            });
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('co.switch') % 2 ? 'sd.switch.oops' : 'sd.switch.leave');
        },
      });

      // ================= hotspots =================

      api.hot(stairsDown, {
        id: 'co.down',
        near: { x: 450, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(220, () => true));
            ctx.sfx('slide');
            await ctx.run(api.hero.slideTo(140, 900, true));
          }, { cinema: false, skippable: false });
          await api.go('hallway', 'fromStairs');
        },
      });

      api.hot(ficus, {
        id: 'co.ficus',
        near: { x: 640, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('co.ficus');
          if (n === 1) await api.think('c4.ficus.look');
          else if (n === 2) {
            api.sfx('paper');
            await api.think('c4.ficus.talk');
          } else await api.think('c4.ficus.silent');
        },
      });

      api.hot(bathG, {
        id: 'co.bath',
        near: { x: 850, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(858, () => true));
            ctx.sfx('slide', false);
          }, { cinema: false, skippable: false });
          await api.go('bathroom', 'enter');
        },
      });

      api.hot(bedG, {
        id: 'co.bed',
        near: { x: 1172, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(1174, () => true));
            ctx.sfx('slide', false);
          }, { cinema: false, skippable: false });
          await api.go('bedroom', 'enter');
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('upFirst')) {
        st.flag('upFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          await ctx.think('c4.first1');
          await ctx.run(api.hero.lookAround());
          await ctx.think('c4.first2');
        }, { cinema: false });
      }
    },
  });
})();
