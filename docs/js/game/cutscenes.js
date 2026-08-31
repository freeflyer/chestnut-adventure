/* Chestnut Adventure 2.5D — shared fx + the grand finale.
   Night → trembling soil → sprout → first light → sunrise → the trunk →
   the crown in waves → full spring day → blossom → real bees → morning life. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  CH.fx = {
    /** falling rain into a layer: thin bright streaks at several depths; returns stop() */
    rain(layer, intensity) {
      const drops = [];
      const mat = new T.MeshBasicMaterial({ color: new T.Color('#9db8d8'), transparent: true, opacity: 0.5, fog: false });
      const geo = new T.BoxGeometry(1.6, 14, 1.6);
      for (let i = 0; i < (intensity || 40); i++) {
        const d = new T.Mesh(geo, mat);
        d.userData.noHit = true;
        layer.add(d);
        drops.push({ el: d, x: U.rand(-40, 1640), y: U.rand(-900, 0), z: U.rand(-300, 250), sp: U.rand(600, 900) });
      }
      const un = CH.tw.tick((dt) => {
        drops.forEach((dr) => {
          dr.y += dr.sp * dt;
          if (dr.y > 920) { dr.y = U.rand(-80, -10); dr.x = U.rand(-40, 1640); }
          dr.el.position.set(dr.x, dr.y, dr.z);
        });
      }, 'scene');
      return () => { un(); drops.forEach((d) => d.el.parent && d.el.parent.remove(d.el)); geo.dispose(); mat.dispose(); };
    },

    /** a floating glyph rising from a point (z's over a sleeper, a ♥, a !) */
    floaties(api, x, y, glyph, color, z) {
      const g = K.label(glyph, { size: 26, color: color || '#cbd6ff', x, y, z: z != null ? z : 40, parent: api.layers.fx });
      g.material.opacity = 0;
      const o = { dy: 0, op: 0 };
      CH.tw.to(o, { dy: -46, op: 0.9 }, {
        dur: 900, group: 'scene', ease: CH.tw.ease.quadOut,
        onUpdate: () => { K.tr(g, { y: y + o.dy }); g.material.opacity = o.op; },
      }).then(() => CH.tw.to(o, { dy: -80, op: 0 }, {
        dur: 800, group: 'scene', ease: CH.tw.ease.quadIn,
        onUpdate: () => { K.tr(g, { y: y + o.dy }); g.material.opacity = o.op; },
      })).then(() => { g.parent && g.parent.remove(g); g.material.map.dispose(); g.material.dispose(); });
    },
  };

  // ============================================================ the set
  CH.defScene('epilogue', {
    noHero: true,
    pageBg: '#10162a',
    bg: '#78aed6',
    fogColor: '#a7cfe2', fogNear: 26, fogFar: 70,
    fill: 2.4, ambient2: 1.0, skyLight: '#bcd8f0', groundLight: '#6a8a48',
    camera: { x: 800, y: 380, z: 1640, tx: 800, ty: 500, fov: 31, follow: 0, parallax: 1.2 },

    build(api) {
      const far = api.layers.far, mid = api.layers.mid, fx = api.layers.fx, L = api.layers.lights;
      const P = CH.props;
      const E = {};

      // the night breeze of the garden goes on here, quiet, down among the grass: the same uneven gusts driving the loop
      {
        const breeze = CH.audio.loop('breeze');
        const gust = { v: 0, target: 0.15, next: 2 };
        let gt = 0;
        api.tick((dt) => {
          gt += dt; gust.next -= dt;
          if (gust.next <= 0) { gust.target = U.rand(0.04, 0.55) * (Math.random() < 0.3 ? 1.7 : 1); gust.next = U.rand(2.5, 6.5); }
          gust.v += (gust.target - gust.v) * Math.min(1, dt * (gust.target > gust.v ? 1.4 : 0.45));
          const g = Math.max(0, gust.v + Math.sin(gt * 0.7) * 0.05 + Math.sin(gt * 1.9 + 1) * 0.03);
          breeze.set(g * 0.6);
        });
      }

      // ----- the day world (painted bright; night lies on top as a veil) -----
      const skyTex = K.canvasTex(64, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#78aed6'); g.addColorStop(0.55, '#a7cfe2'); g.addColorStop(1, '#f0e6c4');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      const sky = K.vplane(-2600, 5200, -1400, 1200, -2400, new T.MeshBasicMaterial({ map: skyTex, fog: false }), far);
      sky.userData.__disposeTex = skyTex;

      // warm glow hugging the horizon at dawn
      const dawnTex = K.canvasTex(4, 256, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(255,184,119,0)'); g.addColorStop(0.72, 'rgba(255,184,119,1)'); g.addColorStop(1, 'rgba(255,184,119,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      const dawnMat = new T.MeshBasicMaterial({ map: dawnTex, transparent: true, opacity: 0, fog: false, depthWrite: false });
      E.dawnBand = K.vplane(-2600, 5200, 40, 720, -2380, dawnMat, far);
      E.dawnBand.userData.__disposeTex = dawnTex;
      E.dawnBand.userData.noHit = true;

      // the sun waits behind the hills on the right
      E.sunG = K.g(far, { z: -2300 });
      const sunMat = new T.MeshStandardMaterial({ color: new T.Color('#ffe9a8'), emissive: new T.Color('#ffe9a8'), emissiveIntensity: 1.6, roughness: 1, fog: false, transparent: true, opacity: 0 });
      K.disc(1900, -90, 58, 6, sunMat, E.sunG).castShadow = false;
      const sunGlow = K.glow(E.sunG, 1900, -90, 10, 150, '#ffe9a8', 0.0);
      E.sunOff = { v: 470 };
      E.sunLight = K.sun(L, 1500, -200, -900, '#fff0c8', 0.0, { tx: 700, ty: 700, tz: 0, shadow: true, size: 1500 });
      E.moonLight = K.sun(L, 300, -300, -900, '#9db8d8', 1.2, { tx: 900, ty: 700, tz: 0, shadow: false });

      // lazy spring clouds: fat cumulus, each a flat shaded underside with a heap of white puffs on top, translucent
      // (the sky and the sun show through), drifting slowly across the whole width of the sky
      E.cloudsG = K.g(far, { z: -2200 });
      const cloudMat = new T.MeshStandardMaterial({ color: new T.Color('#ffffff'), emissive: new T.Color('#ffffff'), emissiveIntensity: 0.22, roughness: 1, transparent: true, opacity: 0, fog: false });   // depth is written: where the puffs of one cloud overlap, the nearer surface wins instead of both showing through (the sky objects behind are drawn earlier, back to front)
      const cloudBaseMat = new T.MeshStandardMaterial({ color: new T.Color('#dfe8f4'), emissive: new T.Color('#c9d6e6'), emissiveIntensity: 0.18, roughness: 1, transparent: true, opacity: 0, fog: false });
      const cloud = (cx, cy, s2, flat) => {
        const c = K.g(E.cloudsG);
        const w = 210, hk = flat ? 0.6 : 1;                                        // half-width of the underside at scale 1; a flat one (low, by the horizon) heaps up less
        K.ellipsoid(0, 0, w, 28, 46, cloudBaseMat, c).castShadow = false;           // the flat, slightly grey underside
        const n = U.randi(5, 7);
        for (let i = 0; i < n; i++) {
          const u = -1 + ((i + 0.5) / n) * 2;                                       // -1..1 across the underside
          const r = (40 + (1 - Math.abs(u)) * 56) * U.rand(0.8, 1.15) * hk;         // the middle heaps up, the ends taper
          const px = u * w * 0.82 + U.rand(-12, 12);
          K.ellipsoid(px, -r * 0.55 - U.rand(0, 16), r * U.rand(1.0, 1.25), r, r * 0.8, cloudMat, c).castShadow = false;
          const r2 = r * U.rand(0.5, 0.7);                                          // a smaller shoulder in front of or behind each heap: a fuller, less bubbly silhouette
          K.ellipsoid(px + U.rand(-r * 0.6, r * 0.6), -r2 * 0.6 - U.rand(0, 10), r2 * 1.15, r2, r2 * 0.8, cloudMat, c, { z: U.pick([-1, 1]) * r * 0.5 }).castShadow = false;
        }
        K.tr(c, { x: cx, y: cy, s: s2 });
        return { el: c, x: cx, y: cy, s: s2, sp: U.rand(11, 20) * (flat ? 0.6 : 1) };
      };
      E.clouds = [cloud(-800, -140, 1.5), cloud(300, 40, 1.0), cloud(950, 410, 0.7, true), cloud(1500, -230, 1.35), cloud(2250, 130, 1.05), cloud(2950, -60, 1.2), cloud(-200, 380, 0.6, true)];
      E.cloudMats = [cloudMat, cloudBaseMat];

      // hills + spring ground
      K.ext('M -800 640 Q 300 560 700 626 T 2600 610 L 2600 800 L -800 800 Z', 60, K.mat('#587e46', { rough: 1, fog: false }), far, { z: -1500, bevel: 0 });
      const grassMat = new T.MeshStandardMaterial({ map: K.canvasTex(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#5d8a44'; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) { ctx.fillStyle = Math.random() < 0.5 ? 'rgba(120,170,80,0.5)' : 'rgba(40,80,30,0.45)'; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 5); }
      }, { repeat: [10, 5] }), roughness: 1 });
      K.hplane(-2000, 3600, 656, -1500, 1900, grassMat, far);

      // the house on a bright morning, the Kid's window ready for a wave
      const hg = P.house(mid, 100, 0, { z: -420, day: true });
      const kidWin = K.g(hg);
      E.kid = CH.models.kid(K.g(kidWin, { z: 36 }), 392, 440, 0.85);   // a child-sized shadow inside the window recess, behind the mullions, against the lit glass
      E.kid.setOpacity(0);
      E.kidArm = E.kid.arm;

      // spring flowers waiting in the grass
      E.flowers = [];
      // [x, z] on the lawn (y 658 everywhere: the grass plane lies at 656): a few far back by the hills, most across the
      // middle, a few right down by the camera — the whole field, not one row along the house; near ones read bigger
      [[-400, -1200], [820, -1150], [1500, -1250], [2000, -1100],
       [-250, -700], [900, -650], [1400, -800], [1750, -600],
       [-100, -300], [250, -250], [800, -300], [1350, -200], [1550, -80],
       [150, 150], [450, 300], [700, 420], [1000, 200], [1300, 350],
       [350, 650], [900, 780], [1200, 600]].forEach((p) => {   // three times the handful: the whole lawn comes up in flower
        const f = K.g(mid);
        K.tube([[0, 0, 0], [0, -14, 0]], 1.5, K.mat('#4c7a38', { rough: 0.9 }), f, { seg: 3, radial: 5 });
        const petal = K.mat(U.pick(['#f2d06b', '#f2b3c4', '#eae4f2']), { rough: 0.9 });
        for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; K.sphere(Math.cos(a) * 6, -16 + Math.sin(a) * 6, 3.6, petal, f); }
        K.sphere(0, -16, 3, K.mat('#e8933c', { rough: 0.9 }), f, { z: 2 });
        K.tr(f, { x: p[0], y: 658, z: p[1], s: 0.001 });
        f.__x = p[0]; f.__y = 658; f.__z = p[1];
        E.flowers.push(f);
      });

      // the mound where our hero sleeps (roomy — a big tree is coming)
      E.mound1 = K.ellipsoid(1090, 664, 150, 14, 70, K.mat('#2c1d0c', { rough: 1 }), mid, { z: -40 });
      E.mound2 = K.ellipsoid(1090, 658, 112, 12, 52, K.mat('#3d2a10', { rough: 1 }), mid, { z: -40 });

      // ----- the night veil on top -----
      const veilMat = new T.MeshBasicMaterial({ color: new T.Color('#0d1226'), transparent: true, opacity: 0.84, depthWrite: false, fog: false });
      E.veil = K.vplane(-6000, 7600, -6000, 8000, 1200, veilMat, fx);
      E.veil.userData.noHit = true; E.veil.renderOrder = 20;
      E.nightSky = K.g(fx, { z: -2350 });
      E.stars = [];
      for (let i = 0; i < 40; i++) E.stars.push(K.glow(E.nightSky, U.rand(-600, 2200), U.rand(-800, 420), 0, U.rand(5, 11), '#e8ecff', U.rand(0.3, 0.8)));
      E.moon = P.moon(E.nightSky, 720, 158, 52, { z: 0 });
      E.moon.traverse((m) => { if (m.isMesh && !m.isSprite && m.material) { m.material = m.material.clone(); m.material.transparent = true; } });   // its own copy of the (shared, opaque) moon material, so setNight can fade the disc with the stars instead of it winking out with the night sky

      api.__epi = E;
    },
  });

  // ============================================================ the film
  CH.epilogue = async function () {
    CH.ui.hideMenu();
    const api = await CH.engine.go('epilogue', null, {});
    const E = api.__epi;
    const mid = CH.engine.layers.mid, fx = CH.engine.layers.fx;
    const TX = 1090, TY = 660;
    let tree = null;

    const setVeil = (v) => { E.veil.material.opacity = v; E.moonLight.intensity = 1.2 * Math.max(0, (v - 0.2)) / 0.64; };
    // the stars and the moon fade on their own clocks: the stars go with the night, the moon lingers, pale, into the morning
    let nightV = 1, moonV = 1;
    const applyNight = () => { E.nightSky.visible = nightV > 0.02 || moonV > 0.02; };
    const setNight = (v) => { nightV = v; E.stars.forEach((s) => { s.material.opacity = 0.6 * v; }); applyNight(); };
    const setMoon = (v) => { moonV = v; E.moon.traverse((m) => { if (m.material && m.material.transparent) m.material.opacity = v; }); applyNight(); };
    const setSun = (v) => { E.sunG.children[0].material.opacity = v; E.sunG.children[1].material.opacity = 0.45 * v; E.cloudMats.forEach((m, i) => { m.opacity = (i ? 0.66 : 0.8) * v; }); E.sunLight.intensity = 2.4 * v; };
    let ct = 0;
    CH.tw.tick((dt) => {
      ct += dt;
      E.clouds.forEach((c) => {
        c.x -= c.sp * dt;
        if (c.x < -1500) c.x = 3100;                                                // off the left edge of the sky (at this depth it spans about -1100..2700): back round to the right
        K.tr(c.el, { x: c.x, y: c.y + Math.sin(ct * 0.4 + c.y) * 4, s: c.s });
      });
      K.tr(E.sunG, { y: E.sunOff.v, z: -2300 });
    }, 'scene');

    const sparkleAt = (x, y, tint, z) => {
      const s = K.glow(fx, x, y, z || 20, 10, tint || '#fff3c4', 0);
      const o = { s: 6, op: 0 };
      CH.tw.to(o, { s: 26, op: 0.95 }, {
        dur: 320, group: 'scene', ease: CH.tw.ease.quadOut, onUpdate: () => { s.scale.set(o.s, o.s, 1); s.material.opacity = o.op; },
      }).then(() => CH.tw.to(o, { s: 4, op: 0 }, {
        dur: 380, group: 'scene', ease: CH.tw.ease.quadIn, onUpdate: () => { s.scale.set(o.s, o.s, 1); s.material.opacity = o.op; },
      })).then(() => { s.parent && s.parent.remove(s); s.material.dispose(); });
    };

    await CH.cut.play(async (ctx) => {
      // ================= I. night hush =================
      const fly = K.glow(fx, 0, 0, 0, 5, '#ffe9a3', 0.8);
      const flyUn = CH.tw.tick(() => {
        fly.position.set(700 + Math.sin(ct * 0.7) * 180 + Math.sin(ct * 0.23) * 120, 560 + Math.cos(ct * 0.5) * 40, 20);
        fly.material.opacity = 0.25 + 0.55 * (Math.sin(ct * 2.3) + 1) / 2;
      }, 'scene');
      setVeil(0.84); setNight(1); setMoon(1); setSun(0);
      await ctx.w(1600);

      // ================= II. the soil stirs =================
      for (let i = 0; i < 2; i++) {
        ctx.sfx('tap');
        await ctx.tw({ v: 0 }, { v: 1 }, {
          dur: 420, onUpdate: (k, o) => {
            const dx = Math.sin(o.v * Math.PI * 4) * 4;
            K.tr(E.mound1, { x: 1090 + dx, y: 664, z: -40, sx: 150, sy: 14, sz: 70 });
            K.tr(E.mound2, { x: 1090 - dx, y: 658, z: -40, sx: 112, sy: 12, sz: 52 });
          },
        });
        CH.props.dust({ layers: { fx } }, 1090 + U.rand(-30, 30), 650, 3);
        await ctx.w(360);
      }

      tree = CH.props.fractalTree(mid, TX, TY, { s: 1.35 });
      ctx.sfx('pop', 1.4);
      await ctx.run(tree.growTo(0.1, 2400));
      const pulse = K.glow(fx, TX, TY - 10, 20, 30, '#a8e07a', 0.5);
      ctx.tw({ v: 0 }, { v: 1 }, {
        dur: 1300, ease: CH.tw.ease.quadOut,
        onUpdate: (k, o) => { pulse.scale.set(60 + o.v * 260, 60 + o.v * 260, 1); pulse.material.opacity = 0.5 * (1 - o.v); },
      }).then(() => { pulse.parent && pulse.parent.remove(pulse); });
      tree.gust(2.2, 900);
      await ctx.w(1100);

      // ================= III. first light =================
      ctx.sfx('chirp');
      ctx.tw({ v: 0 }, { v: 0.6 }, { dur: 2600, onUpdate: (k, o) => { E.dawnBand.material.opacity = o.v; } });
      const dawn = ctx.tw({ v: 0.84 }, { v: 0.5 }, {
        dur: 3800, ease: CH.tw.ease.quadInOut,
        onUpdate: (k, o) => setVeil(o.v),
      });
      ctx.sfx('boing', 0.8);
      await ctx.run(tree.growTo(0.16, 900));
      await ctx.w(420);
      ctx.sfx('boing', 0.9);
      await ctx.run(tree.growTo(0.23, 900));
      await ctx.w(400);
      await dawn;

      // ================= IV. sunrise; the tree grows, branch by branch =================
      ctx.tw({ v: 0 }, { v: 1 }, { dur: 2600, onUpdate: (k, o) => setSun(o.v) });
      ctx.tw(E.sunOff, { v: 0 }, { dur: 8800, ease: CH.tw.ease.quadInOut });
      ctx.tw({ v: 0.5 }, { v: 0.12 }, {
        dur: 8800, ease: CH.tw.ease.quadInOut,
        onUpdate: (k, o) => setVeil(o.v),
      });
      ctx.tw({ v: 1 }, { v: 0 }, { dur: 4200, onUpdate: (k, o) => setNight(o.v) });
      ctx.tw({ v: 1 }, { v: 0 }, { dur: 7500, ease: CH.tw.ease.quadInOut, onUpdate: (k, o) => setMoon(o.v) });   // the moon thins out slowly in the brightening sky, gone only well after sunrise
      ctx.tw({ v: 0.6 }, { v: 0 }, { dur: 6800, delay: 1800, onUpdate: (k, o) => { E.dawnBand.material.opacity = o.v; } });
      await ctx.run(tree.growTo(1, 11500));
      let leafGuard = 0;
      while (tree.leafProgress() < 0.96 && !ctx.dead() && leafGuard++ < 18) await ctx.w(300);

      // ================= V. full day settles in =================
      for (const f of E.flowers) {
        ctx.tw({ v: 0 }, { v: 1 }, {
          dur: 460, ease: CH.tw.ease.backOut,
          onUpdate: (k, o) => { K.tr(f, { x: f.__x, y: f.__y, z: f.__z, s: Math.max(0.001, o.v) }); },
        });
        await ctx.w(45);   // three times the flowers, half the stagger: the wave of blooming takes about as long as before
      }
      ctx.tw({ v: 0.12 }, { v: 0 }, { dur: 1600, onUpdate: (k, o) => setVeil(o.v) });
      // guarded like every other sprite here: if anything has already taken it off the layer, saying so must not throw —
      // the whole epilogue runs inside one script, and an exception here would take the bees, the morning and the credits with it
      flyUn(); fly.parent && fly.parent.remove(fly);
      tree.gust(2.4, 2600);
      await ctx.w(2300);

      // ================= VI. it BLOOMS — bud, candle, speckle =================
      const order = [...tree.flowers.keys()].sort(() => Math.random() - 0.5);
      const budPs = order.map((idx, k) => (async () => {
        await ctx.w(k * 150 * U.rand(0.4, 1.4));
        if (ctx.dead()) return;
        await ctx.tw(tree.flowers[idx], { budS: 1 }, { dur: 520, ease: CH.tw.ease.backOut });
      })().catch(() => {}));
      await Promise.all(budPs);
      await ctx.w(500);
      const bloomPs = order.map((idx, k) => (async () => {
        await ctx.w(k * 160 * U.rand(0.4, 1.5));
        if (ctx.dead()) return;
        const f = tree.flowers[idx];
        await ctx.tw(f, { coneS: 1 }, { dur: 780, ease: CH.tw.ease.backOut });
        if (ctx.dead()) return;
        const tip = tree.candleTipAbs(idx);
        if (k % 4 === 0) sparkleAt(tip.x, tip.y - 4, null, tip.z + 20);
        await ctx.tw(f, { dotsO: 1 }, { dur: 420 });
      })().catch(() => {}));
      await Promise.all(bloomPs);
      ctx.sfx('bell');
      const crownC = tree.crownTop();
      const bloomPulse = K.glow(fx, crownC.x, crownC.y + 120, 30, 120, '#fff8e2', 0.4);
      await ctx.tw({ v: 0 }, { v: 1 }, {
        dur: 1100, ease: CH.tw.ease.quadOut,
        onUpdate: (k, o) => { bloomPulse.scale.set(240 + o.v * 640, 240 + o.v * 640, 1); bloomPulse.material.opacity = 0.4 * (1 - o.v); },
      });
      bloomPulse.parent && bloomPulse.parent.remove(bloomPulse);
      await ctx.w(500);

      // ================= VII. the bees =================
      const beesAudio = CH.audio.loop('bees');
      const candleTip = (i) => tree.candleTipAbs(i);
      const leanCandle = (i, r) => { CH.tw.to(tree.flowers[i], { lean: r }, { dur: 260, group: 'scene' }); };
      const springCandle = (i) => { CH.tw.to(tree.flowers[i], { lean: 0 }, { dur: 640, group: 'scene', ease: CH.tw.ease.elasticOut }); };
      const wiggleCandle = (i) => {
        const c = tree.flowers[i];
        CH.tw.to({ v: 0 }, { v: 1 }, { dur: 700, group: 'scene', ease: CH.tw.ease.quadOut, onUpdate: (k, o) => { c.lean = Math.sin(o.v * Math.PI * 3) * 15 * (1 - o.v); } });
      };

      const bees = [];
      const mkBee = (bx, by, opts) => {
        const made = CH.models.bee(fx);   // a bee from the cast
        const b = made.el, inner = made.inner, w1 = made.w1, w2 = made.w2;
        b.visible = false;
        const bee = {
          el: b, inner, w1, w2, x: bx, y: by, tx: bx, ty: by,
          state: 'enter', t: 0, ph: U.rand(0, 6), flip: 1,
          candle: -1, landings: 0, maxLandings: opts.maxLandings,
          special: opts.special || false, voice: opts.voice, gone: false, alpha: 0,
        };
        bees.push(bee);
        return bee;
      };
      mkBee(-80, 320, { voice: 0, maxLandings: 3 });
      mkBee(1720, 210, { voice: 1, maxLandings: 2, special: true });
      mkBee(-80, 520, { voice: 2, maxLandings: 3 });

      const pickCandle = (bee) => {
        let i;
        do { i = U.randi(0, tree.flowers.length - 1); } while (i === bee.candle);
        bee.candle = i;
        const tip = candleTip(i);
        bee.side = bee.x < tip.x ? -1 : 1;
        bee.tx = tip.x + bee.side * 30;
        bee.ty = tip.y - 34;
      };

      const beeTick = CH.tw.tick((dt) => {
        bees.forEach((bee) => {
          if (bee.gone) { beesAudio.voice(bee.voice, 0.0001); return; }
          bee.ph += dt * 10;
          const ease = (sp) => { bee.x += (bee.tx - bee.x) * dt * sp; bee.y += (bee.ty - bee.y) * dt * sp; };
          const near = () => U.dist(bee.x, bee.y, bee.tx, bee.ty) < 8;
          let flying = true;
          switch (bee.state) {
            case 'enter':
              bee.tx = TX + U.rand(-140, 140); bee.ty = TY - 470 + U.rand(-40, 40);
              ease(1.1); bee.y += Math.sin(bee.ph) * 1.1;
              if (Math.abs(bee.x - bee.tx) < 160) { pickCandle(bee); bee.state = 'approach'; }
              break;
            case 'approach':
              ease(1.9); bee.y += Math.sin(bee.ph) * 0.9;
              if (near()) { bee.state = 'hover'; bee.t = U.rand(0.35, 0.7); }
              break;
            case 'hover': {
              bee.x += Math.sin(bee.ph * 1.3) * 0.5; bee.y += Math.sin(bee.ph) * 0.7;
              bee.t -= dt;
              if (bee.t <= 0) {
                const tip = candleTip(bee.candle);
                if (bee.special) { bee.tx = tip.x; bee.ty = tip.y + 10; bee.state = 'bonkdive'; }
                else { bee.tx = tip.x; bee.ty = tip.y - 4; bee.state = 'landing'; }
              }
              break;
            }
            case 'landing': {
              const tip = candleTip(bee.candle);
              bee.tx = tip.x; bee.ty = tip.y - 5;
              ease(3.6);
              if (U.dist(bee.x, bee.y, bee.tx, bee.ty) < 3.5) { bee.state = 'sitting'; bee.t = U.rand(1.4, 2.4); leanCandle(bee.candle, -bee.side * 7); }
              break;
            }
            case 'sitting': {
              flying = false;
              const tip = candleTip(bee.candle);
              bee.tx = tip.x; bee.ty = tip.y - 5;
              bee.x = tip.x; bee.y = tip.y - 5 + Math.sin(bee.ph * 0.7) * 0.5;
              bee.t -= dt;
              if (bee.t <= 0) {
                springCandle(bee.candle);
                CH.audio.sfx('pop', 1.6);
                bee.landings++;
                bee.y -= 8;
                if (bee.landings >= bee.maxLandings) { bee.state = 'leave'; bee.tx = bee.voice === 1 ? 1780 : -140; bee.ty = U.rand(120, 260); }
                else { pickCandle(bee); bee.state = 'approach'; }
              }
              break;
            }
            case 'bonkdive':
              ease(4.2);
              if (U.dist(bee.x, bee.y, bee.tx, bee.ty) < 7) {
                CH.audio.sfx('boing', 1.5);
                wiggleCandle(bee.candle);
                CH.fx.floaties({ layers: { fx } }, bee.x, bee.y - 22, '!', '#e8b64c', 30);
                bee.special = false;
                bee.state = 'tumble'; bee.t = 0.75; bee.vr = 0;
              }
              break;
            case 'tumble':
              bee.t -= dt;
              bee.vr = (bee.vr || 0) + dt * 900;
              bee.x += -bee.side * 46 * dt; bee.y += 60 * dt;
              if (bee.t <= 0) { bee.state = 'approach'; const tip = candleTip(bee.candle); bee.tx = tip.x + bee.side * 30; bee.ty = tip.y - 34; }
              break;
            case 'leave':
              ease(1.4); bee.y += Math.sin(bee.ph) * 1;
              if (bee.x < -120 || bee.x > 1760) { bee.gone = true; bee.el.visible = false; }
              break;
          }
          const dx = bee.tx - bee.x;
          if (Math.abs(dx) > 8 && flying) bee.flip = dx > 0 ? 1 : -1;
          const ws = flying ? 0.5 + Math.abs(Math.sin(bee.ph * 3.2)) * 0.9 : 0.3;
          const beat = 25 + 30 * (ws - 0.5) / 0.9;                                                 // the near wing tilts toward the viewer, the far one away — a real beat, not scissors
          K.tr(bee.w1, { x: -5, y: -7, z: 2, r: 0, rx: -beat }); K.tr(bee.w2, { x: -3, y: -7, z: 2, r: 0, rx: beat });
          const tz = bee.candle >= 0 ? candleTip(bee.candle).z : 0;
          K.tr(bee.el, { x: bee.x, y: bee.y, z: tz + 30, sx: -bee.flip * 0.68, sy: 0.68, sz: 0.68, r: bee.state === 'tumble' ? bee.vr : 0 });
          const d = U.dist(bee.x, bee.y, TX, TY - 320);
          const distF = U.clamp(1.5 - d / 950, 0.12, 1);
          const vol = flying ? (0.013 + 0.005 * Math.abs(Math.sin(bee.ph * 1.3))) * distF : 0.0015;
          beesAudio.voice(bee.voice, vol);
        });
      }, 'scene');
      void beeTick;

      for (const bee of bees) {
        bee.el.visible = true;
        await ctx.w(700);
      }
      await ctx.w(12500);
      bees.forEach((bee) => {
        if (!bee.gone && bee.state !== 'leave') { bee.state = 'leave'; bee.tx = bee.voice === 1 ? 1780 : -140; bee.ty = U.rand(120, 260); }
      });
      await ctx.w(2600);
      beesAudio.stop();

      // ================= VIII. morning life =================
      ctx.sfx('chirp');
      await ctx.tw({ v: 0 }, { v: 1 }, { dur: 600, onUpdate: (k, o) => { E.kid.setOpacity(o.v); } });
      for (let i = 0; i < 3; i++) {
        await ctx.tw({ r: 0 }, { r: 26 }, { dur: 240, onUpdate: (k, o) => K.tr(E.kidArm, { r: o.r }) });
        await ctx.tw({ r: 26 }, { r: 0 }, { dur: 240, onUpdate: (k, o) => K.tr(E.kidArm, { r: o.r }) });
      }
      ctx.sfx('chirp');

      // Vera's thread hangs from a swaying branch — and swings along with it
      const threadMat = new T.MeshStandardMaterial({ color: new T.Color('#fdf9ef'), roughness: 0.9, transparent: true, opacity: 0 });
      const thread = K.box(-0.7, 0, 1.4, 48, 1.4, threadMat, fx);
      const vs = K.sphere(0, 0, 5, new T.MeshStandardMaterial({ color: new T.Color('#4a3d52'), roughness: 0.8, transparent: true, opacity: 0 }), fx);
      ctx.sfx('pluck', 0.8);
      ctx.tw({ v: 0 }, { v: 0.9 }, { dur: 700, onUpdate: (k, o) => { threadMat.opacity = o.v; vs.material.opacity = o.v; } });

      const petals = [];
      for (let i = 0; i < 10; i++) {
        const p = K.ellipsoid(0, 0, 4, 2.4, 1, K.mat('#f8f2e0', { rough: 0.9 }), fx);
        petals.push({ el: p, x: TX + U.rand(-230, 230), y: TY - U.rand(300, 560), z: U.rand(-60, 60), ph: U.rand(0, 6) });
      }
      CH.tw.tick((dt) => {
        petals.forEach((p) => {
          p.ph += dt;
          p.y += dt * 26;
          p.x += Math.sin(p.ph * 2) * 0.8;
          if (p.y > 880) { p.y = TY - U.rand(360, 560); p.x = TX + U.rand(-230, 230); }
          K.tr(p.el, { x: p.x, y: p.y, z: p.z, r: Math.sin(p.ph * 3) * 40 });
        });
        if (tree) {
          const a = tree.candleTipAbs(5);
          K.tr(thread, { x: a.x + 20, y: a.y + 10 + 24, z: a.z + 10, sy: 1 });
          K.tr(vs, { x: a.x + 20, y: a.y + 60, z: a.z + 10 });
        }
      }, 'scene');

      await ctx.w(4200);
    }, { cinema: false, skippable: false });

    if (tree) tree.finish();

    CH.state.data.finished = true;
    CH.state.data.maxChapter = 5;
    CH.state.save();
    await CH.ui.credits();
  };
})();
