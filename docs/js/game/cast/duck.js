/* Chestnut Adventure 2.5D — the judging duck, from the character sheet: a plump yellow rubber duck moulded in
   ONE skin. The body is a single dense faceted shell: every vertex of a fine icosphere is pushed out along its
   ray to the far surface of a union of simple volumes — the chunky body, the full rump, the breast, the neck,
   the big round head, the crown, a chain of balls for the thick tail sweeping up and back, and a flattened
   teardrop each side for the raised wing — so the head flows into the neck and breast, the wing steps up out
   of the flank and the tail grows from the rump with no seams and no separate parts. The underside is cut
   flat. Only the wide flat orange bill and the two flat eyes are separate. Faintly glossy rubber. Facing
   RIGHT, origin under the belly. The scene bobs the wrapper it passes in.
   API kept from the old model: M.duck(parent, x, y, z) → the group. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const YELLOW = '#f8cf3a', YELLOW_DEEP = '#e6bb2c', YELLOW_LIGHT = '#fbe066', BEAK = '#ef7f2c', BEAK_DEEP = '#c9621c', BEAK_LIGHT = '#f5963f';
  const pick = (p) => Math.random() < p;
  const shade = (ny) => (ny < -0.55 ? YELLOW_LIGHT : ny > 0.7 ? YELLOW_DEEP : pick(0.05) ? YELLOW_LIGHT : YELLOW);
  const gloss = { rough: 0.5, emissive: '#7a5a08', ei: 0.3 };

  // the volumes the skin is stretched over: [cx, cy, cz, rx, ry, rz]
  const VOLUMES = [
    [-4, -25, 0, 24, 24, 22],      // the body
    [-22, -23, 0, 19, 19, 17],     // the full rump
    [11, -27, 0, 17, 17, 15],      // the breast
    [15, -37, 0, 12, 12, 11],      // the neck
    [18, -48, 0, 18.5, 18.5, 17],  // the big round head
    [17, -54, 0, 14, 14, 13],      // the crown
    [-33, -31, 0, 12, 12, 10], [-39, -39, 0, 8.5, 8.5, 7], [-44, -47, 0, 5.5, 5.5, 4.5], [-48, -53, 0, 2.6, 2.6, 2.4],   // the tail, thick at the rump, sweeping up and back
    [-2, -26, 20, 15, 9, 6.5], [-2, -26, -20, 15, 9, 6.5],   // the wings, a teardrop stepping out of each flank
  ];
  const O = new T.Vector3(-4, -24, 0);   // the ray origin, deep inside the body
  // how far along the ray from O in direction d the far surface of an ellipsoid lies (or -1 for a miss)
  const farT = (d, v) => {
    const mx = (O.x - v[0]) / v[3], my = (O.y - v[1]) / v[4], mz = (O.z - v[2]) / v[5];
    const dx = d.x / v[3], dy = d.y / v[4], dz = d.z / v[5];
    const a = dx * dx + dy * dy + dz * dz, b = dx * mx + dy * my + dz * mz, c = mx * mx + my * my + mz * mz - 1;
    const disc = b * b - a * c;
    if (disc < 0) return -1;
    return (-b + Math.sqrt(disc)) / a;
  };

  M.duck = function (parent, x, y, z) {
    const g = K.g(parent, { x, y, z: z || 0 });
    const body = K.g(g);

    // ---- the skin: one fine icosphere, each vertex pushed out along its ray to the outermost volume
    const geo = new T.IcosahedronGeometry(1, 3);
    const pos = geo.attributes.position, d = new T.Vector3();
    for (let i = 0; i < pos.count; i++) {
      d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
      let t = 0;
      for (const v of VOLUMES) { const tt = farT(d, v); if (tt > t) t = tt; }
      pos.setXYZ(i, O.x + d.x * t, Math.min(O.y + d.y * t, -7), O.z + d.z * t);   // the underside cut flat: the base the toy sits on
    }
    geo.computeVertexNormals();
    const skin = K.mesh(geo, LP.mat(YELLOW), body, {});
    LP.jitter(skin, 0.35);
    LP.paint(skin, YELLOW, (cx, cy, cz, nx, ny) => shade(ny), gloss);

    // ---- the bill: a wide flat faceted blob growing out of the face, narrowing to a rounded tip, tipped a little
    //      down, the seam between the halves painted round it; the eyes flat discs set into the head
    const bill = LP.rock(body, 39, -45.5, 0, 1, BEAK, { detail: 2, jitter: 0.05, sx: 14, sy: 5.2, sz: 8.2, r: 6 });
    LP.paint(bill, BEAK, (cx, cy, cz, nx, ny) => (Math.abs(cy - 0.04) < 0.1 && cx > -0.3 ? BEAK_DEEP : ny < -0.45 ? BEAK_LIGHT : pick(0.12) ? BEAK_DEEP : null), { rough: 0.55 });
    LP.rock(body, 43, -48.2, 4, 1, BEAK_DEEP, { detail: 0 });                                                   // nostrils
    LP.rock(body, 43, -48.2, -4, 1, BEAK_DEEP, { detail: 0 });
    const eyes = [1, -1].map((sd) => {
      const e = LP.eye(body, 24, -53, sd * 16, 3.6, { seg: 12, color: '#f6f3ea', pupil: true, flip: sd });
      K.tr(e, { x: 24, y: -53, z: sd * 16, ry: sd < 0 ? 180 : 0, sz: 0.35 });
      return e;
    });

    K.pad(-50, -68, 96, 72, g, { d: 40 });

    // ---- idle life: he bobs with the scene; on his own he narrows that eye now and then
    let t = U.rand(0, 6);
    LP.tick((dt) => {
      t += dt;
      const squint = Math.sin(t * 0.37) > 0.55 ? 0.55 : 0;
      eyes.forEach((e) => e.lid(squint));
    });
    return g;
  };
})();
