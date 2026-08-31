/* Chestnut Adventure 2.5D — Teddy, from the character sheet: a plush blue teddy bear of dense hand-cut facets
   sitting with his legs out and his arms down at his sides. The tan belly, the tan around the muzzle, the
   inner ears and the big oval foot pads are painted on the same faceted skin (a change of plush colour, not
   lumps); only the snout stands out from the face. Round ears, dark button eyes with glints, a dark nose, a
   stitched mouth. Origin under his seat, facing the viewer.
   API kept from the old model: M.teddy(parent, x, y, z, s) → the group (scenes hang their own pads and
   sway on the wrapper they pass in). */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const M = CH.models;

  const BLUE = '#3868a4', BLUE_DEEP = '#33609a', BLUE_LIGHT = '#4074b0', TAN = '#d9b47c', TAN_DEEP = '#c9a468', INK = '#1e1a24';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.05 }, o || {}));
  const pick = (p) => Math.random() < p;
  // plush facets as the sheet paints them: lighter where they face up, darker underneath, a few odd ones
  const shade = (ny) => (ny < -0.5 ? BLUE_LIGHT : ny > 0.55 ? BLUE_DEEP : pick(0.04) ? BLUE_LIGHT : BLUE);
  const tan = (ny) => (ny > 0.35 ? TAN_DEEP : pick(0.12) ? TAN_DEEP : TAN);

  M.teddy = function (parent, x, y, z, s) {
    const g = K.g(parent, { x, y, z: z || 0, s: s || 1 });
    const body = K.g(g);

    // ---- the body: a plump faceted pear, the tan belly an oval painted on its front from the chest to the lap
    const torso = rock(body, 0, -28, 0, 24, BLUE, { sx: 1.06, sy: 1.05, sz: 1.0, detail: 3, jitter: 0.03 });
    LP.paint(torso, BLUE, (cx, cy, cz, nx, ny) => {
      if (cz > 0 && (cx / 12) ** 2 + ((cy - 4) / 16.5) ** 2 < 1) return tan(ny);            // the belly: a big soft egg-oval from mid-chest to the lap
      return shade(ny);
    });
    // ---- arms: down along the sides, the paws resting beside the hips
    [-1, 1].forEach((sd) => {
      LP.paint(rock(body, sd * 24, -24, 6, 7, BLUE, { sx: 0.85, sy: 1.75, sz: 0.85, r: sd * -10 }), BLUE, (cx, cy, cz, nx, ny) => shade(ny));
      LP.paint(rock(body, sd * 29, -6.5, 8, 6.5, BLUE, { sx: 1.05, sy: 0.9, ry: sd * -25 }), BLUE, (cx, cy, cz, nx, ny) => shade(ny));   // the paw, resting on the ground beside the hip
    });
    // ---- legs: out in front, the big tan oval pads painted on the soles that face us
    [-1, 1].forEach((sd) => {
      LP.paint(rock(body, sd * 14, -10, 18, 10.5, BLUE, { sx: 1.05, sy: 0.85, sz: 1.9 }), BLUE, (cx, cy, cz, nx, ny) => shade(ny));
      const foot = rock(body, sd * 17, -9, 37, 8.5, BLUE, { sx: 1.0, sy: 1.0, sz: 0.65 });
      LP.paint(foot, BLUE, (cx, cy, cz, nx, ny, nz) => (nz > 0.15 && (cx / 8) ** 2 + (cy / 8) ** 2 < 1 ? tan(ny) : shade(ny)));   // the pad fills the sole
    });

    // ---- the head: a faceted ball; round ears with tan insides; the tan muzzle painted round a short snout;
    //      dark button eyes with glints; a dark nose; a stitched mouth
    const head = K.g(body, { x: 0, y: -60 });
    const skull = rock(head, 0, 0, 0, 20, BLUE, { sx: 1.08, sy: 0.98 });
    LP.paint(skull, BLUE, (cx, cy, cz, nx, ny) => (cz > 10 && (cx / 9.5) ** 2 + ((cy - 8) / 7) ** 2 < 1 ? tan(ny) : shade(ny)));   // the tan round the muzzle: a compact oval on the centre-lower face
    const ears = [-1, 1].map((sd) => {
      const eg = K.g(head, { x: sd * 15, y: -20 });
      const ear = rock(eg, 0, 0, -1, 9, BLUE, { sz: 0.45 });
      LP.paint(ear, BLUE, (cx, cy, cz, nx, ny, nz) => (nz > 0.5 && cx * cx + (cy + 1) ** 2 < 28 ? tan(ny) : shade(ny)));   // the tan inset, a big circle on the front face
      return { g: eg, x: sd * 15, y: -20, sd };
    });
    LP.paint(rock(head, 0, 7, 16, 8.5, TAN, { sx: 1.35, sy: 0.75, sz: 0.85 }), TAN, (cx, cy, cz, nx, ny) => tan(ny));   // the broad short snout, standing out from the face
    LP.jitter(LP.prism(head, 'M -3.6 -1.6 C -3.6 -2.8 3.6 -2.8 3.6 -1.6 C 3.6 1 1.6 2.8 0 3 C -1.6 2.8 -3.6 1 -3.6 -1.6 Z', 2.6, INK, { y: 2.8, z: 23.6, bevel: 0.8, bevelSeg: 1, seg: 5, noShadow: true }), 0.12);   // the rounded nose, wider than tall, at the top of the muzzle
    K.tube([[0, 5.6, 24.3], [0, 9, 24.4]], 0.8, LP.mat(INK), head, { straight: true, radial: 4 }).castShadow = false;            // the stitch down from the nose…
    K.tube([[0, 9, 24.4], [-1.8, 10.4, 24.2], [-3.4, 9.6, 23.8]], 0.8, LP.mat(INK), head, { straight: true, radial: 4 }).castShadow = false;   // …splitting into two arcs inside the muzzle
    K.tube([[0, 9, 24.4], [1.8, 10.4, 24.2], [3.4, 9.6, 23.8]], 0.8, LP.mat(INK), head, { straight: true, radial: 4 }).castShadow = false;
    const eyeL = LP.eye(head, -6, -2.5, 18.2, 3.4, { seg: 10, glint: false });
    const eyeR = LP.eye(head, 6, -2.5, 18.2, 3.4, { seg: 10, glint: false });
    [eyeL, eyeR].forEach((e, i) => { K.tr(e, { sz: 0.55 }); const gl = K.sphere((i ? -1 : 1) * -0.9, -0.9, 0.6, K.mat('#ffffff', { emissive: '#ffffff', ei: 0.6 }), e, { z: 2.6, seg: 6 }); gl.castShadow = false; });   // flat buttons, one small glint each

    K.pad(-30, -84, 60, 88, g, { d: 40 });

    // ---- idle life: a slow plush breath, the head tilts, an ear wiggles now and then, blinks
    const blink = LP.blinker([eyeL, eyeR], { min: 2.5, max: 7 });
    LP.idle(body, {
      breath: 0.012, breathF: 1.1, sway: 0.6, swayF: 0.5,
      tick: (dt, t) => {
        blink(dt);
        K.tr(head, { x: 0, y: -60, r: Math.sin(t * 0.6) * 3 });
        ears.forEach((e, i) => { const f = Math.sin(t * 4.1 + i * 2.6); K.tr(e.g, { x: e.x, y: e.y, r: (f > 0.94 ? (f - 0.94) * 150 : 0) * e.sd }); });
      },
    });
    return g;
  };
})();
