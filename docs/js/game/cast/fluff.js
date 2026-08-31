/* Chestnut Adventure 2.5D — Fluff, from the character sheet: a dust bunny the width of the duct — a mound of
   nine near-equal big soft lumps of dense hand-cut facets in dusty violet, stacked in three tiers and
   overlapping into one scalloped heap about two-thirds as tall as it is wide, three tiny pebbles of fluff at
   its foot, a few short fine wisps sprouting from the upper outer lumps, and a sleeping face on the big front
   lump: two soft closed-eye arcs curving down near its middle, a tiny dark nose under them and a small round
   open mouth just below it; tufts of fine whiskers fan out from the outer lumps. Built at the origin, its lumps resting on y ≈ 84 (the duct floor line the old blob used); the scene
   breathes, gusts and scales the body group it gets back.
   API: M.fluff(parent) → { el (the body group the scene transforms), eyeL, eyeR (the closed-eye arcs),
   eyesOpen (a hidden group of open eyes the scene shows when she wakes) }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const M = CH.models;

  const FLUFF = '#7a7bb8', FLUFF_LIGHT = '#9a9bd2', FLUFF_DEEP = '#5c5e98', MUZZLE = '#bcbde2', WISP = '#b4baD8', INK = '#12131f';
  const rock = (parent, x, y, z, r, o) => LP.rock(parent, x, y, z, r, FLUFF, Object.assign({ detail: 3, jitter: 0.04 }, o || {}));
  const pick = (p) => Math.random() < p;
  const shade = (ny) => (ny < -0.5 ? FLUFF_LIGHT : ny > 0.55 ? FLUFF_DEEP : pick(0.06) ? FLUFF_LIGHT : FLUFF);
  const lump = (parent, x, y, z, r, o, fn) => LP.paint(rock(parent, x, y, z, r, o), FLUFF, fn || ((cx, cy, cz, nx, ny) => shade(ny)));

  M.fluff = function (parent) {
    const body = K.g(parent);
    // ---- the mound: a bottom tier of four big lumps (the face lump in front), three on top of those, two on the crown
    lump(body, 0, 30, 18, 55, { sx: 1.1, sy: 0.98, sz: 0.9 });   // the face lump
    lump(body, -86, 38, -12, 48, {});
    lump(body, 88, 40, -10, 47, {});
    lump(body, 0, 36, -66, 46, { sx: 1.15 });
    lump(body, -50, -26, -34, 42, {});
    lump(body, 52, -24, -32, 41, {});
    lump(body, 0, -20, -14, 40, { sx: 1.05 });
    lump(body, -22, -72, -40, 34, {});
    lump(body, 26, -70, -38, 33, {});
    // three tiny pebbles of fluff at the foot
    [[-124, 76, 24, 8], [126, 78, 22, 7], [-8, 82, 62, 6]].forEach((p) => lump(body, p[0], p[1], p[2], p[3], { detail: 2 }));
    // ---- whisker tufts: from two roots on each outer lump, three fine hairs fan out sideways, uneven in length
    [[-108, 12, -8, -1], [110, 14, -6, 1]].forEach(([rx, ry, rz, sd]) => {
      [[-14, 1.0], [0, 1.15], [14, 0.85]].forEach(([spread, len]) => {
        const a = (spread - 18) * Math.PI / 180, L = 48 * len;
        const pts = [[rx, ry, rz], [rx + sd * Math.cos(a) * L * 0.5, ry + Math.sin(a) * L * 0.5 - 4, rz + 2], [rx + sd * Math.cos(a) * L, ry + Math.sin(a) * L - 14, rz + 4]];
        const w = K.tube(pts, 0.7, LP.mat(WISP), body, { seg: 8, radial: 4 }); w.castShadow = false;
      });
    });
    // ---- the sleeping face: two soft closed-eye arcs near the middle of the front lump, a round open mouth low on it
    const eyeMat = LP.mat(INK);
    const eyeL = K.tube([[-27, 6, 64.5], [-17, 14, 67.5], [-7, 6, 64.5]], 2.4, eyeMat, body, { seg: 12, radial: 6 }); eyeL.castShadow = false;   // closed eyes, the arcs curving down, lying on the lump
    const eyeR = K.tube([[5, 6, 64.5], [15, 14, 67.5], [25, 6, 64.5]], 2.4, eyeMat, body, { seg: 12, radial: 6 }); eyeR.castShadow = false;
    LP.prism(body, 'M -3.6 -0.6 L 3.6 -0.6 C 3.6 1.8 1.4 4 0 4.4 C -1.4 4 -3.6 1.8 -3.6 -0.6 Z', 2.6, INK, { x: -1, y: 20.5, z: 69, bevel: 0.5, bevelSeg: 1, seg: 4, noShadow: true });   // a tiny dark nose tight under the eyes
    LP.prism(body, 'M -6 0 C -6 -7.5 6 -7.5 6 0 C 6 8 -6 8 -6 0 Z', 3, INK, { x: -1, y: 36, z: 69, bevel: 0.6, bevelSeg: 1, seg: 7, noShadow: true });   // a round open mouth under it, snoring
    const eyesOpen = K.g(body, { z: 58 });
    K.sphere(-17, 9, 7, LP.mat('#dfe9f2', { rough: 0.6 }), eyesOpen, { seg: 12 }); K.sphere(15, 9, 7, LP.mat('#dfe9f2', { rough: 0.6 }), eyesOpen, { seg: 12 });
    K.sphere(-17, 9, 3, LP.mat(INK), eyesOpen, { z: 5.5, seg: 8 }); K.sphere(15, 9, 3, LP.mat(INK), eyesOpen, { z: 5.5, seg: 8 });
    eyesOpen.visible = false;
    return { el: body, eyeL, eyeR, eyesOpen };
  };
})();
