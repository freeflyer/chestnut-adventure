/* Chapter 4 (optional) — the bathroom: dental floss, treacherous soap, a judgemental duck. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  const WALL = -330;

  CH.defScene('bathroom', {
    chapter: 5,
    pageBg: '#12202a',
    bg: '#0f1a22',
    ambient: [{ name: 'drip', every: [3000, 5200] }],
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 160, x2: 1420, y: 800 },
      { id: 'counter', x1: 290, x2: 700, y: 556 },
    ],
    links: [
      { a: 'floor', b: 'counter', ax: 360, bx: 360, type: 'climb' },
      { a: 'counter', b: 'floor', ax: 680, bx: 740, type: 'drop', dir: 'ab' },
    ],
    spots: {
      enter: { x: 230, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#1c303c'], [1, '#2a4452']],
        floorStops: [[0, '#8a8ea0'], [1, '#5e6274']],
        baseboard: '#1a2c38',
        tiles: true,
      });
      // wall tiles
      // tiled to the ceiling, the way bathrooms are; a darker course at the top where the wall meets the ceiling
      for (let ty = -8; ty < 5; ty++) for (let tx = 0; tx < 24; tx++) {
        K.rbox(-440 + tx * 106, 340 + ty * 94, 100, 88, 4, 4, K.mat((tx + ty) % 2 ? '#2c4a5a' : '#294654', { rough: 0.45 }), far, { z: WALL + 2 });
      }
      K.box(-440, -420, 2600, 24, 8, '#1a2c38', far, { z: WALL + 6 });
      // bath mat
      const bmat = K.cut(K.rectShape(-150, -40, 300, 80, 12), K.mat('#5a9e8f', { rough: 1 }), far, { rx: 90 });
      K.tr(bmat, { x: 910, y: 798.5, z: 40, rx: 90 });
      // a cool ceiling light
      K.spot(L, 800, 70, 80, 800, 800, -40, '#dfeaf2', 55, { angle: 58, penumbra: 0.8, decay: 1.4, mapSize: 2048, dist: 2000 });
      // the light itself: a short cord from the ceiling and a frosted globe near the top of the frame
      K.cylUp(800, 30, 2, 440, K.mat('#1a2c38', { rough: 0.8 }), far, { z: 60 });
      K.sphere(800, 56, 30, K.mat('#eaf2f6', { emissive: '#dfeaf2', ei: 0.45, rough: 0.6 }), far, { z: 60 }).castShadow = false;

      // door back (left)
      const doorG = P.openDoor(mid, 120, 300, 120, 500, { z: WALL, hinge: 'right', angle: 64, c1: '#6e4c2e', c2: '#57422e' });
      K.pad(100, 290, 170, 520, doorG, { d: 50, z: WALL + 30 });

      // ---------- sink cabinet + counter ----------
      const cabG = K.g(mid, { z: -180 });
      K.rbox(300, 570, 390, 230, 260, 10, '#3f6b6b', cabG);
      K.rbox(316, 600, 170, 180, 8, 8, '#4a7d7d', cabG, { z: 132 });
      K.rbox(500, 600, 170, 180, 8, 8, '#4a7d7d', cabG, { z: 132 });
      K.sphere(478, 690, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), cabG, { z: 140 });
      K.sphere(508, 690, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), cabG, { z: 140 });
      // the counter top with the basin let into it: a slab with an oval hole, the bowl hanging in the hole, its rim flush
      const slabShape = K.rectShape(284, -150, 420, 300, 8);
      const basinHole = new T.Path(); basinHole.absellipse(480, 0, 58, 42, 0, Math.PI * 2, false, 0); slabShape.holes.push(basinHole);
      const slab = K.ext(slabShape, 22, K.mat('#d8cdb4', { rough: 0.5 }), cabG, { bevel: 0, seg: 24 });
      K.tr(slab, { x: 0, y: 553, z: 0, rx: 90 });
      const bowlProf = [[58, 0], [55, 5], [48, 14], [36, 24], [20, 32], [0, 36]].map((p) => new T.Vector2(p[0], p[1]));
      const bowl = K.mesh(new T.LatheGeometry(bowlProf, 36), K.mat('#e9eef0', { rough: 0.25, metal: 0.05, side: 'double' }), cabG);
      K.tr(bowl, { x: 480, y: 542, z: 0, sz: 0.72 });
      K.torus(480, 542, 58, 2.5, K.mat('#dfe6ea', { rough: 0.3 }), cabG, { z: 0, rx: 90, sz: 0.72 });   // the rim, flush with the top
      K.cylUp(480, 578, 5, 1.5, K.mat('#6a7a80', { rough: 0.4, metal: 0.6 }), cabG, { z: 0, seg: 12 });   // the plughole
      K.tube([[480, 542, -50], [480, 470, -50], [486, 452, -50], [504, 450, -40], [516, 460, -24], [516, 476, -12]], 6, K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 }), cabG, { seg: 24 });
      // towel ring + towel (the climbing route)
      const towel = K.g(main, { z: -40 });
      K.torus(360, 620, 26, 3.5, K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 }), towel);
      const cloth = K.mat('#e2938a', { rough: 1 });
      const towelBody = K.ext('M 336 626 C 326 690 330 745 340 776 C 346 786 352 780 358 786 C 364 780 372 786 378 780 C 384 786 392 780 396 774 C 404 745 400 690 388 626 Z', 16, cloth, towel, { bevel: 6, seg: 8 });
      {   // soft vertical folds, deeper toward the hem: the surface undulates instead of standing like a board
        const pos = towelBody.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = Math.abs(pos.getY(i)), d = Math.max(0, (y - 640) / 150);
          pos.setZ(i, pos.getZ(i) + Math.sin(x * 0.38 + 1.2) * (2 + 4 * d) + Math.sin(x * 0.9) * 1.2 * d);
        }
        pos.needsUpdate = true; towelBody.geometry.computeVertexNormals();
      }
      K.tube([[346, 640, 2], [340, 616, 6], [350, 598, 10], [366, 594, 12], [380, 600, 10], [386, 620, 6], [380, 642, 2]], 9, cloth, towel, { seg: 16, radial: 8 });   // folded over the ring
      K.pad(330, 596, 70, 200, towel, { d: 50 });

      // mirror above the sink
      const mirror = K.g(far, { z: WALL + 2 });
      const rim = K.mesh(new T.TorusGeometry(1, 0.06, 8, 48), K.mat('#20283e', { rough: 0.6 }), mirror);
      K.tr(rim, { x: 480, y: 380, z: 6, sx: 110, sy: 130, sz: 40 });
      const glassTex = K.canvasTex(128, 128, (ctx, w, h) => {
        // what a bathroom mirror shows: the tiled wall opposite, a little brighter up toward the ceiling light
        const gr = ctx.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#5e7c8e'); gr.addColorStop(0.55, '#3c5668'); gr.addColorStop(1, '#2a3f4e');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(20,34,44,0.5)'; ctx.lineWidth = 3;
        for (let x = 12; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 20; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        const rg = ctx.createRadialGradient(w * 0.32, h * 0.16, 4, w * 0.32, h * 0.16, w * 0.5);
        rg.addColorStop(0, 'rgba(255,250,235,0.5)'); rg.addColorStop(1, 'rgba(255,250,235,0)');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      });
      const face = K.mesh(new T.CircleGeometry(1, 48), new T.MeshStandardMaterial({ map: glassTex, roughness: 0.12, metalness: 0.35, envMapIntensity: 1.6 }), mirror);
      face.userData.__disposeTex = glassTex;
      K.tr(face, { x: 480, y: 380, z: 4, sx: 104, sy: 124, sz: 1 });
      face.castShadow = false;
      K.pad(370, 250, 220, 260, mirror, { d: 30 });

      // ---------- the floss box (on the counter) ----------
      const flossG = K.g(main, { z: -140 });
      K.rbox(600, 508, 62, 40, 40, 8, K.mat('#7fc8d6', { rough: 0.5 }), flossG);
      K.rbox(612, 498, 38, 14, 24, 5, K.mat('#a9dde7', { rough: 0.5 }), flossG);
      K.tube([[652, 504, 10], [664, 512, 12], [662, 534, 12]], 1.4, K.mat('#ffffff', { rough: 0.8 }), flossG, { seg: 8, radial: 5 });
      K.pad(590, 490, 84, 62, flossG, { d: 60 });
      if (st.hasItem('floss') || st.has('flossTaken')) main.remove(flossG);

      // ---------- the bathtub: a hollow basin, open at the top, water well below the rim ----------
      const tubG = K.g(mid, { z: -150 });
      const enamel = K.mat('#e8eef0', { rough: 0.25, metal: 0.05, side: 'double' });
      const tubShape = K.rectShape(800, -130, 620, 260, 60);
      tubShape.holes.push(K.rectShape(826, -104, 568, 208, 44));
      const walls = K.ext(tubShape, 160, enamel, tubG, { bevel: 6, seg: 12 });
      K.tr(walls, { x: 0, y: 720, z: 0, rx: 90 });                 // the ring of walls, standing on the floor
      const floorIn = K.cut(K.rectShape(826, -104, 568, 208, 44), K.mat('#dfe6ea', { rough: 0.3 }), tubG, { rx: 90 });
      K.tr(floorIn, { x: 0, y: 792, z: 0, rx: 90 });               // the basin floor, seen from above
      const tubRim = K.ext(K.rectShape(788, -142, 644, 284, 68), 18, K.mat('#d0dade', { rough: 0.25 }), tubG, { bevel: 6, seg: 12 });
      tubRim.geometry = new T.ExtrudeGeometry([(() => { const r = K.rectShape(788, -142, 644, 284, 68); r.holes.push(K.rectShape(826, -104, 568, 208, 44)); return r; })()], { depth: 8, bevelEnabled: true, bevelThickness: 5, bevelSize: 5, bevelSegments: 3, curveSegments: 12 });
      K.tr(tubRim, { x: 0, y: 646, z: 0, rx: 90 });                // the rolled rim on top of the walls
      const water = new T.MeshPhysicalMaterial({ color: new T.Color('#3f86ad'), roughness: 0.08, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.94, envMapIntensity: 1.6 });
      const waterM = K.cut(K.rectShape(828, -102, 564, 204, 42), water, tubG, { rx: 90 });
      K.tr(waterM, { x: 0, y: 654, z: 0, rx: 90 });                 // still bathwater, filled nearly to the rim so it reads from the room
      waterM.castShadow = false;
      // claw feet
      K.tube([[850, 800, 100], [846, 830, 104], [822, 846, 108]], 6, K.mat('#aebec4', { rough: 0.3, metal: 0.6 }), tubG, { seg: 8 });
      K.tube([[1370, 800, 100], [1374, 830, 104], [1398, 846, 108]], 6, K.mat('#aebec4', { rough: 0.3, metal: 0.6 }), tubG, { seg: 8 });
      // shower head above, dripping
      const pipe = K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 });
      K.tube([[1360, 620, WALL + 20], [1360, 260, WALL + 20], [1352, 212, WALL + 20], [1320, 200, WALL + 20], [1250, 200, WALL + 20], [1226, 208, WALL + 20], [1216, 232, WALL + 20], [1216, 254, WALL + 20]], 6, pipe, far, { seg: 32 });
      const headMat = K.mat('#aebec4', { rough: 0.3, metal: 0.6 });
      K.cylUp(1216, 262, 9, 12, headMat, far, { z: WALL + 20, seg: 16 });                          // the neck
      K.cylUp(1216, 270, 27, 10, headMat, far, { z: WALL + 20, rTop: 18, seg: 28 });                // the head, flaring down to its face
      for (let ring = 0; ring < 3; ring++) {                                                        // the holes in its face
        const n = ring === 0 ? 1 : ring * 6, rr = ring * 7.5;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; K.cylUp(1216 + Math.cos(a) * rr, 272, 1.4, 1.6, K.mat('#2a3540', { rough: 0.9 }), far, { z: WALL + 20 + Math.sin(a) * rr, seg: 6 }); }
      }
      // the duck, watching, afloat in the tub
      const duck = K.g(main, { z: -150, y: 30 });
      CH.models.duck(duck, 1160, 646, 0);
      let duckT = 0;
      api.tick((dt) => { duckT += dt; K.tr(duck, { z: -150, y: 30 + Math.sin(duckT * 1.4) * 2, r: Math.sin(duckT * 1.1) * 3, ox: 1160, oy: 646 }); });

      // ---------- the soap (the trap), perched on the tub rim corner ----------
      const soap = K.g(main, { z: -30 });
      K.ellipsoid(790, 626, 34, 11, 22, K.mat('#e2938a', { rough: 0.35, clearcoat: 0.8 }), soap);
      K.ellipsoid(782, 618, 10, 3, 6, K.mat('#ffffff', { rough: 0.4, opacity: 0.6 }), soap);
      K.pad(752, 606, 78, 40, soap, { d: 60 });

      // ---------- red herrings: a giant toothbrush + bathroom scales ----------
      const brushG = K.g(main, { z: -150 });
      K.cylUp(321, 542, 15, 42, K.mat('#cfe4ea', { rough: 0.2, opacity: 0.85 }), brushG, { rTop: 12 });
      K.rbox(314, 452, 7, 52, 7, 3, '#e2635f', brushG);
      K.rbox(314, 442, 7, 10, 7, 2, '#eafcff', brushG);
      K.pad(300, 436, 44, 112, brushG, { d: 40 });

      const scaleG = K.g(main, { z: -20 });
      K.rbox(216, 786, 84, 16, 60, 6, K.mat('#aebec4', { rough: 0.4, metal: 0.3 }), scaleG);
      K.rbox(240, 782, 36, 8, 30, 3, K.mat('#e8eef0', { rough: 0.5 }), scaleG, { z: 20 });
      const needle = K.rbox(257, 776, 2, 8, 2, 1, K.mat('#c23f4a', { rough: 0.5 }), scaleG, { z: 36, ox: 258, oy: 784 });
      K.pad(212, 770, 92, 34, scaleG, { d: 70 });

      api.hot(brushG, {
        id: 'bt.brush',
        near: { x: 420, plat: 'counter' },
        act: async () => { await api.think(st.bumpClick('bt.brush') % 2 ? 'sd.brush.look' : 'sd.brush.look2'); },
      });
      api.hot(scaleG, {
        id: 'bt.scale',
        near: { x: 320, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.hopTo(258, 788, { h: 30, dur: 300 }));
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 900, ease: CH.tw.ease.elasticOut,
              onUpdate: (k, o) => K.tr(needle, { r: 700 * (1 - o.t) * Math.sin(o.t * 9) + 24 * o.t, ox: 258 - 258, oy: 784 - 780 }),
            });
            await ctx.w(700);
            await ctx.run(api.hero.hopTo(330, 800, { h: 30, dur: 300 }));
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 500, onUpdate: (k, o) => K.tr(needle, { r: 24 * (1 - o.t) }),
            });
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('bt.scale') % 2 ? 'sd.scale.weigh' : 'sd.scale.again');
        },
      });

      // ================= hotspots =================

      api.hot(doorG, {
        id: 'bt.door',
        near: { x: 230, plat: 'floor' },
        act: async () => { await api.go('corridor', 'fromBath'); },
      });

      api.hot(mirror, {
        id: 'bt.mirror',
        near: { x: 480, plat: 'counter' },
        act: async () => {
          const n = st.bumpClick('bt.mirror');
          if (n === 1) { await api.hero.blink(2); await api.think('c4.mirror.look'); }
          else await api.think('c4.mirror.look2');
        },
      });

      api.hot(towel, {
        id: 'bt.towel',
        near: { x: 400, plat: 'counter' },
        act: async () => { await api.think('c4.towel.look'); },
      });

      api.hot(flossG, {
        id: 'bt.floss',
        near: { x: 620, plat: 'counter' },
        active: () => !!flossG.parent,
        act: async () => {
          api.sfx('coin');
          st.flag('flossTaken');
          st.give('floss');
          main.remove(flossG);
          await api.think('c4.floss.take');
          await api.think('c4.floss.idea');
        },
      });

      api.hot(duck, {
        id: 'bt.duck',
        near: { x: 1080, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('bt.duck');
          api.sfx('squeak', 0.6);
          if (n === 1) await api.think('c4.duck.look');
          else if (n === 2) await api.think('c4.duck.stare');
          else await api.think('c4.duck.won');
        },
      });

      api.hot(soap, {
        id: 'bt.soap',
        near: { x: 730, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('bt.soap');
          if (n === 1) { await api.think('c4.soap.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.hopTo(790, 620, { h: 40, dur: 320 }));
            ctx.sfx('slide');
            await ctx.tw(api.hero.A, { rock: -30 }, { dur: 200 });
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 600, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => {
                api.hero.place(U.lerp(790, 1020, o.t), 620 - Math.sin(o.t * 2.4) * 60 + o.t * 120);
                api.hero.A.rock = o.t * 540;
              },
            });
            ctx.sfx('splash');
            api.cam.bump(0.7);
            api.hero.A.rock = 0;
          }, { cinema: false, skippable: false });
          await api.respawn();
          await api.think('c4.soap.oops');
        },
      });

      api.hot(tubG, {
        id: 'bt.tub',
        near: { x: 760, plat: 'floor' },
        act: async () => { await api.think(st.bumpClick('bt.tub') % 2 ? 'c4.tub.look' : 'c4.tub.look2'); },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('bathFirst')) {
        st.flag('bathFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          await ctx.think('c4.bath1');
        }, { cinema: false });
      }
    },
  });
})();
