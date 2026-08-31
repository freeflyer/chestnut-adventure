/* Chapter 5 — the Dream. The Kid's dream of the house: wobbly, drawn in crayon,
   softly lit, and full of things that talk. Four scenes:
   dreamRoom → dreamHall → dreamKitchen ⇄ dreamGarden, and out through Biscuit's cloud. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE, X = window.THREE_X;

  const INK = '#2a1f3d';      // dark crayon
  const LILAC = '#c9b8f2';
  const GOLD = '#e8b64c';

  // the hand-drawn wobble: the whole picture breathes and "boils" like a crayon film
  const WobbleShader = {
    uniforms: { tDiffuse: { value: null }, time: { value: 0 }, seed: { value: 0 }, amount: { value: 0.0055 }, grain: { value: 0.07 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float time; uniform float seed; uniform float amount; uniform float grain;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + seed * 17.3) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        vec2 uv = vUv;
        vec2 d = vec2(noise(uv * 7.0 + seed) - 0.5, noise(uv * 9.0 + 4.0 + seed) - 0.5) * amount;
        vec4 c = texture2D(tDiffuse, uv + d);
        float g = (hash(uv * 900.0 + time) - 0.5) * grain;
        float vig = smoothstep(1.25, 0.45, length(uv - 0.5) * 1.35);
        gl_FragColor = vec4(c.rgb * (0.86 + 0.14 * vig) + g, c.a);
      }`,
  };

  // ============================================================ dream fx
  const DF = CH.dreamfx = {
    /** the dream look: hand-drawn wobble, paper grain, vignette, drifting sparks, a halo on the hero */
    apply(api) {
      const pass = new X.ShaderPass(WobbleShader);
      api.addPass(pass);
      let acc = 0, seed = 3;
      api.tick((dt) => {
        acc += dt;
        pass.uniforms.time.value += dt;
        if (acc > 0.42) { acc = 0; seed = (seed % 9) + 1; pass.uniforms.seed.value = seed; }
      });

      // drifting sparks
      const sp = [];
      for (let i = 0; i < 26; i++) {
        const el = K.glow(api.layers.fx, 0, 0, 0, U.rand(4, 9), U.pick(['#fff3c4', '#d9c7ff', '#bfeeff']), 0.6);
        sp.push({ el, x: U.rand(0, 1600), y: U.rand(100, 900), z: U.rand(-300, 200), v: U.rand(12, 30), ph: U.rand(0, 6.28) });
      }
      // the hero glows faintly — he is the one solid thing in here
      const halo = K.glow(api.layers.fx, 0, 0, 0, 70, '#cdb8ff', 0.18);
      const haloLight = K.point(api.layers.lights, 0, 0, 90, '#cdb8ff', 2.6, 500);
      api.tick((dt) => {
        sp.forEach((p) => {
          p.y -= p.v * dt; p.ph += dt;
          if (p.y < -20) { p.y = 920; p.x = U.rand(0, 1600); }
          p.el.position.set(p.x + Math.sin(p.ph) * 14, p.y, p.z);
          p.el.material.opacity = 0.25 + 0.5 * (Math.sin(p.ph * 1.7) + 1) / 2;
        });
        if (CH.hero.attached) {
          halo.position.set(CH.hero.x, CH.hero.y - 30 * CH.hero.A.scale, 10);
          haloLight.position.set(CH.hero.x, CH.hero.y - 40, 90);
          halo.visible = true; haloLight.intensity = 2.6;
        } else { halo.visible = false; haloLight.intensity = 0; }
      });
    },

    /** crayon stroke that draws itself on; resolves with the group */
    draw(parent, d, color, dur, width, o) {
      o = o || {};
      const g = K.g(parent, { z: o.z || 0 });
      const pts = K.pathPoints(d, 40).map((p) => [p[0], p[1], 0]);
      const under = K.tube(pts, (width || 7) / 2 + 2, K.mat(color, { rough: 1, opacity: 0.3 }), g, { seg: pts.length * 2, radial: 6 });
      const main = K.tube(pts, (width || 7) / 2, K.mat(color, { rough: 1, emissive: color, ei: 0.15 }), g, { seg: pts.length * 2, radial: 6 });
      under.castShadow = main.castShadow = false;
      const total = main.geometry.index.count;
      under.geometry.setDrawRange(0, 0); main.geometry.setDrawRange(0, 0);
      CH.audio.sfx('paper');
      return CH.tw.to({ v: 0 }, { v: 1 }, {
        dur: dur || 900, group: 'scene', ease: CH.tw.ease.quadInOut,
        onUpdate: (k, q) => { const n = Math.floor(total * q.v / 3) * 3; under.geometry.setDrawRange(0, n); main.geometry.setDrawRange(0, n); },
      }).then(() => { under.geometry.setDrawRange(0, Infinity); main.geometry.setDrawRange(0, Infinity); return g; });
    },

    /** a crayon outline: same double stroke, already complete. Multiple subpaths welcome. */
    line(parent, d, color, width, o) {
      o = o || {};
      const g = K.g(parent, { z: o.z || 0 });
      const loader = new X.SVGLoader();
      const data = loader.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>');
      data.paths.forEach((p) => p.subPaths.forEach((spath) => {
        const pts = spath.getPoints(24).map((v) => [v.x, v.y, 0]);
        if (pts.length < 2) return;
        const under = K.tube(pts, (width || 6) / 2 + 2, K.mat(color, { rough: 1, opacity: o.opacity != null ? o.opacity * 0.3 : 0.28 }), g, { seg: pts.length * 2, radial: 6 });
        const m = K.tube(pts, (width || 6) / 2, K.mat(color, { rough: 1, emissive: color, ei: o.ei != null ? o.ei : 0.12, opacity: o.opacity != null ? o.opacity : 0.95 }), g, { seg: pts.length * 2, radial: 6 });
        under.castShadow = m.castShadow = false;
      }));
      return g;
    },

    /** a sleeper's dream-cloud with lazy z's: soft translucent wisps; returns { g, puff() } */
    cloud(parent, x, y, s, z) {
      const g = K.g(parent);
      const inner = K.g(g);
      const puffs = [];
      [[0, 0, 34], [-28, 8, 26], [28, 8, 26], [-10, -14, 24], [14, -12, 22], [-40, 14, 18], [40, 14, 18]].forEach((c) => {
        const p = K.glow(inner, c[0], c[1], U.rand(-6, 6), c[2], '#f4eefc', 0.42);
        p.material.blending = T.NormalBlending; p.material.depthWrite = false;
        puffs.push(p);
      });
      const z1 = K.label('z', { size: 22, color: '#8f7ab8', x: -12, y: -26, z: 32, parent: inner });
      const z2 = K.label('z', { size: 16, color: '#8f7ab8', x: 6, y: -40, z: 32, parent: inner });
      K.pad(-54, -60, 108, 108, inner, { d: 60 });
      let t = U.rand(0, 6);
      CH.tw.tick((dt) => {
        t += dt;
        K.tr(g, { x, y: y + Math.sin(t * 1.4) * 6, z: z || 0, s: (s || 1) * (1 + 0.04 * Math.sin(t * 2.1)) });
        puffs.forEach((p, i) => { p.material.opacity = 0.34 + 0.12 * Math.sin(t * 1.3 + i); });
      }, 'scene');
      return {
        g,
        async puff() {
          CH.audio.sfx('pop', 0.6);
          await CH.tw.to({ v: 0 }, { v: 1 }, {
            dur: 420, group: 'scene', ease: CH.tw.ease.quadOut,
            onUpdate: (k, o) => { K.tr(inner, { s: 1 + o.v * 2.2 }); puffs.forEach((p) => { p.material.opacity = 0.4 * (1 - o.v); }); z1.material.opacity = z2.material.opacity = 1 - o.v; },
          });
          g.visible = false;
        },
      };
    },

    /** lilac fade for diving in / waking up; fn does the scene change */
    async veil(fn) {
      const c = document.getElementById('curtain');
      c.classList.add('dreamy');
      c.classList.add('show');
      await U.wait(700);
      await fn();
      setTimeout(() => c.classList.remove('dreamy'), 900);
    },
  };

  const WALL = -330;
  const dreamLights = (api, color) => {
    const L = api.layers.lights;
    K.spot(L, 800, -300, 200, 800, 800, -100, color || '#e8dcff', 90, { angle: 70, penumbra: 0.9, decay: 1.3, mapSize: 2048, dist: 2200 });
  };

  // ============================================================ the Kid's room, dreamt
  CH.defScene('dreamRoom', {
    chapter: 6,
    dream: true,
    pageBg: '#1e1838',
    bg: '#1a1533',
    ambient: [],
    fill: 2.0, ambient2: 1.0, skyLight: '#8a78c8', groundLight: '#3a5a5a',
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 150, x2: 1450, y: 800 },
    ],
    links: [],
    spots: {
      start: { x: 760, plat: 'floor' },
      fromHall: { x: 1290, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, fx = api.layers.fx;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#3a2f5c'], [1, '#5a4a7c']],
        floorStops: [[0, '#3f5b5b'], [1, '#243838']],
        baseboard: '#2c2448',
      });
      DF.apply(api);
      dreamLights(api);

      // the wall stickers are real stars now — they twinkle and fizz
      const starsG = K.g(far, { z: WALL + 4 });
      const stars = [];
      for (let i = 0; i < 14; i++) {
        const sx = U.rand(200, 1150), sy = U.rand(60, 330);
        const mat = new T.MeshStandardMaterial({ color: new T.Color('#ffe9a3'), emissive: new T.Color('#ffe9a3'), emissiveIntensity: 0.6, roughness: 0.8 });
        const s2 = K.ext('M 0 -10 L 2.6 -2.6 L 10 0 L 2.6 2.6 L 0 10 L -2.6 2.6 L -10 0 L -2.6 -2.6 Z', 4, mat, starsG, { x: sx, y: sy, s: U.rand(1, 1.8), bevel: 1 });
        s2.castShadow = false;
        stars.push({ el: s2, mat, ph: U.rand(0, 6) });
        K.pad(sx - 22, sy - 22, 44, 44, starsG, { d: 20 });
      }
      let t = 0;
      api.tick((dt) => {
        t += dt;
        stars.forEach((s2) => { s2.mat.emissiveIntensity = 0.3 + 0.6 * (Math.sin(t * 2.2 + s2.ph) + 1) / 2; });
      });

      // a drawing of a window, raining crayon
      const winG = K.g(far, { z: WALL + 6 });
      DF.line(winG, 'M 700 130 L 900 130 L 900 300 L 700 300 Z M 800 130 L 800 300 M 700 215 L 900 215', LILAC, 6);
      for (let i = 0; i < 9; i++) DF.line(winG, `M ${716 + i * 20} ${150 + (i % 3) * 30} l -8 40`, '#9fc8ff', 3, { opacity: 0.6 });
      DF.line(winG, 'M 858 170 a 18 18 0 1 0 22 22', '#fff3c4', 5);
      K.pad(690, 120, 220, 190, winG, { d: 20 });

      // ---------- giant blocks (left), humming ----------
      const blocksG = K.g(main, { z: -80 });
      const block = (x, y, c, letter) => {
        const g = K.g(blocksG);
        K.rbox(x, y, 120, 120, 120, 14, K.mat(c, { rough: 0.85 }), g);
        K.box(x + 12, y + 12, 96, 96, 4, K.mat(c, { rough: 0.9 }), g, { z: 61 });
        K.label(letter, { size: 64, color: '#fff6e4', x: x + 60, y: y + 62, z: 64, parent: g });
        return g;
      };
      const bK = block(260, 680, '#c96a5f', 'K'), bI = block(400, 680, '#5a9e8f', 'I'), bD = block(330, 556, '#e0a050', 'D');
      let bt = 0;
      api.tick((dt) => {
        bt += dt;
        K.tr(bK, { r: Math.sin(bt * 1.1) * 1.5, ox: 320, oy: 800 });
        K.tr(bI, { r: Math.sin(bt * 1.3 + 2) * 1.5, ox: 460, oy: 800 });
        K.tr(bD, { r: Math.sin(bt * 0.9 + 4) * 2.2, ox: 390, oy: 676, y: Math.sin(bt * 1.7) * 3 });
      });

      // ---------- the bed is a hill, and Teddy is a mountain on it ----------
      const bedG = K.g(mid, { z: -200 });
      K.ext('M 600 800 C 640 600 980 590 1030 800 Z', 260, K.mat('#5a7ea0', { rough: 0.95 }), bedG, { bevel: 30, seg: 16 });
      for (let i = 0; i < 5; i++) K.tube([[660 + i * 76, 700 + (i % 2) * 10, 150], [670 + i * 76, 740 + (i % 2) * 10, 156], [660 + i * 76, 790 + (i % 2) * 10, 150]], 5, K.mat('#48688a', { rough: 0.95 }), bedG, { seg: 8, radial: 6 });
      const teddy = K.g(mid, { z: -120 });
      const TX = 830, TY = 640;
      CH.models.teddy(teddy, TX, TY + 100, 0, 4.2);
      K.pad(TX - 110, TY - 200, 220, 310, teddy, { d: 200 });
      let tt = 0, blinkT = 3;
      api.tick((dt) => {
        tt += dt; blinkT -= dt;
        K.tr(teddy, { z: -120, y: Math.sin(tt * 0.9) * 4, r: Math.sin(tt * 0.6) * 1.2, ox: TX, oy: TY + 100 });
        if (blinkT < 0) blinkT = U.rand(2.5, 5);
      });
      api.anchor('teddy', () => ({ x: TX, y: TY - 190, z: -120 }));

      // ---------- the dinosaur is alive, and the crayon is under his paw ----------
      const dinoG = K.g(main, { z: -30 });
      const dino = CH.models.dino(dinoG, 0, 0, 0, 3.2);
      const dEye = dino.children.find((c) => c.geometry && c.geometry.type === 'SphereGeometry') || dino.children[0];
      K.tr(dinoG, { x: 1190, y: 800, z: -30 });
      api.anchor('dino', () => ({ x: 1190, y: 660 }));
      const crayonG = K.g(main, { z: 20 });
      K.rbox(-30, -6, 60, 12, 12, 4, K.mat('#e2635f', { rough: 0.7 }), crayonG);
      K.rbox(-18, -6, 24, 12, 12.4, 3, K.mat('#f2b3ad', { rough: 0.7 }), crayonG);
      const ctip = K.cone(30, 0, 6, 14, '#e2635f', crayonG); K.tr(ctip, { r: 90, x: 30, y: -7 });
      K.pad(-40, -20, 96, 40, crayonG, { d: 30 });
      const crayonHome = st.has('dinoTickled') ? { x: 1040, y: 794, r: -12 } : { x: 1112, y: 794, r: 8 };
      K.tr(crayonG, { x: crayonHome.x, y: crayonHome.y, z: 20, r: crayonHome.r });
      if (st.hasItem('crayon') || st.has('crayonTaken')) main.remove(crayonG);
      let dt2 = 0;
      api.tick((dt) => {
        dt2 += dt;
        const asleep = st.has('dinoTickled');
        K.tr(dinoG, { x: 1190, y: 800 + (asleep ? Math.sin(dt2 * 1.5) * 2 : 0), z: -30, r: asleep ? 0 : Math.sin(dt2 * 3) * 2 });
        K.tr(dEye, { x: 25, y: -56.5, z: 5.6, s: asleep ? 0.3 : 1 });   // where the eye sits on the new Dino model
      });

      // ---------- the door, scribbled shut ----------
      const doorG = K.g(mid);
      K.rbox(1346, 316, 118, 484, 20, 8, K.mat('#2c2448', { rough: 0.9 }), doorG, { z: WALL + 10 });
      DF.line(doorG, 'M 1346 316 L 1464 316 L 1464 800 L 1346 800 Z', LILAC, 5, { z: WALL + 22 });
      const scribble = DF.line(doorG,
        'M 1356 340 L 1450 420 L 1352 500 L 1454 580 L 1354 660 L 1452 740 L 1356 790 M 1450 330 L 1356 420 L 1456 500 L 1354 580 L 1454 660 L 1352 740',
        '#a894e6', 8, { opacity: 0.9, ei: 0.3, z: WALL + 24 });
      const drawnDoor = K.g(doorG, { z: WALL + 24 });
      const glowIn = K.box(1364, 336, 82, 448, 2, new T.MeshStandardMaterial({ color: new T.Color('#ffe9a3'), emissive: new T.Color('#e8d0a0'), emissiveIntensity: 0.5, transparent: true, opacity: 0 }), drawnDoor, { z: -4 });
      glowIn.castShadow = false;
      if (st.has('dreamDoor')) {
        scribble.visible = false;
        DF.line(drawnDoor, 'M 1364 784 L 1364 360 Q 1405 320 1446 360 L 1446 784', GOLD, 8);
        K.sphere(1432, 580, 8, K.mat(GOLD, { rough: 0.4 }), drawnDoor, { z: 6 });
        glowIn.material.opacity = 0.55;
      }
      K.pad(1330, 300, 160, 500, doorG, { d: 40, z: WALL + 30 });

      // ================= hotspots =================
      api.hot(starsG, {
        id: 'dr.stars', near: { x: 700, plat: 'floor' },
        act: async () => { await api.think('d.room.stars'); },
      });
      api.hot(winG, {
        id: 'dr.window', near: { x: 800, plat: 'floor' },
        act: async () => { await api.think('d.room.window'); },
      });
      api.hot(blocksG, {
        id: 'dr.blocks', near: { x: 560, plat: 'floor' },
        act: async () => { await api.think('d.room.blocks'); },
      });

      api.hot(teddy, {
        id: 'dr.teddy', near: { x: 700, plat: 'floor' },
        act: async () => {
          api.hero.face(1);
          if (st.has('dreamKey')) { await api.say('teddy', 'd.room.teddy.key'); return; }
          if (st.has('dreamDoor')) { await api.say('teddy', 'd.room.teddy.go'); return; }
          if (st.hasItem('crayon')) { await api.say('teddy', 'd.room.teddy.door'); return; }
          await api.say('teddy', 'd.room.teddy.crayon');
        },
      });

      api.hot(dinoG, {
        id: 'dr.dino', near: { x: 1080, plat: 'floor' },
        act: async () => {
          api.hero.face(1);
          if (st.has('dinoTickled')) { await api.think('d.room.dino.after'); return; }
          const n = st.bumpClick('dr.dino');
          if (n === 1) {
            await api.cut(async (ctx) => {
              ctx.sfx('sad');
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, onUpdate: (k, o) => K.tr(dinoG, { x: 1190, y: 800, r: Math.sin(o.t * Math.PI * 4) * 8 }),
              });
              await ctx.say('dino', 'd.room.dino.mine');
            }, { cinema: false, skippable: false });
            await api.think('d.room.dino.roar');
            return;
          }
          await api.cut(async (ctx) => {
            await ctx.think('d.room.dino.tickle');
            await ctx.run(api.hero.tailWhip(1150, 740));
            for (let i = 0; i < 4; i++) {
              ctx.sfx('tap');
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 180, onUpdate: (k, o) => K.tr(dinoG, { x: 1190, y: 800 - Math.sin(o.t * Math.PI) * 18, r: (i % 2 ? 1 : -1) * 10 }),
              });
            }
            await ctx.say('dino', 'd.room.dino.laugh');
            ctx.sfx('slide', false);
            const hx = api.hero.x - 30;
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 700, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => K.tr(crayonG, { x: U.lerp(1112, hx, o.t), y: 794 - Math.sin(o.t * Math.PI) * 40, r: U.lerp(8, -12, o.t) + o.t * 540 }),
            });
            st.flag('dinoTickled');
            api.hero.face(-1);
            await ctx.run(api.hero.tailWhip(hx, 790));
            ctx.sfx('coin');
            main.remove(crayonG);
            st.flag('crayonTaken');
            st.give('crayon');
          }, { cinema: false, skippable: false });
          await api.hero.excite();
          await api.think('d.room.crayon.take');
          api.toast('d.goal2');
        },
      });

      api.hot(crayonG, {
        id: 'dr.crayon', near: { x: 990, plat: 'floor' },
        active: () => st.has('dinoTickled') && !!crayonG.parent,
        act: async () => {
          api.sfx('coin');
          st.flag('crayonTaken');
          st.give('crayon');
          main.remove(crayonG);
          await api.think('d.room.crayon.take');
          api.toast('d.goal2');
        },
      });

      api.hot(doorG, {
        id: 'dr.door', near: { x: 1290, plat: 'floor' },
        act: async () => {
          api.hero.face(1);
          if (st.has('dreamDoor')) {
            await api.cut(async (ctx) => {
              ctx.sfx('slide', true);
              await ctx.run(api.hero.rollTo(1400, () => true));
            }, { cinema: false, skippable: false });
            await api.go('dreamHall', 'fromRoom');
            return;
          }
          const n = st.bumpClick('dr.door');
          await api.think(n === 1 ? 'd.room.door.look' : 'd.room.door.look2');
        },
        item: {
          crayon: async () => {
            if (st.has('dreamDoor')) { await api.think('d.room.door.drawn'); return; }
            await api.cut(async (ctx) => {
              api.hero.face(1);
              await ctx.run(api.hero.tailWhip(1360, 700));
              ctx.tw({ v: 1 }, { v: 0 }, { dur: 700, onUpdate: (k, o) => { scribble.traverse((m) => { if (m.material) m.material.opacity = m.material.opacity && o.v * 0.85; }); if (o.v < 0.02) scribble.visible = false; } });
              await ctx.run(DF.draw(drawnDoor, 'M 1364 784 L 1364 360 Q 1405 320 1446 360 L 1446 784', GOLD, 1400, 8));
              await ctx.run(DF.draw(drawnDoor, 'M 1424 580 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0', GOLD, 400, 6));
              ctx.sfx('bell');
              await ctx.tw({ v: 0 }, { v: 0.55 }, { dur: 800, onUpdate: (k, o) => { glowIn.material.opacity = o.v; } });
            }, { cinema: false, skippable: false });
            st.flag('dreamDoor');
            await api.hero.excite();
            await api.think('d.room.door.drawn');
          },
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (st.has('dreamFirst')) return;
      st.flag('dreamFirst');
      api.cut(async (ctx) => {
        const h = api.hero, gx = h.x;
        h.place(gx, 300, 'floor');
        await ctx.tw({ t: 0 }, { t: 1 }, {
          dur: 1700, ease: CH.tw.ease.sinInOut,
          onUpdate: (k, o) => { h.place(gx + Math.sin(o.t * 6) * 22, U.lerp(300, 800, o.t), 'floor'); h.A.rock = Math.sin(o.t * 9) * 12; },
        });
        h.A.rock = 0;
        await ctx.run(h.landSquash(0.5));
        await ctx.run(h.slowBlink());
        await ctx.run(h.lookAround());
        await ctx.think('d.room.first1');
        await ctx.think('d.room.first2');
        await ctx.say('teddy', 'd.room.teddy1');
        await ctx.say('teddy', 'd.room.teddy2');
        await ctx.think('d.room.first3');
      }, { cinema: false }).then(() => api.toast('d.goal1'));
    },
  });

  // ============================================================ the corridor, dreamt
  CH.defScene('dreamHall', {
    chapter: 6,
    dream: true,
    pageBg: '#1c1734',
    bg: '#18142e',
    ambient: [],
    fill: 2.0, ambient2: 1.0, skyLight: '#8a78c8', groundLight: '#4a3a5c',
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 150, x2: 1450, y: 800 },
      { id: 'puff', x1: 690, x2: 830, y: 596, noWalk: true },
      { id: 'ledge', x1: 930, x2: 1110, y: 446, noWalk: true },
    ],
    links: [
      { a: 'floor', b: 'puff', ax: 760, bx: 760, type: 'float', when: (s) => s.has('canFloat') },
      { a: 'puff', b: 'ledge', ax: 790, bx: 1000, type: 'float', when: (s) => s.has('canFloat') },
    ],
    spots: {
      fromRoom: { x: 280, plat: 'floor' },
      fromKitchen: { x: 1000, plat: 'ledge' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, fx = api.layers.fx;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#2c2450'], [1, '#4a3d70']],
        floorStops: [[0, '#4a3a5c'], [1, '#2c2238']],
        baseboard: '#241f40',
      });
      DF.apply(api);
      dreamLights(api);

      // the stairs go UP now, into a lilac glow
      const stairsG = K.g(mid, { z: -70 });                                                   // forward of the wall, rising to the right, clear of the door
      for (let i = 0; i < 9; i++) {
        const sx = 480 + i * 34, sy = 780 - i * 76;
        K.rbox(sx - 120, sy, 150, 22, 60, 6, K.mat('#5a4a7c', { rough: 0.9, opacity: 1 - i * 0.06 }), stairsG, { z: i * 22 });
      }
      K.pad(340, 120, 460, 692, stairsG, { d: 40 });
      K.glow(far, 720, 300, WALL + 60, 170, '#c9b8f2', 0.22);
      K.point(api.layers.lights, 720, 300, WALL + 120, '#c9b8f2', 9, 900);

      // doors, doors, doors — floating at odd angles; one is upside down
      const doorsG = K.g(far, { z: WALL + 30 });
      const dreamDoor = (x, y, r, sc, c) => {
        const g = K.g(doorsG);
        K.rbox(-40, -100, 80, 200, 12, 8, K.mat(c, { rough: 0.9 }), g);
        K.box(-26, -84, 52, 70, 4, K.mat('#000000', { rough: 1, opacity: 0.2 }), g, { z: 7 });
        K.sphere(24, 10, 6, K.mat(GOLD, { rough: 0.4 }), g, { z: 8 });
        K.pad(-44, -104, 88, 208, g, { d: 20 });
        K.tr(g, { x, y, r, s: sc });
        return g;
      };
      const d1 = dreamDoor(400, 230, -12, 0.9, '#6e4c2e');
      const d2 = dreamDoor(1300, 260, 180, 0.8, '#57422e');
      const d3 = dreamDoor(1420, 640, 14, 0.7, '#7e5a3c');
      let dtm = 0;
      api.tick((dt) => {
        dtm += dt;
        K.tr(d1, { x: 400, y: 230 + Math.sin(dtm * 0.8) * 10, r: -12 + Math.sin(dtm * 0.5) * 3, s: 0.9 });
        K.tr(d2, { x: 1300, y: 260 + Math.sin(dtm * 0.7 + 2) * 12, r: 180 + Math.sin(dtm * 0.6) * 4, s: 0.8 });
        K.tr(d3, { x: 1420, y: 640 + Math.sin(dtm * 0.9 + 4) * 8, r: 14, s: 0.7 });
      });

      // the attic hatch, open, pouring light
      const hatchG = K.g(far, { z: WALL + 20 });
      K.rbox(860, 20, 180, 50, 20, 8, K.mat('#3c2f22', { rough: 0.9 }), hatchG);
      K.box(872, 28, 156, 34, 2, K.mat('#ffe9a3', { emissive: '#ffe9a3', ei: 0.9 }), hatchG, { z: 12 });
      // the light pouring out of it: a long soft shaft down toward the floor, not a shade
      const shaft = K.ext('M 872 62 L 668 802 L 1232 802 L 1028 62 Z', 2, new T.MeshBasicMaterial({ color: new T.Color('#ffe9a3'), transparent: true, opacity: 0.05, depthWrite: false, fog: false }), hatchG, { z: 14, bevel: 0 });
      shaft.castShadow = false; shaft.userData.noHit = true;
      K.spot(api.layers.lights, 950, 40, WALL + 40, 950, 800, 30, '#ffe9a3', 120, { angle: 24, penumbra: 0.6, decay: 1.4, dist: 1400, shadow: false });   // down through his plane: it lights whoever stands in it
      K.pad(850, 10, 200, 300, hatchG, { d: 20 });

      // the ficus floats and, at last, talks
      const ficusG = K.g(mid, { z: -100 });
      P.pottedPlant(ficusG, 0, 0, 1.4);
      let ft = 0;
      api.tick((dt) => { ft += dt; K.tr(ficusG, { x: 300, y: 600 + Math.sin(ft * 1.1) * 14, z: -100, r: Math.sin(ft * 0.7) * 4 }); });

      // the door back to the room (left)
      const backG = P.openDoor(mid, 110, 300, 120, 500, { z: WALL, hinge: 'right', angle: 64, c1: '#6e4c2e', c2: '#57422e' });
      K.pad(90, 290, 170, 520, backG, { d: 50, z: WALL + 30 });

      // a small solid cloud, for standing on
      const puffG = K.g(main, { z: -20 });
      // the same stuff as the sleepy cloud over the kid: nothing but soft glows
      const puff = (g, cx, cy, list, glow) => {
        list.forEach((c) => {
          const p = K.glow(g, cx + c[0], cy + c[1], U.rand(-8, 8), c[2] * 1.5, '#f4eefc', 0.5);
          p.material.blending = T.NormalBlending; p.material.depthWrite = false;
        });
        K.glow(g, cx, cy - 4, 0, glow, '#f4eefc', 0.2);
      };
      puff(puffG, 760, 604, [[0, 0, 36], [-42, 10, 27], [42, 10, 27], [-16, -18, 22], [18, -16, 20], [-62, 16, 16], [62, 16, 16], [0, 18, 30]], 150);
      K.pad(700, 560, 120, 90, puffG, { d: 60 });

      // the kitchen door hangs under the ceiling, on a rope, with the Kid's name on it
      const kdoorG = K.g(main, { z: -30 });
      K.cylUp(1020, 236, 3, 280, K.mat('#8a6a42', { rough: 0.8 }), kdoorG);
      K.rbox(930, 236, 180, 210, 20, 10, K.mat('#7e5a3c', { rough: 0.9 }), kdoorG);
      const kglowMat = new T.MeshStandardMaterial({ color: new T.Color('#ffe9a3'), emissive: new T.Color('#ffe9a3'), emissiveIntensity: 0.6, transparent: true, opacity: 0 });
      const kglow = K.box(940, 246, 160, 190, 2, kglowMat, kdoorG, { z: 11 });
      K.sphere(1082, 360, 8, K.mat(GOLD, { rough: 0.4 }), kdoorG, { z: 14 });
      K.pad(920, 230, 200, 226, kdoorG, { d: 30 });
      // the ledge under it
      const ledgeG = K.g(main, { z: -20 });
      puff(ledgeG, 1020, 454, [[0, 0, 40], [-58, 8, 30], [58, 8, 30], [-22, -16, 24], [26, -14, 22], [-82, 14, 18], [82, 14, 18], [0, 20, 34]], 190);
      let kt = 0;
      api.tick((dt) => {
        kt += dt;
        K.tr(kdoorG, { z: -30, r: Math.sin(kt * 0.9) * 1.6, ox: 1020, oy: -40 });
      });

      // the three letters, in slots
      let order = (st.val('kidOrder') || 'DKI').split('');
      const tiles = [];
      const COLS = { K: '#c96a5f', I: '#5a9e8f', D: '#e0a050' };
      const slotX = [966, 1020, 1074];
      const renderTiles = () => {
        tiles.forEach((tg, i) => {
          while (tg.g.children.length) tg.g.remove(tg.g.children[0]);
          K.rbox(-20, -20, 40, 40, 14, 6, K.mat(COLS[order[i]], { rough: 0.85 }), tg.g);
          K.label(order[i], { size: 26, color: '#fff6e4', x: 0, y: 1, z: 8, parent: tg.g });
          K.pad(-26, -26, 52, 52, tg.g, { d: 30 });
          K.tr(tg.g, { x: slotX[i], y: 300, z: 16 });
        });
      };
      for (let i = 0; i < 3; i++) tiles.push({ g: K.g(kdoorG) });
      renderTiles();
      const setDoorOpen = () => { kglowMat.opacity = 0.55; };
      if (st.has('kidDoorOpen')) setDoorOpen();

      // ================= hotspots =================
      api.hot(backG, {
        id: 'dh.back', near: { x: 240, plat: 'floor' },
        act: async () => { await api.go('dreamRoom', 'fromHall'); },
      });
      api.hot(doorsG, {
        id: 'dh.doors', near: null,
        act: async () => { await api.think('d.hall.doors'); },
      });
      api.hot(stairsG, {
        id: 'dh.stairs', near: { x: 480, plat: 'floor' },
        act: async () => { await api.think('d.hall.stairs'); },
      });
      api.hot(hatchG, {
        id: 'dh.hatch', near: null,
        act: async () => { await api.think('d.hall.hatch'); },
      });
      api.hot(ficusG, {
        id: 'dh.ficus', near: { x: 620, plat: 'floor' },
        act: async () => { api.sfx('paper'); await api.think('d.hall.ficus'); },
      });

      const lesson = async () => {
        await api.think('d.hall.high');
        await api.think('d.hall.high2');
        st.flag('canFloat');
        api.toast('d.goal3');
      };
      api.hot(puffG, {
        id: 'dh.puff', near: null,
        act: async () => {
          if (!st.has('canFloat')) { await api.think('d.hall.puff'); await lesson(); }
          const ok = await api.walkTo(760, 'puff');
          if (ok && !st.has('floated')) { st.flag('floated'); await api.think('d.hall.float'); }
        },
      });
      api.hot(kdoorG, {
        id: 'dh.kdoor', near: null,
        act: async () => {
          if (!st.has('canFloat')) { await lesson(); }
          const ok = await api.walkTo(1000, 'ledge');
          if (!ok) return;
          if (!st.has('floated')) { st.flag('floated'); await api.think('d.hall.float'); }
          api.hero.face(1);
          if (!st.has('kidDoorOpen')) {
            await api.think(st.bumpClick('dh.kdoor') % 2 ? 'd.hall.letters' : 'd.hall.kdoor.locked');
            return;
          }
          await api.cut(async (ctx) => {
            ctx.sfx('slide', true);
            await ctx.tw(api.hero.A, { sx: 0.7, sy: 1.15 }, { dur: 260 });
            await ctx.w(200);
          }, { cinema: false, skippable: false });
          api.hero.A.sx = 1; api.hero.A.sy = 1;
          await api.go('dreamKitchen', 'enter');
        },
      });
      tiles.forEach((tg, i) => {
        api.hot(tg.g, {
          id: 'dh.l' + (i + 1), near: { x: 1000, plat: 'ledge' },
          active: () => st.has('canFloat') && !st.has('kidDoorOpen'),
          act: async () => {
            api.hero.face(1);
            await api.hero.tailWhip(slotX[i], 320);
            api.sfx('tap');
            const j = (i + 1) % 3;
            const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
            st.flag('kidOrder', order.join(''));
            renderTiles();
            if (order.join('') === 'KID') {
              st.flag('kidDoorOpen');
              api.sfx('bell');
              setDoorOpen();
              await api.hero.excite();
              await api.think('d.hall.letters.ok');
            }
          },
        });
      });
    },

    enter(api) {
      const st = api.state;
      if (st.has('dreamHallFirst')) return;
      st.flag('dreamHallFirst');
      api.cut(async (ctx) => {
        await ctx.w(400);
        await ctx.run(api.hero.lookAround());
        await ctx.think('d.hall.first1');
        await ctx.think('d.hall.first2');
      }, { cinema: false });
    },
  });

  // ============================================================ the kitchen, dreamt
  CH.defScene('dreamKitchen', {
    chapter: 6,
    dream: true,
    pageBg: '#16202a',
    bg: '#131c26',
    ambient: [],
    fill: 2.0, ambient2: 1.0, skyLight: '#7a8ac8', groundLight: '#4a3a5c',
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 140, x2: 1120, y: 800 },
      { id: 'counter', x1: 710, x2: 1490, y: 516 },
      { id: 'bowl', x1: 1190, x2: 1390, y: 792 },      // the bowl's floor: he hops in, walks it half-hidden by the walls, hops out
      { id: 'floorR', x1: 1470, x2: 1570, y: 800 },
    ],
    links: [
      { a: 'floor', b: 'counter', ax: 760, bx: 760, type: 'float' },
      { a: 'floor', b: 'bowl', ax: 1120, bx: 1200, type: 'hop' },
      { a: 'bowl', b: 'floorR', ax: 1380, bx: 1484, type: 'hop' },
    ],
    spots: {
      enter: { x: 280, plat: 'floor' },
      fromGarden: { x: 560, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, fx = api.layers.fx;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#243a48'], [1, '#3a5468']],
        floorStops: [[0, '#6a5a7a'], [1, '#3e3450']],
        baseboard: '#1c2c34',
        tiles: true,
      });
      DF.apply(api);
      dreamLights(api, '#dfe6ff');

      // window with a crayon moon
      const winG = K.g(far, { z: WALL + 6 });
      DF.line(winG, 'M 620 130 L 920 130 L 920 370 L 620 370 Z M 770 130 L 770 370 M 620 250 L 920 250', LILAC, 6);
      DF.line(winG, 'M 860 170 a 26 26 0 1 0 30 30', '#fff3c4', 6);

      // door back to the corridor (left, under the stairs shape)
      const backG = K.g(mid);
      K.ext('M 60 812 L 60 560 L 208 668 L 208 812 Z', 30, K.mat('#26314d', { rough: 0.9 }), backG, { z: WALL + 15, bevel: 2 });
      K.ext('M 72 806 L 72 574 L 196 664 L 196 806 Z', 12, K.mat('#7e5a3c', { rough: 0.9 }), backG, { z: WALL + 26, bevel: 1 });
      DF.line(backG, 'M 60 812 L 60 560 L 208 668 L 208 812', INK, 4, { z: WALL + 34 });

      // ---------- the fridge, with the glowing drawing and no handle ----------
      const fridgeG = K.g(mid, { z: -220 });
      const steel = K.mat('#c8d4d8', { rough: 0.4, metal: 0.2 });
      // the box of the fridge, open at the front
      K.box(250, 220, 240, 580, 200, steel, fridgeG, { z: -10 });
      // the interior (revealed when the door swings): a sea of milk
      const insideG = K.g(fridgeG, { z: 92 });
      insideG.visible = st.has('fridgeOpen');
      K.box(256, 226, 228, 568, 6, K.mat('#2c4a66', { rough: 0.9 }), insideG, { z: -3 });
      const milkMat = K.mat('#f4f1ea', { rough: 0.6 });
      const milk = [];
      for (let i = 0; i < 9; i++) milk.push(K.sphere(268 + i * 27, 700, 20, milkMat, insideG, { z: 4 }));
      K.box(256, 704, 228, 90, 10, milkMat, insideG, { z: 4 });
      K.rbox(330, 640, 84, 110, 60, 8, K.mat('#e8eef0', { rough: 0.6 }), insideG, { z: 30 }); // carton island
      K.rbox(330, 640, 84, 26, 60, 8, K.mat('#5a9e8f', { rough: 0.6 }), insideG, { z: 30 });
      let mt = 0;
      api.tick((dt) => {
        mt += dt;
        milk.forEach((m, i) => K.tr(m, { x: 268 + i * 27, y: 700 + Math.sin(mt * 1.6 + i * 0.7) * 8, z: 4 }));
      });
      // Biscuit, asleep on the island, and his dream-cloud
      const dcat = CH.actors.cat(K.g(insideG, { z: 60 }), 372, 640, 0.6);
      void dcat;
      const catCloud = DF.cloud(insideG, 372, 540, 0.9, 60);
      // the door face (a group, so it can swing on its hinge at the right)
      const doorFace = K.g(fridgeG);
      K.rbox(250, 220, 240, 580, 14, 14, steel, doorFace, { z: 100 });
      K.box(250, 440, 240, 10, 16, '#93a5ac', doorFace, { z: 100 });
      DF.line(doorFace, 'M 250 220 L 490 220 L 490 800 L 250 800 Z', INK, 4, { z: 110 });
      // the Kid's drawing, glowing
      const drawing = K.g(doorFace, { z: 110 });
      const drawTex = K.canvasTex(220, 180, (ctx, w, h) => {
        ctx.fillStyle = '#fdf7e8'; ctx.fillRect(0, 0, w, h); ctx.scale(2, 2);
        ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.strokeStyle = '#e2635f'; ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(20, 36); ctx.lineTo(36, 24); ctx.lineTo(52, 36); ctx.lineTo(52, 60); ctx.closePath(); ctx.stroke();
        ctx.strokeStyle = '#8a6a42'; ctx.beginPath(); ctx.moveTo(68, 60); ctx.lineTo(68, 42); ctx.stroke();
        ctx.strokeStyle = '#67b8a0'; ctx.beginPath(); ctx.arc(68, 36, 10, 0, 6.28); ctx.stroke();
        ctx.strokeStyle = '#e8b64c'; ctx.beginPath(); ctx.arc(92, 14, 7, 0, 6.28); ctx.stroke();
      });
      const drawM = K.vplane(330, 440, 270, 360, 0, new T.MeshStandardMaterial({ map: drawTex, emissiveMap: drawTex, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.12, roughness: 0.9 }), drawing);
      drawM.scale.y = -1; drawM.userData.__disposeTex = drawTex;
      K.tr(drawing, { z: 110, r: -3, ox: 385, oy: 315 });
      const drawGlow = K.glow(doorFace, 385, 315, 150, 96, '#ffe9a3', 0.26);
      let gt = 0;
      api.tick((dt) => { gt += dt; drawGlow.material.opacity = 0.22 + 0.1 * Math.sin(gt * 2.4); });
      // handle (drawn later)
      const handleG = K.g(doorFace, { z: 112 });
      if (st.has('fridgeHandle')) DF.line(handleG, 'M 470 470 L 470 580', GOLD, 8);
      const setFridge = (open) => {
        if (open) K.tr(doorFace, { ry: -80, ox: 490, oy: 0 });
        else K.tr(doorFace, { ry: 0, ox: 490, oy: 0 });
      };
      setFridge(st.has('fridgeOpen'));
      const drawingHit = K.pad(316, 256, 138, 118, doorFace, { d: 30, z: 112 });
      let fz = 2;
      api.tick((dt) => {
        fz += dt;
        if (fz > 3.4 && !st.has('fridgeOpen')) { fz = 0; CH.fx.floaties(api, 372 + U.rand(-16, 16), 214, 'z', '#cbd6ff', -100); }
      });

      // ---------- counter, drawer-stairs to nowhere, toaster launching toast ----------
      const counterG = K.g(mid);
      K.rbox(696, 516, 904, 26, 300, 6, K.mat('#d8cdb4', { rough: 0.6 }), counterG, { z: -180 });
      K.box(710, 542, 880, 258, 280, '#3f6b6b', counterG, { z: -190 });
      DF.line(counterG, 'M 696 516 L 1600 516', INK, 4, { z: -28 });
      const drawersG = K.g(main);
      for (let i = 0; i < 7; i++) {
        K.rbox(790 + i * 28, 716 - i * 90, 190, 78, 40, 8, K.mat('#4a7d7d', { rough: 0.85, opacity: 1 - i * 0.1 }), drawersG, { z: -40 - i * 6 });
        K.rbox(856 + i * 28, 750 - i * 90, 60, 12, 10, 6, K.mat(GOLD, { rough: 0.5 }), drawersG, { z: -18 - i * 6 });
      }
      K.pad(780, 80, 400, 720, drawersG, { d: 40, z: -40 });
      const toasterG = K.g(main, { z: -60 });
      K.ext('M 1240 516 L 1240 466 A 20 20 0 0 1 1260 448 L 1312 448 A 20 20 0 0 1 1332 466 L 1332 516 Z', 60, K.mat('#e2eaec', { rough: 0.3, metal: 0.3 }), toasterG, { bevel: 4 });
      K.box(1256, 445, 60, 6, 14, K.mat('#2c2438', { rough: 0.9 }), toasterG, { z: 0 });                    // the slot
      K.rbox(1334, 478, 10, 22, 8, 3, K.mat('#e2635f', { rough: 0.6 }), toasterG, { z: 0 });                 // the lever
      const toast = K.rbox(1266, 400, 40, 48, 10, 6, K.mat('#e0a050', { rough: 0.8 }), toasterG, { ox: 1286, oy: 424 });
      K.pad(1230, 380, 110, 140, toasterG, { d: 60 });
      let tt = 0;
      api.tick((dt) => {
        tt += dt;
        const ph = (tt % 4) / 4;
        K.tr(toast, { y: -ph * 380, r: ph * 200, ox: 1286, oy: 424 });
        toast.visible = ph < 0.9;
      });

      // a bowl the size of a bath: BISCUIT
      const bowlG = K.g(main, { z: 0 });   // on his own line, clear of the counter's front (z -50): a shallow oval in plan
      {   // one hollow lathe: a flared wall 10 thick, open at the top, a dark floor inside
        const prof = [[0, 0], [130, 0], [148, 54], [138, 54], [122, 8], [0, 8]].map((p) => new T.Vector2(p[0], p[1]));   // chest-high to him: the walls hide his lower half
        const bowl = K.mesh(new T.LatheGeometry(prof, 40), K.mat('#4a6a8a', { rough: 0.6, side: 'double' }), bowlG, {});
        K.tr(bowl, { x: 1290, y: 800, r: 180, sz: 0.3 });
        K.cylUp(1290, 792, 118, 2, K.mat('#2c3a4c', { rough: 0.8 }), bowlG, { seg: 40, sz: 0.3 });
      }
      K.label(CH.t('name.cat').toUpperCase(), { size: 28, color: '#d8e4ec', x: 1290, y: 774, z: 46, parent: bowlG });
      K.pad(1150, 720, 280, 90, bowlG, { d: 160 });   // narrower than the bowl, so a click on the floor beyond it walks him out

      // ================= hotspots =================
      api.hot(backG, {
        id: 'dk.back', near: { x: 260, plat: 'floor' },
        act: async () => { await api.go('dreamHall', 'fromKitchen'); },
      });
      api.hot(drawersG, {
        id: 'dk.drawers', near: { x: 740, plat: 'floor' },
        act: async () => { await api.think('d.kit.drawers'); },
      });
      api.hot(toasterG, {
        id: 'dk.toaster', near: { x: 1200, plat: 'counter' },
        act: async () => { await api.think('d.kit.toaster'); },
      });
      api.hot(bowlG, {
        id: 'dk.bowl', near: { x: 1290, plat: 'bowl' },   // he hops up onto the rim to look in
        act: async () => { await api.think('d.kit.bowl'); },
      });

      const drawHandle = async () => {
        if (st.has('fridgeHandle')) { await api.think('d.kit.fridge.drawn'); return; }
        await api.cut(async (ctx) => {
          api.hero.face(-1);
          await ctx.run(api.hero.tailWhip(470, 560));
          await ctx.run(DF.draw(handleG, 'M 470 470 L 470 580', GOLD, 700, 8));
          ctx.sfx('bell');
        }, { cinema: false, skippable: false });
        st.flag('fridgeHandle');
        await api.think('d.kit.fridge.drawn');
      };

      api.hot(drawingHit, {
        id: 'dk.drawing', near: { x: 560, plat: 'floor' },
        active: () => !st.has('fridgeOpen'),
        item: { crayon: drawHandle },
        act: async () => {
          api.hero.face(-1);
          await api.cut(async (ctx) => {
            if (!st.has('drawingSeen')) { st.flag('drawingSeen'); await ctx.think('d.kit.drawing'); }
            await ctx.think('d.kit.drawing.go');
            ctx.sfx('float');
            const h = api.hero, x0 = h.x, y0 = h.y;
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 1500, ease: CH.tw.ease.sinInOut,
              onUpdate: (k, o) => {
                h.place(U.lerp(x0, 385, o.t), U.lerp(y0, 330, o.t) - Math.sin(o.t * Math.PI) * 60, 'floor');
                h.setScale(1 - o.t * 0.7);
                h.A.rock = o.t * 380;
              },
            });
            ctx.sfx('bell');
            await ctx.w(200);
          }, { cinema: false, skippable: false });
          api.hero.setScale(1); api.hero.A.rock = 0;
          await DF.veil(() => api.go('dreamGarden', 'enter'));
        },
      });

      api.hot(fridgeG, {
        id: 'dk.fridge', near: { x: 560, plat: 'floor' },
        act: async () => {
          api.hero.face(-1);
          if (st.has('fridgeOpen')) { await api.think('d.kit.fridge.open'); return; }
          if (st.has('fridgeHandle') && !st.hasItem('key')) { await api.think('d.kit.fridge.first'); return; }
          if (st.has('fridgeHandle')) {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(470, 520));
              ctx.sfx('metal', 0.4);
              insideG.visible = true;
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 900, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => { K.tr(doorFace, { ry: -80 * o.t, ox: 490, oy: 0 }); },
              });
              ctx.sfx('meow', 0.7);
              await ctx.w(400);
            }, { cinema: false, skippable: false });
            st.flag('fridgeOpen');
            await api.think('d.kit.fridge.open');
            return;
          }
          const n = st.bumpClick('dk.fridge');
          if (n === 1) { await api.think('d.kit.fridge.look'); return; }
          await api.think(st.hasItem('key') ? 'd.kit.fridge.cat' : 'd.kit.fridge.hint');
        },
        item: { crayon: drawHandle, key: async () => { await CH.engine.hotspots.find((q) => q.opts.id === 'dk.fridge').opts.act(); } },   // the key on the door does what a click does
      });

      api.hot(catCloud.g, {
        id: 'dk.catcloud', near: { x: 560, plat: 'floor' },
        active: () => st.has('fridgeOpen'),
        act: async () => {
          api.hero.face(-1);
          if (!st.hasItem('key')) { await api.think('d.kit.notyet'); return; }
          await api.cut(async (ctx) => {
            await ctx.think('d.kit.dive1');
            ctx.sfx('float');
            const h = api.hero, x0 = h.x, y0 = h.y;
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 1300, ease: CH.tw.ease.sinInOut,
              onUpdate: (k, o) => {
                h.place(U.lerp(x0, 372, o.t), U.lerp(y0, 560, o.t) - Math.sin(o.t * Math.PI) * 40, 'floor');
                h.A.lid = 0.2 + Math.abs(Math.sin(o.t * 28)) * 0.3;
              },
            });
            h.A.lid = 0;
            await ctx.run(catCloud.puff());
            ctx.sfx('swoosh', 0.6);
            await ctx.w(250);
          }, { cinema: false, skippable: false });
          st.take('crayon');
          st.flag('dreamDone');
          st.flag('justWoke');
          await DF.veil(() => api.go('kitchen', 'wake'));
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (st.has('dreamKitchenFirst')) return;
      st.flag('dreamKitchenFirst');
      api.cut(async (ctx) => {
        await ctx.w(400);
        await ctx.run(api.hero.lookAround());
        await ctx.think('d.kit.first1');
        await ctx.think('d.kit.first2');
      }, { cinema: false });
    },
  });

  // ============================================================ the crayon garden
  CH.defScene('dreamGarden', {
    chapter: 6,
    dream: true,
    pageBg: '#d9cfb8',
    bg: '#ece3cf',
    fogColor: '#ece3cf', fogNear: 24, fogFar: 70,
    ambient: [],
    fill: 2.6, ambient2: 1.2, skyLight: '#fff2d8', groundLight: '#8aa858',
    exposure: 1.0,
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'ground', x1: 100, x2: 1500, y: 800 },
      { id: 'branch', x1: 1110, x2: 1250, y: 396, noWalk: true },
    ],
    links: [
      { a: 'ground', b: 'branch', ax: 1180, bx: 1180, type: 'float' },
    ],
    spots: {
      enter: { x: 520, plat: 'ground' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, fx = api.layers.fx, L = api.layers.lights;
      const P = CH.props;

      // paper sky, crayon ground
      K.vplane(-2000, 3600, -1200, 1200, -1400, K.mat('#f3ead8', { rough: 1, fog: false }), far);
      K.hplane(-2000, 3600, 800, -2600, 500, K.mat('#a8c46a', { rough: 1 }), far);
      for (let i = 0; i < 40; i++) {
        DF.line(far, `M ${-40 + i * 44} 812 q 10 -${U.rand(20, 60)} ${U.rand(-10, 22)} -${U.rand(30, 70)}`, '#7aa348', 5, { opacity: 0.8, z: U.rand(-300, 100) });
      }
      DF.apply(api);
      K.sun(L, 300, -200, 200, '#fff4d0', 1.8, { tx: 800, ty: 800, tz: 0, shadow: true, size: 1500 });

      // the sun has a face. of course it does.
      const sunG = K.g(far, { z: -1200 });
      K.disc(300, 170, 70, 10, K.mat('#ffd24a', { emissive: '#ffd24a', ei: 0.3, rough: 0.9 }), sunG);
      K.torus(300, 170, 70, 3, K.mat('#e8933c', { rough: 0.9 }), sunG, { z: 6 });
      const rays = K.g(sunG);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        DF.line(rays, `M ${300 + Math.cos(a) * 88} ${170 + Math.sin(a) * 88} L ${300 + Math.cos(a) * 124} ${170 + Math.sin(a) * 124}`, '#e8933c', 7);
      }
      K.pad(174, 44, 252, 252, sunG, { d: 20 });
      K.sphere(278, 158, 6, K.mat(INK, { rough: 0.7 }), sunG, { z: 8 });
      K.sphere(322, 158, 6, K.mat(INK, { rough: 0.7 }), sunG, { z: 8 });
      DF.line(sunG, 'M 276 190 q 24 22 48 0', INK, 5, { z: 8 });
      let stT = 0;
      api.tick((dt) => { stT += dt; K.tr(rays, { r: stT * 8, ox: 300, oy: 170 }); });

      // crayon clouds
      [[600, 120], [1000, 90], [1350, 160]].forEach((c) => {
        DF.line(far, `M ${c[0] - 60} ${c[1] + 20} q 20 -40 60 -20 q 20 -40 60 0 q 40 -10 40 30 q -20 30 -60 20 q -40 30 -80 0 q -40 10 -20 -30 Z`, '#9fc8ff', 6, { opacity: 0.7, z: -1100 });
      });

      // the house in three lines, with a door back to the kitchen
      const houseG = K.g(mid, { z: -200 });
      DF.line(houseG, 'M 380 800 L 380 520 L 530 400 L 680 520 L 680 800 Z', '#e2635f', 9, { ei: 0.45 });
      DF.line(houseG, 'M 420 800 L 420 640 L 500 640 L 500 800', '#8a6a42', 8, { ei: 0.4 });
      DF.line(houseG, 'M 560 500 L 640 500 L 640 580 L 560 580 Z', '#9fc8ff', 6, { ei: 0.45 });
      K.pad(360, 390, 340, 420, houseG, { d: 40 });

      // THE tree — the only real thing in a drawn world
      const treeG = K.g(mid, { z: -60 });
      P.fractalTree(treeG, 1180, 800, { s: 1.0, grown: true });
      api.anchor('tree', () => ({ x: 1180, y: 320 }));
      K.pad(1120, 470, 120, 330, treeG, { d: 60 });

      // the little key, hanging from a branch on a thread
      const keyG = K.g(main, { z: -40 });
      K.cylUp(0, -8, 1, 52, K.mat('#fdf9ef', { rough: 0.8 }), keyG);
      K.torus(0, 0, 11, 2.6, K.mat(GOLD, { rough: 0.4, metal: 0.4 }), keyG);
      K.tube([[8, 8, 0], [30, 30, 0]], 2.6, K.mat(GOLD, { rough: 0.4, metal: 0.4 }), keyG, { seg: 4, radial: 6 });
      K.tube([[22, 22, 0], [28, 16, 0]], 2.4, K.mat(GOLD, { rough: 0.4, metal: 0.4 }), keyG, { seg: 4, radial: 6 });
      K.tube([[28, 28, 0], [34, 22, 0]], 2.4, K.mat(GOLD, { rough: 0.4, metal: 0.4 }), keyG, { seg: 4, radial: 6 });
      K.pad(-36, -36, 92, 92, keyG, { d: 220, z: 90 });   // reaches well forward of the canopy: the key hangs among leaves that would otherwise take the click
      let kt = 0;
      api.tick((dt) => { kt += dt; K.tr(keyG, { x: 1200, y: 400, z: 70, r: Math.sin(kt * 1.2) * 8, ox: 0, oy: -60 }); });
      if (st.has('dreamKey')) main.remove(keyG);

      // ================= hotspots =================
      api.hot(sunG, {
        id: 'dg.sun', near: null,
        act: async () => { await api.think('d.gard.sun'); },
      });
      api.hot(houseG, {
        id: 'dg.house', near: { x: 460, plat: 'ground' },
        act: async () => {
          if (!st.has('houseSeen')) { st.flag('houseSeen'); await api.think('d.gard.house'); }
          await DF.veil(() => api.go('dreamKitchen', 'fromGarden'));
        },
      });
      api.hot(treeG, {
        id: 'dg.tree', near: { x: 1060, plat: 'ground' },
        act: async () => {
          api.hero.face(1);
          if (!st.has('dreamKey')) {
            await api.say('tree', 'd.gard.tree1');
            await api.say('tree', 'd.gard.tree2');
            return;
          }
          if (!st.has('treeTold')) {
            st.flag('treeTold');
            await api.say('tree', 'd.gard.tree3');
            await api.say('tree', 'd.gard.tree4');
            api.toast('d.goal4');
            return;
          }
          await api.say('tree', 'd.gard.tree.later');
        },
      });
      api.hot(keyG, {
        id: 'dg.key', near: { x: 1180, plat: 'branch' },
        active: () => !!keyG.parent,
        act: async () => {
          api.hero.face(1);
          await api.hero.tailWhip(1200, 410);
          api.sfx('coin');
          main.remove(keyG);
          st.flag('dreamKey');
          st.give('key');
          await api.think('d.gard.key1');
          await api.think('d.gard.key2');
          await api.say('tree', 'd.gard.tree3');
          await api.say('tree', 'd.gard.tree4');
          st.flag('treeTold');
          api.toast('d.goal4');
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (st.has('dreamGardenFirst')) return;
      st.flag('dreamGardenFirst');
      api.cut(async (ctx) => {
        await ctx.w(500);
        await ctx.run(api.hero.lookAround());
        await ctx.think('d.gard.first1');
        api.hero.face(1);
        await ctx.think('d.gard.first2');
        await ctx.think('d.gard.first3');
        await ctx.say('tree', 'd.gard.hello');
      }, { cinema: false });
    },
  });
})();
