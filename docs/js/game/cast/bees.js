/* Chestnut Adventure 2.5D — the bees, from the character sheet: fat round bumblebees of dense hand-cut facets,
   golden yellow with three dark brown bands painted round the same body; body and head are ONE lathe — the egg
   narrows at the neck and swells again into the head — with black glossy eyes (a glint each) set toward the
   front so she looks where she flies, a little smile under them, a stinger behind, two translucent blue faceted
   wings on top. Facing LEFT by default (the epilogue mirrors them with sx), centred on the body.
   API: M.bee(parent) → { el, inner, w1, w2 } — the epilogue's flight code moves `el`, flips `inner`'s scale and
   beats `w1`/`w2` by setting their transform each frame (pivot at (∓1, -6, 2), the beat is an rx tilt about the
   body's axis — the near wing toward the viewer, the far wing away), so the wings are built with their root at
   their own origin. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const GOLD = '#e8b64c', GOLD_LIGHT = '#f2ca66', GOLD_DEEP = '#c9962e', BROWN = '#4a3416', BROWN_LIGHT = '#5e4420', WING = '#9cc6ff';
  const pick = (p) => Math.random() < p;
  const gold = (ny) => (ny < -0.5 ? GOLD_LIGHT : ny > 0.55 ? GOLD_DEEP : pick(0.08) ? GOLD_LIGHT : GOLD);

  M.bee = function (parent) {
    const el = K.g(parent);
    const inner = K.g(el);
    // ---- body and head: one faceted lathe — the egg of the body, a pinch at the neck, the ball of the head —
    //      the three brown bands and the dark rear cap painted round the same skin
    const L = 21, STEP = 0.9, HEAD_C = 13.6, HEAD_R = 4.9;                                          // the lathe's +y runs forward: the head is at its far end
    const bodyR = (y) => (y <= L / 2 ? 9.5 * Math.pow(Math.max(0, 1 - ((y / L + 0.5 - 0.58) / 0.62) ** 2), 0.6) : 0);
    const headR = (y) => HEAD_R * Math.sqrt(Math.max(0, 1 - ((y - HEAD_C) / HEAD_R) ** 2));
    const profile = [];
    for (let y = -L / 2; y <= HEAD_C + HEAD_R - 0.4; y += STEP) profile.push(new T.Vector2(Math.max(0.05, Math.pow(bodyR(y) ** 5 + headR(y) ** 5, 0.2)), y));   // a smooth union: the egg eases into the head over a soft neck
    profile.push(new T.Vector2(0.05, HEAD_C + HEAD_R));
    const body = K.mesh(new T.LatheGeometry(profile, 28), LP.mat(GOLD), inner, {});
    K.tr(body, { x: 1, r: 90 });
    LP.jitter(body, 0.06);
    const BAND_ROWS = new Set([3, 4, 5, 10, 11, 12, 17, 18, 19]);                                     // whole rows of the lathe, so the band edges are its own rings
    LP.paint(body, GOLD, (cx, cy, cz, nx, ny) => { const row = Math.floor((cy + L / 2) / STEP); if (row <= 0) return BROWN; if (BAND_ROWS.has(row)) return pick(0.08) ? BROWN_LIGHT : BROWN; return gold(-nx); });   // three even bands and a dark cap at the rear tip
    // ---- the face, toward the front of the head so she looks where she flies: black glossy eyes with a glint,
    //      a little smile under them
    [1, -1].forEach((sd) => {
      K.sphere(-16.6, -0.8, 1.55, K.mat('#17131c', { rough: 0.18 }), inner, { z: sd * 2.9, seg: 10 }).castShadow = false;
      K.sphere(-17.6, -1.3, 0.45, K.mat('#ffffff', { emissive: '#ffffff', ei: 0.5 }), inner, { z: sd * 3.7, seg: 6 }).castShadow = false;   // the glint
    });
    K.tube([[-17.6, 1.6, -2.2], [-18.4, 2.6, -0.8], [-18.4, 2.6, 0.8], [-17.6, 1.6, 2.2]], 0.4, LP.mat('#2a1c0a'), inner, { seg: 8, radial: 4 }).castShadow = false;   // the smile, right under the eyes across the front of the face
    // ---- the stinger: the dark rear cap narrows to a point on the axis
    LP.cone(inner, 15.5, 3.5, 0, 2.0, 7, BROWN, { seg: 6, r: 90 });   // centred on the tail tip, its point straight back
    // ---- the wings: translucent blue faceted blades, each rooted at its own origin so the flight code can hinge it
    const wingMat = K.mat(WING, { opacity: 0.5, side: 'double', flat: true, emissive: '#5f8fd0', ei: 0.08, rough: 0.5 });
    const w1 = K.g(inner, { x: -5, y: -7, z: 2 });                                               // rooted on the thorax, just behind the head
    const w2 = K.g(inner, { x: -3, y: -7, z: 2 });
    const wl = LP.prism(w1, 'M 0 0 C 5 -8 12 -16 21 -19 C 25 -17 24 -11 19 -6 C 13 -1 5 0 0 0 Z', 0.5, wingMat, { bevel: 0, seg: 6, z: 1.2 });   // broad leaves sweeping up and back over the abdomen
    const wr = LP.prism(w2, 'M 0 0 C 4 -7 10 -14 18 -17 C 22 -15 21 -10 16 -5 C 11 -1 4 0 0 0 Z', 0.5, wingMat, { bevel: 0, seg: 6, z: -1.2 });
    LP.jitter(wl, 0.5); LP.jitter(wr, 0.5);
    wl.castShadow = wr.castShadow = false;
    return { el, inner, w1, w2 };
  };
})();
