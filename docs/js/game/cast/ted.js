/* Chestnut Adventure 2.5D — Ted the Cactus, from the character sheet: one ribbed column of dense hand-cut
   facets (a ribbed lathe, sixteen sides, eight strong ridges running unbroken up to a narrower rounded cap)
   leaning a little to the left from its base; two thick faceted branches — the left bending down to a plain
   rounded end, the right raised on the diagonal into a simple faceted mitt of the same thickness with a thumb
   and one jointed index finger pointing up at head height; two big flat white eyes touching, flat black
   pupils looking up toward the finger, a small open grin just under them, a compact orange blossom of five
   thick petals angled up on the apex, small spines standing straight out of the ridges, and a faceted
   terracotta pot with a thin collar and dark soil inside it. Origin under the pot, facing the viewer.
   API kept from the old model: M.ted(parent, x, y, s) → { el, talk(), anchor() }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const GREEN = '#6aa838', MOUTH = '#5a1e16', SPINE = '#e9dcaa';
  const POT = '#d4692f', POT_RIM = '#e07a3c', SOIL = '#5a4330', CLOD = '#6e5238';
  const PETAL = '#ef6a2c', PETAL_DEEP = '#d4501f', PETAL_LIGHT = '#f8874a';
  const WHITE = '#f8f5ec';

  /** a faceted solid of revolution standing on (cx, baseY): profile [[radius, heightUp], ...] from the base */
  const lathe = (parent, cx, baseY, z, profile, seg, color) => {
    const geo = new T.LatheGeometry(profile.map((p) => new T.Vector2(p[0], p[1])), seg);
    const m = K.mesh(geo, LP.mat(color), parent, {});
    K.tr(m, { x: cx, y: baseY, z, r: 180 });
    return m;
  };
  /** a thick faceted tube through the points, mitred at the bends, every facet its own tone */
  const limb = (parent, pts, r, seg) => LP.jitter(K.tube(pts, r, LP.mat(GREEN), parent, { straight: true, radial: 8, seg: seg || 8 }), 0.35);
  /** a faceted lump (a branch end, a mitt, a knuckle) */
  const lump = (parent, x, y, z, r, o) => LP.rock(parent, x, y, z, r, GREEN, Object.assign({ detail: 1, jitter: 0.09 }, o || {}));

  M.ted = function (parent, x, y, s) {
    s = s || 1;
    const g = K.g(parent, { x, y, s });

    // ---- the pot: ten facets tapering out to a thin collar, dark soil with clods right up at the mouth
    LP.jitter(lathe(g, 0, 0, 0, [[0, 0], [17, 0], [19, 7], [21, 14], [22.6, 20], [23.4, 24]], 10, POT), 0.25);
    const collar = K.mesh(new T.TorusGeometry(23.4, 2.6, 5, 10), LP.mat(POT_RIM), g);
    K.tr(collar, { y: -24.5, rx: 90 });
    lathe(g, 0, -23.4, 0, [[0, 0], [21.6, 0], [20.6, 1.4], [13, 2.8], [0, 3.4]], 10, SOIL);
    for (let i = 0; i < 9; i++) LP.dodeca(g, U.rand(-17, 17), -25.4, U.rand(-12, 12), U.rand(1.1, 2), CLOD);

    // ---- the plant: everything that sways, hinged at the soil. One eight-ribbed column tapering to a small cap.
    const plant = K.g(g);
    K.tr(plant, { oy: -23 });
    const RIBS = 8;
    const PROFILE = [[0, 0], [12.4, 0], [13, 5], [13.4, 11], [13.5, 18], [13.5, 26], [13.4, 34], [13.25, 38], [13.1, 42], [12.85, 46], [12.6, 50], [11.8, 57], [10.8, 63], [9.4, 68], [7.6, 72.5], [5.4, 76], [3.2, 78.4], [1.2, 79.8], [0, 80.2]];
    const column = LP.cactus(plant, 0, -23, 0, PROFILE, RIBS, 0.18, GREEN);
    {   // the mouth notch: the front crest sinks in on the row behind the grin (rows 38 and 46 keep the ridge). Found by
        // position, not by index — every copy of that vertex (the seam's two, and each triangle corner once the smooth pass
        // has unindexed the lathe) moves together
      const pos = column.geometry.attributes.position;
      for (let k = 0; k < pos.count; k++) if (Math.abs(pos.getY(k) - 42) < 0.01 && Math.abs(pos.getX(k)) < 0.01 && pos.getZ(k) > 10) { pos.setX(k, 0); pos.setZ(k, 12.2); }
      if (LP.SMOOTH) column.geometry = LP.creased(column.geometry); else column.geometry.computeVertexNormals();
    }
    LP.jitter(column, 0.35);
    // spines: small cones standing straight out of the ridge crests, rows along the ones facing us and the sides
    const rr = (h) => { let r = 12; for (let i = 1; i < PROFILE.length; i++) if (h <= PROFILE[i][1]) { const a = PROFILE[i - 1], b = PROFILE[i]; r = a[0] + (b[0] - a[0]) * (h - a[1]) / (b[1] - a[1]); break; } return r * 1.18; };
    const spike = (part, px, py, pz, dir, len) => {
      const ng = K.g(part, { x: px, y: py, z: pz, ry: -dir / K.DEG });
      const c = K.cone(0, (len || 5) / 2, 0.85, len || 5, LP.mat(SPINE), ng, { seg: 5, r: 90 });   // +90 on top of the kit's 180: the point goes outward
      c.castShadow = false;
    };
    for (let c = 0; c < RIBS; c++) {
      const a = c * (Math.PI * 2 / RIBS);                       // exactly on the crests
      const nx = Math.cos(a), nz = Math.sin(a);
      if (nz < -0.15) continue;
      for (let h = 7; h < 74; h += 8) {
        if (Math.abs(nx) < 0.55 && h > 34 && h < 68) continue;   // keep the face clear
        const r = rr(h) - 1;
        spike(plant, nx * r, -23 - h, nz * r, a);
      }
    }
    spike(plant, -3, -98, 3.5, Math.PI / 2 + 0.7, 3.5); spike(plant, 3.5, -98.5, 3, Math.PI / 2 - 0.7, 3.5);

    // ---- the left branch: out and bending down, ending blunt and rounded, a few spines along its top
    const armL = K.g(plant, { x: -12, y: -58 });
    limb(armL, [[4, 0, 0], [-14, 1, 1], [-18, 13, 2]], 8.4);
    lump(armL, -18.5, 14.5, 2, 8.5, { sy: 1.08 });
    spike(armL, -5, -8.6, 1, Math.PI / 2, 4); spike(armL, -12, -7.6, 1, Math.PI / 2, 4); spike(armL, -22, 5, 3, Math.PI * 0.9, 4); spike(armL, -22, 17, 8, Math.PI * 0.55, 4);

    // ---- the right branch: up the diagonal into a simple faceted mitt as thick as the arm, a thumb, one jointed finger
    const armR = K.g(plant, { x: 12, y: -60 });
    limb(armR, [[-4, 0, 0], [12, -3, 1], [18, -17, 2]], 8.2);
    const hand = K.g(armR, { x: 19.5, y: -22, z: 2.5, r: -10 });
    lump(hand, 0, -1, 0, 9, { sx: 1.05, sy: 1.1, sz: 0.85 });                                               // the palm
    // three fingers folded into the lower front of the palm, their middle joints toward us
    [[3, 5.5], [6, 2.5], [7, -1.5]].forEach((p) => lump(hand, p[0], p[1], 5.5, 2.9, { detail: 1 }));
    limb(hand, [[-4.5, 3, 2.5], [-9.5, -1, 4], [-10, -7, 5]], 2.7, 3);                                          // the thumb, up the inner side
    lump(hand, -10, -7.5, 5, 2.7);
    limb(hand, [[1, -6, 1], [2.2, -12.5, 1.3]], 3.4, 3);                                                        // index finger, proximal
    lump(hand, 2.4, -13, 1.3, 3.5);                                                                            // knuckle
    limb(hand, [[2.6, -13.5, 1.3], [3.8, -19.5, 1.6]], 3.0, 3);                                                 // distal
    lump(hand, 4, -20.4, 1.6, 3.1);                                                                            // rounded tip
    spike(armR, 4, -7.6, 1, Math.PI / 2, 3.5); spike(armR, 14, -12, 4, Math.PI * 0.35, 3.5);

    // ---- the face: two big flat white eyes touching, flat black pupils looking up toward the finger, a grin under them
    const eye = (ex, ey, r) => {
      const eg = K.g(plant, { x: ex, y: ey, z: 13.6 });
      const w = K.sphere(0, 0, r, LP.mat(WHITE, { rough: 0.45, emissive: WHITE, ei: 0.08 }), eg, { seg: 10, sy: 1.15, sz: 0.36 });
      w.castShadow = false;
      const pu = K.sphere(r * 0.22, -r * 0.4, r * 0.42, LP.mat('#111016', { rough: 0.3 }), eg, { seg: 8, sz: 0.5, z: r * 0.3 });
      pu.castShadow = false;
      eg.lid = (k) => K.tr(eg, { x: ex, y: ey, z: 13.6, sy: 1 - Math.min(0.96, k) });
      return eg;
    };
    const eyeL = eye(-5.4, -76, 5.6), eyeR = eye(5.8, -76.5, 6.0);
    // the grin: a dark wedge sunk into a notch cut into the front crest, so the ridge stops at the mouth
    LP.prism(plant, 'M -3 -66.5 C -0.8 -61 5.8 -61 8 -67 Z', 2.6, MOUTH, { z: 12.4, bevel: 0.3, noShadow: true, seg: 6 });

    // ---- the blossom: crowning the apex a little to the left, six folded orange petals round a small dark centre
    const fl = K.g(plant, { x: -2, y: -101, z: 1.5, r: -10, rx: -38 });
    for (let i = 0; i < 6; i++) {
      const pg = K.g(fl, { r: i * 60 });
      LP.prism(pg, 'M 0 0 L 4.4 -4.2 L 2.6 -12 L 0 -11.5 Z', 2.2, i % 2 ? PETAL_DEEP : PETAL, { bevel: 0.5, noShadow: true, seg: 1, rx: 30, ry: 14 });
      LP.prism(pg, 'M 0 0 L -4.4 -4.2 L -2.6 -12 L 0 -11.5 Z', 2.2, i % 2 ? PETAL : PETAL_LIGHT, { bevel: 0.5, noShadow: true, seg: 1, rx: 30, ry: -14 });
    }
    LP.dodeca(fl, 0, 0, 1.8, 2, PETAL_DEEP);

    // ---- idle life: the plant leans left from its base and sways, breathes, blinks, the raised arm wags now and then
    const blink = LP.blinker([eyeL, eyeR], { min: 2.5, max: 6 });
    LP.idle(plant, {
      r0: -8, breath: 0.012, breathF: 1.3, sway: 1.2, swayF: 0.8,
      tick: (dt, t) => {
        blink(dt);
        const wag = Math.max(0, Math.sin(t * 1.7)) * Math.sin(t * 9) * 2.5;
        K.tr(armR, { x: 12, y: -60, r: wag });
      },
    });

    return { el: g, talk() { CH.audio.sfx('tap'); }, anchor: () => ({ x, y: y - 122 * s }) };
  };
})();
