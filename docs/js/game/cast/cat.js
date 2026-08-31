/* Chestnut Adventure 2.5D — Biscuit, from the character sheet: a big orange low-poly cat asleep, a compact
   dome of crisp hand-cut facets rising to an apex mid-back and dropping into a round haunch, a big wide
   head turned three-quarters to us and resting on two big forward paws. Every colour change is painted on
   the same skin — the warm-cream muzzle, cheeks and chin, the cream chest, the cream toes, the deeper-orange
   facets over the back and the bands of the tail — never a separate lump. On the face two long thin upturned
   closed-eye lines, a small dark triangle of a nose, a little "w" of a mouth and whiskers; thick ears with
   peach insides; a plush tail curling in a tight hook forward over the back to a pointed cream tip.
   Facing LEFT, origin under the belly.
   API kept from the old model: M.cat(parent, x, y, s) → { el, setPos(x, y), wake(v), anchor() }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const FUR = '#ee8a35', FUR_DEEP = '#c9601e', CREAM = '#efd3a4', CREAM_DEEP = '#c9a678', INK = '#2a1d16', NOSE = '#4a2a1c', EAR = '#f0a080', WHISKER = '#f6ecd8';
  const rock = (parent, x, y, z, r, color, o) => LP.rock(parent, x, y, z, r, color, Object.assign({ detail: 2, jitter: 0.07 }, o || {}));
  /** a rock painted by a rule given in the mesh's own local coordinates (before its placement transform) */
  const painted = (parent, x, y, z, r, o, rule) => { const m = rock(parent, x, y, z, r, FUR, o); LP.paint(m, FUR, rule); return m; };

  M.cat = function (parent, x, y, s) {
    s = s || 1;
    const g = K.g(parent);
    const body = K.g(g);

    // ---- the body: a compact dome, apex mid-back, a round haunch at the rear, shoulders and chest up front;
    //      a scatter of deeper-orange facets over the top of the back, the chest painted cream
    const backShade = (cx, cy, cz, nx, ny) => (ny < -0.55 && Math.random() < 0.3 ? FUR_DEEP : null);
    painted(body, 4, -54, 0, 48, { sx: 0.92, sy: 1.22, sz: 1.0 }, backShade);
    painted(body, 36, -40, 6, 34, { sx: 1.0, sy: 1.0, sz: 1.2, ry: 20 }, backShade);                 // the haunch, swelling out of the dome
    rock(body, 44, -18, 16, 20, FUR, { sx: 1.1, sy: 0.7, sz: 0.9 });                                 // the folded thigh
    painted(body, -30, -50, 6, 30, { ry: -20 }, backShade);                                          // the shoulders
    rock(body, -46, -44, 10, 24, FUR, { sx: 1.0, sy: 0.9, sz: 1.0 });                                // the neck, flowing into the head
    painted(body, -50, -30, 12, 23, { sx: 1.0, sy: 0.95, sz: 1.0 }, (cx, cy, cz) => (cx < 0 && cy > -10 && cz > 0 ? CREAM : null)); // the chest, cream in front
    // the forelegs from the shoulders to two big paws side by side under the chin, toes painted cream
    [[26, 0], [0, -8]].forEach(([z, ahead]) => {
      K.tube([[-54, -36, z - 2], [-72, -20, z], [-86 + ahead, -16, z]], 10, LP.mat(FUR), body, { straight: true, radial: 8 });
      painted(body, -100 + ahead, -15, z, 16, { sx: 1.7, sy: 0.72, sz: 1.0 }, (cx, cy, cz) => {
        if (cx > -6) return null;
        if (cx < -10 && cy > -4 && Math.abs(Math.sin(cz * 0.55)) > 0.72) return CREAM_DEEP;   // the grooves between the toes
        return CREAM;
      });
    });

    // ---- the tail: plush, a tight hook forward over the back, bands painted along it, a pointed cream tip; hinged to sway
    const tailG = K.g(body, { x: 62, y: -26, z: 0 });
    const curve = new T.CatmullRomCurve3([[-12, -2, 4], [0, 0, 0], [16, -16, -6], [24, -44, -10], [12, -70, -10], [-10, -80, -6], [-32, -72, 0]].map((p) => new T.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.6);   // the first point sits inside the haunch: the root grows out of the rump
    const samples = []; for (let k = 0; k <= 60; k++) samples.push(curve.getPoint(k / 60));
    const tail = K.tubeDyn(28, 8, 20, LP.mat(FUR), tailG);
    tail.set((t) => { const v = curve.getPoint(t); return [v.x, v.y, v.z]; }, (t) => 20 - t * 11);
    LP.paint(tail.mesh, FUR, (cx, cy, cz) => {
      let best = 0, bd = 1e9; for (let k = 0; k < samples.length; k++) { const q = samples[k], dd = (q.x - cx) ** 2 + (q.y - cy) ** 2 + (q.z - cz) ** 2; if (dd < bd) { bd = dd; best = k; } }
      const t = best / 60;
      if (t > 0.9) return CREAM;
      return Math.floor(t * 7) % 2 ? FUR_DEEP : null;
    });
    const e = curve.getPoint(1), et = curve.getTangent(1);
    const tipGeo = new T.ConeGeometry(9, 22, 7); tipGeo.rotateX(Math.PI / 2);
    const tip = K.mesh(tipGeo, LP.mat(CREAM), tailG);
    tip.position.set(e.x + et.x * 10, e.y + et.y * 10, e.z + et.z * 10); tip.lookAt(e.x + et.x * 40, e.y + et.y * 40, e.z + et.z * 40);

    // ---- the head: big and wide, built with its face toward +z, then turned three-quarters to us and laid on the paws;
    //      the muzzle, cheeks and chin are cream facets of the same skin
    const head = K.g(body, { x: -70, y: -50, z: 16, ry: -40, r: 4 });
    painted(head, 0, 0, 0, 40, { sx: 1.3, sy: 0.88, sz: 0.95 }, (cx, cy, cz) => {
      const front = cz > 12, low = cy > 3 - Math.abs(cx) * 0.12;                       // the lower front of the face
      const cheek = cz > 0 && cy > 4 && Math.abs(cx) > 12 && Math.abs(cx) < 40;      // out to the broad cheeks
      return (front && low) || cheek ? CREAM : null;
    });
    painted(head, 0, 12, 22, 22, { sx: 1.35, sy: 0.6, sz: 0.55 }, () => CREAM);                                 // a gentle cream bulge for the muzzle, sunk into the head
    // the ears (thick wedges, peach inside), hinged so they can flick
    const earWedge = (parent) => {   // a triangular wedge, its front face cut into 36 facets so the peach inside is paint on the same skin
      const A = [-14, 4], B = [0, -22], C = [14, 4], D = 6, N = 6;
      const cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3 + 2];   // the inner triangle: 72%, sunk a little lower in the ear
      const inner = [A, B, C].map((p) => [cen[0] + (p[0] - cen[0]) * 0.58, cen[1] + (p[1] - cen[1]) * 0.66]);
      const inTri = (px, py) => { const [p, q, r] = inner; const s1 = (q[0] - p[0]) * (py - p[1]) - (q[1] - p[1]) * (px - p[0]), s2 = (r[0] - q[0]) * (py - q[1]) - (r[1] - q[1]) * (px - q[0]), s3 = (p[0] - r[0]) * (py - r[1]) - (p[1] - r[1]) * (px - r[0]); return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0); };
      const P = [], Cc = [], G = [], fur = new T.Color(FUR), fd = new T.Color(FUR_DEEP), pe = new T.Color(EAR), pd = new T.Color('#dd8a6c');
      const tri = (a, b, c, col) => { P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); for (let k = 0; k < 3; k++) Cc.push(col.r, col.g, col.b); G.push(col === pe || col === pd ? 1 : 0); };
      const bary = (i, j) => { const u = i / N, v = j / N, w = 1 - u - v; return [A[0] * w + B[0] * u + C[0] * v, A[1] * w + B[1] * u + C[1] * v]; };
      for (let i = 0; i < N; i++) for (let j = 0; j < N - i; j++) {            // the front face (+z), subdivided
        const p0 = bary(i, j), p1 = bary(i + 1, j), p2 = bary(i, j + 1);
        const c0 = [(p0[0] + p1[0] + p2[0]) / 3, (p0[1] + p1[1] + p2[1]) / 3];
        tri([p0[0], p0[1], D], [p1[0], p1[1], D], [p2[0], p2[1], D], inTri(c0[0], c0[1]) ? (Math.random() < 0.2 ? pd : pe) : (Math.random() < 0.2 ? fd : fur));
        if (j < N - i - 1) { const p3 = bary(i + 1, j + 1); const c1 = [(p1[0] + p3[0] + p2[0]) / 3, (p1[1] + p3[1] + p2[1]) / 3]; tri([p1[0], p1[1], D], [p3[0], p3[1], D], [p2[0], p2[1], D], inTri(c1[0], c1[1]) ? (Math.random() < 0.2 ? pd : pe) : (Math.random() < 0.2 ? fd : fur)); }
      }
      tri([A[0], A[1], -D], [C[0], C[1], -D], [B[0], B[1], -D], fur);           // the back face
      [[A, B], [B, C], [C, A]].forEach(([p, q]) => {                             // the three walls
        tri([p[0], p[1], D], [p[0], p[1], -D], [q[0], q[1], -D], fur); tri([p[0], p[1], D], [q[0], q[1], -D], [q[0], q[1], D], fur);
      });
      // reorder the facets so the peach ones form one material group (the inside glows faintly, as skin lit from within)
      const order = G.map((g, i) => i).sort((a, b) => G[a] - G[b]);
      const P2 = [], C2 = []; order.forEach((i) => { for (let k = 0; k < 9; k++) P2.push(P[i * 9 + k]); for (let k = 0; k < 9; k++) C2.push(Cc[i * 9 + k]); });
      const nFur = G.filter((g) => g === 0).length;
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(P2, 3));
      geo.setAttribute('color', new T.Float32BufferAttribute(C2, 3));
      geo.addGroup(0, nFur * 3, 0); geo.addGroup(nFur * 3, (G.length - nFur) * 3, 1);
      geo.computeVertexNormals();
      const m = new T.Mesh(geo, [new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, flatShading: true, roughness: 0.8 }),
        new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, flatShading: true, roughness: 0.8, emissive: new T.Color(EAR), emissiveIntensity: 0.32 })]);
      m.castShadow = true; m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    const ears = [-1, 1].map((sd) => {
      const eg = K.g(head, { x: sd * 24, y: -24, z: -4, r: sd * 18 });
      earWedge(eg);
      return { g: eg, x: sd * 24, y: -24, sd };
    });
    // the nose: a small dark triangle at the top of the muzzle; the mouth: a little w under it
    LP.prism(head, 'M -5 -3.5 L 5 -3.5 L 0 4.5 Z', 4, NOSE, { x: 0, y: 6, z: 37, bevel: 0.7, seg: 1, noShadow: true });
    K.tube([[0, 10.5, 37.6], [0, 14, 37.8]], 1.4, LP.mat(INK), head, { straight: true, radial: 4 }).castShadow = false;
    K.tube([[0, 14, 37.8], [-5, 17.5, 37.6], [-10, 15.5, 36.8]], 1.4, LP.mat(INK), head, { straight: true, radial: 4 }).castShadow = false;
    K.tube([[0, 14, 37.8], [5, 17.5, 37.6], [10, 15.5, 36.8]], 1.4, LP.mat(INK), head, { straight: true, radial: 4 }).castShadow = false;
    // whiskers: three a side, short, sweeping back and down from the muzzle, clear of the eyes
    [[-1, 0], [-1, 1], [-1, 2], [1, 0], [1, 1], [1, 2]].forEach(([sd, i]) => {
      K.tube([[sd * 11, 10 + i * 4, 35], [sd * 26, 12 + i * 6, 30]], 0.45, K.mat(WHISKER, { rough: 0.8, emissive: WHISKER, ei: 0.25 }), head, { straight: true, radial: 3 }).castShadow = false;
    });
    // eyes: two long thin upturned closed lines above the muzzle; awake, two amber eyes with dark pupils
    const arc = (cx, cy, cz, w) => { const pts = []; for (let k = 0; k <= 6; k++) { const u = k / 6; pts.push([cx - w / 2 + w * u, cy + Math.sin(u * Math.PI) * 3.6, cz + Math.sin(u * Math.PI) * 0.6]); } return pts; };
    const eyeL = K.tube(arc(-16, -8, 36.6, 15), 0.8, LP.mat(INK), head, { straight: true, radial: 4 });
    const eyeR = K.tube(arc(16, -8, 36.6, 15), 0.8, LP.mat(INK), head, { straight: true, radial: 4 });
    eyeL.castShadow = eyeR.castShadow = false;
    const eyeLO = LP.eye(head, -16, -8, 36.8, 4.8, { iris: '#c9b13a', pupil: true, seg: 10 });
    const eyeRO = LP.eye(head, 16, -8, 36.8, 4.8, { iris: '#c9b13a', pupil: true, seg: 10 });
    eyeLO.visible = eyeRO.visible = false;

    // ---- idle life: slow breathing asleep, quicker awake; an ear flicks now and then; the tail sways at its root
    let t = U.rand(0, 6), awake = false;
    const blink = LP.blinker([eyeLO, eyeRO], { min: 2, max: 5 });
    LP.tick((dt) => {
      t += dt;
      const br = Math.sin(t * (awake ? 3 : 1.6)) * (awake ? 1 : 2.4);
      K.tr(body, { sx: 1, sy: 1 + br * 0.012, sz: 1 });
      K.tr(head, { x: -70, y: -50 + (awake ? -12 : 0) + br * 0.4, z: 16, ry: -40, r: awake ? 0 : 4 });
      ears.forEach((e2, i) => { const f = Math.sin(t * 5.3 + i * 2.1); K.tr(e2.g, { x: e2.x, y: e2.y, z: -4, r: e2.sd * 18 + (f > 0.93 ? (f - 0.93) * 120 : 0) * e2.sd }); });
      K.tr(tailG, { x: 62, y: -26, z: 0, r: Math.sin(t * 0.9) * 3 });
      if (awake) blink(dt);
      K.tr(g, { x, y, s });
    });

    return {
      el: g,
      setPos(nx, ny) { x = nx; y = ny; },
      wake(v) { awake = v; eyeL.visible = eyeR.visible = !v; eyeLO.visible = eyeRO.visible = !!v; },
      anchor: () => ({ x: x - 40, y: y - 110 }),
    };
  };
})();
