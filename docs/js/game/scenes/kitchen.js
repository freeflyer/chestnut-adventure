/* Chapter 3 — the kitchen expedition: drawers or toaster, the jar, and Biscuit on patrol. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  const WALL = -330;

  CH.defScene('kitchen', {
    chapter: 4,
    pageBg: '#141e24',
    bg: '#10181e',
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: (st) => [
      { id: 'floor', x1: 140, x2: 1480, y: 800, z: 90 },   // the walking line out in front of the cat (he lies from z -77 to 44, tail included) and the bowl: the hero's spikes reach 37 either side of him
      { id: 'stool', x1: 596, x2: 690, y: 640, noWalk: true },   // the seat's top (it spans y 640..652); z 0 on purpose: the toaster fills the seat's depth, he stands at its front edge
      { id: 'drawer1', x1: 800, x2: 968, y: 722, noWalk: true },
      { id: 'drawer2', x1: 812, x2: 956, y: 630, noWalk: true },
      { id: 'counter', x1: 710, x2: 900, y: 516, z: -200 },   // the counter top left of the sink; the walking line runs through the basin's depth (z -265..-135), so the hop goes over the sink itself
      { id: 'counterR', x1: 1160, x2: 1230, y: 516, z: -200 }, // right of the sink, a landing strip ending before the jar
    ],
    links: (st) => [
      { a: 'floor', b: 'stool', ax: 640, bx: 640, type: 'hop' },
      { a: 'floor', b: 'drawer1', ax: 884, bx: 884, type: 'hop', when: (s) => s.has('drawersOut') },
      { a: 'drawer1', b: 'drawer2', ax: 884, bx: 884, type: 'hop', when: (s) => s.has('drawersOut') },
      { a: 'drawer2', b: 'counter', ax: 884, bx: 820, type: 'hop', when: (s) => s.has('drawersOut') },
      { a: 'counter', b: 'floor', ax: 712, bx: 665, type: 'drop', dir: 'ab', az: -45 },   // to the counter's front-left corner (the top starts at x 696, its front edge is z -30), then off it onto the floor's line
      { a: 'counter', b: 'counterR', ax: 896, bx: 1164, type: 'hop', h: 110, dur: 620 },   // over the sink, taking off and landing clear of its rim
      { a: 'stool', b: 'floor', ax: 640, bx: 600, type: 'hop' },
    ],
    spots: {
      enter: { x: 240, plat: 'floor' },
      wake: { x: 660, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#1e3038'], [1, '#2c444e']],
        floorStops: [[0, '#8a6a4a'], [1, '#5e4630']],
        baseboard: '#1c2c34',
        tiles: true,
      });
      // a cool ceiling light, high and a little in front of the furniture line. From (800,-260,160) it raked across the fridge and cabinet
      // fronts at ~75°: the fridge top burned while its bottom fell off, and every thin edge smeared a long shadow. Higher and forward it lights
      // the fronts evenly while the sill's shadow still runs down to the counter. Shadow map fit, blur and depth bias come from E.fitShadows
      K.spot(L, 800, -800, 450, 800, 640, -220, '#dfe6ff', 106, { angle: 84, penumbra: 1, decay: 1.4, mapSize: 2048, dist: 2000, normalBias: 0.02 });

      // ---------- the under-stairs door (back to the hallway), inside face ----------
      const backDoor = K.g(mid);
      K.point(L, 150, 640, -200, '#9db8d8', 2.4, 700, { decay: 1.6 });   // a little cool spill so the way back reads
      K.ext('M 60 812 L 60 560 L 208 668 L 208 812 Z', 30, K.mat('#26314d', { rough: 0.9 }), backDoor, { z: WALL + 15, bevel: 2 });
      K.ext('M 72 806 L 72 574 L 196 664 L 196 806 Z', 12, P.woodMat('#8e6a48', '#6a4c30', 0.7), backDoor, { z: WALL + 26, bevel: 1 });
      const kflapG = K.g(main);
      K.box(100, 712, 78, 88, 10, '#3c2a18', kflapG, { z: WALL + 34 });
      const kflapDoor = K.rbox(108, 720, 62, 74, 5, 3, '#4e3826', kflapG, { z: WALL + 40, ox: 139, oy: 720 });

      // ---------- fridge ----------
      const fridgeG = K.g(mid, { z: -220 });
      const steel = K.mat('#d6e0e4', { rough: 0.55, metal: 0.08 });
      K.rbox(250, 220, 240, 580, 220, 14, steel, fridgeG);
      K.box(249, 440, 242, 10, 224, '#93a5ac', fridgeG);   // a hair wider than the body: its end faces were coplanar with the sides and z-fought
      K.rbox(462, 300, 12, 90, 14, 6, K.mat('#8a9aa0', { rough: 0.4, metal: 0.5 }), fridgeG, { z: 116 });
      K.rbox(462, 470, 12, 120, 14, 6, K.mat('#8a9aa0', { rough: 0.4, metal: 0.5 }), fridgeG, { z: 116 });
      // magnets + kid's drawing
      const redMag = K.disc(310, 300, 9, 6, K.mat('#e2635f', { rough: 0.5 }), fridgeG, { z: 113 });
      K.disc(420, 340, 9, 6, K.mat('#67b8a0', { rough: 0.5 }), fridgeG, { z: 113 });
      K.disc(360, 520, 9, 6, K.mat('#e8b64c', { rough: 0.5 }), fridgeG, { z: 113 });
      const drawing = K.g(fridgeG, { z: 111 });
      const drawTex = K.canvasTex(220, 180, (ctx, w, h) => {
        ctx.fillStyle = '#fdf7e8'; ctx.fillRect(0, 0, w, h); ctx.scale(2, 2);
        ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.strokeStyle = '#e2635f'; ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(20, 36); ctx.lineTo(36, 24); ctx.lineTo(52, 36); ctx.lineTo(52, 60); ctx.closePath(); ctx.stroke();
        ctx.strokeStyle = '#8a6a42'; ctx.beginPath(); ctx.moveTo(68, 60); ctx.lineTo(68, 42); ctx.stroke();
        ctx.strokeStyle = '#67b8a0'; ctx.beginPath(); ctx.arc(68, 36, 10, 0, 6.28); ctx.stroke();
        ctx.strokeStyle = '#e8b64c'; ctx.beginPath(); ctx.arc(92, 14, 7, 0, 6.28); ctx.stroke();
      });
      const drawM = K.vplane(330, 440, 270, 360, 0, new T.MeshStandardMaterial({ map: drawTex, roughness: 0.9 }), drawing);
      drawM.scale.y = -1; drawM.userData.__disposeTex = drawTex;
      K.tr(drawing, { z: 111, r: -3, ox: 385, oy: 315 });

      // ---------- cat bowl ----------
      const bowlG = K.g(main, { z: -50 });
      // radii 45/53, 32 tall (y 768..800), at x 541: its rim (488..594) sits midway between the cat and the stool's front leg (606..618)
      const bowlX = 541;
      // a real bowl: a lathe with a cavity (rim at 768, inner floor 10 above the ground), and what's in it as a dark disc on that floor;
      // profile in local (radius, y), y from the rim (0) down to the base (32). The outer wall is the same cone as before (45 -> 53)
      const catBowlProfile = [[0, 32], [45, 32], [53, 0], [48, 0], [46, 6], [43, 14], [40, 22], [0, 22]];
      const catBowl = K.mesh(new T.LatheGeometry(catBowlProfile.map((q) => new T.Vector2(q[0], q[1])), 28), K.mat('#4a6a8a', { rough: 0.5, side: 'double' }), bowlG);
      K.tr(catBowl, { x: bowlX, y: 768, z: 0 });
      K.cylUp(bowlX, 790, 39, 1.5, K.mat('#2c3a4c', { rough: 0.7 }), bowlG);   // the kibble, on the bowl's floor
      // the name, centred on the bowl in every language (K.label centres its text) — and on the bowl's outline as seen: the flat label
      // hangs 48 in front of the bowl's axis, so from a camera off to one side it would slide sideways; each frame it is nudged
      // by exactly that parallax (48 * the camera's sideways offset / its distance to the axis)
      const bowlName = K.label(CH.t('name.cat').toUpperCase(), { size: 12.6, color: '#d8e4ec', x: bowlX, y: 784, z: 53, parent: bowlG });   // mid-height on the bowl's side, not down at its bottom edge
      api.tick(() => { const cam = CH.engine.camera.position; K.tr(bowlName, { x: bowlX + 53 * ((cam.x * 100 + 800) - bowlX) / ((cam.z * 100) + 50) }); });
      K.pad(bowlX - 65, 754, 130, 50, bowlG, { d: 110 });

      // ---------- stool + toaster ----------
      const stoolG = K.g(mid, { z: -60 });
      K.cylUp(643, 652, 46, 12, K.mat('#7c4a48', { rough: 0.8 }), stoolG, { rTop: 52, seg: 28 });
      [[612, 40], [674, 40], [612, -40], [674, -40]].forEach((l) => K.cylUp(l[0], 800, 6, 150, K.mat('#513029', { rough: 0.8 }), stoolG, { z: l[1] }));   // 150 tall: up into the seat (y 640..652) — at 136 they stopped at 664, 12 short of it, and the toaster hung in the air
      const toasterG = K.g(main, { y: -6, z: -60 });   // centred on the stool's seat (z -60), not pushed to its front edge; lifted 6 so its bottom (drawn at 646) sits on the seat's top (640) instead of in it
      K.ext('M 596 646 L 596 596 A 20 20 0 0 1 616 578 L 668 578 A 20 20 0 0 1 688 596 L 688 646 Z', 60, K.mat('#d8e2e6', { rough: 0.3, metal: 0.4 }), toasterG, { bevel: 4 });
      K.box(614, 572, 56, 12, 20, '#37444c', toasterG, { z: 0 });
      const lever = K.g(toasterG);
      K.rbox(690, 600, 16, 10, 12, 4, '#e2635f', lever, { z: 8 });
      K.disc(642, 622, 6, 4, K.mat('#c9d6da', { rough: 0.4 }), toasterG, { z: 32 });

      // ---------- the counter ----------
      const counterG = K.g(mid);
      for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 14; tx++) {
        K.box(706 + tx * 58, 380 + ty * 46, 54, 42, 6, ty % 2 === tx % 2 ? '#2c464e' : '#294048', counterG, { z: WALL + 4, round: 2 });
      }
      // the top is an extrusion with a real opening for the sink (it used to be a solid slab with a dark plate on it); the inner subpath
      // runs the other way round so the SVG fill rule makes it a hole. Local v maps to z: 0..300 -> -330..-30, the hole 65..195 -> -265..-135
      K.ext('M 0 0 L 904 0 L 904 300 L 0 300 Z M 240 65 L 240 195 L 428 195 L 428 65 Z', 26, K.mat('#d8cdb4', { rough: 0.6 }), counterG, { bevel: 4, rx: 90, x: 696, y: 529, z: -330 });
      K.box(710, 550, 880, 250, 280, '#3f6b6b', counterG, { z: -190 });
      // the drawers stack
      const drawerFront = (y) => {
        const g = K.g(main);
        K.rbox(790, y, 190, 78, 260, 8, '#4a7d7d', g, { z: -170 });
        K.box(804, y + 12, 162, 54, 4, '#38605f', g, { z: -38 });
        K.box(808, y + 16, 154, 46, 6, '#4a7d7d', g, { z: -37 });
        K.rbox(856, y + 34, 60, 12, 10, 6, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), g, { z: -30 });
        return g;
      };
      const dr1 = drawerFront(716);
      const dr2 = drawerFront(626);
      drawerFront(540);
      const setDrawers = (out) => {
        if (out) {
          // staircase: the bottom drawer sticks out the most, toward us
          K.tr(dr1, { x: 52, z: 40 });
          K.tr(dr2, { x: 26, z: 20 });
        }
      };
      setDrawers(st.has('drawersOut'));
      // cupboard doors right of drawers
      K.rbox(1010, 566, 200, 224, 8, 8, '#4a7d7d', counterG, { z: -44 });
      K.sphere(1190, 680, 8, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), counterG, { z: -36 });
      K.rbox(1230, 566, 200, 224, 8, 8, '#4a7d7d', counterG, { z: -44 });
      K.sphere(1250, 680, 8, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), counterG, { z: -36 });

      // ---------- sink + tap (on the counter) ----------
      const sinkG = K.g(mid, { z: -200 });
      // a real basin: the steel surround is a frame with an opening (same opening as the counter top above), and the basin hangs below
      // it — four walls and a floor of darker steel, 30 deep, a drain in the middle. Its floor stays above the cabinet body's top (550).
      // The hero walks along z 0, in front of the counter's edge, so he never crosses the opening
      const basinMat = K.mat('#3a4f5a', { rough: 0.55, metal: 0.3 });
      K.ext('M 0 0 L 220 0 L 220 160 L 0 160 Z M 16 15 L 16 145 L 204 145 L 204 15 Z', 8, K.mat('#aebec4', { rough: 0.3, metal: 0.5 }), sinkG, { bevel: 2, rx: 90, x: 920, y: 518, z: -80 });
      K.box(936, 514, 188, 34, 4, basinMat, sinkG, { z: -63 });   // back wall
      K.box(936, 514, 188, 34, 4, basinMat, sinkG, { z: 63 });    // front wall
      K.box(936, 514, 4, 34, 130, basinMat, sinkG, { z: 0 });     // left wall
      K.box(1120, 514, 4, 34, 130, basinMat, sinkG, { z: 0 });    // right wall
      K.box(936, 544, 188, 4, 130, basinMat, sinkG, { z: 0 });    // floor, 544..548
      K.cylUp(1030, 544, 7, 1, K.mat('#26363f', { rough: 0.6, metal: 0.4 }), sinkG);   // the drain
      K.tube([[1010, 516, -60], [1010, 470, -60], [1018, 452, -60], [1040, 452, -60], [1052, 466, -60], [1053, 480, -60]], 6, K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 }), sinkG, { seg: 24 });
      K.rodX(1000, 1020, 512, 5, K.mat('#8a9aa0', { rough: 0.3, metal: 0.7 }), sinkG, { z: -60 });
      K.pad(998, 440, 78, 84, sinkG, { d: 60, z: -60 });
      const dripDot = K.sphere(1053, 480, 4, K.mat('#9fd4e8', { rough: 0.2, opacity: 0.9 }), sinkG, { z: -60 });
      // one drop every few seconds: it forms at the spout, falls 0.9 s into the basin, and the drip sound fires exactly as it lands
      // (the sound used to be an independent random ambient, never in step with the drops)
      let dripT = 0, dripPeriod = U.rand(3.5, 6);
      const dripFall = 0.9;
      api.tick((dt) => {
        dripT += dt;
        if (dripT >= dripPeriod) { dripT -= dripPeriod; dripPeriod = U.rand(3.5, 6); CH.audio.sfx('drip'); }
        const tf = dripT - (dripPeriod - dripFall);   // seconds into the fall; negative while the drop is still forming
        dripDot.visible = tf > 0;
        if (tf > 0) K.tr(dripDot, { x: 1053, y: 478 + (tf / dripFall) * (540 - 478), z: -60 });   // spout tip -> basin floor
      });

      // window above the sink
      P.windowNight(far, 880, 112, 300, 240, { moon: true });   // 18 higher than it was: the sill's underside (pane bottom + frame 14 + sill 14 = 380) now meets the top of the tiles (380) instead of lying over them
      K.sun(L, 1030, 100, -100, '#9db8d8', 0.7, { tx: 900, ty: 800, tz: 0 });

      // ---------- THE JAR of cocktail umbrellas ----------
      const jarG = K.g(main, { z: -150 });   // a little deeper on the counter, clear of the walking line at z -70
      const glass = new T.MeshPhysicalMaterial({ color: new T.Color('#cfe4ea'), transparent: true, opacity: 0.35, roughness: 0.1, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
      const jar = K.cylUp(1310, 516, 40, 108, glass, jarG, { seg: 32 });
      jar.castShadow = false;
      const lid = K.g(jarG);
      K.cylUp(1310, 412, 46, 20, K.mat('#c9762e', { rough: 0.45, metal: 0.3 }), lid);
      K.cylUp(1310, 392, 46, 8, K.mat('#a85c22', { rough: 0.45, metal: 0.3 }), lid);
      const brollyMini = (x, y, r, c) => {
        const g = K.g(jarG, { x, y, r, z: U.rand(-14, 14) });
        K.cone(0, 12, 14, 12, K.mat(c, { rough: 0.8, side: 'double' }), g);
        K.cylUp(0, 54, 1.5, 44, K.mat('#c99358', { rough: 0.6 }), g);
        return g;
      };
      const redMini = brollyMini(1292, 428, -14, '#e2635f');   // the one he takes
      brollyMini(1316, 420, 4, '#67b8a0');
      brollyMini(1334, 430, 16, '#e8b64c');
      if (st.has('gotBrolly')) { jarG.remove(redMini); K.tr(lid, { x: 60, y: -30, z: 30, r: 160, ox: 1310, oy: 400 }); }   // taken already: the red one gone, the lid off
      K.pad(1260, 386, 100, 132, jarG, { d: 90 });

      // ---------- mixing bowl + flour (counter flavour) ----------
      // a solid bowl (thick wall, flat base), not a zero-thickness half sphere: a shell touching the counter at one point has its
      // occluder at the receiver's own depth, so the shadow map lit a disc under it and the shadow came out as a ring. Profile in
      // local (radius, y) with y running from the rim (0) down to the base (40.3); the base hides the only zone the depth bias forgives
      const bowlProfile = [[0, 40.3], [26, 40.3], [31.7, 36], [37.5, 30], [41.6, 24], [45.3, 16], [47.3, 8], [48, 0], [34, 0], [33.5, 6], [31.8, 12], [28.8, 18], [24.1, 24], [19.3, 28], [15.4, 30.3], [0, 30.3]];
      const bowlGeo = new T.LatheGeometry(bowlProfile.map((q) => new T.Vector2(q[0], q[1])), 28);
      const mixBowl = K.mesh(bowlGeo, K.mat('#e2635f', { rough: 0.5, side: 'double' }), mid);
      K.tr(mixBowl, { x: 1466, y: 475.7, z: -150 });   // base on the counter (516)
      K.torus(1466, 475.7, 48, 3, K.mat('#c0504e', { rough: 0.5 }), mid, { z: -150, rx: 90 });
      const flourG = K.g(mid, { z: -285 });   // back against the tiles, clear of the walking line at z -200
      K.rbox(740, 470, 70, 46, 50, 5, '#d8cdb4', flourG);
      K.label('FLOUR', { size: 12, color: '#8a7a5c', x: 775, y: 494, z: 26, parent: flourG });

      // ---------- Biscuit on patrol ----------
      const catHome = { x: 400, y: 800 };   // well left of the bowl: neither his rump nor his tail touches it
      const cat = CH.actors.cat(K.g(main, { z: -30 }), catHome.x, catHome.y, 0.95);
      api.anchor('cat', cat.anchor);
      const catAsleep = st.data.chapter >= 6 || st.has('dreamDone');
      let catAlert = false, alertTimer = 0, stirTimer = U.rand(14, 22);
      if (catAsleep) {
        let zt = 1.5;
        api.tick((dt) => {
          zt += dt;
          if (zt > 3.4) { zt = 0; CH.fx.floaties(api, catHome.x - 40 + U.rand(-8, 8), catHome.y - 120, 'z', '#cbd6ff'); }
        });
      }
      const alertMark = K.label('!', { size: 40, color: '#e8b64c', x: catHome.x - 40, y: catHome.y - 130, z: 20, parent: fg });
      alertMark.material.opacity = 0;

      function catNoise() {
        if (catAsleep) return;
        if (catAlert) { alertTimer = 6; return; }
        catAlert = true;
        alertTimer = 6;
        cat.wake(true);
        CH.audio.sfx('meow');
      }
      api.tick((dt) => {
        if (catAsleep) return;
        alertMark.material.opacity = catAlert ? 0.9 : 0;
        if (catAlert) {
          alertTimer -= dt;
          if (alertTimer <= 0) { catAlert = false; cat.wake(false); }
          if (!CH.engine._respawning && !CH.engine.locked && api.hero.attached
            && api.hero.plat === 'floor' && Math.abs(api.hero.x - (api.hero.__lastX || api.hero.x)) > 0.6
            && api.hero.x > 320) {
            catAlert = false; cat.wake(false);
            pounce();
          }
        } else {
          stirTimer -= dt;
          if (stirTimer <= 0) { stirTimer = U.rand(16, 26); catNoise(); }
        }
        api.hero.__lastX = api.hero.x;
      });

      async function pounce() {
        if (CH.engine._respawning) return;
        CH.engine.lock(true);
        CH.audio.sfx('meow');
        const hx = api.hero.x;
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 380, group: 'scene', ease: CH.tw.ease.quadIn,
          onUpdate: (k, o) => cat.setPos(U.lerp(catHome.x, hx - 60, o.t), catHome.y),
        });
        CH.audio.sfx('boing', 0.7);
        api.cam.bump(0.6);
        CH.engine.lock(false);
        await api.respawn();
        await CH.tw.to({ t: 0 }, { t: 1 }, {
          dur: 700, group: 'scene', ease: CH.tw.ease.quadInOut,
          onUpdate: (k, o) => cat.setPos(U.lerp(hx - 60, catHome.x, o.t), catHome.y),
        });
        await api.think('c3.cat.batted');
      }

      // ---------- red herrings: a seed packet + a movable fridge magnet ----------
      const packG = K.g(main, { z: 24 });
      K.rbox(-16, -22, 32, 40, 4, 3, '#e8d05f', packG);
      K.ellipsoid(0, -6, 6, 9, 2, '#4a3a2c', packG, { z: 3 });
      K.box(-12, 7, 24, 2, 1, '#c9b34a', packG, { z: 3 });
      K.pad(-24, -30, 48, 56, packG, { d: 40 });
      K.tr(packG, { x: 735, y: 782, z: 24, r: 8 });   // on the floor past the toaster stand, at the cabinet's left end — off the cat's bowl
      if (st.hasItem('seed') || st.has('seedTaken')) main.remove(packG);

      const magHot = K.pad(286, 276, 48, 48, main, { d: 30, z: -100 });

      api.hot(packG, {
        id: 'k.pack',
        near: { x: 672, plat: 'floor' },   // beside the packet (719..751), not on top of it
        active: () => !!packG.parent,
        act: async () => {
          api.sfx('paper');
          st.flag('seedTaken');
          st.give('seed');
          main.remove(packG);
          await api.think('sd.pack.take');
        },
      });
      api.hot(magHot, {
        id: 'k.magnet',
        near: { x: 520, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.tailWhip(360, 420));
            ctx.sfx('metal', 0.1);
            const cx0 = redMag.__t.x, cy0 = redMag.__t.y;
            const nx = 300 + U.rand(0, 140), ny = 280 + U.rand(0, 220);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 420, ease: CH.tw.ease.quadInOut,
              onUpdate: (k, o) => {
                K.tr(redMag, { x: U.lerp(cx0, nx, o.t), y: U.lerp(cy0, ny, o.t) });
                K.tr(magHot, { x: U.lerp(cx0, nx, o.t), y: U.lerp(cy0, ny, o.t) });
              },
            });
            ctx.sfx('tap');
          }, { cinema: false, skippable: false });
          catNoise();
          await api.think(st.bumpClick('k.magnet') % 2 ? 'sd.magnet.move' : 'sd.magnet.art');
        },
      });

      // ================= hotspots =================

      api.hot(kflapG, {
        id: 'k.flap',
        near: { x: 210, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(150, () => true));
            ctx.sfx('boing');
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 300, onUpdate: (k, o) => K.tr(kflapDoor, { rx: 60 * o.t }),
            });
          }, { cinema: false, skippable: false });
          await api.go('hallway', 'fromKitchen');
        },
      });

      api.hot(fridgeG, {
        id: 'k.fridge',
        near: { x: 520, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('k.fridge');
          if (n === 1) await api.think('c3.fridge.look');
          else if (n === 2) { await api.think('c3.fridge.drawing'); }
          else await api.think('c3.fridge.hum');
        },
      });

      api.hot(bowlG, {
        id: 'k.bowl',
        near: { x: 600, plat: 'floor' },
        act: async () => {
          api.sfx('tap');
          catNoise();
          await api.think(st.bumpClick('k.bowl') % 2 ? 'c3.bowl.look' : 'c3.bowl.risky');
        },
      });

      api.hot(cat.el, {
        id: 'k.cat',
        near: { x: 380, plat: 'floor' },
        act: async () => {
          if (catAsleep) { await api.think(st.bumpClick('k.cat') % 2 ? 'c5.cat.asleep' : 'c5.cat.asleep2'); return; }
          await api.think(st.bumpClick('k.cat') % 2 ? 'c3.cat.look' : 'c3.cat.look2');
        },
      });

      const drawersZone = K.pad(786, 550, 200, 250, main, { d: 60, z: -30 });
      api.hot(drawersZone, {
        id: 'k.drawers',
        near: { x: 1000, plat: 'floor' },
        active: () => !st.has('drawersOut'),
        act: async () => {
          const n = st.bumpClick('k.drawers');
          if (n === 1) { await api.think('c3.drawers.look'); return; }
          await api.cut(async (ctx) => {
            api.hero.face(-1);
            await ctx.run(api.hero.tailWhip(916, 754));
            ctx.sfx('slide', false);
            await ctx.tw({ t: 0 }, { t: 1 }, { dur: 420, ease: CH.tw.ease.backOut, onUpdate: (k, o) => K.tr(dr1, { x: 52 * o.t, z: 40 * o.t }) });
            await ctx.w(200);
            await ctx.run(api.hero.tailWhip(942, 664));
            ctx.sfx('slide', false);
            await ctx.tw({ t: 0 }, { t: 1 }, { dur: 420, ease: CH.tw.ease.backOut, onUpdate: (k, o) => K.tr(dr2, { x: 26 * o.t, z: 20 * o.t }) });
            ctx.sfx('tap');
          }, { cinema: false, skippable: false });
          st.flag('drawersOut');
          setDrawers(true);
          await api.hero.excite();
          await api.think('c3.drawers.stairs');
        },
      });

      api.hot(toasterG, {
        id: 'k.toaster',
        near: { x: 640, plat: 'stool' },
        act: async () => {
          const n = st.bumpClick('k.toaster');
          if (n === 1) { await api.think('c3.toaster.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.hopTo(698, 598, { h: 40, dur: 350 }));   // onto the lever (the toaster sits 6 higher than it is drawn)
            ctx.sfx('slide', false);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 300, ease: CH.tw.ease.quadIn,
              onUpdate: (k, o) => {
                K.tr(lever, { y: 34 * o.t });
                api.hero.place(698, 598 + 34 * o.t, 'stool');
              },
            });
            await ctx.w(420);
            ctx.sfx('spring');
            K.tr(lever, { y: 0 });
            catNoise();
            const lineZ = CH.engine.platZ('counter', 860), z0 = api.hero.z || 0;   // the toaster throws him straight onto the counter's walking line, not onto the air in front of it
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 800, ease: CH.tw.ease.linear,
              onUpdate: (k, o) => {
                const x = U.lerp(698, 860, o.t);
                const y = U.lerp(632, 516, o.t) - Math.sin(o.t * Math.PI) * 220;
                api.hero.place(x, y, 'counter', U.lerp(z0, lineZ, o.t));
                api.hero.A.rock = o.t * 360 * 2;
              },
            });
            api.hero.A.rock = 0;
            ctx.sfx('thud');
            await ctx.run(api.hero.landSquash(1.4));
            CH.props.dust(api, 860, 520, 6);
          }, { cinema: false, skippable: false });
          if (!st.has('toasterDone')) {
            st.flag('toasterDone');
            await api.think('c3.toaster.fly');
          }
        },
      });

      api.hot(sinkG, {
        id: 'k.tap',
        near: { x: 880, plat: 'counter' },   // at the sink's left edge — the basin itself is a hole now
        act: async () => {
          api.sfx('drip');
          const n = st.bumpClick('k.tap');
          if (n === 1) { await api.think('c3.tap.look'); }
          else {
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.rollTo(890, () => true));
              api.hero.face(1);
              await ctx.tw(api.hero.A, { lid: 0.6 }, { dur: 200 });
              ctx.sfx('drip');
              await ctx.w(600);
              await ctx.tw(api.hero.A, { lid: 0, lidLo: 0.5 }, { dur: 250 });
              await ctx.w(500);
              await ctx.tw(api.hero.A, { lidLo: 0 }, { dur: 200 });
            }, { cinema: false, skippable: false });
            await api.think('c3.tap.drink');
          }
        },
      });

      api.hot(jarG, {
        id: 'k.jar',
        near: { x: 1230, plat: 'counterR' },
        act: async () => {
          if (st.has('gotBrolly')) { await api.think('c3.jar.done'); return; }
          const n = st.bumpClick('k.jar');
          if (n === 1) { await api.think('c3.jar.look'); return; }
          await api.think('c3.jar.stuck');
          api.toast('c3.jar.toast');
        },
        item: {
          coin: async () => {
            if (st.has('gotBrolly')) { await api.think('c3.jar.done'); return; }
            await api.cut(async (ctx) => {
              await ctx.run(api.hero.tailWhip(1290, 400));
              await ctx.run(api.hero.spin(2));
              ctx.sfx('metal', 0.4);
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => K.tr(lid, { x: 60 * o.t, y: -90 * o.t + 60 * o.t * o.t, z: 30 * o.t, r: 160 * o.t, ox: 1310, oy: 400 }),
              });
              ctx.sfx('tap');
              await ctx.run(api.hero.tailWhip(1310, 430));
              jarG.remove(redMini);   // out of the jar and into his pocket; the others stay
              ctx.sfx('coin');
              await ctx.w(300);
            }, { cinema: false, skippable: false });
            st.flag('gotBrolly');
            st.give('brolly');
            await api.hero.excite();
            await api.think('c3.jar.got');
            await api.think(st.has('veraMet') ? 'c3.jar.plan' : 'c3.jar.planAlone');   // he can get here through the flap before meeting Vera: then there is nobody to show it to yet
          },
        },
      });

      api.hot(counterG, {
        id: 'k.counter',
        near: { x: 1100, plat: 'floor' },
        active: () => !st.has('drawersOut') && !st.has('toasterDone'),
        act: async () => {
          const n = st.bumpClick('k.counter');
          if (n === 1) await api.think('c3.counter.high');
          else { await api.think('c3.counter.high2'); api.toast('c3.counter.toast'); }
        },
      });

      api.hot(drawing, {
        id: 'k.drawing',
        near: { x: 520, plat: 'floor' },
        act: async () => { await api.think('c3.drawing.look'); },
      });
    },

    enter(api) {
      const st = api.state;
      if (st.has('justWoke')) {
        st.flag('justWoke', false);
        api.cut(async (ctx) => {
          const h = api.hero;
          h.A.rock = 86;
          await ctx.w(900);
          ctx.sfx('tap');
          await ctx.tw(h.A, { rock: 0 }, { dur: 700, ease: CH.tw.ease.bounceOut });
          await ctx.run(h.slowBlink());
          await ctx.run(h.lookAround());
          h.face(-1);
          await ctx.think('c5.wake1');
          await ctx.think('c5.wake2');
        }, { cinema: false }).then(() => api.toast('c5.goal'));
        return;
      }
      if (!st.has('kitchenFirst')) {
        st.flag('kitchenFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          await ctx.think('c3.first1');
          await ctx.run(api.hero.lookAround());
          await ctx.think('c3.first2');
        }, { cinema: false });
      }
    },
  });
})();
