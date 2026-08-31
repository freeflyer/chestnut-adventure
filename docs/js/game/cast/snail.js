/* Chestnut Adventure 2.5D — the snail, from the character sheet: a coral faceted shell with the spiral cut into
   it as a groove, on a long teal foot whose yellow sole is painted along its lower edge (the same skin, a
   change of colour); the foot itself swells into the head at the front, one continuous body, with two stalks
   carrying big yellow eyes. Dense hand-cut facets.
   Facing RIGHT, built at the origin (the garden scales and moves the wrapper it passes in).
   API kept from the old model: M.snail(parent) → the group. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const SHELL = '#e8714c', SHELL_DEEP = '#4a1a0e', SHELL_LIGHT = '#f59a6a', SHELL_SHADE = '#a63d27', BODY = '#2d6b6e', BODY_DEEP = '#245658', BODY_LIGHT = '#3a7f82', UNDER = '#d9b64a', UNDER_DEEP = '#c09c34', EYE = '#f0bf2a';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.05 }, o || {}));
  const pick = (p) => Math.random() < p;
  const bodyShade = (ny) => (ny < -0.5 ? BODY_LIGHT : ny > 0.55 ? BODY_DEEP : pick(0.08) ? BODY_LIGHT : BODY);
  const shellShade = (ny) => (ny < -0.35 ? SHELL_LIGHT : ny > 0.3 ? SHELL_SHADE : pick(0.15) ? SHELL_LIGHT : SHELL);

  M.snail = function (parent) {
    const g = K.g(parent);
    const body = K.g(g);

    // ---- the foot: one tapering faceted tube along the ground rising into the head, the yellow sole painted
    //      along its lower edge; the head a rounder knob at the front
    const curve = new T.CatmullRomCurve3([[-36, -2, 0], [-27, -4, 0], [-16, -6, 0], [-4, -6.5, 0], [10, -7.5, 0], [22, -12, 0], [31, -18, 0], [38, -23, 0], [44, -25, 0]].map((p) => new T.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
    const foot = K.tubeDyn(40, 12, 4, LP.mat(BODY), body);
    foot.set((t) => { const v = curve.getPoint(t); return [v.x, v.y, v.z]; }, (t) => {
      const base = 0.4 + Math.min(1, t * 2.2) * 6.6 + Math.max(0, t - 0.55) * 1.4;                 // the foot, closed to a point well behind the shell, thickening toward the front…
      const head = 3.2 * Math.exp(-(((t - 0.86) / 0.09) ** 2));                                     // …swelling into the head…
      const tip = t > 0.9 ? Math.max(0.05, 1 - ((t - 0.9) / 0.1) ** 1.6) : 1;                        // …which rounds off to a blunt snout
      return (base + head) * tip;
    });
    LP.jitter(foot.mesh, 0.15);
    LP.paint(foot.mesh, BODY, (cx, cy, cz, nx, ny) => (ny > 0.45 && cx < 30 ? (pick(0.25) ? UNDER_DEEP : UNDER) : bodyShade(ny)));

    // ---- the shell: one thick faceted disc, the spiral painted round it as a dark groove between the whorls,
    //      the whorls lighter toward the rim
    const shell = K.g(body, { x: -12, y: -27, z: 0 });
    const disc = rock(shell, 0, 0, 0, 17, SHELL, { detail: 4, jitter: 0.03, sx: 1.32, sy: 0.9, sz: 0.55 });
    // the spiral: a groove pressed into the shell's own facets on both faces (the vertices near the spiral pulled
    // in toward the mid-plane), and painted dark along its floor, 2.5 turns out to the rim
    const spiralDist = (x, y) => {   // distance from a point on the face to the spiral curve (in the disc's own xy)
      const u = (x - 2) / 1.32, v = (y + 1) / 0.9, r = Math.hypot(u, v), th = Math.atan2(v, u);
      let best = 1e9;
      for (let k = -1; k < 4; k++) { const rs = 1.8 * Math.exp(0.128 * (th + Math.PI * 2 * k)); if (rs > 17.5 || rs < 4.2) continue; best = Math.min(best, Math.abs(r - rs)); }   // the innermost turn is left solid, so the centre is a point, not a hole
      return best;
    };
    {
      const pos = disc.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
        const d = spiralDist(px, py);
        if (d < 1.6 && Math.abs(pz) > 2) pos.setZ(i, pz * (0.66 + 0.26 * (d / 1.6)));                       // the groove
      }
      disc.geometry.computeVertexNormals();
    }
    LP.paint(disc, SHELL, (cx, cy, cz, nx, ny, nz) => {
      if (Math.abs(nz) > 0.25 || Math.abs(cz) > 2) {
        const d = spiralDist(cx, cy);
        if (d < 0.9) return SHELL_DEEP;                                                                    // the floor of the groove
        if (d < 1.7) return SHELL_SHADE;                                                                   // its shaded flanks
      }
      return shellShade(ny);
    });
    // ---- the eye stalks, each hinged at its base so it can wobble, big yellow eyes with dark pupils
    const stalks = [[33, -24, 4, 1], [38, -23, -4, -1]].map((p) => {
      const sg = K.g(body, { x: p[0], y: p[1], z: p[2] });
      LP.jitter(LP.limb(sg, [[0, 0, 0], [2 + p[3] * 0.5, -6.5, 0], [4 + p[3], -12, 0]], 1.05, BODY, { radial: 6 }), 0.15);
      LP.paint(rock(sg, 4.5 + p[3], -16, 0, 5.2, EYE, { detail: 2, m: { rough: 0.6 } }), EYE, (cx, cy, cz, nx, ny) => (ny < -0.3 ? BODY_DEEP : pick(0.2) ? '#e0ae22' : null));   // big yellow eyes, a dark cap over the top
      const pu = K.sphere(6.4 + p[3], -15.5, 2.1, LP.mat('#1c2238', { rough: 0.9 }), sg, { z: 4, seg: 8 }); pu.castShadow = false;
      return { g: sg, x: p[0], y: p[1], z: p[2], ph: U.rand(0, 6) };
    });
    K.pad(-38, -50, 76, 54, g, { d: 30 });

    // ---- idle life: the foot stretches and gathers, the stalks wobble, the shell rocks a little
    let t = U.rand(0, 6);
    LP.tick((dt) => {
      t += dt;
      K.tr(body, { sx: 1 + Math.sin(t * 1.4) * 0.04, sy: 1 - Math.sin(t * 1.4) * 0.02 });
      K.tr(shell, { x: -12, y: -27, r: Math.sin(t * 1.4) * 2 });
      stalks.forEach((s) => K.tr(s.g, { x: s.x, y: s.y, z: s.z, r: Math.sin(t * 2.1 + s.ph) * 8 }));
    });
    return g;
  };
})();
