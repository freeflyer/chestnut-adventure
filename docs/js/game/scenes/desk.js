/* Chapter 1 — the desk (macro view). Wake up, learn to move, get down. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  CH.defScene('desk', {
    chapter: 1,
    pageBg: '#1c2438',
    bg: '#161d30',
    heroScale: 1.5,
    ambient: [{ name: 'tick', every: [2600, 4200] }],
    fill: 2.2, ambient2: 1.0,
    camera: { x: 800, y: 380, z: 1590, tx: 800, ty: 490, fov: 32, follow: 0.07 },

    platforms: [
      { id: 'desk', x1: 120, x2: 1330, y: 640 },
    ],
    links: [],
    spots: {
      start: { x: 780, plat: 'desk' },
      fromReturn: { x: 1240, plat: 'desk' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      // ---------- backdrop: dusk wall + window + moon ----------
      const wallMat = new T.MeshStandardMaterial({ map: P.wallTex('#222b44', '#38435f'), roughness: 0.95 });
      K.vplane(-500, 2100, -500, 1500, -330, wallMat, far);
      // the room floor, far below the desk: only its darkness shows past the edge
      K.hplane(-500, 2100, 1320, -330, 500, K.mat('#1a1420', { rough: 1 }), far);
      K.sidewall(-170, -500, 1320, -330, 500, K.mat('#1c2238', { rough: 1 }), far, { facing: 'right' });
      K.sidewall(1770, -500, 1320, -330, 500, K.mat('#1c2238', { rough: 1 }), far, { facing: 'left' });
      const win = P.windowNight(far, 150, 90, 300, 420, { moon: true, lightI: 1.2 });
      P.glow(far, 300, 300, 260, '#9db8d8', 0.10, -300);
      K.sun(L, 300, 200, -200, '#9db8d8', 1.4, { tx: 700, ty: 700, tz: 0, shadow: false });
      K.spot(L, 1100, -200, 300, 1150, 500, -330, '#8a86b8', 90, { angle: 70, penumbra: 1, decay: 1.2, shadow: false, dist: 1600 });
      // curtains: heavy, folded
      const curtain = K.mat('#54405c', { rough: 1 });
      K.ext('M 100 70 C 130 240 96 420 128 540 L 74 540 L 74 70 Z', 22, curtain, far, { z: -296, bevel: 3 });
      K.ext('M 500 70 C 470 240 506 420 476 540 L 528 540 L 528 70 Z', 22, curtain, far, { z: -296, bevel: 3 });
      // picture on the wall
      P.picture(far, 640, 160, 170, 120, (ctx, w, h) => {
        ctx.fillStyle = '#7a90ae';
        ctx.beginPath(); ctx.moveTo(0, h * 0.8); ctx.lineTo(w * 0.3, h * 0.4); ctx.lineTo(w * 0.55, h * 0.68); ctx.lineTo(w * 0.78, h * 0.3); ctx.lineTo(w, h * 0.62); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8d8a8'; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.22, 12, 0, 6.28); ctx.fill();
      });

      // ---------- the desk slab ----------
      const wood = P.woodMat('#8a5c36', '#5a3a20', 0.65);
      K.box(-60, 640, 1442, 24, 560, wood, main, { z: -50 });
      K.box(-60, 640, 1442, 3, 4, '#a8763f', main, { z: 231 });           // the worn front edge
      // the same desk we later see from the floor: four corner legs, and the wide drawer front centred between them
      K.box(4, 664, 46, 700, 40, '#4a2e18', main, { z: 180 });             // front legs, a little back from the front edge
      K.box(1322, 664, 46, 700, 40, '#4a2e18', main, { z: 180 });
      K.box(4, 664, 46, 700, 40, '#3a2212', main, { z: -310 });            // back legs
      K.box(1322, 664, 46, 700, 40, '#3a2212', main, { z: -310 });
      K.box(254, 694, 900, 180, 24, '#7a5030', main, { z: 190 });          // the drawer front, set back under the edge like downstairs
      K.sphere(704, 784, 12, K.mat('#a8823c', { metal: 0.3, rough: 0.6 }), main, { z: 204 });
      // chair below the edge
      const chair = K.g(main, { z: 120 });
      K.rbox(1445, 730, 150, 26, 150, 8, '#7c4a48', chair);
      K.rbox(1580, 560, 22, 190, 150, 8, '#6a3f3d', chair);
      K.cylUp(1520, 900, 8, 146, '#513029', chair);

      // ---------- desk lamp (left) ----------
      const lampG = K.g(mid, { z: -120 });
      K.ellipsoid(230, 636, 62, 8, 46, K.mat('#3a2313', { rough: 0.6, metal: 0.3 }), lampG);
      K.tube([[230, 632, 0], [226, 560, 0], [250, 500, 0], [300, 470, 0], [346, 434, 0]], 6, K.mat('#c9762e', { rough: 0.5, metal: 0.4 }), lampG, { seg: 24 });
      // the shade: solid painted metal, dark inside, a bulb hidden in its throat; the light lives under it
      const shadeG = K.g(lampG, { x: 342, y: 428, r: -36 });
      const shade = K.mesh(new T.CylinderGeometry(9, 46, 80, 28, 1, true), K.mat('#d9822a', { rough: 0.55, metal: 0.15 }), shadeG);
      K.tr(shade, { y: 40, r: 180 });
      const shadeIn = K.mesh(new T.CylinderGeometry(8.5, 45, 79, 28, 1, true), K.mat('#5a3410', { rough: 0.7, side: 'back' }), shadeG);
      K.tr(shadeIn, { y: 40, r: 180 });
      shadeIn.castShadow = false;
      K.cylUp(0, 2, 10, 4, K.mat('#b86a20', { rough: 0.5, metal: 0.2 }), shadeG); // the cap where the arm meets the shade
      const bulbMat = new T.MeshStandardMaterial({ color: new T.Color('#fff2c8'), emissive: new T.Color('#ffe2a0'), emissiveIntensity: 1.6, roughness: 0.4 });
      const bulb = K.sphere(0, 30, 7, bulbMat, shadeG);
      bulb.castShadow = false;
      // the light: the bulb itself, in the throat of the shade, aimed straight down the shade's axis (pivot (342,428),
      // 36° off vertical) so the pool lands exactly where the shade points; this is what throws the shadows
      const AX = 0.588, AY = 0.809;   // the shade's axis, unit
      const lampLight = K.spot(L, 342 + AX * 30, 428 + AY * 30, -120, 342 + AX * 262, 428 + AY * 262, -120, '#ffcf7a', 42, { angle: 32, penumbra: 0.5, decay: 1.6, mapSize: 2048, dist: 1400 });
      const lampFill = K.point(L, 342 + AX * 78, 428 + AY * 78, -100, '#ffb454', 2, 800);
      const mouthGlow = K.glow(mid, 396, 492, -70, 46, '#ffb454', 0.1);
      const setLamp = (on) => {
        lampLight.intensity = on ? 42 : 0;
        lampFill.intensity = on ? 2 : 0;
        mouthGlow.visible = on;
        bulbMat.emissiveIntensity = on ? 1.6 : 0;
        bulbMat.color.set(on ? '#fff2c8' : '#c9b9a0');
      };
      setLamp(!st.has('deskLampOff'));

      // ---------- items on the desk ----------
      // sticky notes + pencil
      const notes = K.g(main, { z: -190 });
      K.rbox(500, 632, 66, 8, 66, 2, '#e8d05f', notes);
      K.rbox(506, 626, 66, 8, 66, 2, '#f0dc74', notes, { r: 4, ox: 506, oy: 630 });
      const pencilG = K.g(main, { x: 380, y: 634, z: -110, r: -9 });
      K.rodX(0, 94, 0, 4.2, K.mat('#e8a13c', { rough: 0.6 }), pencilG).geometry = new T.CylinderGeometry(4.2, 4.2, 94, 6).rotateZ(Math.PI / 2).translate(47, 0, 0);
      const tip = K.cone(100, 0, 4.2, 12, '#d8c8a8', pencilG);
      K.tr(tip, { r: 90, x: 100, y: -6 });
      K.sphere(106, 0, 1.6, '#3a2b22', pencilG);
      K.rbox(-4, -4, 12, 8, 8, 2, '#e2938a', pencilG);

      // mug
      const mug = K.g(main, { z: -70 });
      {   // a hollow mug: one lathe with a wall 4 thick, a floor inside, and the last of the coffee at the bottom
        const prof = [[0, 0], [38, 0], [46, 80], [42, 80], [35, 10], [0, 10]].map((p) => new T.Vector2(p[0], p[1]));
        const cup = K.mesh(new T.LatheGeometry(prof, 32), K.mat('#b5525c', { rough: 0.45, side: 'double' }), mug, {});
        K.tr(cup, { x: 888, y: 640, r: 180 });
        K.cylUp(888, 630, 35, 2, K.mat('#3a1d14', { rough: 0.9 }), mug, { seg: 32 });
      }
      K.torus(934, 598, 19, 6, K.mat('#b5525c', { rough: 0.45 }), mug, { z: 0 });

      // Ted the cactus — a polite spiky distance from the hero's waking spot
      const tedG = K.g(main, { z: -60 });
      const ted = CH.actors.ted(tedG, 625, 640, 1.95);
      api.anchor('ted', () => ({ x: 700, y: 470 }));

      // tape dispenser
      const tape = K.g(main, { z: -30 });
      K.ext('M 1060 640 L 1060 600 A 34 34 0 0 1 1128 600 L 1128 640 Z', 40, K.mat('#4a6a8a', { rough: 0.55 }), tape, { bevel: 3 });
      K.disc(1094, 600, 20, 44, K.mat('#7fa8c9', { rough: 0.5 }), tape);
      K.disc(1094, 600, 9, 46, K.mat('#2c3a4c', { rough: 0.5 }), tape);
      K.box(1094, 580, 46, 8, 38, K.mat('#d8e4ec', { rough: 0.3, opacity: 0.9 }), tape);

      // ---------- the book stack (ramp solution) ----------
      const books = K.g(main, { z: -60 });
      const bookColors = [['#8a4a52', '#c98a63'], ['#4a6a5a', '#a8c9a0'], ['#5a4a7a', '#a89ac9']];
      const bookMesh = (parent, x, y, w, h, d, c) => {
        const g = K.g(parent);
        K.rbox(x, y, w, h, d, 3, c[0], g);
        K.box(x + 4, y + 3, w - 8, h - 6, 4, c[1], g, { z: d / 2 }); // the pages, facing us
        return g;
      };
      bookMesh(books, 1130, 612, 220, 28, 160, bookColors[1]);
      bookMesh(books, 1150, 584, 200, 28, 160, bookColors[2]);
      // the top book — pushable
      const topBook = K.g(books);
      bookMesh(topBook, 0, 0, 210, 26, 160, bookColors[0]);
      K.label('ROOTS & WINGS', { size: 13, color: '#e8d8b8', letterSpacing: 2, x: 105, y: 13, z: 81.5, parent: topBook });
      const setBook = (ramped) => {
        if (ramped) K.tr(topBook, { x: 1305, y: 585, z: 200, r: 38, ox: 0, oy: 26 });
        else K.tr(topBook, { x: 1160, y: 558, z: 0, r: 0, ox: 0, oy: 26 });
      };
      setBook(st.has('bookRamp'));

      // ---------- the charging cable (climb solution) ----------
      const cable = K.g(main, { z: 60 });
      const cableMat = K.mat('#d8d4c8', { rough: 0.6 });
      let cableMesh = null;
      const cablePlug = K.g(cable);
      K.rbox(-10, -8, 26, 16, 14, 3, '#b8b4a8', cablePlug);
      K.rbox(14, -5, 10, 10, 10, 2, '#8a867c', cablePlug);
      const cableHit = K.pad(940, 575, 116, 70, cable, { d: 80 });
      const setCable = (down) => {
        if (cableMesh) { cable.remove(cableMesh); cableMesh.geometry.dispose(); }
        if (down) {
          const pts = K.pathPoints('M 960 634 C 1050 600 1180 620 1320 634 L 1402 646 C 1414 660 1412 780 1410 900', 30).map((p, i) => [p[0], p[1], 0]);
          cableMesh = K.tube(pts, 4, cableMat, cable, { seg: 60, radial: 8 });
          K.tr(cablePlug, { x: 1410, y: 898, r: 90 });
        } else {
          const pts = K.pathPoints('M 960 634 C 1000 590 1060 590 1080 620 C 1100 646 1030 650 1046 616 C 1056 592 1120 600 1150 630', 30).map((p, i) => [p[0], p[1], Math.sin(i * 0.45) * 12]);
          cableMesh = K.tube(pts, 4, cableMat, cable, { seg: 60, radial: 8 });
          K.tr(cablePlug, { x: 1150, y: 630, r: 10 });
        }
      };
      setCable(st.has('cableDown'));

      // ---------- red herrings: a snow globe on the sill (left corner), a paperclip ----------
      const globeG = K.g(main, { z: -262 });   // on the sill (top at 524, front edge at -238), clear of the window frame behind it
      K.cylUp(200, 524, 26, 12, K.mat('#3c2f22', { rough: 0.6 }), globeG);
      const glass = new T.MeshPhysicalMaterial({ color: new T.Color('#cfe4ea'), transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
      const gSphere = K.sphere(200, 496, 24, glass, globeG, { seg: 32 });
      gSphere.castShadow = false;
      K.cone(196, 506, 7, 18, '#557f3e', globeG);
      K.box(204, 498, 6, 8, 6, '#7a5230', globeG);
      const flakes = [];
      for (let i = 0; i < 6; i++) flakes.push(K.sphere(200, 496, 1.4, K.mat('#ffffff', { emissive: '#ffffff', ei: 0.5 }), globeG));
      flakes.forEach((f) => { f.visible = false; });
      let snowT = -1;
      api.tick((dt) => {
        if (snowT < 0) return;
        snowT += dt;
        flakes.forEach((f, i) => {
          const ph = snowT * 2 + i;
          f.visible = snowT < 3;
          K.tr(f, { x: 200 + Math.sin(ph + i * 2) * (14 - i), y: 484 + ((ph * 8 + i * 7) % 26), z: Math.cos(ph) * 8 });
        });
        if (snowT > 3) snowT = -1;
      });

      const clipG = K.g(main, { z: -100, x: 1011, y: 636, s: 1.7, ox: 0, oy: 0 });
      const clipPts = K.pathPoints('M 1006 636 L 1006 626 A 5 5 0 0 1 1016 626 L 1016 634 A 3.4 3.4 0 0 1 1009.2 634 L 1009.2 628', 30).map((p) => [p[0] - 1011, 1.4, p[1] - 632]);
      K.tube(clipPts, 1.2, K.mat('#aab4c0', { rough: 0.3, metal: 0.7 }), clipG, { seg: 40, radial: 6 });
      K.pad(-16, -14, 32, 28, clipG, { d: 30 });
      if (st.hasItem('clip') || st.has('clipTaken')) main.remove(clipG);

      // dust motes in the lamp light
      const motes = [];
      for (let i = 0; i < 14; i++) {
        const m = K.glow(fg, 0, 0, 0, U.rand(2.5, 5), '#ffe9c0', 0.35);
        motes.push({ el: m, x: U.rand(260, 620), y: U.rand(460, 630), z: U.rand(-150, 100), ph: U.rand(0, 6), sp: U.rand(0.2, 0.5) });
      }
      api.tick((dt) => {
        motes.forEach((m) => {
          m.ph += dt * m.sp;
          m.el.position.set(m.x + Math.sin(m.ph * 1.7) * 18, m.y + Math.cos(m.ph) * 12, m.z);
          m.el.material.opacity = st.has('deskLampOff') ? 0 : 0.15 + 0.2 * (Math.sin(m.ph * 2) + 1) / 2;
        });
      });

      // ================= hotspots =================

      api.hot(win, {
        id: 'd.window',
        near: { x: 320, plat: 'desk' },
        act: async () => {
          const n = st.bumpClick('d.window');
          await api.think(n % 2 ? 'c1.look.window' : 'c1.look.window2');
        },
      });

      api.hot(lampG, {
        id: 'd.lamp',
        near: { x: 300, plat: 'desk' },
        act: async () => {
          api.sfx('tap');
          st.flag('deskLampOff', !st.has('deskLampOff'));
          setLamp(!st.has('deskLampOff'));
          if (st.has('deskLampOff')) await api.think('c1.lamp.off');
          else await api.think('c1.lamp.on');
        },
      });

      api.hot(ted.el, {
        id: 'd.ted',
        near: { x: 710, plat: 'desk' },
        act: async () => {
          const n = st.bumpClick('d.ted');
          if (!st.has('deskDown')) {
            if (!st.has('bookRamp') && !st.has('cableDown')) {
              if (n === 1) { await api.say('ted', 'c1.ted.chat1'); await api.say('ted', 'c1.ted.hint1'); }
              else if (n === 2) await api.say('ted', 'c1.ted.hint2');
              else await api.say('ted', U.pick(['c1.ted.chat2', 'c1.ted.hint2']));
            } else {
              await api.say('ted', 'c1.ted.go');
            }
          } else {
            await api.say('ted', U.pick(['c1.ted.later1', 'c1.ted.later2']));
          }
        },
      });

      api.hot(globeG, {
        id: 'd.globe',
        near: { x: 285, plat: 'desk' },
        act: async () => {
          await api.cut(async (ctx) => {
            api.hero.face(-1);
            await ctx.run(api.hero.tailWhip(208, 510));
            ctx.sfx('tap');
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 500, onUpdate: (k, o) => K.tr(globeG, { x: Math.sin(o.t * Math.PI * 5) * 4 }),
            });
            snowT = 0;
            await ctx.w(900);
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('d.globe') % 2 ? 'sd.globe.shake' : 'sd.globe.again');
        },
      });

      api.hot(clipG, {
        id: 'd.clip',
        near: { x: 1010, plat: 'desk' },
        active: () => !!clipG.parent,
        act: async () => {
          api.sfx('coin');
          st.flag('clipTaken');
          st.give('clip');
          main.remove(clipG);
          await api.think('sd.clip.take');
        },
      });

      api.hot(notes, {
        id: 'd.notes', near: { x: 560, plat: 'desk' },
        act: async () => { api.sfx('paper'); await api.think('c1.look.notes'); },
      });
      api.hot(pencilG, {
        id: 'd.notes', near: { x: 560, plat: 'desk' },
        act: async () => { api.sfx('paper'); await api.think('c1.look.notes'); },
      });
      api.hot(mug, {
        id: 'd.mug', near: { x: 830, plat: 'desk' },
        act: async () => {
          const n = st.bumpClick('d.mug');
          await api.think(n % 2 ? 'c1.look.mug' : 'c1.look.mug2');
        },
      });
      api.hot(tape, {
        id: 'd.tape', near: { x: 1040, plat: 'desk' },
        act: async () => { await api.think('c1.look.tape'); },
      });

      api.hot(books, {
        id: 'd.books',
        near: { x: 1090, plat: 'desk' },
        active: () => true,
        act: async () => {
          if (st.has('bookRamp')) { await api.think('c1.books.done'); return; }
          const n = st.bumpClick('d.books');
          if (n === 1) { await api.think('c1.books.look'); return; }
          await api.hero.rollTo(1120, () => true);
          api.hero.face(1);
          await api.hero.tailWhip(1180, 560);
          api.sfx('slide', false);
          await api.tw({ t: 0 }, { t: 1 }, {
            dur: 700, ease: CH.tw.ease.quadIn,
            onUpdate: (k, o) => {
              K.tr(topBook, { x: U.lerp(1160, 1305, o.t), y: U.lerp(558, 585, o.t), z: U.lerp(0, 200, o.t), r: U.lerp(0, 38, o.t), ox: 0, oy: 26 });
            },
          });
          api.sfx('doorThud');
          api.cam.bump(0.8);
          CH.props.dust(api, 1380, 660, 8);
          st.flag('bookRamp');
          rampZone.visible = true;
          await api.hero.excite();
          await api.think('c1.books.ramp');
        },
      });

      const descendCable = async () => {
        await api.cut(async (ctx) => {
          await ctx.run(api.hero.rollTo(1372, () => true));
          await ctx.run(api.hero.climbDown(1410, 850));
        }, { cinema: false, skippable: false });
        st.flag('deskDown');
        await api.go('study', 'fromCable');
      };
      api.hot(cable, {
        id: 'd.cable',
        near: { x: 920, plat: 'desk' },
        act: async () => {
          if (st.has('cableDown')) { await descendCable(); return; }
          const n = st.bumpClick('d.cable');
          if (n === 1) { await api.think('c1.cable.look'); return; }
          await api.hero.tailWhip(1000, 620);
          api.sfx('slide', false);
          setCable(true);
          st.flag('cableDown');
          cableZone.visible = true;
          api.sfx('tap');
          await api.think('c1.cable.dropped');
        },
      });

      // the edge of the desk
      const edgeZone = K.pad(1330, 560, 70, 90, main, { d: 60, z: -120 });
      api.hot(edgeZone, {
        id: 'd.edge',
        near: { x: 1310, plat: 'desk' },
        act: async () => {
          api.hero.face(1);
          await CH.tw.to(api.hero.A, { rock: 16 }, { dur: 260, group: 'scene' });
          await api.delay(420);
          await CH.tw.to(api.hero.A, { rock: 0 }, { dur: 200, group: 'scene' });
          if (st.has('bookRamp') || st.has('cableDown')) {
            await api.think('c1.edge.ready');
            return;
          }
          const n = st.bumpClick('d.edge');
          if (n === 1) { await api.hero.headShake(); await api.think('c1.edge.high'); }
          else if (n === 2) { await api.hero.headShake(); await api.think('c1.edge.high2'); }
          else await api.think('c1.edge.hint');
        },
      });

      // descend via the book ramp — the target is the whole plank plus the chair seat it lands on
      const rampZone = K.g(main, { z: 140 });
      rampZone.visible = st.has('bookRamp');
      const rampPlank = K.pad(-14, -18, 245, 66, rampZone, { d: 180 });
      K.tr(rampPlank, { x: 1305, y: 585, r: 38, ox: 0, oy: 26 });
      K.pad(1428, 704, 190, 80, rampZone, { d: 180 });
      api.hot(rampZone, {
        id: 'd.ramp',
        active: () => st.has('bookRamp'),
        near: { x: 1290, plat: 'desk' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(1330, () => true));
            await ctx.run(api.hero.slideTo(1470, 700, true));
            ctx.sfx('boing');
          }, { cinema: false, skippable: false });
          st.flag('deskDown');
          await api.go('study', 'fromRamp');
        },
      });

      // descend via the cable
      const cableZone = K.pad(1330, 560, 130, 420, main, { d: 160, z: 60 });
      cableZone.visible = st.has('cableDown');
      api.hot(cableZone, {
        id: 'd.cableEnd',
        active: () => st.has('cableDown'),
        near: { x: 1340, plat: 'desk' },
        act: descendCable,
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('awake')) {
        const hero = api.hero;
        api.cut(async (ctx) => {
          hero.A.lid = 1; // fast asleep, shell closed
          await ctx.w(900);
          for (let i = 0; i < 3; i++) {
            await ctx.tw(hero.A, { rock: -7 }, { dur: 120 });
            await ctx.tw(hero.A, { rock: 6 }, { dur: 140 });
            await ctx.tw(hero.A, { rock: 0 }, { dur: 120 });
            ctx.sfx('tap');
            await ctx.w(500 - i * 120);
          }
          ctx.sfx('crack');
          hero.A.lidJitter = -0.06;
          await ctx.tw(hero.A, { bounce: 8 }, { dur: 110, ease: CH.tw.ease.quadOut });
          await ctx.tw(hero.A, { bounce: 0 }, { dur: 160, ease: CH.tw.ease.bounceOut });
          await ctx.w(700);
          ctx.sfx('pop', 0.8);
          hero.A.lidJitter = 0;
          await ctx.tw(hero.A, { lid: 0.62 }, { dur: 900, ease: CH.tw.ease.quadInOut });
          await ctx.w(500);
          await ctx.tw(hero.A, { lid: 0 }, { dur: 700, ease: CH.tw.ease.backOut });
          ctx.sfx('squeak', 0.9);
          await ctx.w(400);
          await ctx.run(hero.slowBlink());
          await ctx.run(hero.lookAround());
          await ctx.think('c1.wake1');
          hero.face(-1);
          await ctx.tw(hero.A, { pupX: -7 }, { dur: 260 });
          await ctx.w(350);
          ctx.sfx('squeak', 1.4);
          await ctx.tw(hero.A, { bounce: 12, rock: 8 }, { dur: 140, ease: CH.tw.ease.quadOut });
          await ctx.tw(hero.A, { bounce: 0, rock: 0 }, { dur: 260, ease: CH.tw.ease.bounceOut });
          await ctx.think('c1.wake.spiky');
          await ctx.tw(hero.A, { pupX: 0 }, { dur: 220 });
          await ctx.say('ted', 'c1.ted.hello1');
          await ctx.say('ted', 'c1.ted.hello2');
          await ctx.think('c1.wake2');
          await ctx.think('c1.wake3');
          await ctx.say('ted', 'c1.ted.hello3');
        }, { skippable: false }).then(() => {
          hero.A.lid = 0; hero.A.lidJitter = 0; hero.A.rock = 0; hero.A.bounce = 0;
          st.flag('awake');
          api.toast('c1.goal');
        });
      }
    },
  });
})();
