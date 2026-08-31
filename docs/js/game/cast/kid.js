/* Chestnut Adventure 2.5D — the Kid, from the character sheet: a child's silhouette in the lit window of the
   house, seen from the front — a round head of dense facets under a tousled mop of hair (a fringe over the
   brow, a fuller mass on the left, five tufts flicking up and to the right), a small round ear, a short wide
   neck, sloping shoulders, and one arm raised in a clear V beside the head with a compact open hand, five
   chunky fingers spread in a wave. One near-black plum material for the whole figure (the sheet shows a
   shadow, not a painted figure), shared so the cutscene can fade the whole silhouette in. Origin at the
   bottom centre of the torso (the sill line).
   API: M.kid(parent, x, y, s) → { el, arm (group pivoted at the shoulder, rotate it with K.tr(arm, { r }) to
   wave), setOpacity(v) }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const KID = '#1a1424';

  M.kid = function (parent, x, y, s) {
    s = s || 1;
    const g = K.g(parent, { x, y, s });
    const body = K.g(g);
    const mat = new T.MeshStandardMaterial({ color: new T.Color(KID), roughness: 1, flatShading: true, transparent: true, opacity: 1 });
    const rock = (p, rx, ry, rz, r, o) => LP.rock(p, rx, ry, rz, r, mat, Object.assign({ detail: 2, jitter: 0.04 }, o || {}));
    const noShadow = (m) => { m.castShadow = false; return m; };

    // ---- torso: sloping shoulders narrowing to the neck, a faceted chest
    noShadow(LP.jitter(LP.prism(body, 'M -28 0 C -29 -10 -26 -17 -20 -21 L -10 -26 C -5 -28 5 -28 10 -26 L 20 -21 C 26 -17 29 -10 28 0 Z', 16, mat, { bevel: 3, bevelSeg: 2, seg: 5 }), 0.4));
    // the far arm hangs tight against the side, behind the sill
    noShadow(K.tube([[-19, -20, 0], [-22, -4, 0]], 4, mat, body, { straight: true, radial: 7 }));
    // ---- a short wide neck; the head; a soft round ear on the left
    noShadow(LP.cyl(body, -2, -26, 0, 5.5, 12, mat, { seg: 10 }));
    const head = K.g(body, { x: -3, y: -46 });
    noShadow(rock(head, 0, 0, 0, 15.5, { sx: 1.02, sy: 1.06 }));
    noShadow(rock(head, -16, 2.5, 0, 4.4, { sx: 0.8, sz: 0.55 }));
    // ---- the hair, all of it in the plane of the silhouette (it is a shadow: nothing is built round the back
    //      of the head): one flat plate over the crown that bulges fuller on the left, a jagged fringe over the
    //      brow, and five curved tufts of unequal size all flicking up and to the right
    noShadow(LP.jitter(LP.prism(head, 'M -19 -2 C -21 -8 -18 -15 -10 -19 C -3 -22.5 6 -21.5 12 -16 L 14 -12 L 10 -6 C 4 -10 -4 -11 -9 -5 L -12 -1 Z', 8, mat, { bevel: 1, bevelSeg: 1, seg: 5 }), 0.3));
    noShadow(LP.jitter(LP.prism(head, 'M -15 -9 L -14 -1 L -10 5 L -6 -1 L -1 4 L 4 -1 L 9 3 L 13 -3 L 14 -9 Z', 5, mat, { z: 12, bevel: 1, bevelSeg: 1, seg: 1 }), 0.3));   // the fringe
    [[-120, 13, 8, 10], [-100, 15, 9, 22], [-80, 17, 9, 34], [-60, 16, 9, 46], [-40, 13, 8, 58], [-22, 10, 7, 70]].forEach(([deg, len, w, lean]) => {
      const a = deg * Math.PI / 180, hw = w / 2;
      // a curved tooth: the leading side bows out, the trailing side sweeps in to the tip
      const d = `M ${-hw} 0 C ${-hw - 2} ${-len * 0.45} ${-hw * 0.6} ${-len * 0.8} ${hw * 0.15} ${-len} C ${hw * 0.55} ${-len * 0.7} ${hw * 0.8} ${-len * 0.35} ${hw} 0 Z`;
      const p = LP.prism(head, d, 7, mat, { x: Math.cos(a) * 13.5, y: Math.sin(a) * 13.5 - 2, bevel: 1, bevelSeg: 1, seg: 4, r: lean });
      noShadow(LP.jitter(p, 0.3));
    });

    // ---- the raised arm: pivoted at the top corner of the shoulder, a thick child's arm bent in a clear V,
    //      the forearm rising close beside the head, a compact open hand with five chunky fingers
    const arm = K.g(body, { x: 16, y: -25 });
    noShadow(rock(arm, 0, 0, 0, 6.6, { detail: 1 }));                                                          // the shoulder
    noShadow(K.tube([[0, 0, 0], [17, -4, 0]], 6.2, mat, arm, { straight: true, radial: 8 }));                   // a thick child's upper arm, out to the elbow at chin height
    noShadow(rock(arm, 17, -4, 0, 5.9, { detail: 1 }));                                                         // the elbow
    noShadow(K.tube([[17, -4, 0], [15, -18, 0]], 5.6, mat, arm, { straight: true, radial: 8 }));                // the forearm, up beside the head, a clear gap of glass between them
    noShadow(K.tube([[15, -18, 0], [14, -22, 0]], 4.8, mat, arm, { straight: true, radial: 8 }));               // …narrowing to the wrist
    noShadow(rock(arm, 13.5, -27, 0, 7.2, { sx: 1.1, sy: 1.05, sz: 0.5 }));                                     // a compact palm flat to the glass at ear height beside the head
    [[[7, -30], [1, -36]], [[9, -34], [7, -45]], [[13, -35], [13.5, -47]], [[17, -34], [20, -45]], [[20, -30], [26, -35]]].forEach(([a, b]) => {   // five spread fingers pointing up past the crown, the thumb out to the left
      noShadow(K.tube([[a[0], a[1], 0], [b[0], b[1], 0]], 2.2, mat, arm, { straight: true, radial: 6 }));
      noShadow(K.sphere(b[0], b[1], 2.2, mat, arm, { seg: 6 }));
    });

    // ---- idle life: a breath, a slow tilt of the head
    let t = U.rand(0, 5);
    LP.tick((dt) => {
      t += dt;
      K.tr(body, { sy: 1 + Math.sin(t * 1.5) * 0.012 });
      K.tr(head, { x: -3, y: -46 + Math.sin(t * 1.5) * 0.4, r: Math.sin(t * 0.8) * 2.5 });
    });

    const api = { el: g, arm, setOpacity(v) { mat.opacity = v; mat.transparent = true; } };
    g.userData.kid = api;
    return api;
  };
})();
