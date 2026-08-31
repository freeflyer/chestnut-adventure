/* Chapter 5 — the garden: the puddle, the Countess, the flowerbed… and the ending. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  let cross = null;

  CH.defScene('garden', {
    chapter: 7,
    pageBg: '#0d1420',
    bg: '#0b111c',
    fogNear: 22, fogFar: 60,
    ambient: [],
    fill: 1.9, ambient2: 0.8, skyLight: '#4a5a8a', groundLight: '#1a2414',
    camera: { x: 800, y: 380, z: 1590, tx: 800, ty: 470, follow: 0.08, parallax: 1.2 },

    platforms: [
      { id: 'ground', x1: 150, x2: 600, y: 800 },
      { id: 'yard', x1: 1150, x2: 1520, y: 800 },
    ],
    links: [
      { a: 'ground', b: 'yard', ax: 590, bx: 1150, type: 'custom', run: () => cross() },
    ],
    spots: {
      enter: { x: 460, plat: 'ground' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fx, L = api.layers.lights;
      const P = CH.props;

      // night sky
      const skyTex = K.canvasTex(64, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0d1226'); g.addColorStop(0.55, '#1b2642'); g.addColorStop(0.85, '#2c3145'); g.addColorStop(1, '#3a3844');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      const sky = K.vplane(-3000, 6000, -1800, 1400, -2600, new T.MeshBasicMaterial({ map: skyTex, fog: false }), far);
      sky.scale.y = -1; sky.userData.__disposeTex = skyTex;
      for (let i = 0; i < 56; i++) K.glow(far, U.rand(-1000, 3000), U.rand(-900, 500), -2500, U.rand(5, 12), '#e8ecff', U.rand(0.3, 0.8));
      P.moon(far, 320, 100, 80, { z: -2400, sky: '#141b30' });
      K.sun(L, 300, -300, -600, '#9db8d8', 2.6, { tx: 800, ty: 800, tz: 0, shadow: true, size: 1500 });

      // distant treeline — the big world
      K.ext('M -800 620 Q 200 520 420 600 Q 560 480 760 590 Q 980 470 1200 585 Q 1400 500 2600 600 L 2600 900 L -800 900 Z', 60, K.mat('#131a26', { rough: 1, fog: false }), far, { z: -1400, bevel: 0 });
      // her nest on the treeline — where shinies go

      // ground: a lawn rolling from the fence to our feet
      const grassMat = new T.MeshStandardMaterial({ map: K.canvasTex(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#25301e'; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) { ctx.fillStyle = Math.random() < 0.5 ? 'rgba(60,90,40,0.5)' : 'rgba(10,18,8,0.5)'; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 5); }
      }, { repeat: [10, 5] }), roughness: 1 });
      K.hplane(-1500, 3200, 800, -1400, 500, grassMat, far);
      // a few tufts of grass around the walking line
      const tuft = K.mat('#2f4a24', { rough: 1, side: 'double' });
      for (let i = 0; i < 40; i++) {
        const gx = U.rand(100, 1550), gz = U.rand(-260, 160), h = U.rand(14, 30);
        if (gx > 580 && gx < 1150 && gz > -110) continue; // not in the puddle
        K.cut(`M -3 0 Q ${U.rand(-6, 2)} ${-h * 0.6} ${U.rand(-6, 6)} ${-h} Q ${U.rand(1, 5)} ${-h * 0.5} 3 0 Z`, tuft, mid, { x: gx, y: 800, z: gz, ry: U.rand(-50, 50) });
      }
      // fence along the back
      for (let i = 0; i < 14; i++) K.rbox(-140 + i * 150, 620, 16, 100, 16, 4, '#242030', far, { z: -520 });
      K.box(-200, 640, 2200, 10, 10, '#242030', far, { z: -520 });

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
      K.box(-170, 742, 520, 58, 416, K.mat('#4a4650', { rough: 0.95 }), mid, { z: -542 });
      K.box(-176, 740, 532, 6, 428, K.mat('#5e5a66', { rough: 0.9 }), mid, { z: -542 });   // its lighter capping course
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
      [[360, 30], [510, 76], [1235, 128]].forEach((p) => {
        const s = K.cut(K.ellipseShape(0, 0, 70, 36), K.mat('#3c4048', { rough: 1 }), far, { rx: 90 });
        K.tr(s, { x: p[0], y: 799.4, z: p[1], rx: 90 });
      });

      // ---------- the puddle ----------
      const puddleG = K.g(mid);
      const water = new T.MeshPhysicalMaterial({ color: new T.Color('#2a4058'), roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, transparent: true, opacity: 0.92 });
      const pud = K.cut(K.blobShape([[-150, 0], [-40, -70], [130, -80], [280, -36], [380, 20], [290, 100], [110, 118], [-80, 90]]), water, puddleG, { rx: 90 });
      K.tr(pud, { x: 750, y: 799, z: -10, rx: 90 });
      pud.castShadow = false;
      const shimmer = K.glow(puddleG, 865, 792, -10, 48, '#e8ecff', 0.3);
      shimmer.scale.set(200, 22, 1);                                          // the moon, smeared across the water
      // a couple of rings where the last drops fell
      K.torus(760, 798.6, 40, 1.2, K.mat('#9fb8cc', { rough: 0.6, opacity: 0.35 }), puddleG, { rx: 90, z: -20 });
      K.torus(1040, 798.6, 28, 1.2, K.mat('#9fb8cc', { rough: 0.6, opacity: 0.35 }), puddleG, { rx: 90, z: 46 });
      K.pad(586, 690, 524, 140, puddleG, { d: 200, z: -10 });   // stops short of the second leaf, so the leaf stays clickable
      let sh = 0;
      api.tick((dt) => { sh += dt; shimmer.material.opacity = 0.14 + 0.12 * (Math.sin(sh * 2.2) + 1) / 2; });
      // toppled watering can
      const canG = K.g(mid, { x: 580, y: 790, z: -80, r: 14 });
      const tin = K.mat('#5a7d6d', { rough: 0.5, metal: 0.3 });
      K.cylUp(0, 22, 32, 44, tin, canG, { rTop: 38, seg: 24 });
      K.torus(0, -22, 34, 4, K.mat('#4d6c5e', { rough: 0.5, metal: 0.3 }), canG, { rx: 90 });
      K.tube([[-30, 0, 0], [-56, 6, 0], [-76, 14, 0]], 5, K.mat('#4d6c5e', { rough: 0.5, metal: 0.3 }), canG, { seg: 8 });
      K.torus(24, -6, 18, 3, tin, canG, { ry: 90 });
      K.pad(-40, -30, 90, 60, canG, { d: 70 });

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
      let boatX = st.has('boatRight') ? 1090 : 640;                                   // it waits at the shore it was left on
      K.tr(boatG, { x: boatX, y: 796, z: -10 });
      boatG.visible = leafOnWater;
      // when the leaf is left on the far shore (the Countess dropped him back on the near one), the wind pushes it
      // slowly back across the puddle, rocking; until it arrives there is nothing to cross on
      let boatT = 0, boatDrift = null, sailing = false;
      const DRIFT_SPEED = 22;   // px per second — the puddle takes about twenty seconds
      const startDrift = (to) => { if (boatDrift !== to && Math.abs(boatX - to) > 1) boatDrift = to; };
      api.tick((dt) => {
        if (!boatG.visible || sailing) return;
        boatT += dt;
        if (!boatDrift && api.hero.attached && !CH.engine.locked) {
          const heroLeft = api.hero.plat === 'ground', boatLeft = boatX < 900;
          if (heroLeft !== boatLeft) startDrift(heroLeft ? 640 : 1090);
        }
        if (boatDrift) {
          const dir = boatDrift > boatX ? 1 : -1;
          boatX += dir * DRIFT_SPEED * dt;
          if ((dir > 0 && boatX >= boatDrift) || (dir < 0 && boatX <= boatDrift)) { boatX = boatDrift; boatDrift = null; st.flag('boatRight', boatX > 900); }
          K.tr(boatG, { x: boatX, y: 796 + Math.sin(boatT * 2.6) * 3, z: -10, r: Math.sin(boatT * 2.2) * 5 + Math.sin(boatT * 5.1) * 1.5 });   // gusted along, rocking
        } else {
          K.tr(boatG, { x: boatX, y: 796 + Math.sin(boatT * 1.8) * 2, z: -10, r: Math.sin(boatT * 1.3) * 2 });
        }
      });

      // the second leaf (the disguise), past the puddle, lying flat
      const leaf2G = K.g(main);
      CH.models.leaf(leaf2G, { s: 1.15, rx: 84, r: 40 });
      K.tr(leaf2G, { x: 1205, y: 797, z: -30 });
      K.pad(-52, -34, 104, 50, leaf2G, { d: 90 });   // lying flat, the leaf itself is a sliver to click: this upright pad is the target (kept low, off the gnome behind it)

      // garden gnome, keeping watch beside the flowerbed
      const gnomeG = K.g(mid, { z: -100 });
      CH.models.gnome(gnomeG, 1226, 800, 0);
      const gnomeSockG = CH.models.gnomeSock(gnomeG.children[0]);
      gnomeSockG.visible = st.has('gnomeSock');

      // a snail on the path
      const snailG = K.g(main, { z: 60 });
      CH.models.snail(snailG);
      let snailX = 430, snailDir = 1;
      api.tick((dt) => {
        snailX += dt * 1.6 * snailDir;
        if (snailX > 450) { snailX = 450; snailDir = -1; }                              // turn back short of the leaf by the can, so the snail never sits on the click that takes it
        if (snailX < 190) { snailX = 190; snailDir = 1; }
        K.tr(snailG, { x: snailX, y: 806, z: 60, sx: 1.4 * snailDir, sy: 1.4, sz: 1.4 });
      });

      // ---------- the fence post + the Countess ----------
      const postG = K.g(mid, { z: -140 });
      K.rbox(1150, 560, 20, 160, 20, 5, '#2c2838', postG);
      K.sphere(1160, 552, 14, K.mat('#332e42', { rough: 0.8 }), postG);
      // a bare tree at the fence corner holds her nest, at her own depth, where she actually flies to
      const treeG = K.g(mid, { z: -140 });
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
      const magpie = CH.actors.magpie(K.g(main, { z: -140 }), 1160, 537, 1);   // her feet on top of the post knob (its top is at 537 this deep)
      K.point(L, 1120, 500, -30, '#9db8d8', 2.2, 500, { decay: 1.6 });      // moonlight catching the Countess on her post
      magpie.face(-1);
      api.anchor('magpie', magpie.anchor);
      const magpieGone = () => st.has('magpieBribed');

      // ---------- the flowerbed ----------
      const bedG = K.g(main, { z: -60 });
      const soil1 = K.cut(K.ellipseShape(0, 0, 160, 70), K.mat('#241a10', { rough: 1 }), bedG, { rx: 90 });
      K.tr(soil1, { x: 1420, y: 799.5, z: 0, rx: 90 });
      K.ellipsoid(1420, 800, 140, 10, 54, K.mat('#31220f', { rough: 1 }), bedG);
      // sleeping tulips
      [[1330, 790, -20], [1510, 792, -10], [1385, 800, 30], [1470, 804, 26]].forEach((t, i) => {
        const tg = K.g(bedG, { x: t[0], y: t[1], z: t[2], s: U.rand(0.8, 1.1) });
        K.tube([[0, 0, 0], [-3, -20, 0], [3, -34, 0], [0, -46, 0]], 2, K.mat('#3f6b35', { rough: 0.9 }), tg, { seg: 8, radial: 5 });
        K.ellipsoid(0, -54, 8, 11, 8, K.mat(i % 2 ? '#8a4a6a' : '#a85a4a', { rough: 0.8 }), tg);
      });
      K.glow(bedG, 1420, 780, 10, 120, '#8aa86a', 0.1);
      K.pad(1260, 720, 320, 90, bedG, { d: 160 });

      // fireflies
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

      // ---------- the Countess swoop hazard ----------
      let swooping = false;
      api.tick(() => {
        if (swooping || magpieGone() || st.has('magpieFooled')) return;
        if (CH.engine.locked || CH.engine._respawning || !api.hero.attached) return;
        if (api.hero.x > 1270 && api.hero.plat === 'yard') {
          swooping = true;
          swoop();
        }
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
          onUpdate: (k, o) => magpie.setPos(U.lerp(1160, hx, o.t), U.lerp(537, hy - 40, o.t)),
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
          onUpdate: (k, o) => magpie.setPos(U.lerp(440, 1160, o.t), U.lerp(660, 537, o.t) - Math.sin(o.t * Math.PI) * 60),
        });
        magpie.fly(false);                                 // back on the post: wings folded
        magpie.face(-1);
        await api.hero.dizzy(800);
        await api.think('c5.magpie.dropped');
        await api.think('c5.bed.magpie');
        CH.engine.lock(false);
        swooping = false;
      }

      // ---------- fireflies of the garden: one or two at a time drift in from off an edge, wander low and slow, linger a while
      //            over whoever is out here (him, the gnome, the snail, the Countess), and drift off the other way ----------
      {
        const FWARM = '#ffcf7a';
        const flies = [];
        let nextIn = U.rand(4, 9);
        const interest = () => {   // a spot to hang over, given live so it follows whoever moves
          const pts = [() => ({ x: CH.hero.x, y: CH.hero.y - 96 }), () => ({ x: 1226, y: 690 }), () => ({ x: snailX, y: 756 })];
          if (!magpieGone()) pts.push(() => ({ x: 1160, y: 500 }));
          return U.pick(pts);
        };
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
                  if (Math.random() < 0.7) { fl.state = 'linger'; fl.spot = interest(); fl.until = U.rand(4, 7); }
                  else { fl.state = 'leave'; fl.tx = fl.dir > 0 ? 1740 : -140; fl.ty = U.rand(600, 740); fl.until = 40; }
                } else if (Math.random() < 0.3) { fl.state = 'hover'; fl.tx = fl.x + fl.dir * U.rand(120, 220); fl.ty = U.rand(430, 520); fl.until = U.rand(2.5, 4); }   // up to fence-top height or a little above, for a moment
                else { fl.tx = fl.x + fl.dir * U.rand(220, 360); fl.ty = U.rand(600, 750); fl.until = U.rand(3.5, 6); }
              }
            } else if (fl.state === 'hover') {
              fl.ty += Math.sin(fl.t * 1.1) * 0.25;   // hanging there, drifting a little
              if (fl.until <= 0) { fl.state = 'cross'; fl.tx = fl.x + fl.dir * U.rand(200, 320); fl.ty = U.rand(600, 750); fl.until = U.rand(3.5, 6); }
            } else if (fl.state === 'linger') {
              const p = fl.spot();
              fl.ang += dt * 1.25;   // one slow loop in about five seconds
              fl.tx = p.x + Math.cos(fl.ang) * 30; fl.ty = p.y - 22 + Math.sin(fl.ang) * 12;
              if (fl.until <= 0) { fl.state = 'leave'; fl.tx = fl.dir > 0 ? 1740 : -140; fl.ty = U.rand(600, 740); fl.until = 40; }
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

      // ================= hotspots =================

      api.hot(porchG, {
        id: 'g.porch',
        near: { x: 460, plat: 'ground' },
        act: async () => { await api.think('c5.porch.look'); },
      });

      api.hot(gnomeG, {
        id: 'g.gnome',
        near: { x: 1180, plat: 'yard' },
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
              await ctx.run(api.hero.tailWhip(1212, 660));
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

      // ---------- red herring: the downstairs neighbour ----------
      const wormG = K.g(main, { z: 40 });
      CH.models.worm(wormG);
      K.pad(-18, -20, 36, 24, wormG, { d: 30 });
      K.tr(wormG, { x: 1215, y: 800, z: 40, sy: 0.25 });
      api.hot(wormG, {
        id: 'g.worm',
        near: { x: 1240, plat: 'yard' },
        act: async () => {
          await api.cut(async (ctx) => {
            ctx.sfx('squeak', 0.6);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 400, ease: CH.tw.ease.backOut,
              onUpdate: (k, o) => K.tr(wormG, { x: 1215, y: 800, sy: 0.25 + o.t * 0.75 }),
            });
            await ctx.w(700);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 350, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => K.tr(wormG, { x: 1215, y: 800, sy: 1 - o.t * 0.75 }),
            });
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('g.worm') % 2 ? 'sd.worm.hi' : 'sd.worm.shy');
        },
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
        else { await api.think('c5.puddle.fear'); api.toast('c5.puddle.toast'); }
      };
      cross = async () => {
        if (!st.has('leafBoat')) { await puddleTalk(); return false; }
        if (boatDrift) { await api.think('c5.boat.drifting'); return false; }   // the leaf is still on its way over
        await sail();
        return true;
      };
      const shore = () => (api.hero.x < 900 ? { x: 560, plat: 'ground' } : { x: 1180, plat: 'yard' });
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
            if (!(await api.walkTo(560, 'ground'))) return;
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
        sailing = true;
        await api.cut(async (ctx) => {
          const x0 = fromLeft ? 590 : 1150, x1 = fromLeft ? 1150 : 590;
          await ctx.run(api.hero.rollTo(x0, () => true));
          ctx.sfx('boing', 0.9);
          await ctx.run(api.hero.hopTo(fromLeft ? 640 : 1090, 778, { h: 60, dur: 400 }));
          ctx.sfx('drip');
          await ctx.w(300);
          await ctx.tw({ t: 0 }, { t: 1 }, {
            dur: 1400, ease: CH.tw.ease.quadInOut,
            onUpdate: (k, o) => {
              const bx = U.lerp(fromLeft ? 640 : 1090, (x0 + x1) / 2, Math.min(1, o.t * 2));
              const bx2 = o.t < 0.5 ? bx : U.lerp((x0 + x1) / 2, x1 > x0 ? 1090 : 640, (o.t - 0.5) * 2);
              api.hero.place(bx2, 780 + Math.sin(o.t * 9) * 4);
              K.tr(boatG, { x: bx2, y: 796 + Math.sin(o.t * 9) * 3, z: -10 });
            },
          });
          ctx.sfx('boing', 1.1);
          await ctx.run(api.hero.hopTo(x1, 800, { h: 50, dur: 380 }));
          boatX = fromLeft ? 1090 : 640;                                              // and the leaf stays at the far shore
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
        near: { x: 1150, plat: 'yard' },   // he stops beside the leaf, not on top of it
        active: () => !st.has('magpieFooled') && !magpieGone(),
        act: async () => {
          const n = st.bumpClick('g.leaf2');
          if (n === 1) { await api.think('c5.leaf2.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(1200, () => true));
            ctx.sfx('paper');
            leaf2G.visible = false;
            const hat = K.g(main, { z: 10 });
            CH.models.leaf(hat, { s: 1.15, rx: 68 });   // held flat above him, its blade turned down at him
            const o = { x: 1200 };
            const placeHat = () => K.tr(hat, { x: o.x, y: api.hero.y - 114, z: 10, r: Math.sin(o.x / 30) * 4 });   // clear above his head and his spikes (his top is at y - 80)
            placeHat();
            const un = api.tick(placeHat);
            await ctx.think('c5.leaf2.hide');
            await ctx.tw(o, { x: 1300 }, {
              dur: 3200, ease: CH.tw.ease.linear,
              onUpdate: () => { api.hero.place(o.x, 800); api.hero.A.bounce = Math.abs(Math.sin(o.x / 12)) * 3; },
            });
            un();
            hat.parent.remove(hat);
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
        near: { x: 1200, plat: 'yard' },
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
                onUpdate: (k, o) => magpie.setPos(U.lerp(1160, 1420, o.t), U.lerp(537, 486, o.t) - Math.sin(o.t * Math.PI) * 120),
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

      // ---------- THE FLOWERBED — the end of the journey ----------
      api.hot(bedG, {
        id: 'g.bed',
        near: { x: 1310, plat: 'yard' },
        act: async () => {
          if (!magpieGone() && !st.has('magpieFooled')) {
            await api.think('c5.bed.magpie');
            return;
          }
          const n = st.bumpClick('g.bed');
          if (n === 1) { await api.think('c5.bed.here'); api.toast('c5.bed.toast'); return; }
          await finale();
        },
      });

      async function finale() {
        st.flag('planted');
        await api.cut(async (ctx) => {
          await ctx.run(api.hero.rollTo(1420, () => true));
          api.hero.face(-1);
          await ctx.w(400);
          await ctx.run(api.hero.lookAround());
          await ctx.think('c5.end.here');
          await ctx.think('c5.end.thanks');
          ctx.sfx('slide', false);
          await ctx.tw({ t: 0 }, { t: 1 }, {
            dur: 1200, ease: CH.tw.ease.quadInOut,
            onUpdate: (k, o) => { api.hero.place(1420, 800 + o.t * 34); },
          });
          CH.props.dust(api, 1420, 800, 6);
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
})();
