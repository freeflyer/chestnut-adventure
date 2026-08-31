/* Chestnut Adventure 2.5D — Vera, from the character sheet: a deep dusty-violet spider, a big near-spherical
   bulb of an abdomen in dense hand-cut facets pinched straight onto a clearly faceted head, two dark eyes in
   thin pale rims, a small dark mouth and two short pale fangs; eight slender angular legs on the sides of the
   head, each one prism tapering from a modest hip out along a long femur to a high crisp knee, then a shorter
   shin down to a needle point — the front pair reaching well ahead, the rear pair well behind. She hangs on a
   thread whose top stays put on the ceiling while she swings.
   API kept from the old model: M.vera(parent, x, y, s, threadLen) → { el, anchor() }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const M = CH.models;

  const BODY = '#5b4576', BODY_DEEP = '#2a1f3d', HEAD = '#5b4576', LEG = '#5b4576', RIM = '#8c7ab0', MOUTH = '#1a1328', FANG = '#c9bde0';

  M.vera = function (parent, x, y, s, threadLen) {
    s = s || 1;
    const L = threadLen || 300;
    // the thread: hangs from a fixed point on the ceiling, follows the swing
    const th = K.g(parent, { x, y: y - L });
    K.box(-0.7, 0, 1.4, L, 1.4, K.mat('#d8d4c8', { rough: 0.9, opacity: 0.75 }), th).castShadow = false;

    const g = K.g(parent, { x, y, s });
    const body = K.g(g);

    // ---- the abdomen: a big round bulb of dense hand-cut facets, near-black underneath; the spinneret at the back
    // a tilted ovoid, broader at the top-rear, some twenty-five countable facets
    LP.rock(body, 0, -20, -11, 18, BODY, { detail: 1, jitter: 0.08, sy: 1.12, rx: -15, ry: 14 });
    LP.rock(body, 0, -12, -10, 14.5, BODY_DEEP, { detail: 1, jitter: 0.06, sx: 1.08, sy: 0.6, ry: 30 });
    LP.dodeca(body, 0, -40, -16, 2.4, BODY_DEEP, { detail: 0 });
    // the pinch of a waist, then the head (cephalothorax): a twelve-plane pebble with a flat face for the eyes
    LP.dodeca(body, 0, -3, 1, 3.2, BODY_DEEP);
    LP.jitter(LP.dodeca(body, 0, 6, 12, 10, HEAD, { ry: 6, sy: 0.95 }), 0.5);
    // two dark eyes in thin subdued rims; a dark mouth; two short pale fangs tucked below it
    const eyeL = LP.eye(body, -3.4, 6, 20.2, 1.8, { flip: 1, seg: 10 });
    const eyeR = LP.eye(body, 3.4, 6, 20.2, 1.8, { flip: 1, seg: 10 });
    [-3.4, 3.4].forEach((ex) => { const r = K.torus(ex, 6, 2.0, 0.28, LP.mat(RIM), body, { z: 21.1 }); r.castShadow = false; });
    LP.prism(body, 'M -2 10.5 C -1 11.9 1 11.9 2 10.5 L 1.5 9.9 C 0.8 10.8 -0.8 10.8 -1.5 9.9 Z', 1.2, MOUTH, { z: 21.3, bevel: 0, noShadow: true, seg: 3 });
    LP.cone(body, -2.2, 16.6, 19.5, 1.3, 3.6, FANG, { seg: 5, r: 180 });
    LP.cone(body, 2.2, 16.6, 19.5, 1.3, 3.6, FANG, { seg: 5, r: 180 });

    // ---- eight legs on the sides of the head: one slender prism each, tapering from hip to needle point,
    //      a long femur out to a high knee, a shorter shin down; front pair reaching ahead, rear pair behind
    const legs = [];
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      const hipY = 5 + i * 1.6, hipZ = 18 - i * 3.2;               // along the flank of the head, front to back
      const dz = [30, 11, -11, -30][i];                            // plant ahead of the head … behind the abdomen
      const len = [1.1, 1.0, 0.94, 0.86][i];
      const kneeY = [-20, -34, -38, -27][i];
      const lg = K.g(body, { x: side * 9.8, y: hipY, z: hipZ });
      const foot = [side * 38 * len, 22 + i * 2, dz];
      const P = [[0, 0, 0], [foot[0] * 0.8, kneeY, dz * 0.55], [foot[0] * 0.98, kneeY * 0.3 + 6, dz * 0.9], foot];
      const seg = [0, 0.55, 0.84, 1];
      const tube = K.tubeDyn(16, 5, 3, LP.mat(LEG), lg);
      tube.set((t) => {
        let k = 0; while (k < 2 && t > seg[k + 1]) k++;
        const u = (t - seg[k]) / (seg[k + 1] - seg[k]);
        return [P[k][0] + (P[k + 1][0] - P[k][0]) * u, P[k][1] + (P[k + 1][1] - P[k][1]) * u, P[k][2] + (P[k + 1][2] - P[k][2]) * u];
      }, (t) => 3.1 * Math.pow(1 - t, 0.9) + 0.15);
      legs.push({ g: lg, x: side * 9.8, y: hipY, z: hipZ, ph: U.rand(0, 6), side });
    }

    K.pad(-34, -34, 68, 68, body, { d: 40 });

    // ---- idle life: she swings on her thread, breathes, blinks, and her legs fidget
    const blink = LP.blinker([eyeL, eyeR], { min: 2, max: 6 });
    let t = U.rand(0, 6);
    LP.tick((dt) => {
      t += dt;
      blink(dt);
      const dx = Math.sin(t * 0.9) * 5, dy = Math.sin(t * 1.7) * 3;
      K.tr(g, { x: x + dx, y: y + dy, s });
      const len = Math.sqrt(dx * dx + (L + dy) * (L + dy));
      K.tr(th, { x, y: y - L, r: -Math.atan2(dx, L + dy) / K.DEG, sy: len / L });
      const br = Math.sin(t * 1.6) * 0.03;
      K.tr(body, { sy: 1 + br, sx: 1 - br * 0.5 });
      legs.forEach((l) => K.tr(l.g, { x: l.x, y: l.y, z: l.z, r: Math.sin(t * 2.3 + l.ph) * 2.5 * l.side + (Math.sin(t * 7.1 + l.ph * 2) > 0.92 ? 4 * l.side : 0) }));
    });

    return { el: g, anchor: () => ({ x, y: y - 40 * s }) };
  };
})();
