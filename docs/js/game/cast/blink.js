/* Chestnut Adventure 2.5D — Blink, from the character sheet: a firefly of dense hand-cut facets — a big fat
   glowing yellow teardrop of a lantern, ringed with segment grooves and tapering to a point behind, a chunky
   matte near-black thorax with a domed hump, a distinct round head on a pinched neck with a big amber eye
   hooded by a heavy angry brow, two thin curved antennae, three pairs of jointed near-black legs hanging under
   the thorax, and two broad translucent blue faceted leaf wings each side with a dark leading vein, rooted just
   behind the head and swept back. Faces RIGHT by default (face(-1) mirrors her); the group is centred on the
   thorax. The duct scenes place, move and light her (the glow sprite and the point light stay theirs).
   API: M.blink(parent) → { el, flap(deg), setLit(k 0..1), face(dir) }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const NAVY = '#10172e', NAVY_DEEP = '#080c1c', NAVY_LIGHT = '#1a2446', LAMP = '#f4c832', LAMP_LIGHT = '#f9dc60', LAMP_DEEP = '#d9a622';
  const EYE = '#f0b820', LEG = '#080a18', WING = '#5f97ec';
  const matte = (c) => LP.mat(c, { rough: 1 });
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.07, m: matte(color) }, o || {}));
  const pick = (p) => Math.random() < p;
  const navy = (ny) => (ny < -0.5 ? NAVY_LIGHT : ny > 0.55 ? NAVY_DEEP : pick(0.1) ? NAVY_LIGHT : NAVY);
  const dark = (m) => LP.paint(m, NAVY, (cx, cy, cz, nx, ny) => navy(ny), { rough: 1 });

  M.blink = function (parent) {
    const g = K.g(parent);
    const body = K.g(g);

    // ---- the lantern: a fat faceted teardrop glowing yellow, its rear pulled in to a point, two grooves ringing it
    const lantern = rock(body, -13, 3, 0, 9.5, LAMP, { detail: 3, jitter: 0.04, sx: 1.55, sy: 1.05, sz: 1.05 });
    { const pos = lantern.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); if (x < 0) { const k = 1 - 0.55 * (-x / 9.5); pos.setY(i, pos.getY(i) * k); pos.setZ(i, pos.getZ(i) * k); } } lantern.geometry.computeVertexNormals(); }   // the taper to the tip
    LP.paint(lantern, LAMP, (cx, cy, cz, nx, ny) => (Math.abs(cx + 8) < 0.7 || Math.abs(cx + 16) < 0.7 ? LAMP_DEEP : ny < -0.5 ? LAMP_LIGHT : ny > 0.55 ? LAMP_DEEP : pick(0.1) ? LAMP_LIGHT : LAMP), { emissive: '#f0bc20', ei: 0.55, rough: 0.6 });   // the segment rings painted round it
    const lampMat = lantern.material;
    [[-8, 9.2], [-16, 7.4]].forEach(([x, r]) => { const ring = K.torus(x, 3, r, 0.45, matte(LAMP_DEEP), body, { ry: 90 }); ring.castShadow = false; });   // thin grooves marking the segments
    // ---- the thorax: a chunky matte near-black block with a domed hump; a pinched neck; a distinct round head
    dark(rock(body, 0, -0.5, 0, 7, NAVY, { sx: 1.05, sy: 1.05 }));
    dark(rock(body, 1, -7.5, 0, 4.5, NAVY, { detail: 1, sx: 1.25, sy: 0.85 }));                                  // the domed hump between the wing roots
    dark(rock(body, 8.5, -1, 0, 2.8, NAVY, { detail: 1 }));                                                       // the pinched neck
    dark(rock(body, 14.5, -1.5, 0, 6.2, NAVY, {}));                                                               // the round head
    // ---- the big amber eyes with dark pupils, each hooded by a heavy angry brow; two thin curved antennae
    [1, -1].forEach((sd) => {
      const e = K.sphere(16, -2, 3.7, LP.mat(EYE, { rough: 0.9 }), body, { z: sd * 4.8, seg: 12 }); e.castShadow = false;
      const p = K.sphere(18.6, -2.2, 1.9, matte('#17131c'), body, { z: sd * 6.4, seg: 7 }); p.castShadow = false;
      const brow = LP.rock(body, 16.6, -4.9, sd * 5.6, 3.6, NAVY_DEEP, { detail: 1, jitter: 0.05, sx: 1.25, sy: 0.42, sz: 0.9, r: sd * 0 + 12, m: matte(NAVY_DEEP) });   // the brow, a wedge hooding the top of the eye
      brow.castShadow = false;
      K.tube([[15, -7, sd * 1.2], [17.5, -10.5, sd * 2], [19.5, -12.5, sd * 2.6], [20.5, -14.5, sd * 2.6]], 0.22, matte(LEG), body, { seg: 8, radial: 4 }).castShadow = false;   // the antenna, curving back
    });
    // ---- three pairs of jointed near-black legs hanging forward from under the thorax, hooked at the tips
    [1, -1].forEach((sd) => [0, 1, 2].forEach((i) => {
      const x = -1 + i * 4;
      K.tube([[x, 5, sd * 3], [x + 2.5, 10, sd * 5.5], [x + 1, 15, sd * 6.5], [x + 2.2, 16.5, sd * 6.8]], 0.45, matte(LEG), body, { straight: true, radial: 4 }).castShadow = false;
    }));
    // ---- the wings: two broad translucent blue leaves each side, faceted, a dark vein along the leading edge,
    //      rooted just behind the head and swept back
    const wingMat = K.mat(WING, { opacity: 0.42, side: 'double', flat: true, rough: 1 });
    const veinMat = matte('#15224a');
    const wings = [];
    [1, -1].forEach((sd) => {
      const wg = K.g(body, { x: 5, y: -6, z: sd * 1.8, ry: sd * 12 });
      const fore = LP.prism(wg, 'M 0 0 C -8 -10 -22 -17 -32 -14 C -33 -8 -22 0 0 0 Z', 0.6, wingMat, { bevel: 0, seg: 7, z: sd * 0.7 });   // broad blunt leaves, swept back at a shallow angle
      const hind = LP.prism(wg, 'M 0 1 C -6 -4 -18 -9 -26 -6 C -25 0 -14 4 0 1 Z', 0.6, wingMat, { bevel: 0, seg: 7, z: sd * -0.7, r: 5 });
      LP.jitter(fore, 1.0); LP.jitter(hind, 1.0);
      fore.castShadow = hind.castShadow = false;
      K.tube([[0, 0, sd * 0.7], [-10, -8, sd * 0.7], [-22, -13.5, sd * 0.7], [-32, -14, sd * 0.7]], 0.3, veinMat, wg, { seg: 8, radial: 4 }).castShadow = false;   // the leading vein
      wings.push({ g: wg, sd });
    });

    let dir = 1;
    K.tr(body, { r: -6 });   // a nose-up flying tilt
    return {
      el: g,
      flap(deg) { wings.forEach((w) => K.tr(w.g, { x: 5, y: -6, z: w.sd * 1.8, ry: w.sd * 12, rx: w.sd * deg })); },
      setLit(k) { lampMat.emissiveIntensity = 0.6 * k; },
      face(d) { d = d >= 0 ? 1 : -1; if (d !== dir) { dir = d; K.tr(body, { sx: dir, r: -6 }); } },
    };
  };
})();
