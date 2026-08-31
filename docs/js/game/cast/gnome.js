/* Chestnut Adventure 2.5D — the garden gnome, from the character sheet: a squat ceramic gnome of dense
   hand-cut facets — a broad red hat with a wide brim, one cone whose upper part creases over and droops down
   the side (a single bent skin, not two parts), a crease down its front, a big round pink face with rosy
   cheeks painted on the same skin, ears, a big bulb nose, dark eyes under bushy white brows, a bushy curling
   moustache with a smaller pointed white beard peeking out beneath it, over arms folded high across a teal
   coat that flares like a bell, a brown belt with a brass buckle painted
   round it, dark boots under the hem, all standing on a chunky faceted stone plinth. Origin under the plinth,
   facing the viewer.
   API kept from the old model: M.gnome(parent, x, y, z) → the group, whose FIRST child keeps an identity
   transform (the garden hangs the sock bonnet off it); M.gnomeSock(parent) → the sock bonnet group. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const STONE = '#6a6058', STONE_DEEP = '#4a4240', STONE_LIGHT = '#807468', COAT = '#2f6b63', COAT_DEEP = '#225048', COAT_LIGHT = '#3d827a', BELT = '#5a3a24', BELT_DEEP = '#3e2716', BRASS = '#d9a83a';
  const SKIN = '#f4c9ab', SKIN_DEEP = '#e2b090', CHEEK = '#e07a68', NOSE = '#ea9c82', BEARD = '#f4efe6', BEARD_DEEP = '#d8d0c2', HAT = '#c9402f', HAT_DEEP = '#9c2c1e', HAT_LIGHT = '#dc5a44', BOOT = '#2a2430';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.05 }, o || {}));
  const pick = (p) => Math.random() < p;
  const shadeOf = (light, mid, deep) => (ny) => (ny < -0.5 ? light : ny > 0.55 ? deep : pick(0.03) ? light : mid);
  const coatShade = shadeOf(COAT_LIGHT, COAT, COAT_DEEP), stoneShade = shadeOf(STONE_LIGHT, STONE, STONE_DEEP), hatShade = shadeOf(HAT_LIGHT, HAT, HAT_DEEP);
  const beardShade = (ny) => (ny > 0.4 ? BEARD_DEEP : pick(0.15) ? BEARD_DEEP : BEARD);
  const skinShade = (ny) => (ny > 0.5 ? SKIN_DEEP : pick(0.08) ? SKIN_DEEP : SKIN);
  const LIFT = -19;   // the figure stands on top of the plinth

  M.gnome = function (parent, x, y, z) {
    const g = K.g(parent, { x, y, z: z || 0 });
    // the plinth first, in an identity group, so the sock can hang off children[0] as it always has:
    // a chunky faceted rock, the widest thing in the silhouette
    const plinth = K.g(g);
    LP.paint(rock(plinth, 0, -8, 0, 41, STONE, { jitter: 0.1, sy: 0.46, sz: 0.8 }), STONE, (cx, cy, cz, nx, ny) => stoneShade(ny));
    LP.paint(rock(plinth, -18, -10, 10, 21, STONE, { jitter: 0.14, sy: 0.6, sz: 0.85 }), STONE, (cx, cy, cz, nx, ny) => stoneShade(ny));
    LP.paint(rock(plinth, 20, -9, -4, 19, STONE, { jitter: 0.14, sy: 0.6, sz: 0.9 }), STONE, (cx, cy, cz, nx, ny) => stoneShade(ny));

    const body = K.g(g, { y: LIFT });
    // ---- boots showing under the hem; the coat: one faceted bell flaring to a wide hem, the folds, the belt and
    //      its dark edges painted round it
    [-10, 10].forEach((bx) => LP.paint(rock(body, bx, -5, 16, 8, BOOT, { sx: 1.15, sy: 0.65, sz: 1.35 }), BOOT, () => (pick(0.15) ? '#3a3340' : null)));
    const profile = [[24, 0], [35, 1.5], [36, 6], [33, 14], [28, 22], [25, 27], [24, 33], [23.4, 36], [22, 42], [19.5, 47], [15.5, 51], [9, 54], [0, 54.5]];
    const coat = K.mesh(new T.LatheGeometry(profile.map((p) => new T.Vector2(p[0], p[1])), 26), LP.mat(COAT), body, {});
    K.tr(coat, { y: -3, r: 180 });
    LP.jitter(coat, 0.7);
    LP.paint(coat, COAT, (cx, cy, cz, nx, ny) => {
      if (cy > 26.5 && cy < 33.5) return (cy < 27.8 || cy > 32.2) ? BELT_DEEP : pick(0.2) ? BELT_DEEP : BELT;   // the belt
      if (cy < 24 && Math.sin(Math.atan2(cz, cx) * 4 + 0.4) > 0.86) return COAT_DEEP;                            // the folds of the skirt
      return coatShade(ny);
    });
    K.rbox(-7, -36.5, 14, 10, 3, 1.2, LP.mat(BRASS), body, { z: 23.5 });                                           // the brass buckle, a frame with a tongue
    K.rbox(-4.5, -34, 9, 5, 3.6, 0.8, LP.mat(BELT_DEEP), body, { z: 24 });
    K.box(-0.8, -36, 1.6, 9, 3.8, LP.mat(BRASS), body, { z: 24.2 });
    // arms folded high across the chest under the beard: thick sleeves with cuffs, pink hands gripping the sleeves
    [[[-25, -44, 12], [-12, -41, 20], [6, -41, 24]], [[25, -42, 12], [12, -38, 22], [-6, -38, 27]]].forEach((pts) => LP.jitter(LP.limb(body, pts, 6.4, COAT, { radial: 8 }), 0.4));   // one forearm crossing over the other, just below the beard's point
    [[-25, -46, 12], [25, -44, 12]].forEach((p) => LP.paint(rock(body, p[0], p[1], p[2], 6.6, COAT, { detail: 1 }), COAT, (cx, cy, cz, nx, ny) => coatShade(ny)));   // the shoulders
    K.torus(-16, -41.5, 6.4, 1.2, LP.mat(COAT_DEEP), body, { z: 19, ry: 70 }).castShadow = false;                        // the cuffs
    K.torus(16, -38.5, 6.4, 1.2, LP.mat(COAT_DEEP), body, { z: 21, ry: -70 }).castShadow = false;
    LP.paint(rock(body, 22, -40, 26, 5.8, SKIN, { detail: 1, sx: 1.3, sy: 0.9 }), SKIN, (cx, cy, cz, nx, ny) => skinShade(ny));   // the hands, mitts gripping the opposite sleeves
    LP.paint(rock(body, -22, -43, 26, 5.8, SKIN, { detail: 1, sx: 1.3, sy: 0.9 }), SKIN, (cx, cy, cz, nx, ny) => skinShade(ny));

    // ---- the beard: a broad faceted fan tapering to a point above the belt, with real thickness; the
    //      moustache curling out over it
    const beard = LP.prism(body, 'M -18 -80 C -19 -68 -10 -56 0 -44 C 10 -56 19 -68 18 -80 C 13 -86 -13 -86 -18 -80 Z', 18, BEARD, { z: 16, bevel: 6, bevelSeg: 3, seg: 6 });
    LP.jitter(beard, 0.8);
    LP.paint(beard, BEARD, (cx, cy, cz, nx, ny) => beardShade(ny));
    [[-1, 'M 0 -84 C -10 -91 -24 -88 -23 -79 C -22 -72 -16 -70 -13 -75 C -10 -70 -4 -71 -2 -78 Z'], [1, 'M 0 -84 C 10 -91 24 -88 23 -79 C 22 -72 16 -70 13 -75 C 10 -70 4 -71 2 -78 Z']].forEach(([sd, d]) => {
      const m = LP.prism(body, d, 7, BEARD, { z: 25, bevel: 2.5, bevelSeg: 2, seg: 6 });   // the bushy moustache, the face's biggest white shape, lying flat under the nose
      LP.jitter(m, 0.5);
      LP.paint(m, BEARD, (cx, cy, cz, nx, ny) => beardShade(ny));
    });

    // ---- the round face with the cheeks painted rosy on the same skin; the big bulb nose; the eyes; bushy white brows
    const face = rock(body, 0, -87, 8, 17, SKIN, { sx: 1.05 });
    [-1, 1].forEach((sd) => LP.paint(rock(body, sd * 17.5, -85, 6, 5.4, SKIN, { detail: 1, sx: 0.55, sy: 1.15 }), SKIN, (cx, cy, cz, nx, ny) => skinShade(ny)));   // the ears
    LP.paint(face, SKIN, (cx, cy, cz, nx, ny) => (cz > 5 && ((cx - 8.5) ** 2 + (cy - 1) ** 2 < 24 || (cx + 8.5) ** 2 + (cy - 1) ** 2 < 24) ? (pick(0.3) ? '#d8705e' : CHEEK) : skinShade(ny)));
    LP.paint(rock(body, 0, -84, 25, 7.2, NOSE, { detail: 2 }), NOSE, (cx, cy, cz, nx, ny) => (ny > 0.4 ? '#d8846c' : pick(0.2) ? '#f0a88e' : null));   // the big bulb nose
    [-6.5, 6.5].forEach((ex) => {   // eyes: a warm white, a big dark iris with the pupil in it, and only a small soft glint
      LP.eye(body, ex, -92, 22.2, 3.6, { seg: 10, color: '#ece6d8', iris: '#3b2b25', pupil: true, glint: false });
      K.sphere(ex - 1.1, -93.3, 0.55, K.mat('#ffffff', { emissive: '#ffffff', ei: 0.3 }), body, { z: 22.2 + 3.6 * 0.86, seg: 6 }).castShadow = false;
    });
    const browMat = LP.mat(BEARD, { emissive: BEARD, ei: 0.12 });
    [['M -14.4 -97 C -11.3 -101.4 -4.4 -101.4 -1.9 -97.6 L -2.5 -95.1 C -5.6 -97.6 -10.6 -97.6 -13.1 -94.5 Z'], ['M 14.4 -97 C 11.3 -101.4 4.4 -101.4 1.9 -97.6 L 2.5 -95.1 C 5.6 -97.6 10.6 -97.6 13.1 -94.5 Z']].forEach(([d]) => {
      LP.jitter(LP.prism(body, d, 3.6, browMat, { z: 24.5, bevel: 0.8, bevelSeg: 1, seg: 4, noShadow: true }), 0.25);   // bushy brows right over the eyes, under the brim
    });

    // ---- the hat: a broad thick brim, a wide creased cone, its upper part folded over and hanging down the left side
    const hat = K.g(body, { x: 0, y: -102, z: 7 });
    const brim = K.torus(0, -2, 18, 3.8, LP.mat(HAT_LIGHT), hat, { rx: 90 });
    LP.jitter(brim, 0.5);
    LP.paint(brim, HAT_LIGHT, (cx, cy, cz, nx, ny) => (ny > 0.5 ? HAT : pick(0.2) ? HAT : null));   // the rolled band round the brow, lighter than the cone
    {   // one skin: sections of a cone strung along a curve that goes straight up, creases over and droops down the left side to a ball tip
      const axis = new T.CatmullRomCurve3([[0, -2], [0, -15], [-2, -27], [-7, -36], [-15, -41], [-24, -40], [-30, -33], [-34, -23], [-36, -13]].map((p) => new T.Vector3(p[0], p[1], 0)), false, 'catmullrom', 0.5);
      const rad = (t) => { const k = [[0, 19.5], [0.2, 16.5], [0.38, 13], [0.52, 9.8], [0.66, 7.6], [0.82, 6], [1, 5]]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [t0, r0] = k[i - 1], [t1, r1] = k[i]; return r0 + (r1 - r0) * (t - t0) / (t1 - t0); } return 3.6; };
      const ROWS = 30, RAD = 16, P = [], I = [];
      for (let i = 0; i <= ROWS; i++) {
        const t = i / ROWS, p = axis.getPoint(t), tg = axis.getTangent(t).normalize(), n = new T.Vector3(tg.y, -tg.x, 0), r = rad(t), amt = Math.min(0.9, r * 0.06);
        for (let j = 0; j < RAD; j++) { const th = (j / RAD) * Math.PI * 2; P.push(p.x + n.x * r * Math.cos(th) + U.rand(-amt, amt), p.y + n.y * r * Math.cos(th) + U.rand(-amt, amt), r * Math.sin(th) + U.rand(-amt, amt)); }
      }
      for (let i = 0; i < ROWS; i++) for (let j = 0; j < RAD; j++) { const a0 = i * RAD + j, a1 = i * RAD + (j + 1) % RAD; I.push(a0, a0 + RAD, a1, a1, a0 + RAD, a1 + RAD); }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setIndex(I); geo.computeVertexNormals();
      const cone = K.mesh(geo, LP.mat(HAT), hat, {});
      let k = 0;
      LP.paint(cone, HAT, (cx, cy, cz, nx, ny) => { const q = Math.floor(k++ / 2), row = Math.floor(q / RAD), j = q % RAD; const th = ((j + 0.5) / RAD) * Math.PI * 2; return (row < 14 && Math.abs(Math.sin(th) - 1) < 0.12) ? HAT_DEEP : hatShade(ny); });   // the crease down the front of the standing part
      const end = axis.getPoint(1);
      LP.paint(rock(hat, end.x, end.y + 1.5, 0, 5.6, HAT_LIGHT, { detail: 1 }), HAT_LIGHT, (cx, cy, cz, nx, ny) => (pick(0.2) ? HAT : null));   // the soft rounded tip, hanging out to the side at brow height
    }

    K.pad(-38, -170, 76, 178, g, { d: 40 });

    // ---- he is ceramic: nothing on him moves
    return g;
  };

  /** the sock bonnet for the gnome, sized to his hat */
  M.gnomeSock = function (parent) {
    const g = K.g(parent, { z: 24, y: LIFT - 7 });
    const SOCK = '#5a7ea0', SOCK_LIGHT = '#d8e4ec';
    LP.jitter(LP.prism(g, 'M -23 -94 C -23 -110 -14 -118 -3 -115 C 6 -118 17 -110 20 -100 L 20 -92 L -23 -92 Z', 16, SOCK, { bevel: 3 }), 0.4);
    LP.jitter(LP.prism(g, 'M -3 -115 C -11 -122 -25 -117 -28 -108 C -28 -103 -23 -101 -17 -103 L -11 -110 Z', 12, SOCK, { bevel: 2 }), 0.4);
    LP.prism(g, 'M -23 -94 C -23 -98 20 -98 20 -94 C 20 -90 -23 -90 -23 -94 Z', 10, SOCK_LIGHT, { bevel: 1.5, z: 5 });
    return g;
  };
})();
