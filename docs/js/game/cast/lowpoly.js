/* Chestnut Adventure 2.5D — the low-poly cast kit.
   The character sheet draws everyone as a handful of chunky facets: flat-shaded, saturated, no gradients,
   eyes as dark beads with a glint. This file is the shared vocabulary every cast/*.js model is built from.
   Coordinates are the hero's: y down, the origin under the feet; side-view creatures face LEFT.
   Each model keeps a root group the scene may move freely, and an inner `body` group that carries the idle
   animation (breath, sway, bob) so the two never fight over one matrix. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  const geoCache = new Map();
  const LP = {};

  // ---- the smooth pass. The sheet's facets stay the model; the render rounds them: normals are averaged across the edges
  //      softer than CREASE degrees (box edges, rims, lids and wedges stay sharp), and the painted patches blend or stay
  //      crisp by the patch rule in LP.paint. LP.SMOOTH = false gives the old flat look back, for a side-by-side.
  LP.SMOOTH = true;
  LP.CREASE = 60;   // over the 51.4 deg of a 7-sided cone, under the 90 of a box edge or a lid step
  LP.DEBUG_PAINT = false;   // tint the patch classes instead of painting: line cyan, speck yellow, area edge magenta, area grey
  LP.MOTTLE = 0.35;         // how much of its own facet tone every corner keeps after the blend: 0 = perfectly smooth colour,
                            // 1 = the old mosaic. A little keeps the hand-painted mottling of the sheet on a smooth surface.

  const posKey = (x, y, z) => (Math.round(x * 1000) / 1000 + 0) + ',' + (Math.round(y * 1000) / 1000 + 0) + ',' + (Math.round(z * 1000) / 1000 + 0);

  /** a copy of the geometry, unindexed, its normals averaged over the facets meeting at each vertex whose angle to this
      facet is under the crease — smooth-by-angle: round where the facets approximate a curve, sharp where they are an edge */
  LP.creased = (geo, creaseDeg) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const pos = g.attributes.position, n = pos.count, nf = n / 3;
    const fn = new Float32Array(nf * 3);
    const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), cb = new T.Vector3(), ab = new T.Vector3();
    for (let i = 0; i < nf; i++) {
      a.fromBufferAttribute(pos, i * 3); b.fromBufferAttribute(pos, i * 3 + 1); c.fromBufferAttribute(pos, i * 3 + 2);
      cb.subVectors(c, b); ab.subVectors(a, b); cb.cross(ab).normalize();
      fn[i * 3] = cb.x; fn[i * 3 + 1] = cb.y; fn[i * 3 + 2] = cb.z;
    }
    const groups = new Map();
    for (let i = 0; i < n; i++) { const k = posKey(pos.getX(i), pos.getY(i), pos.getZ(i)); let l = groups.get(k); if (!l) groups.set(k, l = []); l.push(i); }
    const cosC = Math.cos((creaseDeg != null ? creaseDeg : LP.CREASE) * Math.PI / 180);
    const out = new Float32Array(n * 3);
    groups.forEach((list) => {
      for (const i of list) {
        const fi = (i / 3) | 0, nx = fn[fi * 3], ny = fn[fi * 3 + 1], nz = fn[fi * 3 + 2];
        let sx = 0, sy = 0, sz = 0;
        for (const j of list) { const fj = (j / 3) | 0; if (nx * fn[fj * 3] + ny * fn[fj * 3 + 1] + nz * fn[fj * 3 + 2] >= cosC) { sx += fn[fj * 3]; sy += fn[fj * 3 + 1]; sz += fn[fj * 3 + 2]; } }
        const len = Math.hypot(sx, sy, sz) || 1;
        out[i * 3] = sx / len; out[i * 3 + 1] = sy / len; out[i * 3 + 2] = sz / len;
      }
    });
    g.setAttribute('normal', new T.BufferAttribute(out, 3));
    return g;
  };

  /** the smooth pass on a finished mesh (a no-op under the flat look) */
  LP.finish = (mesh, o) => { if (LP.SMOOTH) mesh.geometry = LP.creased(mesh.geometry, o && o.crease); return mesh; };

  /** flat-shaded material: the facets read as facets */
  LP.mat = (color, o) => K.mat(color, Object.assign({ rough: 0.78, flat: !LP.SMOOTH }, o || {}));
  const asMat = (c, o) => (typeof c === 'string' ? LP.mat(c, o) : c);

  /** faceted ball: an icosahedron (detail 0 → 20 faces, 1 → 80, 2 → 320 — the sheet's dense facets) */
  LP.ico = (parent, x, y, z, r, color, o) => {
    o = o || {};
    const det = o.detail != null ? o.detail : 2;
    const key = ['ico', r, det, LP.SMOOTH ? 's' : 'f'].join('|');
    let geo = geoCache.get(key);
    if (!geo) { geo = new T.IcosahedronGeometry(r, det); if (LP.SMOOTH) geo = LP.creased(geo); geoCache.set(key, geo); }
    const m = K.mesh(geo, asMat(color, o.m), parent, { cast: o.cast, receive: o.receive });
    K.tr(m, { x, y, z, r: o.r || 0, rx: o.rx || 0, ry: o.ry || 0, sx: o.sx != null ? o.sx : 1, sy: o.sy != null ? o.sy : 1, sz: o.sz != null ? o.sz : 1 });
    return m;
  };

  /** a hand-cut faceted ball: an icosahedron whose vertices are nudged so no two facets look alike */
  LP.rock = (parent, x, y, z, r, color, o) => {
    o = o || {};
    const det = LP.SMOOTH ? Math.max(o.detail || 0, r >= 16 ? 2 : 1) : (o.detail != null ? o.detail : 1);   // smooth: any ball above r 16 gets 320 facets, so its outline and the shading across each facet stop reading as polygons
    let geo = new T.IcosahedronGeometry(r, det);
    const pos = geo.attributes.position, jit = (o.jitter != null ? o.jitter : (LP.SMOOTH ? 0.05 : 0.12)) * r;   // smooth: less than half the nudge, it only has to break the outline, not tone every facet
    const seen = new Map();
    for (let i = 0; i < pos.count; i++) {
      const key = [pos.getX(i), pos.getY(i), pos.getZ(i)].map((v) => (Math.round(v * 1000) / 1000 + 0).toFixed(3)).join(',');   // +0 folds -0 into 0, so a lathe's seam vertices move together
      let d = seen.get(key);
      if (!d) { d = [U.rand(-jit, jit), U.rand(-jit, jit), U.rand(-jit, jit)]; seen.set(key, d); }
      pos.setXYZ(i, pos.getX(i) + d[0], pos.getY(i) + d[1], pos.getZ(i) + d[2]);
    }
    if (LP.SMOOTH) geo = LP.creased(geo); else geo.computeVertexNormals();
    const m = K.mesh(geo, asMat(color, o.m), parent, { cast: o.cast, receive: o.receive });
    K.tr(m, { x, y, z, r: o.r || 0, rx: o.rx || 0, ry: o.ry || 0, sx: o.sx != null ? o.sx : 1, sy: o.sy != null ? o.sy : 1, sz: o.sz != null ? o.sz : 1 });
    return m;
  };

  /** a ribbed column standing on (cx, baseY): `ribs` crests pushed out, valleys pulled in — a cactus, a bellows */
  LP.ribbed = (parent, cx, baseY, z, r, h, ribs, depth, color, o) => {
    o = o || {};
    const n = ribs * 2;
    let geo = new T.CylinderGeometry(o.rTop != null ? o.rTop : r, r, h, n, o.rows || 3, !!o.open);
    const pos = geo.attributes.position, step = (Math.PI * 2) / n;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), pz = pos.getZ(i);
      const rad = Math.sqrt(px * px + pz * pz);
      if (rad < 1e-4) continue;
      const idx = Math.round(Math.atan2(pz, px) / step);
      const k = (idx % 2 === 0) ? 1 + depth : 1 - depth;
      pos.setX(i, px * k); pos.setZ(i, pz * k);
    }
    if (LP.SMOOTH) geo = LP.creased(geo); else geo.computeVertexNormals();
    const m = K.mesh(geo, asMat(color, o.m), parent, { cast: o.cast, receive: o.receive });
    K.tr(m, { x: cx, y: baseY - h / 2, z, r: 180 + (o.r || 0), rx: o.rx || 0, ry: o.ry || 0 });
    return m;
  };

  /** faceted pebble: a dodecahedron */
  LP.dodeca = (parent, x, y, z, r, color, o) => {
    o = o || {};
    const det = LP.SMOOTH ? Math.max(o.detail || 0, 1) : (o.detail || 0);   // smooth: a dodecahedron's own 63 deg edges are over the crease, so it is subdivided once and rounds
    const key = ['dod', r, det, LP.SMOOTH ? 's' : 'f'].join('|');
    let geo = geoCache.get(key);
    if (!geo) { geo = new T.DodecahedronGeometry(r, det); if (LP.SMOOTH) geo = LP.creased(geo); geoCache.set(key, geo); }
    const m = K.mesh(geo, asMat(color, o.m), parent, { cast: o.cast, receive: o.receive });
    K.tr(m, { x, y, z, r: o.r || 0, rx: o.rx || 0, ry: o.ry || 0, sx: o.sx != null ? o.sx : 1, sy: o.sy != null ? o.sy : 1, sz: o.sz != null ? o.sz : 1 });
    return m;
  };

  /** a chunky prism cut from an svg silhouette: one chamfer segment, so the edges are facets, not cushions */
  LP.prism = (parent, d, depth, color, o) => {
    o = o || {};
    const m = K.ext(d, depth, asMat(color, o.m), parent, {
      bevel: o.bevel != null ? o.bevel : Math.min(depth * 0.3, 5), bevelSeg: o.bevelSeg || 2, seg: o.seg || 7,
      x: o.x || 0, y: o.y || 0, z: o.z || 0, r: o.r || 0, rx: o.rx || 0, ry: o.ry || 0, s: o.s, ox: o.ox, oy: o.oy, cast: o.cast, receive: o.receive,
    });
    if (o.noShadow) m.castShadow = false;
    return LP.finish(m, o);
  };

  /** a faceted cone standing on its base at (cx, baseY) */
  LP.cone = (parent, cx, baseY, z, r, h, color, o) => {
    o = o || {};
    return K.cone(cx, baseY, r, h, asMat(color, o.m), parent, { z, seg: o.seg || 7, r: o.r || 0 });
  };

  /** a faceted cylinder standing on (cx, baseY) */
  LP.cyl = (parent, cx, baseY, z, r, h, color, o) => {
    o = o || {};
    return K.cylUp(cx, baseY, r, h, asMat(color, o.m), parent, { z, seg: o.seg || 8, rTop: o.rTop, r: o.r || 0 });
  };

  /** an angular limb: straight tube segments through the points, few radial sides */
  LP.limb = (parent, pts, r, color, o) => {
    o = o || {};
    const m = K.tube(pts, r, asMat(color, o.m), parent, { straight: true, radial: o.radial || 5, seg: pts.length });
    m.castShadow = o.cast !== false;
    return m;
  };

  /** nudge every vertex of a mesh's geometry a little (shared vertices move together), so each facet gets its
      own tone under flat shading — the hand-cut look of the sheet. Keeps the geometry private to that mesh. */
  LP.jitter = (mesh, amount) => {
    const geo = mesh.geometry.clone();
    const pos = geo.attributes.position;
    const seen = new Map();
    for (let i = 0; i < pos.count; i++) {
      const key = [pos.getX(i), pos.getY(i), pos.getZ(i)].map((v) => (Math.round(v * 100) / 100 + 0).toFixed(2)).join(',');   // +0 folds -0 into 0, so a lathe's seam vertices move together
      let d = seen.get(key);
      if (!d) { d = [U.rand(-amount, amount), U.rand(-amount, amount), U.rand(-amount, amount)]; seen.set(key, d); }
      pos.setXYZ(i, pos.getX(i) + d[0], pos.getY(i) + d[1], pos.getZ(i) + d[2]);
    }
    mesh.geometry = LP.SMOOTH ? LP.creased(geo) : (geo.computeVertexNormals(), geo);
    return mesh;
  };

  /** paint the facets of one mesh: fn(cx, cy, cz, nx, ny, nz) → colour string or null for the base colour.
      The colour becomes part of the surface (vertex colours on a white material), so a cream muzzle or a darker band is
      a change of fur colour on the same skin, not a separate lump.
      Under the smooth pass the facets of one colour are gathered into patches, and each patch is classed by its shape:
        speck — 1–4 facets, or up to 8 of a scatter colour (one that lands as many small separate patches, the noise of a
                random rule): facet-tone noise, it melts into its surround;
        line  — no facet of it is surrounded by its own colour, a one-facet-wide marking (a ring, a band): kept crisp;
        area  — has an inside: its edge grades over one facet, its inside keeps the pure colour.
      o.hard / o.soft name colours that must be a line / an area whatever their shape; o.soft === false paints flat;
      o.mottle (default LP.MOTTLE) is how much of its own tone each facet keeps after the blend. */
  LP.paint = (mesh, base, fn, o) => {
    o = o || {};
    const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    const pos = geo.attributes.position, n = pos.count, nf = n / 3;
    const c = new T.Color(), a = new T.Vector3(), b = new T.Vector3(), d = new T.Vector3(), nrm = new T.Vector3();
    const faceHex = new Array(nf);
    for (let f = 0; f < nf; f++) {
      const i = f * 3;
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); d.fromBufferAttribute(pos, i + 2);
      nrm.subVectors(b, a).cross(d.clone().sub(a)).normalize();
      faceHex[f] = fn((a.x + b.x + d.x) / 3, (a.y + b.y + d.y) / 3, (a.z + b.z + d.z) / 3, nrm.x, nrm.y, nrm.z) || base;
    }
    const col = new Float32Array(n * 3);
    const put = (i, hex) => { c.set(hex); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; };
    if (!LP.SMOOTH || o.soft === false) {
      for (let f = 0; f < nf; f++) for (let k = 0; k < 3; k++) put(f * 3 + k, faceHex[f]);
    } else {
      // the patches: facets of one colour joined edge to edge
      const key = new Array(n);
      for (let i = 0; i < n; i++) key[i] = posKey(pos.getX(i), pos.getY(i), pos.getZ(i));
      const byEdge = new Map();
      for (let f = 0; f < nf; f++) for (let e = 0; e < 3; e++) {
        const k1 = key[f * 3 + e], k2 = key[f * 3 + (e + 1) % 3], ek = k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1;
        let l = byEdge.get(ek); if (!l) byEdge.set(ek, l = []); l.push(f);
      }
      const nb = Array.from({ length: nf }, () => []);
      byEdge.forEach((l) => { for (const f of l) for (const g of l) if (g !== f) nb[f].push(g); });
      const patchOf = new Int32Array(nf).fill(-1), patches = [];
      for (let f = 0; f < nf; f++) {
        if (patchOf[f] >= 0) continue;
        const faces = [f]; patchOf[f] = patches.length;
        for (let q = 0; q < faces.length; q++) for (const g of nb[faces[q]]) if (patchOf[g] < 0 && faceHex[g] === faceHex[faces[q]]) { patchOf[g] = patches.length; faces.push(g); }
        patches.push({ faces, hex: faceHex[f] });
      }
      const norm = (h) => '#' + new T.Color(h).getHexString();
      const hard = new Set((o.hard || []).map(norm)), soft = new Set((o.soft || []).map(norm));
      // a scatter colour — one that lands on the mesh as many small separate patches (facet-tone noise from a random
      // rule) — melts everywhere, even where a handful of its facets happen to touch and would pass for a line
      const byHex = new Map();
      for (const p of patches) { let l = byHex.get(p.hex); if (!l) byHex.set(p.hex, l = []); l.push(p.faces.length); }
      const scatter = new Set();
      byHex.forEach((sizes, hex) => { const sr = sizes.slice().sort((a, b) => a - b); if (sr.length >= 5 && sr[(sr.length / 2) | 0] <= 3) scatter.add(hex); });
      const cls = new Array(nf);
      for (const p of patches) {
        const inside = p.faces.filter((f) => nb[f].length && nb[f].every((g) => faceHex[g] === p.hex)).length;
        const hx = norm(p.hex);
        const speck = p.faces.length <= 4 || (scatter.has(p.hex) && inside === 0 && p.faces.length <= 8);
        p.cls = hard.has(hx) ? 'line' : soft.has(hx) ? 'area' : speck ? 'speck' : inside === 0 ? 'line' : 'area';
        for (const f of p.faces) cls[f] = p.cls;
      }
      if (LP.DEBUG_PAINT) {
        for (let f = 0; f < nf; f++) {
          const edge = nb[f].some((g) => faceHex[g] !== faceHex[f]);
          const hex = cls[f] === 'line' ? '#00e5ff' : cls[f] === 'speck' ? '#ffe000' : edge ? '#ff30c0' : '#8a8a8a';
          for (let k = 0; k < 3; k++) put(f * 3 + k, hex);
        }
      } else {
        // vertex colours: a line's corners keep the facet colour; every other corner averages the facets round its position,
        // lines left out — so a line is crisp on both sides, and everything else grades over one facet
        const byPos = new Map();
        for (let i = 0; i < n; i++) { let l = byPos.get(key[i]); if (!l) byPos.set(key[i], l = []); l.push(i); }
        const acc = new T.Color(), mot = o.mottle != null ? o.mottle : LP.MOTTLE;
        for (let i = 0; i < n; i++) {
          const f = (i / 3) | 0;
          if (cls[f] === 'line') { put(i, faceHex[f]); continue; }
          let r = 0, g = 0, bl = 0, cnt = 0;
          for (const j of byPos.get(key[i])) { const fj = (j / 3) | 0; if (cls[fj] === 'line') continue; acc.set(faceHex[fj]); r += acc.r; g += acc.g; bl += acc.b; cnt++; }
          if (!cnt) { put(i, faceHex[f]); continue; }
          acc.set(faceHex[f]);   // the blend, pulled part of the way back toward this facet's own tone: a light mottling survives
          col[i * 3] = r / cnt + (acc.r - r / cnt) * mot; col[i * 3 + 1] = g / cnt + (acc.g - g / cnt) * mot; col[i * 3 + 2] = bl / cnt + (acc.b - bl / cnt) * mot;
        }
      }
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3));
    mesh.geometry = LP.SMOOTH ? LP.creased(geo, o.crease) : (geo.computeVertexNormals(), geo);
    mesh.material = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, flatShading: !LP.SMOOTH, roughness: o.rough != null ? o.rough : 0.78, metalness: 0 });
    if (o.emissive) { mesh.material.emissive = new T.Color(o.emissive); mesh.material.emissiveIntensity = o.ei != null ? o.ei : 1; }
    return mesh;
  };

  /** a ribbed solid of revolution standing on (cx, baseY): profile [[radius, heightUp], …] from the base up to
      the tip (last radius 0); `ribs` crests pushed out and valleys pulled in by `depth`, so the ridges run
      unbroken over the rounded top — a cactus, a gourd */
  LP.cactus = (parent, cx, baseY, z, profile, ribs, depth, color, o) => {
    o = o || {};
    const n = ribs * 2;
    let geo = new T.LatheGeometry(profile.map((p) => new T.Vector2(p[0], p[1])), n);
    const pos = geo.attributes.position, step = (Math.PI * 2) / n;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), pz = pos.getZ(i);
      const rad = Math.sqrt(px * px + pz * pz);
      if (rad < 1e-4) continue;
      const idx = Math.round(Math.atan2(pz, px) / step);
      const k = (idx % 2 === 0) ? 1 + depth : 1 - depth;
      pos.setX(i, px * k); pos.setZ(i, pz * k);
    }
    if (LP.SMOOTH) geo = LP.creased(geo); else geo.computeVertexNormals();
    const m = K.mesh(geo, asMat(color, o.m), parent, { cast: o.cast, receive: o.receive });
    K.tr(m, { x: cx, y: baseY, z, r: 180 + (o.r || 0), ry: o.ry || 0 });
    return m;
  };

  /** a dark bead eye with a glint. Returns the eye group; `lid(k)` closes it (0 open … 1 shut) by squashing. */
  LP.eye = (parent, x, y, z, r, o) => {
    o = o || {};
    const g = K.g(parent, { x, y, z });
    const ball = K.sphere(0, 0, r, K.mat(o.color || '#17131c', { rough: 0.25 }), g, { seg: o.seg || 10 });
    ball.castShadow = false;
    if (o.iris) { const i = K.sphere(0, 0, r * 0.55, K.mat(o.iris, { rough: 0.3, emissive: o.iris, ei: 0.25 }), g, { z: r * 0.55, seg: 8 }); i.castShadow = false; }
    if (o.pupil) { const p = K.sphere(0, 0, r * 0.3, K.mat('#17131c', { rough: 0.25 }), g, { z: r * 0.85, seg: 6 }); p.castShadow = false; }
    if (o.glint !== false) {
      const gl = K.sphere(-r * 0.36 * (o.flip || 1), -r * 0.36, r * 0.3, K.mat('#ffffff', { emissive: '#ffffff', ei: 0.7 }), g, { z: r * 0.78, seg: 6 });
      gl.castShadow = false;
    }
    g.lid = (k) => K.tr(g, { x, y, z, sy: 1 - Math.min(0.96, k) });
    return g;
  };

  /** two eyes that blink together: returns tick(dt) to call each frame */
  LP.blinker = (eyes, o) => {
    o = o || {};
    let next = U.rand(1.5, 4.5), t = 0, phase = -1;
    return (dt) => {
      if (phase < 0) { next -= dt; if (next <= 0) { phase = 0; } return; }
      phase += dt;
      const D = o.dur || 0.16;
      const k = phase < D / 2 ? phase / (D / 2) : Math.max(0, 1 - (phase - D / 2) / (D / 2));
      eyes.forEach((e) => e.lid(k));
      if (phase >= D) { phase = -1; next = U.rand(o.min || 2, o.max || 5); t += 1; }
    };
  };

  /** a translucent faceted wing: a flat cut-out in pale blue */
  LP.wingMat = () => K.mat('#bfe3ff', { opacity: 0.55, side: 'double', flat: true, emissive: '#78b4ff', ei: 0.18, rough: 0.5 });
  LP.wing = (parent, d, o) => {
    o = o || {};
    const m = K.cut(d, LP.wingMat(), parent, { x: o.x || 0, y: o.y || 0, z: o.z || 0, r: o.r || 0, ry: o.ry || 0, rx: o.rx || 0, s: o.s, ox: o.ox, oy: o.oy, seg: 3 });
    m.castShadow = false;
    return m;
  };

  /** the idle life of a body group: breath (a slow vertical swell about the feet), sway (a lean), bob.
      Call with the group that carries ONLY the idle motion; the scene keeps the root. Returns the stop fn. */
  LP.idle = (body, o) => {
    o = o || {};
    let t = U.rand(0, 20);
    const breath = o.breath != null ? o.breath : 0.02, bf = o.breathF || 1.4;
    const sway = o.sway || 0, sf = o.swayF || 0.9;
    const bob = o.bob || 0, bbf = o.bobF || 1.1;
    const extra = o.tick, r0 = o.r0 || 0;
    return CH.tw.tick((dt) => {
      t += dt;
      const b = Math.sin(t * bf);
      K.tr(body, { sy: 1 + b * breath, sx: 1 - b * breath * 0.5, r: r0 + Math.sin(t * sf) * sway, y: Math.sin(t * bbf) * bob });
      if (extra) extra(dt, t);
    }, 'scene');
  };

  /** a scene-scoped per-frame callback (dies with the scene) */
  LP.tick = (fn) => CH.tw.tick(fn, 'scene');

  CH.LP = LP;
})();
