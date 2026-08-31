/* Chestnut Adventure 2.5D — the Countess, from the character sheet: a magpie in deep navy of dense hand-cut
   facets. The folded wing, the white chest-and-belly and the dark vent are painted on the one faceted body (a
   change of feather colour on the same skin, not lumps); only the wing tips stand off the rump over the tail.
   A thick neck rises almost straight up from the high chest to a narrow head with a tall swept crest, a yellow
   eye with a dark pupil (no brows), a long straight grey beak; in flight two long faceted wings open from the
   shoulders and beat (fly(on)), the legs tuck away and she faces the way she moves; a long tail of five blade
   feathers fanning gently down and back; thin grey legs with knee and ankle knobs and long toes.
   Facing LEFT by default (face(-1) mirrors her), origin between her feet.
   API kept from the old model: M.magpie(parent, x, y, s) → { el, setPos(x, y), face(dir), anchor() }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const M = CH.models;

  const NAVY = '#22315f', NAVY_DEEP = '#121a3c', NAVY_LIGHT = '#30447e', NAVY_EDGE = '#4a5fa0';
  const WHITE = '#e9edf3', WHITE_DEEP = '#c4ccd9', BEAK = '#4a5062', BEAK_DEEP = '#33384a', EYE = '#f2c230', LEG = '#4a5064';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.05 }, o || {}));
  const pick = (p) => Math.random() < p;
  // facets as the sheet paints them: a uniform dark navy with a few lighter ones on top, darker underneath
  const shade = (ny) => (ny < -0.5 ? (pick(0.3) ? NAVY_LIGHT : NAVY) : ny > 0.5 ? NAVY_DEEP : pick(0.06) ? NAVY_LIGHT : NAVY);

  M.magpie = function (parent, x, y, s) {
    s = s || 1;
    const g = K.g(parent);
    const body = K.g(g);
    K.pad(-70, -110, 180, 114, body, { d: 60 });

    // ---- the body: one faceted egg tilted chest-high, rump-low. Painted: the folded wing blanketing the upper
    //      flank from the shoulder to the tail root, darker than the back, its lower edge a clean diagonal
    //      picked out by a lighter feather edge; the white bib from under the neck down the chest and along
    //      the belly and flank up to that edge; the dark vent at the back
    const torso = rock(body, 2, -36, 0, 22, NAVY, { sx: 1.5, sy: 0.9, sz: 0.92, r: 14 });
    const wingLine = (cx) => -11 + (cx + 13) * 0.55 + Math.sin(cx * 0.55) * 1.0;      // the wing's lower edge, local coords (front = -x)
    LP.paint(torso, NAVY, (cx, cy, cz, nx, ny) => {
      const flank = Math.abs(cz) > 3, edge = wingLine(cx);
      if (cx < 13 && cy >= edge) return pick(0.25) ? WHITE_DEEP : WHITE;                // the bib: chest front, belly, flank under the wing
      if (cx >= 13 && cy > 0) return NAVY_DEEP;                                          // the vent under the tail root
      if (flank && cx > -13 && cy < edge && cy > edge - 3) return NAVY_EDGE;             // the wing's feathered lower edge
      if (flank && cx > -13 && cy < edge) return pick(0.12) ? NAVY : NAVY_DEEP;          // the folded wing, the darkest area of the body
      return shade(ny);                                                                  // back, shoulders, chest front
    });
    // the wing tips: a dark flat blade each side standing off the rump, lying back over the root of the tail
    const tips = [1, -1].map((sd) => {
      const w = LP.prism(body, 'M 0 -5 C 14 -4 28 -1 38 4 L 42 8 L 37 10 C 26 7 14 6 0 4 Z', 3, NAVY_DEEP, { x: 16, y: -36, z: sd * 7, bevel: 0.5, seg: 3, ry: sd * 5 });
      LP.jitter(w, 0.3);
      LP.paint(w, NAVY_DEEP, (cx, cy) => (cy > 6.5 ? NAVY_EDGE : pick(0.25) ? NAVY : null));
      return w;
    });

    // ---- the tail: five broad blade feathers from the low rump, a tight stack fanning gently back and down
    const tail = K.g(body, { x: 32, y: -28 });
    [[72, 12, NAVY_LIGHT, 0], [70, 6, NAVY, 2], [68, 0, NAVY, 4], [66, -6, NAVY_DEEP, 6], [62, -12, NAVY_DEEP, 8]].forEach(([len, z, col, tilt]) => {
      const p = LP.prism(tail, `M 0 -5 L ${len - 12} -3 L ${len + 4} 2 L ${len - 10} 9 L 0 4 Z`, 3.5, col, { z, bevel: 0.6, seg: 2, r: tilt });
      LP.jitter(p, 0.3);
      LP.paint(p, col, (cx, cy, cz, nx, ny) => (ny < -0.5 ? NAVY_LIGHT : pick(0.2) ? NAVY_DEEP : null));
    });

    // ---- the neck: one thick tapering column rising almost straight up from deep inside the chest into the head
    const neck = K.tubeDyn(10, 10, 1, LP.mat(NAVY), body);
    neck.set((t) => { const u = 1 - t; return [u * u * 0 + 2 * u * t * -12 + t * t * -22, u * u * -38 + 2 * u * t * -54 + t * t * -78, 0]; }, (t) => 15 - 6 * t);
    LP.jitter(neck.mesh, 0.5);
    LP.paint(neck.mesh, NAVY, (cx, cy, cz, nx, ny) => (cy > -52 && cx < -8 && nx < -0.15 ? (pick(0.25) ? WHITE_DEEP : WHITE) : shade(ny)));

    // ---- the head: a small narrow faceted head; one tall crest swept up and back; the straight grey beak; yellow eyes (no brows, as on the sheet)
    const head = K.g(body, { x: -22, y: -74 });
    LP.paint(rock(head, 0, 0, 0, 10.2, NAVY, { sx: 1.3, sy: 0.82, sz: 0.8 }), NAVY, (cx, cy, cz, nx, ny) => (cy > 4.5 ? NAVY_DEEP : shade(ny)));
    const crest = LP.prism(head, 'M -3 -7 L 2.5 -12.5 L 8 -19.5 L 11.5 -24 L 14 -22 L 13.5 -12.5 L 11 -6 Z', 6, NAVY, { bevel: 2, bevelSeg: 1, seg: 1 });
    LP.jitter(crest, 0.4);
    LP.paint(crest, NAVY, (cx, cy, cz, nx) => (Math.abs(nx) > 0.6 ? (pick(0.5) ? NAVY_LIGHT : null) : NAVY_DEEP));
    LP.prism(head, 'M -11.5 -2.6 L -33 -0.4 L -11.5 2.2 Z', 4, BEAK, { bevel: 0.2, seg: 1 });                                     // the upper mandible
    LP.prism(head, 'M -11.5 1.8 L -31.5 0.2 L -11.5 4.4 Z', 3, BEAK_DEEP, { bevel: 0.2, seg: 1, noShadow: true });                // the lower mandible
    const eyes = [1, -1].map((sd) => {
      const e = LP.eye(head, -3.5, -1.2, sd * 8.2, 3.6, { color: EYE, pupil: true, glint: false, seg: 10 });
      if (sd < 0) K.tr(e, { x: -3.5, y: -1.2, z: -8.2, ry: 180 });
      return e;
    });

    // ---- legs: thin and grey under the body's middle, a knee knob under the belly and an ankle knob at the foot,
    //      three long toes forward and one back
    const legs = K.g(body);
    [-4, 8].forEach((lx) => {
      K.tube([[lx, -24, 0], [lx + 2, -1, 0]], 1.7, LP.mat(LEG), legs, { straight: true, radial: 6 }).castShadow = false;
      K.sphere(lx + 1, -12.5, 3, LP.mat(LEG), legs, { seg: 8 }).castShadow = false;
      K.sphere(lx + 2, -1, 2.6, LP.mat(LEG), legs, { seg: 8 }).castShadow = false;
      [[-13, -5.5], [-14, 0], [-12, 5.5], [10, 0]].forEach(([dx, dz]) => K.tube([[lx + 2, -1, 0], [lx + 2 + dx, 1.5, dz]], 1.3, LP.mat(LEG), legs, { straight: true, radial: 5 }).castShadow = false);
    });

    // ---- the flight wings: two long faceted blades hinged at the shoulders, hidden while she perches (the folded
    //      wing is painted on the body) and spread, beating, while she flies — the same bird, wings opened: navy
    //      coverts, a white bar across the primaries, scalloped feather tips
    const WING_IN = 'M 0 -7 C 14 -14 28 -15 40 -14 L 40 16 L 33 12 L 29 19 L 17 14 L 13 19 L 5 13 C 0 10 0 2 0 -7 Z';           // the arm: shoulder to the wrist
    const WING_OUT = 'M 0 -14 C 8 -14 18 -12 36 -4 L 30 4 L 21 3 L 18 11 L 7 8 L 4 16 L 0 16 Z';                              // the hand: primaries stepping back in scallops
    const wings = [1, -1].map((sd) => {
      const hinge = K.g(body, { x: -6, y: -52, z: sd * 11 });
      const plane = K.g(hinge, { rx: -sd * 90, ry: -sd * 55 });                                   // laid flat, its length out to the side and swept back 35°, the feathered edge toward the tail
      const wi = LP.prism(plane, WING_IN, 2.6, NAVY, { bevel: 0.4, seg: 2 });
      const fold = K.g(plane, { x: 40, rx: -sd * 16 });                                            // the wrist: the outer half dips, so no camera ever sees the wing edge-on
      const wo = LP.prism(fold, WING_OUT, 2.4, NAVY, { bevel: 0.4, seg: 2 });
      [wi, wo].forEach((w, k) => {
        LP.jitter(w, 0.3);
        LP.paint(w, NAVY, (cx, cy, cz, nx, ny) => (k === 1 && cx > 6 && cx < 22 && cy > -10 && cy < 3 ? (pick(0.25) ? WHITE_DEEP : WHITE) : cy > 8 ? NAVY_DEEP : (k === 0 && cx < 10) ? NAVY_LIGHT : pick(0.15) ? NAVY_LIGHT : NAVY));
      });
      hinge.visible = false;
      return { hinge, sd };
    });
    let flying = false, lastX = x, beatK = 1, beatFix = null;   // beatFix: a frozen beat angle (for stills)

    // ---- idle life: she bobs, cocks her head, flicks her tail, blinks; the wing tips shrug now and then
    const blink = LP.blinker(eyes, { min: 1.5, max: 5 });
    let t = U.rand(0, 6), dir = 1;
    LP.tick((dt) => {
      t += dt;
      blink(dt);
      if (flying) {
        const vx = x - lastX;
        if (Math.abs(vx) > 0.4) dir = vx < 0 ? 1 : -1;                                                   // she faces left by default: moving left keeps dir 1
        const beat = beatFix != null ? beatFix : (Math.sin(t * 16) * 30 + 22) * beatK;
        wings.forEach((w) => K.tr(w.hinge, { x: -6, y: -52, z: w.sd * 11, rx: w.sd * beat }));
      }
      lastX = x;
      const cock = Math.sin(t * 0.7) > 0.6 ? Math.sin(t * 6) * 6 : Math.sin(t * 1.3) * 2;
      K.tr(head, { x: -22, y: -74 + Math.sin(t * 2.4) * 0.8, r: cock });
      K.tr(tail, { x: 32, y: -28, r: Math.sin(t * 2.1) * 3 + (Math.sin(t * 0.9) > 0.85 ? -8 : 0) });
      const shrug = Math.sin(t * 0.5) > 0.9 ? Math.sin(t * 9) * 3 : 0;
      tips.forEach((w, i) => K.tr(w, { x: 16, y: -36, z: (i ? -1 : 1) * 7, ry: (i ? -1 : 1) * 5, r: shrug }));
      K.tr(body, { sx: dir, sy: 1 + Math.sin(t * 2.4) * 0.012, sz: 1, r: flying ? 9 * dir : 0 });   // in flight she levels out, nose a touch down
      K.tr(g, { x, y: y + Math.sin(t * 2.4) * 1.4, s });
    });

    const fly = (on, o) => {
      flying = !!on; beatFix = o && o.beat != null ? o.beat : null;
      wings.forEach((w) => { w.hinge.visible = flying; });
      legs.visible = !flying;
      tips.forEach((w) => { w.visible = !flying; });
    };
    const actor = { el: g, setPos(nx, ny) { x = nx; y = ny; }, face(d) { dir = d >= 0 ? 1 : -1; }, fly, anchor: () => ({ x, y: y - 110 }) };
    g.userData.actor = actor;
    return actor;
  };
})();
