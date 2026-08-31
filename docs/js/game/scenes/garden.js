/* Chapter 5 — the garden: the puddle and the Countess in this half, the flowerbed corner and the ending in the next. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  let cross = null;

  // ---------------------------------------------------------------- the night garden, shared by both of its scenes
  // The flowerbed corner is the same garden a few steps further along the fence, so the two scenes are built from the
  // same pieces — sky, lawn, fence, breeze, fireflies — and differ only in what stands on the grass.

  /** sky, stars, the moon (moonX: it hangs further back over our shoulder the further along the garden we walk),
      the treeline, and the moonlight that throws every shadow out here */
  function nightSky(api, moonX) {
    const far = api.layers.far, L = api.layers.lights, P = CH.props;
    const skyTex = K.canvasTex(64, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0d1226'); g.addColorStop(0.55, '#1b2642'); g.addColorStop(0.85, '#2c3145'); g.addColorStop(1, '#3a3844');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    const sky = K.vplane(-3000, 6000, -1800, 1400, -2600, new T.MeshBasicMaterial({ map: skyTex, fog: false }), far);
    sky.scale.y = -1; sky.userData.__disposeTex = skyTex;
    for (let i = 0; i < 56; i++) K.glow(far, U.rand(-1000, 3000), U.rand(-900, 500), -2500, U.rand(5, 12), '#e8ecff', U.rand(0.3, 0.8));
    P.moon(far, moonX, 100, 80, { z: -2400, sky: '#141b30' });
    const sun = K.sun(L, 300, -300, -600, '#9db8d8', 2.6, { tx: 800, ty: 800, tz: 0, shadow: true, size: 1500 });
    sun.shadow.mapSize.set(2048, 2048);   // it has to cover the fence from edge to edge without coarsening every other shadow out here
    // distant treeline — the big world
    K.ext('M -2000 620 Q 200 520 420 600 Q 560 480 760 590 Q 980 470 1200 585 Q 1400 500 2600 600 L 2600 900 L -2000 900 Z', 60, K.mat('#131a26', { rough: 1, fog: false }), far, { z: -1400, bevel: 0 });   // it runs well off both edges: in the flowerbed corner nothing stands in front of its left end
  }

  /** the lawn rolling from the fence to our feet, with tufts of grass standing out of it here and there;
      skip(x, z) keeps a tuft out of what it must not grow through — the water, the turned soil */
  function lawn(api, skip) {
    const far = api.layers.far, mid = api.layers.mid;
    const grassMat = new T.MeshStandardMaterial({ map: K.canvasTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#25301e'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { ctx.fillStyle = Math.random() < 0.5 ? 'rgba(60,90,40,0.5)' : 'rgba(10,18,8,0.5)'; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 5); }
    }, { repeat: [10, 5] }), roughness: 1 });
    K.hplane(-1500, 3200, 800, -1400, 500, grassMat, far);
    const tuft = K.mat('#2f4a24', { rough: 1, side: 'double' });
    for (let i = 0; i < 40; i++) {
      const gx = U.rand(100, 1550), gz = U.rand(-260, 160), h = U.rand(14, 30);
      if (skip && skip(gx, gz)) continue;
      K.cut(`M -3 0 Q ${U.rand(-6, 2)} ${-h * 0.6} ${U.rand(-6, 6)} ${-h} Q ${U.rand(1, 5)} ${-h * 0.5} 3 0 Z`, tuft, mid, { x: gx, y: 800, z: gz, ry: U.rand(-50, 50) });
    }
  }

  /** the fence along the back: its posts stand in the lawn, well back, so each throws its own shadow from its foot.
      It runs off both edges of the frame — standing that far back, the frame is half as wide again as it is at the
      walking line, so the posts reach from -800 to 2350 instead of stopping short of the right edge */
  function fence(api) {
    const far = api.layers.far;
    for (let i = 0; i < 22; i++) K.rbox(-800 + i * 150, 680, 16, 120, 16, 4, '#242030', far, { z: -1000 });
    K.box(-860, 700, 3280, 10, 10, '#242030', far, { z: -1000 });
  }

  /** the night breeze, the same uneven gusts as up on the wall (a slow breath with the odd stronger puff), but
      quieter: we are down among the grass now */
  function breeze(api) {
    const loop = CH.audio.loop('breeze');
    const gust = { v: 0, target: 0.15, next: 2 };
    let gt = 0;
    api.tick((dt) => {
      gt += dt; gust.next -= dt;
      if (gust.next <= 0) { gust.target = U.rand(0.04, 0.55) * (Math.random() < 0.3 ? 1.7 : 1); gust.next = U.rand(2.5, 6.5); }
      gust.v += (gust.target - gust.v) * Math.min(1, dt * (gust.target > gust.v ? 1.4 : 0.45));
      const g = Math.max(0, gust.v + Math.sin(gt * 0.7) * 0.05 + Math.sin(gt * 1.9 + 1) * 0.03);
      loop.set(g * 0.6);
    });
  }

  /** the far-off fireflies of the garden, out over the lawn all night */
  function ambientFlies(api) {
    const fg = api.layers.fx;
    const flies = [];
    for (let i = 0; i < 9; i++) {
      const f = K.glow(fg, 0, 0, 0, U.rand(4, 7), '#ffe9a3', 0.8);
      flies.push({ el: f, x: U.rand(300, 1500), y: U.rand(520, 720), z: U.rand(-400, 150), ph: U.rand(0, 6.28), sp: U.rand(0.4, 0.8) });
    }
    api.tick((dt) => {
      flies.forEach((f) => {
        f.ph += dt * f.sp;
        f.el.position.set(f.x + Math.sin(f.ph) * 40 + Math.sin(f.ph * 0.41) * 50, f.y + Math.cos(f.ph * 0.7) * 22, f.z);
        f.el.material.opacity = 0.2 + 0.6 * (Math.sin(f.ph * 2.1) + 1) / 2;
      });
    });
  }

  /** one or two fireflies at a time drift in from off an edge, wander low and slow, linger a while over whoever is
      out here — interest() names that spot, live, so it follows whoever moves — and drift off the other way */
  function driftFlies(api, interest) {
    const fg = api.layers.fx, L = api.layers.lights;
    const FWARM = '#ffcf7a';
    const flies = [];
    let nextIn = U.rand(4, 9);
    const spawn = () => {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const g = K.g(fg);
      const vis = CH.models.blink(g);
      const glow = K.glow(fg, 0, 0, 0, 56, FWARM, 0.14);
      const light = K.point(L, 0, 0, 60, FWARM, 0, 420);
      const fl = { g, vis, glow, light, dir, x: dir > 0 ? -90 : 1690, y: U.rand(620, 740), vx: dir * 40, vy: 0, t: U.rand(0, 2.4), state: 'cross', wp: 0, until: U.rand(3.5, 6), ang: U.rand(0, 6.28), spot: null, facing: dir };
      fl.tx = fl.x + dir * U.rand(260, 380); fl.ty = U.rand(600, 750);
      vis.face(dir);
      flies.push(fl);
    };
    const remove = (fl) => {
      if (fl.g.parent) fl.g.parent.remove(fl.g);
      K.dispose(fl.g);
      if (fl.glow.parent) fl.glow.parent.remove(fl.glow);
      fl.glow.material.dispose();
      if (fl.light.parent) fl.light.parent.remove(fl.light);
      flies.splice(flies.indexOf(fl), 1);
    };
    api.tick((dt) => {
      nextIn -= dt;
      if (nextIn <= 0 && flies.length < 2) { spawn(); nextIn = U.rand(12, 26); }
      for (let i = flies.length - 1; i >= 0; i--) {
        const fl = flies[i];
        fl.t += dt; fl.until -= dt;
        if (fl.state === 'cross') {
          if (fl.until <= 0) {
            fl.wp++;
            const farSide = fl.dir > 0 ? fl.x > 1400 : fl.x < 200;
            if (fl.wp >= 3 || farSide) {
              if (Math.random() < 0.75) { fl.state = 'toSpot'; fl.spot = interest(); fl.until = 18; }
              else { fl.state = 'leave'; fl.tx = fl.dir > 0 ? 1740 : -140; fl.ty = U.rand(600, 740); fl.until = 40; }
            } else if (Math.random() < 0.3) { fl.state = 'hover'; fl.tx = fl.x + fl.dir * U.rand(120, 220); fl.ty = U.rand(430, 520); fl.until = U.rand(2.5, 4); }   // up to fence-top height or a little above, for a moment
            else { fl.tx = fl.x + fl.dir * U.rand(220, 360); fl.ty = U.rand(600, 750); fl.until = U.rand(3.5, 6); }
          }
        } else if (fl.state === 'toSpot') {
          // the spot it picked can be right across the garden, and at circling speed it would never get there inside one
          // linger — so it crosses to it at travelling speed, and the circling starts once it has arrived
          const p = fl.spot();
          fl.tx = p.x; fl.ty = p.y - 22;
          if (Math.hypot(fl.tx - fl.x, fl.ty - fl.y) < 70) { fl.state = 'linger'; fl.until = U.rand(4, 7); }
          else if (fl.until <= 0) { fl.state = 'leave'; fl.tx = fl.dir > 0 ? 1740 : -140; fl.ty = U.rand(600, 740); fl.until = 40; }
        } else if (fl.state === 'hover') {
          fl.ty += Math.sin(fl.t * 1.1) * 0.25;   // hanging there, drifting a little
          if (fl.until <= 0) { fl.state = 'cross'; fl.tx = fl.x + fl.dir * U.rand(200, 320); fl.ty = U.rand(600, 750); fl.until = U.rand(3.5, 6); }
        } else if (fl.state === 'linger') {
          const p = fl.spot();
          fl.ang += dt * 1.25;   // one slow loop in about five seconds
          fl.tx = p.x + Math.cos(fl.ang) * 30; fl.ty = p.y - 22 + Math.sin(fl.ang) * 12;
          if (fl.until <= 0) {
            if (Math.random() < 0.5) { fl.state = 'toSpot'; fl.spot = interest(); fl.until = 18; }   // on to somebody else out here
            else { fl.state = 'leave'; fl.tx = fl.dir > 0 ? 1740 : -140; fl.ty = U.rand(600, 740); fl.until = 40; }
          }
        } else if (fl.x > 1720 || fl.x < -120 || fl.until <= 0) { remove(fl); continue; }
        // a soft spring toward the target: every turn a slow curve, never a dart
        const slow = fl.state === 'linger' || fl.state === 'hover';
        const k = slow ? 3.2 : 1.6, dmp = slow ? 3.0 : 2.2;
        fl.vx += ((fl.tx - fl.x) * k - fl.vx * dmp) * dt; fl.vy += ((fl.ty - fl.y) * k - fl.vy * dmp) * dt;
        const sp = Math.hypot(fl.vx, fl.vy), maxSp = slow ? 70 : 110;
        if (sp > maxSp) { fl.vx *= maxSp / sp; fl.vy *= maxSp / sp; }
        fl.x += fl.vx * dt; fl.y += fl.vy * dt;
        if (Math.abs(fl.vx) > 10 && Math.sign(fl.vx) !== fl.facing) { fl.facing = Math.sign(fl.vx); fl.vis.face(fl.facing); }
        const bob = Math.sin(fl.t * 2.3) * 5;
        K.tr(fl.g, { x: fl.x, y: fl.y + bob, z: 30, r: -fl.vx * 0.06 });
        fl.vis.flap(Math.sin(fl.t * 38) * 22);
        const cyc = fl.t % 2.4, on = cyc < 1.5 || (cyc > 1.75 && cyc < 1.9), lit = on ? 1 : 0.12;   // Blink's own rhythm
        fl.vis.setLit(lit * 0.7);   // a shade dimmer than Blink herself
        fl.glow.position.set(fl.x, fl.y + bob + 4, 34); fl.glow.material.opacity = 0.155 * lit;
        fl.light.position.set(fl.x, fl.y + bob, 60); fl.light.intensity = 2.45 * lit;
      }
    });
  }


  CH.defScene('garden', {
    chapter: 7,
    pageBg: '#0d1420',
    bg: '#0b111c',
    fogNear: 22, fogFar: 60,
    ambient: [],
    fill: 1.9, ambient2: 0.8, skyLight: '#4a5a8a', groundLight: '#1a2414',
    shadowBox: { lo: [-15, -5, -11], hi: [15, 5.1, 5] },   // out to the fence, and the width of the frame back there
    camera: { x: 800, y: 380, z: 1590, tx: 800, ty: 470, follow: 0.08, parallax: 1.2 },

    platforms: [
      { id: 'ground', x1: 150, x2: 700, y: 800 },   // the near shore: it follows the water's left end
      { id: 'yard', x1: 1150, x2: 1520, y: 800 },
    ],
    links: [
      { a: 'ground', b: 'yard', ax: 690, bx: 1150, type: 'custom', run: () => cross() },
    ],
    spots: {
      enter: { x: 460, plat: 'ground' },
      fromBed: { x: 1500, plat: 'yard' },   // back from the flowerbed corner he steps in at the right edge, deep in her half — and she is waiting
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fx, L = api.layers.lights;
      const P = CH.props;

      nightSky(api, 320);
      lawn(api, (x, z) => x > 680 && x < 1150 && z > -170);   // no tufts standing in the puddle
      fence(api);

      // the porch (left): a deck with two proper steps descending to the garden
      const porchG = K.g(mid);
      const deck = P.woodMat('#2c2534', '#241f2c', 0.85);
      // a low deck the width of the door, its top a step above the lawn, and two shallow steps down to the right —
      // all behind the walking line so the hero is never hidden by it
      K.box(-40, 742, 400, 58, 220, deck, porchG, { z: -250 });
      K.box(-40, 738, 400, 16, 220, '#3a3142', porchG, { z: -250 });
      K.box(360, 762, 60, 38, 220, '#241f2c', porchG, { z: -250 });
      K.box(360, 758, 60, 14, 220, '#5a5070', porchG, { z: -250 });
      K.box(420, 782, 60, 18, 220, '#1f1a26', porchG, { z: -250 });
      K.box(420, 778, 60, 12, 220, '#4e4462', porchG, { z: -250 });
      // the house itself stands at the left, big, raised on a stone foundation so the foot of its door is level with
      // the deck (the deck's top is at 742): the foundation runs the whole width and depth of the house
      // the foundation runs under the whole house, out past the corner board and back under the side wall to its far end,
      // so nothing of the house stands in the air: at the corner its right face shows below the wall down to the lawn
      K.box(-170, 742, 542, 58, 616, K.mat('#4a4650', { rough: 0.95 }), mid, { z: -642 });
      K.box(-176, 740, 554, 6, 628, K.mat('#5e5a66', { rough: 0.9 }), mid, { z: -642 });   // its lighter capping course
      const houseG = K.g(mid, { z: -380 });
      const siding = new T.MeshStandardMaterial({ map: K.canvasTex(256, 512, (ctx, w, h) => {
        ctx.fillStyle = '#3a3142'; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, i * 64 + 58, w, 6); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, i * 64, w, 3); }
      }, { repeat: [3, 6] }), roughness: 0.95 });
      K.vplane(-420, 350, -1000, 742, 0, siding, houseG);                                                // the wall face, off the top of the frame
      K.box(340, -1000, 22, 1742, 60, '#241e2c', houseG, { z: 0 });                                       // the corner board
      K.sidewall(362, -1000, 742, -560, 0, K.mat('#2a2432', { rough: 1 }), houseG, { facing: 'right' });   // the wall turns the corner, away from us
      const dark = K.mat('#241e2c', { rough: 0.9 });
      // the window we jumped from, high up: its deep frame, the lit room behind, the sill — and the sash tilted open
      const WX = 50, WY = 60, WW = 190, WH = 236;
      K.vplane(WX, WX + WW, WY, WY + WH, 2, K.mat('#ffd489', { emissive: '#ffb454', ei: 1.0, rough: 0.6 }), houseG).castShadow = false;
      [[WX - 12, WY - 12, WW + 24, 12], [WX - 12, WY + WH, WW + 24, 12], [WX - 12, WY, 12, WH], [WX + WW, WY, 12, WH]].forEach((b) => K.box(b[0], b[1], b[2], b[3], 30, dark, houseG, { z: 14 }));
      const sash = K.g(houseG, { z: 20 });
      K.box(WX + WW / 2 - 4, WY, 8, WH, 6, dark, sash); K.box(WX, WY + WH / 2 - 4, WW, 8, 6, dark, sash);
      K.box(WX, WY, WW, 8, 6, dark, sash); K.box(WX, WY, 8, WH, 6, dark, sash); K.box(WX + WW - 8, WY, 8, WH, 6, dark, sash);
      K.tr(sash, { z: 20, rx: -7, ox: 0, oy: WY + WH });
      K.box(WX - 22, WY + WH + 12, WW + 44, 12, 46, dark, houseG, { z: 22 });                             // the sill
      K.glow(houseG, WX + WW / 2, WY + WH / 2, 30, 210, '#ffb454', 0.1);
      K.point(houseG, WX + WW / 2, WY + WH / 2, 130, '#ffb454', 4, 760);
      K.cylUp(318, 742, 6, 1742, K.mat('#2a2433', { rough: 0.6 }), houseG, { z: 28 });                    // the drainpipe down the corner
      // the front door onto the porch (the deck's top is at 742), and the porch lamp beside it
      K.box(92, 526, 136, 216, 24, K.mat('#2a2433', { rough: 0.95 }), houseG, { z: 12 });
      K.box(106, 540, 108, 202, 10, P.woodMat('#57422e', '#3e2f20', 0.8), houseG, { z: 24 });
      K.box(118, 552, 84, 78, 6, K.mat('#4a3626', { rough: 0.9 }), houseG, { z: 32 });
      K.box(118, 646, 84, 78, 6, K.mat('#4a3626', { rough: 0.9 }), houseG, { z: 32 });
      K.sphere(196, 646, 6, K.mat('#c9a24b', { metal: 0.6, rough: 0.35 }), houseG, { z: 34 });
      K.rbox(58, 560, 8, 30, 8, 2, dark, houseG, { z: 28 });
      K.rbox(52, 590, 20, 24, 20, 4, K.mat('#ffd489', { emissive: '#ffd489', ei: 1.4 }), houseG, { z: 28 }).castShadow = false;
      K.point(houseG, 62, 602, 120, '#ffb454', 7, 460);

      // stone path
      [[360, 30], [510, 76], [1100, 250]].forEach((p) => {
        const s = K.cut(K.ellipseShape(0, 0, 70, 36), K.mat('#3c4048', { rough: 1 }), far, { rx: 90 });
        K.tr(s, { x: p[0], y: 799.4, z: p[1], rx: 90 });
      });

      // ---------- the puddle ----------
      const puddleG = K.g(mid);
      // ripples: two soft normal maps drifting over each other at speeds that wander and never quite repeat — one on the
      // water, one on its clearcoat — so the moon's glint on the surface breaks up and moves with them
      const rippleTex = (seed) => {
        const N = 128, hgt = new Float32Array(N * N), waves = [];
        for (let i = 0; i < 5; i++) { const a = seed * 1.7 + i * 1.23, k = 2 + i * 1.6; waves.push([Math.cos(a) * k, Math.sin(a) * k, seed * 3.1 + i * 2.3]); }
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let h = 0; for (const w of waves) h += Math.sin((x / N) * Math.PI * 2 * w[0] + (y / N) * Math.PI * 2 * w[1] + w[2]); hgt[y * N + x] = h / waves.length; }
        const tex = K.canvasTex(N, N, (ctx) => {
          const img = ctx.createImageData(N, N);
          for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
            const hx = (hgt[y * N + (x + 1) % N] - hgt[y * N + (x + N - 1) % N]) * 0.5, hy = (hgt[((y + 1) % N) * N + x] - hgt[((y + N - 1) % N) * N + x]) * 0.5;
            const k = (y * N + x) * 4; img.data[k] = 128 - hx * 220; img.data[k + 1] = 128 - hy * 220; img.data[k + 2] = 255; img.data[k + 3] = 255;
          }
          ctx.putImageData(img, 0, 0);
        }, { repeat: [1 / 110, 1 / 110] });
        tex.colorSpace = T.NoColorSpace;
        return tex;
      };
      const rip1 = rippleTex(1), rip2 = rippleTex(2);
      const water = new T.MeshPhysicalMaterial({ color: new T.Color('#2a4058'), roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, transparent: true, opacity: 0.92, normalMap: rip1, normalScale: new T.Vector2(0.45, 0.45), clearcoatNormalMap: rip2, clearcoatNormalScale: new T.Vector2(0.65, 0.65) });
      // its left end is a leaf's length in from where it used to reach, and it is twice as deep as it was: every point's
      // depth doubled about the water's own middle, so it reaches further back and further out toward us alike
      const pud = K.cut(K.blobShape([[-50, -18], [60, -122], [130, -142], [280, -72], [380, 22], [290, 182], [110, 218], [20, 162]]), water, puddleG, { rx: 90 });
      K.tr(pud, { x: 750, y: 799, z: -10, rx: 90 });
      pud.castShadow = false;
      // the moon on the water: not one smear but a handful of streaks, each wandering and breathing on its own
      const streaks = [];
      for (let i = 0; i < 6; i++) {
        const sp = K.glow(puddleG, 865, 787 + i * 2.4, -10 + (i - 2.5) * 18, 48, '#e8ecff', 0.18);   // spread across the wider water
        streaks.push({ sp, x0: 865, y0: 787 + i * 2.4, z0: -10 + (i - 2.5) * 18, w: U.rand(120, 220), ph: U.rand(0, 6.3), f: U.rand(0.5, 1.4), drift: 0, v: 0, op: U.rand(0.1, 0.22) });
      }
      // rings where drops fall: each appears, spreads and fades; a new drop every few seconds somewhere on the water
      const ringGeo = new T.RingGeometry(0.955, 1, 56);
      const rings = [];
      const dropAt = (x, z, delay) => {
        const m = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: new T.Color('#9fb8cc'), transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide }));
        m.userData.noHit = true; puddleG.add(m);
        K.tr(m, { x, y: 798.4, z, rx: 90, s: 1 });
        rings.push({ m, x, z, t: -(delay || 0), life: U.rand(1.8, 2.8), rmax: U.rand(26, 52) });
      };
      let nextDrop = U.rand(1, 3);
      K.pad(686, 690, 424, 140, puddleG, { d: 400, z: 10 });   // stops short of the second leaf, so the leaf stays clickable
      let tt = 0;
      api.tick((dt) => {
        tt += dt;
        // the ripples drift, their speed wandering a little, so the pattern never settles into a loop
        rip1.offset.x += dt * (0.05 + 0.02 * Math.sin(tt * 0.37)); rip1.offset.y += dt * (0.032 + 0.015 * Math.sin(tt * 0.61 + 1));
        rip2.offset.x -= dt * (0.038 + 0.018 * Math.sin(tt * 0.29 + 2)); rip2.offset.y += dt * (0.05 + 0.02 * Math.sin(tt * 0.47));
        for (const k of streaks) {
          k.v += (Math.random() - 0.5) * dt * 30; k.v *= 0.96; k.drift = U.clamp(k.drift + k.v * dt, -14, 14);   // a bounded random walk
          const wob = Math.sin(tt * k.f + k.ph) * 6 + Math.sin(tt * k.f * 1.73 + k.ph * 2) * 3;
          k.sp.position.set(k.x0 + wob + k.drift, k.y0, k.z0);
          k.sp.scale.set(k.w * (1 + 0.12 * Math.sin(tt * k.f * 0.8 + k.ph)), 5.5, 1);
          k.sp.material.opacity = k.op * (0.7 + 0.3 * Math.sin(tt * k.f * 1.3 + k.ph * 3));
        }
        nextDrop -= dt;
        if (nextDrop <= 0 && rings.length < 6) { const x = U.rand(760, 1080), z = U.rand(-130, 150); dropAt(x, z, 0); dropAt(x, z, 0.35); nextDrop = U.rand(1.6, 4.2); }
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i]; r.t += dt;
          if (r.t < 0) continue;
          const u = r.t / r.life;
          if (u >= 1) { puddleG.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); continue; }
          K.tr(r.m, { x: r.x, y: 798.4, z: r.z, rx: 90, s: 3 + r.rmax * u });
          r.m.material.opacity = 0.42 * (1 - u) * Math.min(1, u * 6);
        }
      });
      // the toppled watering can — the sea it spilled is the puddle beside it, and its spout points that way, out over
      // the water; upright and half sunk into the lawn it read as neither one thing nor the other
      const canG = K.g(mid, { x: 590, y: 800, z: -80, r: 7 });
      const tin = K.mat('#5a7d6d', { rough: 0.5, metal: 0.3 });
      const tinDark = K.mat('#4d6c5e', { rough: 0.5, metal: 0.3 });
      K.rodX(-32, 34, -30, 30, tin, canG);                                    // the body, resting its whole length on the lawn
      K.rodX(34, 40, -30, 31, tinDark, canG);                                 // the base capping the far end
      K.rodX(-32, -24, -30, 26, K.mat('#26332e', { rough: 1 }), canG);        // the dark of the inside, set in behind the rim
      K.torus(-32, -30, 30, 4, tinDark, canG, { ry: 90 });                    // the rim of the open top, away from the water
      K.tube([[24, -48, 0], [56, -54, 0], [84, -66, 0]], 7, tinDark, canG, { seg: 10, radial: 8 });   // the spout, swung up over the puddle as it went over
      K.torus(86, -68, 9, 3, tinDark, canG, { ry: -74 });                     // and its rose
      K.torus(4, -30, 31, 4, tinDark, canG, { arc: Math.PI, rx: 90 });        // the carry handle, over on its side with the rest of it
      K.pad(-50, -76, 96, 80, canG, { d: 90 });

      // the leaf boat (near the porch) — also the crossing solution
      const drawLeaf = (g, s2) => CH.models.leaf(g, { s: s2 || 1, rx: 0 });
      const leafG = K.g(main);
      CH.models.leaf(leafG, { s: 1.1, rx: 62, r: -30 });            // propped against the toppled can
      K.tr(leafG, { x: 548, y: 786, z: -30 });
      const leafOnWater = st.has('leafBoat');
      if (st.hasItem('leaf') || leafOnWater) main.remove(leafG);
      // the boat, once launched: lying flat on the water
      const boatG = K.g(main);
      CH.models.leaf(boatG, { s: 1.2, rx: 86, r: 12 });
      let boatX = st.has('boatRight') ? 1090 : 740;                                   // it waits at the shore it was left on
      K.tr(boatG, { x: boatX, y: 796, z: -10 });
      boatG.visible = leafOnWater;
      // when the leaf is left on the far shore (the Countess dropped him back on the near one), the wind pushes it
      // slowly back across the puddle, rocking; until it arrives there is nothing to cross on
      let boatT = 0, boatDrift = null, sailing = false;
      let boatHeel = 0;   // the lie he left it in: it keeps that until he steps aboard again, and only then tips the other way
      const DRIFT_SPEED = 22;   // px per second — the puddle takes about twenty seconds
      const startDrift = (to) => { if (boatDrift !== to && Math.abs(boatX - to) > 1) boatDrift = to; };
      api.tick((dt) => {
        if (!boatG.visible || sailing) return;
        boatT += dt;
        if (!boatDrift && api.hero.attached && !CH.engine.locked) {
          const heroLeft = api.hero.plat === 'ground', boatLeft = boatX < 900;
          if (heroLeft !== boatLeft) startDrift(heroLeft ? 740 : 1090);
        }
        if (boatDrift) {
          const dir = boatDrift > boatX ? 1 : -1;
          boatX += dir * DRIFT_SPEED * dt;
          if ((dir > 0 && boatX >= boatDrift) || (dir < 0 && boatX <= boatDrift)) { boatX = boatDrift; boatDrift = null; st.flag('boatRight', boatX > 900); }
          K.tr(boatG, { x: boatX, y: 796 + Math.sin(boatT * 2.6) * 3, z: -10, r: boatHeel + Math.sin(boatT * 2.2) * 5 + Math.sin(boatT * 5.1) * 1.5 });   // gusted along, rocking, still lying the way he left it
        } else {
          K.tr(boatG, { x: boatX, y: 796 + Math.sin(boatT * 1.8) * 2, z: -10, r: boatHeel + Math.sin(boatT * 1.3) * 2 });
        }
      });

      // the second leaf (the disguise), past the puddle, lying flat
      const leaf2G = K.g(main);
      CH.models.leaf(leaf2G, { s: 1.15, rx: 72, ry: 40 });   // lying on the ground, turned a little in the ground plane (ry, not r: an in-plane roll after the tilt would dig one corner in), tipped up 18 deg toward the room so its face shows, not its edge
      K.tr(leaf2G, { x: 1287, y: 787, z: -5 });   // its lower edge rests on the ground (800), nothing of it sunk in, and it lies level with the Countess's post
      K.pad(-52, -34, 104, 50, leaf2G, { d: 90 });   // lying flat, the leaf itself is a sliver to click: this upright pad is the target (kept low, off the gnome behind it)
      // Once it is up over his head he keeps it there and walks where he likes: the Countess sees a leaf. He loses it two
      // ways, and both put it back on the grass under her post for the taking — stepping onto the water, where it is
      // whipped off him, and walking on to the flowerbed corner, where he simply leaves it behind in her garden.
      let hatG = null, hatOff = null;
      const wearLeaf = () => {
        hatG = K.g(main, { z: 10 });
        CH.models.leaf(hatG, { s: 1.15, rx: 68 });   // held flat above him, its blade turned down at him
        const place = () => K.tr(hatG, { x: api.hero.x, y: api.hero.y - 114, z: 10, r: Math.sin(api.hero.x / 30) * 4 });   // clear above his head and his spikes (his top is at y - 80)
        place();
        hatOff = api.tick(place);
      };
      const loseLeaf = () => {   // off his head and down it goes, rocking, to lie where it lay
        st.flag('magpieFooled', false);
        if (!hatG) return;
        const h = hatG, x0 = h.__t.x, y0 = h.__t.y;
        hatG = null; hatOff(); hatOff = null;
        CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 1600, ease: CH.tw.ease.linear, group: 'scene',
          onUpdate: (k, o) => K.tr(h, { x: U.lerp(x0, 1287, o.t), y: U.lerp(y0, 787, o.t * o.t), z: U.lerp(10, -5, o.t), r: Math.sin(o.t * 11) * 26 * (1 - o.t) }),
        }).then(() => { if (h.parent) h.parent.remove(h); leaf2G.visible = true; });
      };
      if (st.has('magpieFooled')) { leaf2G.visible = false; wearLeaf(); }   // he walked in still holding it

      // a snail on the path
      const snailG = K.g(main, { z: 60 });
      CH.models.snail(snailG);
      let snailX = 250, snailDir = 1;   // starts well left of where he lands (460), crawling his way: he is not hidden behind a snail the moment he touches down
      api.tick((dt) => {
        snailX += dt * 1.6 * snailDir;
        if (snailX > 450) { snailX = 450; snailDir = -1; }                              // turn back short of the leaf by the can, so the snail never sits on the click that takes it
        if (snailX < 190) { snailX = 190; snailDir = 1; }
        K.tr(snailG, { x: snailX, y: 806, z: 60, sx: 1.4 * snailDir, sy: 1.4, sz: 1.4 });
      });

      // ---------- the fence post + the Countess ----------
      // her post stands where the gnome's plinth used to end (1268): she guards the last of the garden, and the walk
      // past her — under a leaf, or paid for with a bottle cap — is the way on to the flowerbed
      const POST_X = 1330;
      const postG = K.g(mid, { z: -140 });
      K.rbox(POST_X - 10, 560, 20, 240, 20, 5, '#2c2838', postG);   // down to the lawn (800), like the fence posts: standing clear of it, its shadow fell away from its foot
      K.sphere(POST_X, 552, 14, K.mat('#332e42', { rough: 0.8 }), postG);
      // a bare tree at the fence corner holds her nest, at her own depth, where she actually flies to
      const treeG = K.g(mid, { x: 60, z: -140 });   // shifted right out of the corner: the exit mark belongs there
      const NEST_X = 1480;   // the nest, drawn at 1420 inside the group, ends up here — where she flies with the cap and stays
      const bark = K.mat('#4a3e52', { rough: 1 });
      K.tube([[1590, 800, 0], [1582, 640, 0], [1560, 500, 0], [1548, 380, 0]], 18, bark, treeG, { seg: 12, radial: 8 });
      K.tube([[1564, 520, 0], [1500, 500, 0], [1440, 508, 0]], 7, bark, treeG, { seg: 10, radial: 6 });
      K.tube([[1554, 430, 0], [1600, 372, 0], [1630, 330, 0]], 6, bark, treeG, { seg: 10, radial: 6 });
      {   // the nest: a woven bowl with a floor, sitting on the branch, a few loose twigs round its rim
        const twig = K.mat('#4a4030', { rough: 1 }), twigLight = K.mat('#6a5a40', { rough: 1 });
        const bowl = K.mesh(new T.LatheGeometry([[0, 0], [22, 0], [30, 9], [36, 20], [38, 27], [33, 27], [30, 20], [24, 11], [0, 9]].map((p) => new T.Vector2(p[0], p[1])), 18), K.mat('#4a4030', { rough: 1, side: 'double' }), treeG, {});
        K.tr(bowl, { x: 1420, y: 508, r: 180, rx: -16 });
        CH.LP.jitter(bowl, 1.2);
        for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; K.tube([[1420 + Math.cos(a) * 30, 484 + Math.sin(a) * 6, Math.sin(a) * 28], [1420 + Math.cos(a) * 44, 480 + Math.sin(a) * 9 + U.rand(-6, 6), Math.sin(a) * 40]], 1.4, i % 2 ? twig : twigLight, treeG, { straight: true, radial: 4 }).castShadow = false; }
      }
      // paid her toll and she is up at her nest with the cap, not down on the post — the garden can be walked back into,
      // so where the bribe cutscene left her is where she has to be found again
      const paid = st.has('magpieBribed');
      const perch = paid ? { x: NEST_X, y: 486 } : { x: POST_X, y: 537 };   // her feet on top of the post knob (its top is at 537 this deep), or on the nest's rim
      const magpie = CH.actors.magpie(K.g(main, { z: -140 }), perch.x, perch.y, 1);
      K.point(L, perch.x - 40, perch.y - 37, -30, '#9db8d8', 2.2, 500, { decay: 1.6 });   // moonlight catching the Countess wherever she sits
      magpie.face(-1);
      api.anchor('magpie', magpie.anchor);
      const magpieGone = () => st.has('magpieBribed');

      breeze(api);
      ambientFlies(api);
      // whoever — and whatever — is out here for a firefly to circle over. Each point is the centre of the little loop it
      // flies, and it hangs 22 above that, so every one of them sits a good head's height ABOVE its subject's top:
      // the chestnut's spikes end at y-80, the Countess's head at 438, the nest's rim at 470, the leaf at 753.
      driftFlies(api, () => {
        const pts = [() => ({ x: CH.hero.x, y: CH.hero.y - 125 }), () => ({ x: snailX, y: 692 }), () => ({ x: NEST_X, y: 425 })];
        if (!magpieGone()) pts.push(() => ({ x: POST_X + 16, y: 393 }));      // over the Countess on her post; once paid she is up at the nest, which is already on the list
        if (!st.has('magpieFooled')) pts.push(() => ({ x: 1287, y: 710 }));   // over the second leaf, while it is still lying on the grass
        return U.pick(pts);
      });

      // ---------- the Countess swoop hazard ----------
      // Her half of the garden is everything past her post. She lets him stand at the leaf and at her own feet, but a few
      // steps taken beyond the post and she has him — whether he is walking up from the water or has just come back out
      // of the flowerbed corner, which is why it counts from wherever he last set foot on this side.
      let swooping = false, caught = 0, lastX = null;
      api.tick(() => {
        if (api.hero.plat !== 'yard' || !api.hero.attached) { caught = 0; lastX = null; return; }
        if (lastX == null) lastX = api.hero.x;
        const moved = Math.abs(api.hero.x - lastX);
        lastX = api.hero.x;
        if (swooping || magpieGone() || st.has('magpieFooled')) return;
        if (CH.engine.locked || CH.engine._respawning) return;
        // out on her side of the post she has seen him, and a few steps later she has him. It counts his steps, not the
        // seconds: standing still where he came out of the flowerbed corner is safe, walking anywhere from there is not,
        // and turning back does not help either — which is why the count runs on once it has started
        if (api.hero.x > 1450) caught = 999;   // just back out of the flowerbed corner, at the far edge of her half: she has him at once
        else if (api.hero.x > POST_X - 40 || caught > 0) caught += moved;
        if (caught > 110) { swooping = true; swoop(); }
      });
      async function swoop() {
        CH.engine.lock(true);
        CH.engine.walkToken++;
        CH.audio.sfx('swoosh');
        CH.audio.sfx('chirp');
        magpie.fly(true);                                  // wings out, legs tucked, facing the way she flies
        const hx = api.hero.x, hy = api.hero.y;
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 500, group: 'scene', ease: CH.tw.ease.quadIn,
          onUpdate: (k, o) => magpie.setPos(U.lerp(POST_X, hx, o.t), U.lerp(537, hy - 40, o.t)),
        });
        CH.audio.sfx('pop', 1.3);
        api.cam.bump(0.5);
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 900, group: 'scene', ease: CH.tw.ease.quadInOut,
          onUpdate: (k, o) => {
            const x = U.lerp(hx, 440, o.t), y = U.lerp(hy - 40, 700, o.t) - Math.sin(o.t * Math.PI) * 160;
            magpie.setPos(x, y);
            api.hero.place(x, y + 44);
          },
        });
        api.hero.place(440, 800, 'ground');
        CH.audio.sfx('thud');
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 800, group: 'scene', ease: CH.tw.ease.quadInOut,
          onUpdate: (k, o) => magpie.setPos(U.lerp(440, POST_X, o.t), U.lerp(660, 537, o.t) - Math.sin(o.t * Math.PI) * 60),
        });
        magpie.fly(false);                                 // back on the post: wings folded
        magpie.face(-1);
        await api.hero.dizzy(800);
        await api.think('c5.magpie.dropped');
        await api.think('c5.bed.magpie');
        CH.engine.lock(false);
        swooping = false;
      }

      // ================= hotspots =================

      api.hot(porchG, {
        id: 'g.porch',
        near: { x: 460, plat: 'ground' },
        act: async () => { await api.think('c5.porch.look'); },
      });

      api.hot(snailG, {
        id: 'g.snail',
        near: null,
        act: async () => {
          const n = st.bumpClick('g.snail');
          if (n === 1) await api.think('c5.snail.look');
          else await api.think('c5.snail.race');
        },
      });

      api.hot(canG, {
        id: 'g.can',
        near: { x: 520, plat: 'ground' },
        act: async () => { await api.think('c5.can.look'); },
      });

      api.hot(leafG, {
        id: 'g.leaf',
        near: { x: 480, plat: 'ground' },
        active: () => !!leafG.parent,
        act: async () => {
          api.sfx('paper');
          st.give('leaf');
          main.remove(leafG);
          await api.think('c5.leaf.take');
        },
      });

      const puddleTalk = async () => {
        const n = st.bumpClick('g.puddle');
        if (n === 1) { await api.think('c5.puddle.look'); }
        else { await api.think('c5.puddle.fear'); }
      };
      cross = async () => {
        if (!st.has('leafBoat')) { await puddleTalk(); return false; }
        if (boatDrift) { await api.think('c5.boat.drifting'); return false; }   // the leaf is still on its way over
        await sail();
        return true;
      };
      const shore = () => (api.hero.x < 900 ? { x: 660, plat: 'ground' } : { x: 1180, plat: 'yard' });
      api.hot(puddleG, {
        id: 'g.puddle',
        near: null,
        act: async () => {
          const s = shore();
          if (!(await api.walkTo(s.x, s.plat))) return;
          if (st.has('leafBoat')) { if (boatDrift) { await api.think('c5.boat.drifting'); return; } await sail(); return; }
          await puddleTalk();
        },
        item: {
          leaf: async () => {
            if (!(await api.walkTo(660, 'ground'))) return;
            st.take('leaf');
            st.flag('leafBoat');
            api.sfx('paper');
            boatG.visible = true;
            await api.think('c5.boat.launch');
            await sail();
          },
        },
      });
      async function sail() {
        const fromLeft = api.hero.x < 900;
        // under way he rides it like a board: the leading edge up, the trailing one cutting the water. The leaf floats
        // right-end-down by about eleven degrees of its own (the model is laid flat with a twist in it), so level is -11
        // and the heel is that much again either side of it — drifting on the wind it keeps its own lie, nose down.
        const heel = fromLeft ? -22 : 0, heel0 = boatHeel;   // it tips over to the new lie under his weight as he lands, not when he steps off
        sailing = true;
        await api.cut(async (ctx) => {
          const x0 = fromLeft ? 690 : 1150, x1 = fromLeft ? 1150 : 690;
          await ctx.run(api.hero.rollTo(x0, () => true));
          ctx.sfx('boing', 0.9);
          // the leaf takes off the moment he lands: we wait out the hop's arc only, and the landing squash (320ms of it,
          // scale, no movement) plays on while the leaf is already sliding away under him
          const hop = api.hero.hopTo(fromLeft ? 740 : 1090, 778, { h: 60, dur: 400 });
          await ctx.w(420);
          ctx.sfx('drip');
          loseLeaf();   // whatever he was hiding under goes over the side as the leaf takes off
          // it goes off at speed the instant he lands and coasts to the far shore — easing in from a standstill read as
          // a pause after the jump, which is the one thing a skimboard never does
          await ctx.tw({ t: 0 }, { t: 1 }, {
            dur: 1400, ease: CH.tw.ease.cubicOut,
            onUpdate: (k, o) => {
              const bx = U.lerp(fromLeft ? 740 : 1090, (x0 + x1) / 2, Math.min(1, o.t * 2));
              const bx2 = o.t < 0.5 ? bx : U.lerp((x0 + x1) / 2, x1 > x0 ? 1090 : 740, (o.t - 0.5) * 2);
              api.hero.place(bx2, 780 + Math.sin(o.t * 9) * 4);
              K.tr(boatG, { x: bx2, y: 796 + Math.sin(o.t * 9) * 3, z: -10, r: U.lerp(heel0, heel, Math.min(1, o.t * 6)) + Math.sin(o.t * 9) * 2 });
            },
          });
          await hop;   // long finished; awaited so nothing is left running behind the cutscene
          ctx.sfx('boing', 1.1);
          await ctx.run(api.hero.hopTo(x1, 800, { h: 50, dur: 380 }));
          boatX = fromLeft ? 1090 : 740;                                              // and the leaf stays at the far shore, lying as it arrived
          boatHeel = heel;
          st.flag('boatRight', fromLeft);
          K.tr(boatG, { x: boatX, y: 796, z: -10 });
        }, { cinema: false, skippable: false });
        sailing = false;
        api.hero.plat = fromLeft ? 'yard' : 'ground';
        if (!st.has('sailedOnce')) {
          st.flag('sailedOnce');
          await api.think('c5.boat.sailed');
        }
      }

      api.hot(leaf2G, {
        id: 'g.leaf2',
        near: { x: 1212, plat: 'yard' },   // he stops beside the leaf, not on top of it
        active: () => !st.has('magpieFooled') && !magpieGone(),
        act: async () => {
          const n = st.bumpClick('g.leaf2');
          if (n === 1) { await api.think('c5.leaf2.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(1262, () => true));
            ctx.sfx('paper');
            leaf2G.visible = false;
            wearLeaf();
            const o = { x: 1262 };
            await ctx.think('c5.leaf2.hide', { at: { x: o.x, y: api.hero.y - 152, z: 0 } });   // the bubble sits above the leaf he holds over his head (its top is around y - 135), not on it
            await ctx.tw(o, { x: 1362 }, {
              dur: 3200, ease: CH.tw.ease.linear,
              onUpdate: () => { api.hero.place(o.x, 800); api.hero.A.bounce = Math.abs(Math.sin(o.x / 12)) * 3; },
            });
            api.hero.A.bounce = 0;
            ctx.sfx('chirp');
            await ctx.say('magpie', 'c5.magpie.confused');
          }, { cinema: false, skippable: false });
          st.flag('magpieFooled');
          await api.think('c5.leaf2.made');
          api.toast('c5.sneak.toast');
        },
      });

      api.hot(magpie.el, {
        id: 'g.magpie',
        near: { x: 1260, plat: 'yard' },
        active: () => !magpieGone(),
        act: async () => {
          const n = st.bumpClick('g.magpie');
          if (n === 1) { await api.say('magpie', 'c5.magpie.hello'); await api.think('c5.magpie.look'); }
          else { await api.think('c5.magpie.shiny'); if (st.hasItem('cap')) api.toast('c5.magpie.toast'); }
        },
        item: {
          cap: async () => {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(990, 700));
              st.take('cap');
              ctx.sfx('coin');
              await ctx.say('magpie', 'c5.magpie.ooo');
              ctx.sfx('swoosh');
              magpie.fly(true);
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 1100, ease: CH.tw.ease.quadInOut,
                onUpdate: (k, o) => magpie.setPos(U.lerp(POST_X, NEST_X, o.t), U.lerp(537, 486, o.t) - Math.sin(o.t * Math.PI) * 120),
              });
              magpie.fly(false);
              magpie.face(-1);
              await ctx.say('magpie', 'c5.magpie.paid');
            }, { cinema: false, skippable: false });
            st.flag('magpieBribed');
            await api.think('c5.magpie.deal');
          },
          '*': async () => { await api.say('magpie', 'c5.magpie.no'); },
        },
      });

      // ---------- on along the fence, to the flowerbed corner ----------
      // the mark rides the screen's own edge, like every other scene's. The tree stands in this corner, but the mark is
      // far in front of it (z 40 against the trunk's -140), so it draws over the trunk instead of disappearing behind it
      // when the mouse parallax slides the tree across the frame
      const pathMark = P.exitMark(api, 1594, 700, 'right', 40, { margin: 44, pad: true });
      api.hot(pathMark.pad, {
        id: 'g.path',
        near: { x: 1470, plat: 'yard' },   // she swoops on him long before this, unless she has been paid or fooled
        act: async () => {
          if (!magpieGone() && !st.has('magpieFooled')) { await api.think('c5.bed.magpie'); return; }
          await api.cut(async (ctx) => { await ctx.run(api.hero.rollTo(1510, () => true)); }, { cinema: false, skippable: false });
          await api.go('gardenBed', 'fromGarden');
          // only now: he is standing at the far right of her half, and dropping the disguise a frame before the scene
          // changes would have her snatch him off the edge of his own way out
          st.flag('magpieFooled', false);   // the leaf stays behind in her garden: come back and it lies under her post again, and she is watching again
        },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('gardenFirst')) {
        st.flag('gardenFirst');
        api.cut(async (ctx) => {
          await ctx.w(500);
          await ctx.run(api.hero.landSquash());
          await ctx.think('c5.garden1');
          await ctx.run(api.hero.lookAround());
          await ctx.think('c5.garden2');
        }, { cinema: false });
      }
    },
  });
  // ================================================================ the flowerbed corner
  // The same garden a few steps further along: the fence and the lawn run on, and at the end of them, with room to
  // spare, the flowerbed waits — the gnome keeping watch a little way off, the worm out on the open grass.
  CH.defScene('gardenBed', {
    chapter: 7,
    pageBg: '#0d1420',
    bg: '#0b111c',
    fogNear: 22, fogFar: 60,
    ambient: [],
    fill: 1.9, ambient2: 0.8, skyLight: '#4a5a8a', groundLight: '#1a2414',
    shadowBox: { lo: [-15, -5, -11], hi: [15, 5.1, 5] },   // out to the fence, and the width of the frame back there
    camera: { x: 800, y: 380, z: 1590, tx: 800, ty: 470, follow: 0.08, parallax: 1.2 },

    platforms: [
      { id: 'ground', x1: 120, x2: 1380, y: 800 },
    ],
    links: [],
    spots: {
      fromGarden: { x: 250, plat: 'ground' },
    },

    build(api) {
      const st = api.state;
      const mid = api.layers.mid, main = api.layers.main;
      const P = CH.props;

      nightSky(api, -640);   // we have walked right: the moon has swung back over our shoulder, off the left of the frame
      lawn(api, (x, z) => x > 1020 && x < 1380 && z > -150 && z < 30);   // no tufts standing in the turned soil
      fence(api);
      breeze(api);
      ambientFlies(api);

      // ---------- the way back, along the fence to the puddle ----------
      const backMark = P.exitMark(api, 60, 700, 'left', 40, { margin: 44, pad: true });

      // ---------- red herring: the downstairs neighbour, out on the open grass ----------
      const wormG = K.g(main, { z: 165 });
      const worm = CH.models.worm(wormG, { s: 1.3 });
      K.pad(-24, -34, 48, 38, wormG, { d: 30 });
      K.tr(wormG, { x: 430, y: 800, z: 165 });   // well out in front of the walking line, with the whole lawn to himself
      worm.rise(0.25);   // at rest only his head is up out of the heap: he sits low in the ground, not squashed flat

      // ---------- garden gnome, keeping watch over the corner ----------
      const gnomeG = K.g(mid, { z: -100 });
      CH.models.gnome(gnomeG, 820, 800, 0);   // a good few steps short of the bed: nothing out here is crowded
      const gnomeSockG = CH.models.gnomeSock(gnomeG.children[0]);
      gnomeSockG.visible = st.has('gnomeSock');

      // ---------- the flowerbed ----------
      const bedG = K.g(main, { z: -60 });
      const soil1 = K.cut(K.ellipseShape(0, 0, 160, 70), K.mat('#241a10', { rough: 1 }), bedG, { rx: 90 });
      K.tr(soil1, { x: 1200, y: 799.5, z: 0, rx: 90 });
      K.ellipsoid(1200, 800, 140, 10, 54, K.mat('#31220f', { rough: 1 }), bedG);
      // sleeping tulips
      [[1110, 790, -20], [1290, 792, -10], [1165, 800, 30], [1250, 804, 26]].forEach((t, i) => {
        const tg = K.g(bedG, { x: t[0], y: t[1], z: t[2], s: U.rand(0.8, 1.1) });
        K.tube([[0, 0, 0], [-3, -20, 0], [3, -34, 0], [0, -46, 0]], 2, K.mat('#3f6b35', { rough: 0.9 }), tg, { seg: 8, radial: 5 });
        K.ellipsoid(0, -54, 8, 11, 8, K.mat(i % 2 ? '#8a4a6a' : '#a85a4a', { rough: 0.8 }), tg);
      });
      K.glow(bedG, 1200, 780, 10, 120, '#8aa86a', 0.1);
      K.pad(1040, 720, 320, 90, bedG, { d: 160 });

      // the same rule as the puddle half of the garden: each point is the centre of the loop the firefly flies, a good
      // head's height above its subject (the gnome's hat tip is at 628, the worm's head at 766)
      driftFlies(api, () => {
        const pts = [() => ({ x: CH.hero.x, y: CH.hero.y - 125 }), () => ({ x: 820, y: 583 }), () => ({ x: 430, y: 722 })];
        return U.pick(pts);
      });

      // ================= hotspots =================

      api.hot(backMark.pad, {
        id: 'g.back',
        near: { x: 190, plat: 'ground' },
        act: async () => {
          await api.cut(async (ctx) => { await ctx.run(api.hero.rollTo(130, () => true)); }, { cinema: false, skippable: false });
          await api.go('garden', 'fromBed');
        },
      });

      api.hot(wormG, {
        id: 'g.worm',
        near: { x: 520, plat: 'ground' },   // beside his heap, not on it
        act: async () => {
          await api.cut(async (ctx) => {
            ctx.sfx('squeak', 0.6);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 400, ease: CH.tw.ease.backOut,
              onUpdate: (k, o) => worm.rise(0.25 + o.t * 0.75),
            });
            await ctx.w(700);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 350, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => worm.rise(1 - o.t * 0.75),
            });
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('g.worm') % 2 ? 'sd.worm.hi' : 'sd.worm.shy');
        },
      });

      api.hot(gnomeG, {
        id: 'g.gnome',
        near: { x: 770, plat: 'ground' },
        act: async () => {
          if (st.has('gnomeSock')) { await api.think('sd.gnome.stylish'); return; }
          const n = st.bumpClick('g.gnome');
          if (n === 1) await api.think('c5.gnome.look');
          else if (n === 2) await api.think('c5.gnome.stare');
          else await api.think('c5.gnome.friend');
        },
        item: {
          sock: async () => {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(806, 660));
              ctx.sfx('boing', 1.1);
              gnomeSockG.visible = true;
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, ease: CH.tw.ease.bounceOut,
                onUpdate: (k, o) => { K.tr(gnomeSockG, { y: -30 * (1 - o.t) }); },
              });
              await ctx.w(600);
            }, { cinema: false, skippable: false });
            st.take('sock');
            st.flag('gnomeSock');
            await api.think('sd.gnome.sock');
          },
        },
      });

      // ---------- THE FLOWERBED — the end of the journey ----------
      api.hot(bedG, {
        id: 'g.bed',
        near: { x: 1090, plat: 'ground' },
        act: async () => {
          const n = st.bumpClick('g.bed');
          if (n === 1) { await api.think('c5.bed.here'); api.toast('c5.bed.toast'); return; }
          await finale();
        },
      });

      async function finale() {
        st.flag('planted');
        await api.cut(async (ctx) => {
          await ctx.run(api.hero.rollTo(1200, () => true));
          api.hero.face(-1);
          await ctx.w(400);
          await ctx.run(api.hero.lookAround());
          await ctx.think('c5.end.here');
          await ctx.think('c5.end.thanks');
          ctx.sfx('slide', false);
          await ctx.tw({ t: 0 }, { t: 1 }, {
            dur: 1200, ease: CH.tw.ease.quadInOut,
            onUpdate: (k, o) => { api.hero.place(1200, 800 + o.t * 34); },
          });
          CH.props.dust(api, 1200, 800, 6);
          api.hero.A.tailTx = -10; api.hero.A.tailTy = -70;
          for (let i = 0; i < 3; i++) {
            await ctx.tw(api.hero.A, { tailCurl: 0.6 }, { dur: 240 });
            await ctx.tw(api.hero.A, { tailCurl: 1.6 }, { dur: 240 });
          }
          api.hero.A.tailTx = null; api.hero.A.tailTy = null;
          await ctx.run(api.hero.slowBlink());
          const rainStop = CH.fx.rain(api.layers.fx, 46);
          const rainLoop = CH.audio.loop('rain');
          await ctx.w(2200);
          await ctx.think('c5.end.rain');
          await ctx.w(1600);
          rainLoop.stop();
          rainStop();
        }, { cinema: true, skippable: false });

        await CH.epilogue();
      }
    },
  });
})();
