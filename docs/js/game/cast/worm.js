/* Chestnut Adventure 2.5D — the earthworm, from the character sheet: a pink faceted worm rising in an S out
   of a heap of dark faceted clods, its segments painted as darker rings round the same skin, a rounder head
   with two round white eyes with dark pupils and a small smile.
   Built at the origin on the ground; the garden squashes the wrapper flat to hide him and pops him up.
   API: M.worm(parent) → the group. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const PINK = '#e28a8a', PINK_DEEP = '#b8626a', PINK_LIGHT = '#eea49f', SOIL = '#5a3a2e', SOIL_DEEP = '#3e261c', SOIL_LIGHT = '#70493a';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 1, jitter: 0.16 }, o || {}));
  const pick = (p) => Math.random() < p;
  const soilShade = (ny) => (ny < -0.5 ? SOIL_LIGHT : ny > 0.55 ? SOIL_DEEP : pick(0.12) ? SOIL_LIGHT : SOIL);
  const pinkShade = (ny) => (ny < -0.5 ? PINK_LIGHT : ny > 0.55 ? PINK_DEEP : pick(0.06) ? PINK_LIGHT : PINK);

  M.worm = function (parent) {
    const g = K.g(parent);
    // ---- the heap: faceted clods, bigger in the middle, a few crumbs around
    [[-13, -4, 2, 7, SOIL], [-3, -5, -7, 7.5, SOIL_LIGHT], [8, -4, 3, 7, SOIL], [17, -3, -2, 5.5, SOIL_DEEP], [3, -4, 10, 6, SOIL_DEEP], [-9, -3, 9, 5.5, '#7a5a44'], [-21, -2, -1, 4.5, SOIL_DEEP], [21, -2, 6, 4, SOIL_LIGHT], [-3, -8, -2, 6, SOIL], [6, -7, -8, 5.5, SOIL_DEEP], [-11, -7, 4, 5, SOIL], [13, -1, 11, 3.5, SOIL_LIGHT], [-25, -1, 5, 2.6, SOIL], [24, -1, -5, 2.4, '#2e1a12'], [0, -3, -12, 6, SOIL_DEEP], [-8, -3, -12, 5, SOIL], [9, -2, -13, 4.5, SOIL_LIGHT], [-17, -2, -8, 4, SOIL_DEEP], [14, -3, -8, 4.5, SOIL]]
      .forEach((c) => LP.paint(LP.rock(g, c[0], c[1], c[2], c[3], c[4], { detail: 0, jitter: 0.22, sy: 0.75 }), c[4], (cx, cy, cz, nx, ny) => (ny < -0.5 ? SOIL_LIGHT : ny > 0.55 ? SOIL_DEEP : null)));
    // ---- the worm: a tapered faceted tube up an S, its segments painted as darker rings; the whole thing sways
    const worm = K.g(g);
    const curve = new T.CatmullRomCurve3([[0, -3, 0], [-3, -11, 0], [-3, -19, 0], [1, -27, 0], [4, -35, 0], [2, -42, 0], [-3, -46, 0]].map((p) => new T.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
    const samples = curve.getPoints(60);
    const nearestT = (x, y, z) => { let best = 0, bd = 1e9; samples.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i / 60; } }); return best; };
    const tube = K.tubeDyn(30, 10, 4, LP.mat(PINK), worm);
    tube.set((t) => { const v = curve.getPoint(t); return [v.x, v.y, v.z]; }, (t) => 4.6);
    LP.jitter(tube.mesh, 0.3);
    LP.paint(tube.mesh, PINK, (cx, cy, cz, nx, ny) => { const row = Math.round(nearestT(cx, cy, cz) * 30); return (row > 1 && row < 27 && row % 4 === 0) ? PINK_DEEP : pinkShade(ny); });   // every fourth row a dark ring
    // the head: a rounder tip, two round white eyes with dark pupils, a small smile
    const e = curve.getPoint(1);
    LP.paint(LP.rock(worm, e.x - 1, e.y, e.z, 5.4, PINK, { detail: 2, jitter: 0.05, sx: 1.15 }), PINK, (cx, cy, cz, nx, ny) => (ny < -0.6 ? PINK_LIGHT : pick(0.05) ? PINK_LIGHT : PINK));   // the fat head, the widest point
    [-1, 1].forEach((sd) => {
      const w = K.sphere(e.x - 1 + sd * 2.4, e.y - 2.2, 2.1, LP.mat('#f6f2e8', { rough: 0.4 }), worm, { z: 4.4, seg: 10 }); w.castShadow = false;
      const p = K.sphere(e.x - 1 + sd * 2.9, e.y - 2.4, 1, LP.mat('#17131c', { rough: 0.9 }), worm, { z: 6.1, seg: 6 }); p.castShadow = false;
    });
    K.tube([[e.x - 2.6, e.y + 1.6, 5], [e.x - 1, e.y + 2.6, 5.3], [e.x + 0.6, e.y + 1.6, 5]], 0.36, LP.mat('#8a3e48'), worm, { straight: true, radial: 3 }).castShadow = false;   // the smile

    let t = U.rand(0, 6);
    LP.tick((dt) => { t += dt; K.tr(worm, { r: Math.sin(t * 1.7) * 4, sx: 1 + Math.sin(t * 2.3) * 0.03 }); });
    return g;
  };
})();
