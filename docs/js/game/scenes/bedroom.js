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
      // scattered crayons: flat on the floor (turned in the floor plane with ry — a roll about the view axis would tip one
      // end up into the air), well in front of the walking line, spread in x and depth so each of the three shows
      [[372, 26, '#e2635f', 150], [452, -38, '#67b8a0', 125], [410, 64, '#e8b64c', 195]].forEach((c) => {   // [x, turn, colour, z]
        const g = K.g(main, { x: c[0], y: 796, z: c[3], ry: c[1] });   // rod radius 4: its underside rests on the floor (800)
        K.rodX(-22, 22, 0, 4, K.mat(c[2], { rough: 0.7 }), g);
        const tip = K.cone(0, 0, 4, 10, c[2], g); K.tr(tip, { r: -90, x: 27, y: 0 });   // K.cone stands its cone up (apex at -y); turned -90 deg about z the apex points along +x: base flush on the rod's end (x 22), point at x 32, on the rod's axis
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
      K.ext('M 628 640 C 632 596 680 570 780 568 C 818 567 838 580 858 588 C 900 596 950 620 986 640 Z', 150, K.mat('#5a7ea0', { rough: 0.95 }), breath, { bevel: 14, z: -10 });   // the hump starts well left of the head and rises steeply, so it climbs over the head's lower half (y ~588 at x 668, ~578 at x 690): the blanket is pulled up over him, one figure
      // the blanket's stripes continue over the hump: flat bands on its front face (z 65), 2 deep, not tubes lying on it
      K.box(764, 576, 12, 64, 2, K.mat('#48688a', { rough: 0.95 }), breath, { z: 66 });
      K.box(857, 596, 12, 44, 2, K.mat('#48688a', { rough: 0.95 }), breath, { z: 66 });
      // the back of a tousled head on the pillow, turned to the wall: hair, no face (no ear either: turned away, his ears are at the top and bottom of the head, not on the side we see)
      K.sphere(690, 572, 28, K.mat('#4a3c56', { rough: 1 }), breath, { z: 40, seg: 28, sx: 1.1, sy: 0.95, sz: 1 });   // on the pillow, sinking a little into it; near the front of the body's depth (the body hump and the blanket over the shoulder are extruded 150-160 deep and reach z 65-74), so the head lies in line with the visible body instead of peeking from behind the blanket
      K.ellipsoid(686, 560, 25, 14, 20, K.mat('#3c3048', { rough: 1 }), breath, { z: 46 });
      // hair the way the yarn ball is wound: thin strands lying half-sunk in the head's surface — but combed like hair, not
      // wound like yarn: from a whorl at the crown they sweep down and round the back of the head, each with a slight wave,
      // in two close dark tones and uneven thickness, so together they read as a mop of hair rather than a set of pipes
      {
        const V3 = window.THREE.Vector3;
        const hairG = K.g(breath, { x: 690, y: 572, z: 40, sx: 1.1, sy: 0.95, sz: 1 });   // the head's own frame (its sphere: r 28, squashed the same way)
        const R = 28.6;                                                                    // strand centres just above the surface: half of each strand sits in the head
        const whorl = new V3(0.2, -0.66, 0.72).normalize();                                // the crown, on the side we see (the back of the head, +z)
        const up = new V3(0, 1, 0), t1 = new V3().crossVectors(whorl, up).normalize(), t2 = new V3().crossVectors(whorl, t1).normalize();
        const hairA = K.mat('#3c3048', { rough: 1 }), hairB = K.mat('#443750', { rough: 1 });
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2 + U.rand(-0.1, 0.1);
          const dir = t1.clone().multiplyScalar(Math.cos(a)).add(t2.clone().multiplyScalar(Math.sin(a)));
          const side = new V3().crossVectors(whorl, dir).normalize();
          const len = U.rand(1.5, 2.2), ph = U.rand(0, 6.3), n = 7, pts = [];
          for (let k = 0; k <= n; k++) {
            const ang = 0.1 + (k / n) * len;
            const wob = Math.sin((k / n) * Math.PI * 1.4 + ph) * 0.14 * (k / n);           // a gentle sideways wave, growing along the strand
            const p = whorl.clone().multiplyScalar(Math.cos(ang)).add(dir.clone().multiplyScalar(Math.sin(ang))).add(side.clone().multiplyScalar(wob)).normalize().multiplyScalar(R);
            pts.push([p.x, p.y, p.z]);
          }
          K.tube(pts, U.rand(1.3, 2.0), i % 3 ? hairA : hairB, hairG, { seg: 10, radial: 5 });
        }
      }
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
      const cloud = CH.dreamfx.cloud(main, 716, 498, 1, -100);   // a touch higher than it was: its lowest puff, bobbing, stays just off the crown of his hair
      cloud.g.visible = st.has('lampOn');

      // ---------- nightstand + star night-light ----------
      const standG = K.g(mid, { z: -120 });
      K.rbox(1060, 610, 120, 190, 120, 10, '#7e5a3c', standG);
      K.rbox(1072, 640, 96, 56, 8, 6, '#6b4a33', standG, { z: 62 });
      K.sphere(1120, 668, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), standG, { z: 68 });
      const lampG = K.g(main, { z: -110 });
      const starOn = K.mat('#ffd489', { emissive: '#ffd489', ei: 0.45, rough: 0.6 });
      const starOff = K.mat('#8a7a5c', { rough: 0.8, emissive: '#8a7a5c', ei: 0.16 });
      // the star stands on the nightstand (top at y 610): its two lower ray tips rest on it, the little base fills the notch between them
      const star = K.ext('M 1120 536 L 1132 560 L 1158 564 L 1139 582 L 1144 608 L 1120 596 L 1096 608 L 1101 582 L 1082 564 L 1108 560 Z', 14, st.has('lampOn') ? starOn : starOff, lampG, { bevel: 3 });
      K.rbox(1112, 596, 16, 14, 14, 4, '#8a6a42', lampG, { z: -8 });
      K.pad(1076, 526, 90, 158, lampG, { d: 60 });
      const lampGlow = K.glow(main, 1120, 568, -100, 70, '#ffcf7a', 0.04);
      const lampLight = K.point(L, 1120, 546, -30, '#ffcf7a', 4.5, 1100, { shadow: true, decay: 1.7 });
      const lampWash = K.spot(L, 1120, 536, -60, 800, 700, -200, '#ffcf7a', 33, { angle: 80, penumbra: 0.9, decay: 1.4, shadow: false, dist: 1800 });
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
      const paneMat = new T.MeshStandardMaterial({ map: glass, emissiveMap: glass, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.6, roughness: 0.3 });
      const pane = K.vplane(1230, 1470, 144, 536, 0, paneMat, sash);
      pane.scale.y = -1; pane.userData.__disposeTex = glass;
      const moonMat = K.mat('#f4ecd7', { emissive: '#f4ecd7', ei: 1.3 }).clone();   // this scene's own copy: its brightness is driven below
      K.disc(1408, 240, 30, 3, moonMat, sash, { z: 3 }).castShadow = false;
      const moonHalo = K.glow(sash, 1408, 240, 8, 58, '#dfe8ff', 0.25);   // r 58: the moon sits 62 from the pane's right edge, so the halo stays on the glass, not over the frame and wall
      const barMat = K.mat('#141a28', { rough: 1 });
      K.box(1345, 144, 10, 392, 12, barMat, sash, { z: 6 });
      K.box(1230, 335, 240, 10, 12, barMat, sash, { z: 6 });
      K.box(1230, 144, 240, 10, 12, barMat, sash, { z: 6 });
      K.box(1230, 526, 240, 10, 12, barMat, sash, { z: 6 });
      K.box(1230, 144, 10, 392, 12, barMat, sash, { z: 6 });
      K.box(1460, 144, 10, 392, 12, barMat, sash, { z: 6 });
      K.point(L, 1350, 340, WALL + 300, '#9db8d8', 1.2, 900);   // the moonlight in the room, well clear of the bars
      K.sun(L, 1350, 200, -150, '#9db8d8', 0.7, { tx: 900, ty: 800, tz: 0 });
      // the handle: a window lever on the sash, centred on the mullion (x 1350) — a round rosette and a bar. Locked, the bar
      // hangs straight down (it sits high enough, rosette y 484, bar 34 long, to end at y 518, clear of the sash's bottom
      // rail at 526); opening the window turns it up to horizontal
      const handle = K.g(main, { z: WALL + 54 });
      K.disc(1350, 484, 9, 4, K.mat('#aebec4', { rough: 0.35, metal: 0.5 }), handle);
      K.rbox(1350, 480, 34, 8, 8, 4, K.mat('#c9d6da', { rough: 0.35, metal: 0.5 }), handle, { z: 3 });   // built pointing right = the open position
      K.tr(handle, { r: st.has('windowOpen') ? 0 : 88, ox: 1350, oy: 484 });
      // the child-safety catch on the frame
      const catchG = K.g(winG, { z: WALL + 52 });
      // on the wood: the frame's left upright (x 1216-1230) and the sash's left bar (1230-1240), not out on the glass
      K.rbox(1218, 508, 24, 34, 10, 5, K.mat('#8a95ab', { rough: 0.4, metal: 0.6 }), catchG);
      const catchBolt = K.rbox(1226, 490, 8, 26, 6, 3, K.mat('#c9d6da', { rough: 0.35, metal: 0.5 }), catchG, { z: 6 });
      K.disc(1230, 526, 3.5, 2, '#1c2338', catchG, { z: 8 });
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
      // the veil darkens the room, not the night outside: the moon, its halo and the sky in the pane are brightened by
      // exactly what the veil takes away, so the window looks the same with the night-light on or off
      const setVeil = (v) => {
        veil.material.opacity = v;
        const k = 1 / (1 - v);
        moonMat.emissiveIntensity = 1.3 * k;
        moonHalo.material.opacity = 0.25 * k;
        paneMat.emissiveIntensity = 0.6 * k;
      };
      setVeil(st.has('lampOn') ? 0 : 0.36);

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
        // a flick at the star toggles it: on, off, on again. The dream-cloud over the Kid comes and goes with the light,
        // and the window only shows itself in the light — so a player flicking the switch notices the cloud
        act: async () => {
          const on = st.has('lampOn');
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(985, () => true));
            api.hero.face(1);
            await ctx.run(api.hero.tailWhip(1122, 586));   // a flick at the star, just above its base
            ctx.sfx('tap');
            await ctx.w(200);
            ctx.sfx('ui');
            st.flag('lampOn', !on);
            setLamp(!on);
            if (on) cloud.g.visible = false;
            await ctx.tw({ v: on ? 0 : 0.36 }, { v: on ? 0.36 : 0 }, {
              dur: 900, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => setVeil(o.v),
            });
            if (!on) cloud.g.visible = true;
            await ctx.w(300);
          }, { cinema: false, skippable: false });
          if (on) { await api.think('c4.lamp.off'); return; }
          await api.hero.excite();
          if (st.has('lampLit')) { await api.think('c4.lamp.again'); return; }
          st.flag('lampLit');
          await api.think('c4.lamp.lit');
          await api.think('c4.lamp.dreams');   // and, after the star, a thought about where the Kid might be off to in his sleep — the cloud is not named, only hinted at
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
                onUpdate: (k, o) => api.hero.place(U.lerp(1300, 1350, o.t), U.lerp(546, 560, o.t) - Math.sin(o.t * Math.PI) * 70, 'sill'),
              });
              api.hero.A.tailTx = 0; api.hero.A.tailTy = -76;   // tail up to the lever (y 484) from where he hangs (560)
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
              onUpdate: (k, o) => { api.hero.place(U.lerp(1300, 1350, o.t), U.lerp(546, 560, o.t) - Math.sin(o.t * Math.PI) * 70, 'sill'); },
            });
            api.hero.A.tailTx = 0; api.hero.A.tailTy = -76;   // tail up to the lever (y 484) from where he hangs (560)
            for (let i = 0; i < 3; i++) {
              ctx.sfx('metal', 0.25);
              await ctx.tw(api.hero.A, { rock: 24 }, { dur: 260, ease: CH.tw.ease.quadInOut });
              await ctx.tw(api.hero.A, { rock: -24 }, { dur: 260, ease: CH.tw.ease.quadInOut });
            }
            ctx.sfx('metal', 0.6);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 400, onUpdate: (k, o) => K.tr(handle, { r: 88 * (1 - o.t), ox: 1350, oy: 484 }),   // the lever swings up from hanging down to horizontal: unlocked
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
              await ctx.run(api.hero.tailWhip(1230, 526));
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
      const dinoG = K.g(main, { z: -60 });
      CH.models.dino(dinoG, 0, 0, 0, 1.5);
      K.tr(dinoG, { x: 402, y: 791, z: -60, r: 3 });   // at the blocks' depth, just clear of the doorway: his tail tip (about 69 left of here at this scale) ends a few px right of the door frame on screen; y 791 puts his feet (9 below the origin) on the floor (800)
      api.hot(dinoG, {
        id: 'b.dino',
        near: { x: 412, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => {
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 500, onUpdate: (k, o) => K.tr(dinoG, { x: 402, y: 791, r: 3 + Math.sin(o.t * Math.PI * 4) * 8 }),
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
