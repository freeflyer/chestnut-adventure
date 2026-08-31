/* Chestnut Adventure 2.5D — Dino, from the character sheet: a green wind-up toy tyrannosaur of dense hand-cut
   facets standing tall on two thick legs. Body, neck and tail are ONE skin — a faceted loft along an S-shaped
   spine that swells from the tail tip through the rump and the chest and narrows into the neck, so the body
   flows into the tail with no seam. The cream throat-chest-belly band and the narrow orange crossbands over
   the back and down the tail are painted on that same skin. A golden butterfly key in his back, one amber eye
   set into the side of the head with a soft painted shadow round it, a short blunt snout with two dark
   painted nostril dents, an open mouth with rows of tiny teeth inside the jaws, stubby arms held forward from
   the chest with two-clawed hands, big three-clawed feet. Facing RIGHT, origin under his feet.
   API kept from the old model: M.dino(parent, x, y, z, s) → the group. The dream scene finds his eye as the
   only SphereGeometry child of that group and scales it to make him sleep, so the eye stays exactly that. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const GREEN = '#68a844', GREEN_DEEP = '#4f8c36', GREEN_LIGHT = '#86bf54', BELLY = '#f0d99c', BELLY_DEEP = '#e6c980', STRIPE = '#ea7f2a', STRIPE_DEEP = '#d86f22';
  const KEY = '#e2b53a', KEY_DEEP = '#b8891f', TOOTH = '#f4efe2', CLAW = '#e8d9a0', EYE = '#f0bf2a', SOCKET = '#3d6e2a', NOSTRIL = '#1f3d16';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.05 }, o || {}));
  const pick = (p) => Math.random() < p;
  const shade = (ny) => (ny < -0.45 ? GREEN_LIGHT : ny > 0.5 ? GREEN_DEEP : pick(0.03) ? GREEN_LIGHT : GREEN);
  const tan = () => (pick(0.12) ? BELLY_DEEP : BELLY);
  const orange = () => (pick(0.15) ? STRIPE_DEEP : STRIPE);
  const green = (m) => LP.paint(m, GREEN, (cx, cy, cz, nx, ny) => shade(ny));

  /** one faceted skin lofted along a spine in the xy plane: an elliptical section (a: in-plane half-depth,
      b: half-width in z) that changes smoothly along it. Returns the mesh and a helper that tells, for any
      point, where along the spine it lies and how far toward the belly side it is. */
  const loft = (parent, spine, a, b, rows, radial, mat) => {
    const curve = new T.CatmullRomCurve3(spine.map((p) => new T.Vector3(p[0], p[1], 0)), false, 'catmullrom', 0.5);
    const P = [], I = [];
    const frames = [];
    for (let i = 0; i <= rows; i++) {
      const t = i / rows, p = curve.getPoint(t), tg = curve.getTangent(t).normalize();
      const n = new T.Vector3(-tg.y, tg.x, 0);                                    // in-plane normal: toward the belly side (the spine runs tail → head, the belly is on its right)
      frames.push({ t, p, n, a: a(t), b: b(t) });
      for (let j = 0; j < radial; j++) {
        const th = (j / radial) * Math.PI * 2;
        P.push(p.x + n.x * a(t) * Math.cos(th), p.y + n.y * a(t) * Math.cos(th), b(t) * Math.sin(th));
      }
    }
    for (let i = 0; i < rows; i++) for (let j = 0; j < radial; j++) {
      const a0 = i * radial + j, a1 = i * radial + (j + 1) % radial, b0 = a0 + radial, b1 = a1 + radial;
      I.push(a0, a1, b0, a1, b1, b0);   // wound so the outside is the front face: the other way round the skin rendered inside out, its near wall culled, and everything behind it (the far thigh, the back's bands) showed through
    }
    // hand-cut jitter in proportion to the local girth (a thin tail tip must not turn into a saw)
    for (let i = 0; i <= rows; i++) { const amt = Math.min(0.35, a(i / rows) * 0.06); for (let j = 0; j < radial; j++) { const k = (i * radial + j) * 3; P[k] += U.rand(-amt, amt); P[k + 1] += U.rand(-amt, amt); P[k + 2] += U.rand(-amt, amt); } }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(P, 3));
    geo.setIndex(I);
    geo.computeVertexNormals();
    const m = K.mesh(geo, mat, parent, {});
    // paint helper: LP.paint visits the triangles in order, two per quad, row by row — so the k-th call knows its
    // row (t along the spine) and its angle round the section (cos > 0 toward the belly)
    const facet = () => { let k = 0; return () => { const q = Math.floor(k++ / 2), row = Math.floor(q / radial), j = q % radial; return { t: row / rows, belly: Math.cos(((j + 0.5) / radial) * Math.PI * 2), side: Math.sin(((j + 0.5) / radial) * Math.PI * 2) }; }; };
    return { mesh: m, facet };
  };

  M.dino = function (parent, x, y, z, s) {
    const g = K.g(parent, { x, y, z: z || 0, s: s || 1 });
    const parts = K.g(g);   // everything but the eye lives here, so the eye is the group's only sphere

    // ---- body, neck and tail: one skin along the spine from the tail tip, up over the rump, forward through the
    //      belly and chest, and up the neck to the base of the skull; cream down the front, orange crossbands
    //      over the back that carry on down the tail
    const SPINE = [[-40, -50], [-34, -38], [-26, -24], [-16, -17], [-4, -21], [6, -33], [13, -44], [20, -53]];
    const prof = (t) => {   // half-depth in the body plane
      const k = [[0, 1.0], [0.1, 2.4], [0.2, 4.6], [0.3, 7.5], [0.42, 10.8], [0.55, 12.6], [0.68, 12.2], [0.8, 8.8], [0.9, 6.2], [1, 5.2]];
      for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [t0, r0] = k[i - 1], [t1, r1] = k[i]; return r0 + (r1 - r0) * (t - t0) / (t1 - t0); }
      return 5.2;
    };
    const body = loft(parts, SPINE, prof, (t) => prof(t) * 0.86, 40, 18, LP.mat(GREEN));
    const at = body.facet();
    const BANDS = new Set([6, 7, 10, 11, 14, 15, 18, 19, 22, 23, 26, 27, 30, 31]);                  // rows: seven crossbands two rows wide, from the tail up over the back
    LP.paint(body.mesh, GREEN, (cx, cy, cz, nx, ny) => {
      const w = at();
      if (w.t > 0.46 && w.belly > 0.66) return tan();                                             // throat, chest, belly: the cream strip down the front
      if (BANDS.has(Math.round(w.t * 40)) && w.belly < 0.2) return orange();                       // the bands wrap over the back and down the flanks
      return shade(ny);
    });
    body.mesh.castShadow = true; body.mesh.receiveShadow = true;

    // ---- the head: one rounded wedge, its top line running straight from the back of the skull down to the blunt
    //      snout, all green; the eye set into its side under a soft painted shadow; two dark nostril dents at the tip;
    //      a dark mouth with the upper teeth hanging inside the wedge's edge and the lower teeth on a hinged jaw
    const head = K.g(parts, { x: 22.5, y: -52.5, s: 1.0 });
    const skull = LP.prism(head, 'M -9 -5 C -6 -8 1 -8.5 6 -7 L 12 -3 C 13.8 -0.5 13.8 2.5 12.2 4 L -7 4.5 C -10.5 2 -11.5 -2 -9 -5 Z', 12.5, GREEN, { bevel: 3, bevelSeg: 2, seg: 5 });
    LP.jitter(skull, 0.5);
    LP.paint(skull, GREEN, (cx, cy, cz, nx, ny) => {
      if (Math.abs(cz) > 3.2 && cx > 9.6 && cy > -4.2 && cy < -0.4) return NOSTRIL;                                    // the nostril dents, painted dark on the snout's facets
      const de = Math.hypot(cx - 2.5, cy + 4);                                                                            // the eye socket: a soft shadow round the eye on both sides
      if (Math.abs(cz) > 4.8 && de < 4.6) return de < 3.2 ? SOCKET : pick(0.5) ? SOCKET : GREEN_DEEP;
      return shade(ny);
    });
    LP.prism(head, 'M -3 3 L 10 3 L 10 5 L -3 5 Z', 6.5, '#4a1f22', { bevel: 0.2, bevelSeg: 1, seg: 1, noShadow: true });   // the dark line of the mouth
    const jaw = K.g(head, { x: -5, y: 3.4 });
    const jawM = LP.prism(jaw, 'M 0 0 L 16.5 -0.5 L 16.5 3 L 0 4 Z', 9.5, GREEN_DEEP, { bevel: 1.2, bevelSeg: 1, seg: 2, z: 0 });
    LP.jitter(jawM, 0.3);
    LP.paint(jawM, GREEN_DEEP, (cx, cy, cz, nx, ny) => (pick(0.2) ? GREEN : null));
    for (let i = 0; i < 8; i++) {
      LP.cone(head, 0.5 + i * 1.5, 5.0, 3.4, 0.34, 0.9, TOOTH, { seg: 4, r: 180 });                           // tiny upper teeth along the lip line, within the jaw's width…
      LP.cone(head, 0.5 + i * 1.5, 5.0, -3.4, 0.34, 0.9, TOOTH, { seg: 4, r: 180 });
      LP.cone(jaw, 4.5 + i * 1.5, 0.3, 2.7, 0.32, 0.85, TOOTH, { seg: 4 });                                   // …and tiny lower teeth on the jaw, well inside its bevelled edge
      LP.cone(jaw, 4.5 + i * 1.5, 0.3, -2.7, 0.32, 0.85, TOOTH, { seg: 4 });
    }

    // ---- the eye: the group's one sphere (the dream scene scales it to close it), flat amber set into the side of
    //      the head, a small pupil, no ring — the shadow round it is painted on the skull; the lid rides on it
    const eye = K.sphere(25, -56.5, 2.9, LP.mat(EYE, { rough: 0.7 }), g, { z: 5.6, seg: 12 });
    K.tr(eye, { sz: 0.38 });
    eye.castShadow = false;
    const pupil = K.sphere(0.4, 0, 1.0, K.mat('#17131c', { rough: 0.9 }), eye, { z: 3, seg: 8 }); pupil.castShadow = false;
    const glint = K.sphere(-0.3, -0.8, 0.35, K.mat('#ffffff', { emissive: '#ffffff', ei: 0.4 }), eye, { z: 3.6, seg: 6 }); glint.castShadow = false;
    const lid = K.sphere(0, 0, 3.0, LP.mat(GREEN), eye, { seg: 10 }); lid.castShadow = false;   // hidden inside the eye until it closes
    K.tr(lid, { y: -3.0, z: -0.6, sy: 0.02 });

    // ---- arms: off the upper chest, held forward with a bent elbow, small two-clawed hands
    //      legs: thick thighs from the hips, shanks down to big flat three-clawed feet pointing forward
    [-1, 1].forEach((sd) => {
      const az = sd * 5.5;
      LP.jitter(LP.limb(parts, [[13, -30, az], [18, -27, az + sd * 0.5], [21, -31, az + sd]], 2.5, GREEN, { radial: 7 }), 0.2);
      green(rock(parts, 21.5, -32.5, az + sd, 2.6, GREEN, { detail: 1 }));                                        // the hand
      [-1, 1].forEach((cz) => LP.cone(parts, 24, -32, az + sd + cz, 0.65, 2.6, CLAW, { seg: 4, r: 90 }));         // its two claws, pointing forward
      green(rock(parts, -3, -17, sd * 6.5, 7, GREEN, { sy: 1.25 }));                                             // the thigh
      LP.jitter(LP.limb(parts, [[-2, -13, sd * 6.5], [1, -3, sd * 7.5]], 4.2, GREEN, { radial: 8 }), 0.2);        // the shank
      LP.paint(rock(parts, 4, -2, sd * 7.5, 6.2, GREEN_DEEP, { sx: 1.6, sy: 0.45, sz: 1.0 }), GREEN_DEEP, () => (pick(0.3) ? GREEN : null));   // the foot
      [-3.6, 0, 3.6].forEach((cz) => LP.cone(parts, 13, 0, sd * 7.5 + cz, 1.2, 3.6, CLAW, { seg: 4, r: 90 }));
    });

    // ---- the golden butterfly key in his back: a short angled shaft sunk into the skin, the two loops over the back
    const key = K.g(parts, { x: -8, y: -38, z: 0, r: -40 });
    K.cylUp(0, 3, 1.4, 8.5, LP.mat(KEY_DEEP), key, { seg: 8 });
    K.box(-0.8, -8, 1.6, 2.5, 1.6, LP.mat(KEY_DEEP), key, { z: 0 });
    K.torus(-3.3, -10.3, 3.2, 1.2, LP.mat(KEY), key, { rx: 0 });                                                // the two loops of the butterfly, lifted clear of the back
    K.torus(3.3, -10.3, 3.2, 1.2, LP.mat(KEY), key, { rx: 0 });

    K.pad(-46, -66, 74, 70, g, { d: 30 });

    // ---- idle life: the key turns, the jaw chatters now and then, the eye blinks by its lid, the whole toy sways a little
    let t = U.rand(0, 6), next = U.rand(2, 5), lidK = 0, lidPhase = -1;
    LP.tick((dt) => {
      t += dt;
      K.tr(parts, { r: Math.sin(t * 0.9) * 1.2, ox: 0, oy: 0 });
      K.tr(key, { x: -8, y: -38, z: 0, r: -40, ry: t * 40 });
      const chat = Math.sin(t * 0.45) > 0.9 ? Math.abs(Math.sin(t * 14)) * 5 : 0;
      K.tr(jaw, { x: -5, y: 3.4, r: chat });
      if (lidPhase < 0) { next -= dt; if (next <= 0) lidPhase = 0; }
      else { lidPhase += dt; lidK = lidPhase < 0.08 ? lidPhase / 0.08 : Math.max(0, 1 - (lidPhase - 0.08) / 0.08); if (lidPhase >= 0.16) { lidPhase = -1; next = U.rand(2, 5); lidK = 0; } }
      K.tr(lid, { y: -3.0 + lidK * 3.0, z: -0.6 + lidK * 0.9, sy: 0.02 + lidK * 1.02 });
    });
    return g;
  };
})();
