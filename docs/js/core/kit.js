/* Chestnut Adventure 2.5D — the construction kit.
   Everything is built in STAGE units: a 1600×900 picture, x to the right, y DOWN,
   z toward the viewer (0 = the line the hero rolls along, negative = deeper in the room).
   The engine parks the whole world under a root that turns those units into metres
   (1 unit = 1 cm) and flips y, so scene code can keep thinking like the old SVG did. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U;
  const T = window.THREE, X = window.THREE_X;

  const DEG = Math.PI / 180;
  const matCache = new Map();
  const geoCache = new Map();
  const texCache = new Map();

  const K = {
    DEG,
    // the svg namespace still matters for the HTML inventory icons
    NS: 'http://www.w3.org/2000/svg',

    // ------------------------------------------------------------ materials
    /** matte, slightly rough "painted wood and card" look; cached by options */
    mat(color, o) {
      o = o || {};
      const key = [color, o.rough, o.metal, o.emissive, o.ei, o.opacity, o.side, o.flat, o.clearcoat, o.sheen, o.phys, o.transmission, o.fog, o.envI].join('|');
      let m = matCache.get(key);
      if (m) return m;
      const base = {
        color: new T.Color(color),
        roughness: o.rough != null ? o.rough : 0.82,
        metalness: o.metal != null ? o.metal : 0,
        flatShading: !!o.flat,
        side: o.side === 'double' ? T.DoubleSide : o.side === 'back' ? T.BackSide : T.FrontSide,
      };
      if (o.emissive) { base.emissive = new T.Color(o.emissive); base.emissiveIntensity = o.ei != null ? o.ei : 1; }
      if (o.opacity != null && o.opacity < 1) { base.transparent = true; base.opacity = o.opacity; }
      if (o.phys || o.clearcoat != null || o.sheen != null || o.transmission != null) {
        m = new T.MeshPhysicalMaterial(base);
        if (o.clearcoat != null) { m.clearcoat = o.clearcoat; m.clearcoatRoughness = o.ccRough != null ? o.ccRough : 0.25; }
        if (o.sheen != null) { m.sheen = o.sheen; m.sheenColor = new T.Color(o.sheenColor || color); }
        if (o.transmission != null) { m.transmission = o.transmission; m.thickness = o.thickness || 20; m.ior = 1.3; }
      } else m = new T.MeshStandardMaterial(base);
      if (o.fog === false) m.fog = false;
      if (o.envI != null) m.envMapIntensity = o.envI;
      matCache.set(key, m);
      return m;
    },

    /** a material that draws nothing at all — for fat click pads */
    ghost() {
      let m = matCache.get('__ghost');
      if (!m) { m = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false }); matCache.set('__ghost', m); }
      return m;
    },

    /** unlit flat colour (sky, glows, paper) */
    flat(color, o) {
      o = o || {};
      const key = ['flat', color, o.opacity, o.side, o.additive, o.depthWrite].join('|');
      let m = matCache.get(key);
      if (m) return m;
      m = new T.MeshBasicMaterial({
        color: new T.Color(color),
        side: o.side === 'double' ? T.DoubleSide : T.FrontSide,
        transparent: (o.opacity != null && o.opacity < 1) || !!o.additive,
        opacity: o.opacity != null ? o.opacity : 1,
        blending: o.additive ? T.AdditiveBlending : T.NormalBlending,
        depthWrite: o.depthWrite != null ? o.depthWrite : !o.additive,
        fog: o.fog !== false,
      });
      matCache.set(key, m);
      return m;
    },

    // ------------------------------------------------------------ transforms
    /**
     * SVG-flavoured transform: translate(x,y,z) · rotate(r about ox,oy) · scale(s | sx,sy,sz).
     * Also ry / rx for turning things in depth (degrees). State is kept on obj.__t and merged.
     */
    tr(obj, t) {
      const cur = obj.__t || (obj.__t = { x: 0, y: 0, z: 0, r: 0, rx: 0, ry: 0, s: 1, sx: null, sy: null, sz: null, ox: 0, oy: 0 });
      Object.assign(cur, t);
      const sx = cur.sx != null ? cur.sx : cur.s, sy = cur.sy != null ? cur.sy : cur.s, sz = cur.sz != null ? cur.sz : cur.s;
      obj.matrixAutoUpdate = false;
      const m = obj.matrix;
      m.makeTranslation(cur.x + cur.ox, cur.y + cur.oy, cur.z);
      if (cur.r) m.multiply(_m.makeRotationZ(cur.r * DEG));
      if (cur.ry) m.multiply(_m.makeRotationY(cur.ry * DEG));
      if (cur.rx) m.multiply(_m.makeRotationX(cur.rx * DEG));
      m.multiply(_m.makeTranslation(-cur.ox, -cur.oy, 0));
      if (sx !== 1 || sy !== 1 || sz !== 1) m.multiply(_m.makeScale(sx, sy, sz));
      obj.matrixWorldNeedsUpdate = true;
      return obj;
    },

    g(parent, t) {
      const g = new T.Group();
      if (parent) parent.add(g);
      if (t) K.tr(g, t);
      return g;
    },

    // ------------------------------------------------------------ meshes
    mesh(geo, material, parent, o) {
      o = o || {};
      const m = new T.Mesh(geo, typeof material === 'string' || typeof material === 'number' ? K.mat(material, o) : material);
      m.castShadow = o.cast !== false;
      m.receiveShadow = o.receive !== false;
      if (parent) parent.add(m);
      if (o.x != null || o.y != null || o.z != null || o.r || o.ry || o.rx || o.s != null) K.tr(m, o);
      return m;
    },

    /** box with its top-left-front corner semantics like an svg rect: x,y = top-left, w×h, depth d centred on z */
    box(x, y, w, h, d, color, parent, o) {
      o = o || {};
      const key = ['box', w, h, d, o.round || 0].join('|');
      let geo = geoCache.get(key);
      if (!geo) {
        geo = o.round ? new X.RoundedBoxGeometry(w, h, d, 3, Math.min(o.round, w / 2, h / 2, d / 2)) : new T.BoxGeometry(w, h, d);
        geoCache.set(key, geo);
      }
      const m = K.mesh(geo, color, parent, Object.assign({}, o, { x: null, y: null, z: null }));
      // the geometry is centred: shift so (x,y) is the top-left of the front face's silhouette
      K.tr(m, { x: x + w / 2, y: y + h / 2, z: o.z || 0, r: o.r || 0, ry: o.ry || 0, rx: o.rx || 0, ox: o.ox != null ? o.ox - w / 2 : 0, oy: o.oy != null ? o.oy - h / 2 : 0 });
      return m;
    },

    /** rounded box, all edges softened */
    rbox(x, y, w, h, d, r, color, parent, o) {
      return K.box(x, y, w, h, d, color, parent, Object.assign({ round: r }, o || {}));
    },

    /** cylinder standing on its end at (cx, baseY): height up from the base (y down → it rises toward -y) */
    cylUp(cx, baseY, r, h, color, parent, o) {
      o = o || {};
      const key = ['cyl', r, o.rTop != null ? o.rTop : r, h, o.seg || 24].join('|');
      let geo = geoCache.get(key);
      if (!geo) { geo = new T.CylinderGeometry(o.rTop != null ? o.rTop : r, r, h, o.seg || 24); geoCache.set(key, geo); }
      const m = K.mesh(geo, color, parent, o);
      K.tr(m, { x: cx, y: baseY - h / 2, z: o.z || 0, r: 180 + (o.r || 0), ox: 0, oy: 0 });
      return m;
    },

    /** cylinder lying along z (a coin, a wheel facing the viewer): centre (cx,cy), radius r, thickness d */
    disc(cx, cy, r, d, color, parent, o) {
      o = o || {};
      const key = ['disc', r, d, o.seg || 32].join('|');
      let geo = geoCache.get(key);
      if (!geo) { geo = new T.CylinderGeometry(r, r, d, o.seg || 32); geo.rotateX(Math.PI / 2); geoCache.set(key, geo); }
      const m = K.mesh(geo, color, parent, o);
      K.tr(m, { x: cx, y: cy, z: o.z || 0, r: o.r || 0, ry: o.ry || 0, rx: o.rx || 0 });
      return m;
    },

    /** cylinder lying along x (a rod, a rail): from x1 to x2 at height cy */
    rodX(x1, x2, cy, r, color, parent, o) {
      o = o || {};
      const len = Math.abs(x2 - x1);
      const key = ['rod', r, len].join('|');
      let geo = geoCache.get(key);
      if (!geo) { geo = new T.CylinderGeometry(r, r, len, 14); geo.rotateZ(Math.PI / 2); geoCache.set(key, geo); }
      const m = K.mesh(geo, color, parent, o);
      K.tr(m, { x: (x1 + x2) / 2, y: cy, z: o.z || 0, r: o.r || 0 });
      return m;
    },

    sphere(cx, cy, r, color, parent, o) {
      o = o || {};
      const key = ['sph', r, o.seg || 24].join('|');
      let geo = geoCache.get(key);
      if (!geo) { geo = new T.SphereGeometry(r, o.seg || 24, Math.max(8, Math.round((o.seg || 24) * 0.6))); geoCache.set(key, geo); }
      const m = K.mesh(geo, color, parent, o);
      K.tr(m, { x: cx, y: cy, z: o.z || 0, sx: o.sx != null ? o.sx : 1, sy: o.sy != null ? o.sy : 1, sz: o.sz != null ? o.sz : 1, r: o.r || 0 });
      return m;
    },

    /** ellipsoid: radii rx, ry, rz */
    ellipsoid(cx, cy, rx, ry, rz, color, parent, o) {
      return K.sphere(cx, cy, 1, color, parent, Object.assign({}, o || {}, { sx: rx, sy: ry, sz: rz != null ? rz : Math.min(rx, ry), seg: (o && o.seg) || 28 }));
    },

    /** a soft cushion: rounded box with a big radius */
    pillow(x, y, w, h, d, color, parent, o) {
      return K.rbox(x, y, w, h, d, Math.min(w, h, d) * 0.42, color, parent, o);
    },

    cone(cx, baseY, r, h, color, parent, o) {
      o = o || {};
      const key = ['cone', r, h, o.seg || 16].join('|');
      let geo = geoCache.get(key);
      if (!geo) { geo = new T.ConeGeometry(r, h, o.seg || 16); geoCache.set(key, geo); }
      const m = K.mesh(geo, color, parent, o);
      K.tr(m, { x: cx, y: baseY - h / 2, z: o.z || 0, r: 180 + (o.r || 0) });
      return m;
    },

    torus(cx, cy, R, r, color, parent, o) {
      o = o || {};
      const key = ['tor', R, r, o.arc || 0].join('|');
      let geo = geoCache.get(key);
      if (!geo) { geo = new T.TorusGeometry(R, r, 10, 36, o.arc || Math.PI * 2); geoCache.set(key, geo); }
      const m = K.mesh(geo, color, parent, o);
      K.tr(m, { x: cx, y: cy, z: o.z || 0, r: o.r || 0, rx: o.rx || 0, ry: o.ry || 0 });
      return m;
    },

    // ------------------------------------------------------------ planes
    /** a horizontal slab: floor, desktop, shelf. x1..x2 wide, at height y, from z1 (deep) to z2 (near) */
    hplane(x1, x2, y, z1, z2, color, parent, o) {
      o = o || {};
      const w = x2 - x1, d = z2 - z1;
      const geo = new T.PlaneGeometry(w, d, 1, 1);
      geo.rotateX(Math.PI / 2); // lies in xz; its face looks toward -y = visually UP
      const m = K.mesh(geo, color, parent, Object.assign({ cast: false }, o));
      K.tr(m, { x: x1 + w / 2, y, z: z1 + d / 2 });
      return m;
    },

    /** a vertical wall facing the viewer: x1..x2, y1..y2 at depth z */
    vplane(x1, x2, y1, y2, z, color, parent, o) {
      o = o || {};
      const w = x2 - x1, h = y2 - y1;
      const geo = new T.PlaneGeometry(w, h, 1, 1);
      const m = K.mesh(geo, color, parent, Object.assign({ cast: false }, o));
      // the world is y-flipped: mirror the plane back so any texture on it reads the right way up
      K.tr(m, { x: x1 + w / 2, y: y1 + h / 2, z, ry: o.ry || 0, sx: 1, sy: -1, sz: 1 });
      return m;
    },

    /** a side wall (left or right) running from z1 to z2 at x */
    sidewall(x, y1, y2, z1, z2, color, parent, o) {
      o = o || {};
      const h = y2 - y1, d = z2 - z1;
      const geo = new T.PlaneGeometry(d, h, 1, 1);
      geo.rotateY(o.facing === 'left' ? -Math.PI / 2 : Math.PI / 2);
      const m = K.mesh(geo, color, parent, Object.assign({ cast: false }, o));
      K.tr(m, { x, y: y1 + h / 2, z: z1 + d / 2 });
      return m;
    },

    // ------------------------------------------------------------ vector shapes → solids
    /** THREE.Shape[] from an svg path string (y down, like everything here) */
    shapes(d) {
      let s = geoCache.get('shp|' + d);
      if (s) return s;
      const loader = new X.SVGLoader();
      const data = loader.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>');
      s = [];
      data.paths.forEach((p) => { X.SVGLoader.createShapes(p).forEach((sh) => s.push(sh)); });
      geoCache.set('shp|' + d, s);
      return s;
    },

    /** points [[x,y],...] along an OPEN svg path (for tubes: cables, ropes, arms) */
    pathPoints(d, n) {
      const loader = new X.SVGLoader();
      const data = loader.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>');
      const out = [];
      data.paths.forEach((p) => p.subPaths.forEach((sp) => {
        sp.getPoints(n || 24).forEach((v) => out.push([v.x, v.y]));
      }));
      return out;
    },

    rectShape(x, y, w, h, r) {
      const s = new T.Shape();
      r = Math.min(r || 0, w / 2, h / 2);
      if (!r) { s.moveTo(x, y); s.lineTo(x + w, y); s.lineTo(x + w, y + h); s.lineTo(x, y + h); s.closePath(); return s; }
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      return s;
    },

    ellipseShape(cx, cy, rx, ry) {
      const s = new T.Shape();
      s.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, 0);
      return s;
    },

    /** smooth closed blob through points (catmull-rom → cubic beziers) */
    blobShape(pts, tension) {
      const k = (tension != null ? tension : 1) / 6;
      const n = pts.length;
      const s = new T.Shape();
      s.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        s.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
      }
      s.closePath();
      return s;
    },

    /**
     * Extrude a shape (or svg path string) into a solid of depth d centred on z.
     * o: { z, bevel (px), x, y, r, s, cast, receive }
     */
    ext(shape, d, color, parent, o) {
      o = o || {};
      const shapes = typeof shape === 'string' ? K.shapes(shape) : (Array.isArray(shape) ? shape : [shape]);
      const bevel = o.bevel != null ? o.bevel : Math.min(3, d / 4);
      const key = typeof shape === 'string' ? ['ext', shape, d, bevel].join('|') : null;
      let geo = key && geoCache.get(key);
      if (!geo) {
        geo = new T.ExtrudeGeometry(shapes, {
          depth: Math.max(0.1, d - bevel * 2), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: o.bevelSeg || 3, curveSegments: o.seg || 10,
        });
        geo.translate(0, 0, -(d - bevel * 2) / 2);
        if (key) geoCache.set(key, geo);
      }
      const m = K.mesh(geo, color, parent, Object.assign({}, o, { x: null, y: null, z: null }));
      K.tr(m, { x: o.x || 0, y: o.y || 0, z: o.z || 0, r: o.r || 0, ry: o.ry || 0, rx: o.rx || 0, s: o.s != null ? o.s : 1, ox: o.ox || 0, oy: o.oy || 0 });
      return m;
    },

    /** a flat cut-out with no thickness to speak of (a drawing, a sticker, a rug) */
    cut(shape, color, parent, o) {
      o = o || {};
      const shapes = typeof shape === 'string' ? K.shapes(shape) : (Array.isArray(shape) ? shape : [shape]);
      const geo = new T.ShapeGeometry(shapes, o.seg || 10);
      const m = K.mesh(geo, color, parent, Object.assign({ cast: false }, o, { x: null, y: null, z: null }));
      K.tr(m, { x: o.x || 0, y: o.y || 0, z: o.z || 0, r: o.r || 0, rx: o.rx || 0, ry: o.ry || 0, s: o.s != null ? o.s : 1, ox: o.ox || 0, oy: o.oy || 0 });
      return m;
    },

    /** a thick painted stroke along an open path: points [[x,y],...], radius r (a tube) */
    tube(pts, r, color, parent, o) {
      o = o || {};
      const v = pts.map((p) => new T.Vector3(p[0], p[1], p[2] || 0));
      const curve = o.straight ? new T.CurvePath() : new T.CatmullRomCurve3(v, false, 'catmullrom', o.tension != null ? o.tension : 0.5);
      if (o.straight) for (let i = 0; i < v.length - 1; i++) curve.add(new T.LineCurve3(v[i], v[i + 1]));
      const geo = new T.TubeGeometry(curve, o.seg || Math.max(8, pts.length * 6), r, o.radial || 10, false);
      const m = K.mesh(geo, color, parent, o);
      if (o.z != null || o.x != null || o.y != null) K.tr(m, { x: o.x || 0, y: o.y || 0, z: o.z || 0 });
      return m;
    },

    /** a tube that can be re-shaped every frame (tails, cables, ropes): returns { mesh, set(pts) } */
    tubeDyn(n, radial, r, color, parent, o) {
      o = o || {};
      const geo = new T.BufferGeometry();
      const count = (n + 1) * radial;
      const pos = new Float32Array(count * 3);
      const nor = new Float32Array(count * 3);
      const idx = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
        const a = i * radial + j, b = i * radial + (j + 1) % radial, c = (i + 1) * radial + j, d = (i + 1) * radial + (j + 1) % radial;
        idx.push(a, b, c, b, d, c);   // wound outward: the other order made every dynamic tube inside out (near wall culled, the far wall's inside showing — the snail's sole on top of its foot)
      }
      geo.setIndex(idx);
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
      const mesh = K.mesh(geo, color, parent, o);
      mesh.frustumCulled = false;
      const tmp = new T.Vector3(), tan = new T.Vector3(), nrm = new T.Vector3(), bin = new T.Vector3();
      const up = new T.Vector3(0, 0, 1);
      return {
        mesh,
        /** fn(t) → [x,y,z] along the tail, t in 0..1; rad(t) → radius */
        set(fn, rad) {
          for (let i = 0; i <= n; i++) {
            const t = i / n;
            const p = fn(t), p2 = fn(Math.min(1, t + 0.02)), p1 = fn(Math.max(0, t - 0.02));
            tan.set(p2[0] - p1[0], p2[1] - p1[1], (p2[2] || 0) - (p1[2] || 0)).normalize();
            nrm.crossVectors(tan, up).normalize();
            if (nrm.lengthSq() < 0.01) nrm.set(1, 0, 0);
            bin.crossVectors(tan, nrm).normalize();
            const rr = rad ? rad(t) : r;
            for (let j = 0; j < radial; j++) {
              const a = (j / radial) * Math.PI * 2;
              tmp.copy(nrm).multiplyScalar(Math.cos(a)).addScaledVector(bin, Math.sin(a));
              const k = (i * radial + j) * 3;
              nor[k] = tmp.x; nor[k + 1] = tmp.y; nor[k + 2] = tmp.z;
              pos[k] = p[0] + tmp.x * rr; pos[k + 1] = p[1] + tmp.y * rr; pos[k + 2] = (p[2] || 0) + tmp.z * rr;
            }
          }
          geo.attributes.position.needsUpdate = true;
          geo.attributes.normal.needsUpdate = true;
        },
      };
    },

    /** fat invisible click pad: a box that draws nothing but catches the ray */
    pad(x, y, w, h, parent, o) {
      o = o || {};
      const geo = new T.BoxGeometry(w, h, o.d || 40);
      const m = new T.Mesh(geo, K.ghost());
      m.castShadow = false; m.receiveShadow = false;
      if (parent) parent.add(m);
      K.tr(m, { x: x + w / 2, y: y + h / 2, z: o.z || 0, r: o.r || 0, ox: o.ox != null ? o.ox - w / 2 : 0, oy: o.oy != null ? o.oy - h / 2 : 0 });
      m.userData.pad = true;
      return m;
    },

    // ------------------------------------------------------------ light & air
    /** a soft round glow sprite (a lamp pool, a halo). Additive, never blocks anything. */
    glow(parent, x, y, z, r, color, op) {
      const tex = K.radialTex(color || '#ffb454');
      const m = new T.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, opacity: op != null ? op : 0.5, blending: T.AdditiveBlending, depthWrite: false, depthTest: true, fog: false });
      const s = new T.Sprite(m);
      s.scale.set(r * 2, r * 2, 1);
      s.position.set(x, y, z || 0);
      s.userData.noHit = true;
      s.renderOrder = 5;
      if (parent) parent.add(s);
      return s;
    },

    radialTex(color) {
      const key = 'rad|' + color;
      let t = texCache.get(key);
      if (t) return t;
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, color); g.addColorStop(0.45, K.rgba(color, 0.45)); g.addColorStop(1, K.rgba(color, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
      t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      texCache.set(key, t);
      return t;
    },

    rgba(hex, a) {
      const c = new T.Color(hex);
      return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
    },

    /** a soft contact shadow blob lying on the ground under something */
    shadowBlob(parent, x, y, z, rx, rz, op) {
      const tex = K.radialTex('#000000');
      const m = new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: op != null ? op : 0.4, depthWrite: false, color: 0x000000 });
      const geo = new T.PlaneGeometry(2, 2);
      geo.rotateX(Math.PI / 2);
      const mesh = new T.Mesh(geo, m);
      mesh.castShadow = false; mesh.receiveShadow = false;
      mesh.userData.noHit = true;
      mesh.renderOrder = 2;
      K.tr(mesh, { x, y: y - 0.6, z, sx: rx, sz: rz || rx * 0.6 });
      if (parent) parent.add(mesh);
      return mesh;
    },

    /** point light in stage units */
    point(parent, x, y, z, color, intensity, dist, o) {
      o = o || {};
      const l = new T.PointLight(color, intensity, dist || 0, o.decay != null ? o.decay : 1.6);
      l.position.set(x, y, z);
      if (o.shadow) {
        l.castShadow = true;
        l.shadow.mapSize.set(1024, 1024);
        l.shadow.bias = -0.0008; l.shadow.normalBias = 0.02;
        l.shadow.radius = 4;
        l.shadow.camera.near = 0.1; l.shadow.camera.far = (dist || 1500) * 0.01;   // the shadow camera lives in metres
      }
      if (parent) parent.add(l);
      return l;
    },

    /** spot light aimed from (x,y,z) at (tx,ty,tz); the one that throws the real shadows */
    spot(parent, x, y, z, tx, ty, tz, color, intensity, o) {
      o = o || {};
      const l = new T.SpotLight(color, intensity, o.dist || 0, (o.angle || 55) * DEG, o.penumbra != null ? o.penumbra : 0.6, o.decay != null ? o.decay : 1.4);
      l.position.set(x, y, z);
      l.target.position.set(tx, ty, tz);
      if (parent) { parent.add(l); parent.add(l.target); }
      if (o.shadow !== false) {
        l.castShadow = true;
        l.shadow.mapSize.set(o.mapSize || 1024, o.mapSize || 1024);
        l.shadow.bias = -0.0006;
        l.shadow.normalBias = 0.02;
        l.shadow.radius = 5;
        l.shadow.camera.near = 0.15; l.shadow.camera.far = (o.far || 2400) * 0.01;  // metres, not stage px
      }
      return l;
    },

    /** a broad directional light (moon through the window, daylight) */
    sun(parent, x, y, z, color, intensity, o) {
      o = o || {};
      const l = new T.DirectionalLight(color, intensity);
      l.position.set(x, y, z);
      l.target.position.set(o.tx != null ? o.tx : 800, o.ty != null ? o.ty : 700, o.tz != null ? o.tz : 0);
      if (parent) { parent.add(l); parent.add(l.target); }
      if (o.shadow) {
        l.castShadow = true;
        l.shadow.mapSize.set(1024, 1024);
        const s = (o.size || 1100) * 0.01;
        l.shadow.camera.left = -s; l.shadow.camera.right = s; l.shadow.camera.top = s; l.shadow.camera.bottom = -s;
        l.shadow.camera.near = 0.1; l.shadow.camera.far = 60;
        l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
      }
      return l;
    },

    // ------------------------------------------------------------ text
    /** text painted on a small plane (labels, book titles, a GO button). Sized in stage px. */
    label(text, o) {
      o = o || {};
      const size = o.size || 24, font = o.font || 'Comfortaa, Nunito, sans-serif';
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      const scale = 3;
      ctx.font = `${o.weight || 700} ${size * scale}px ${font}`;
      if (o.letterSpacing) ctx.letterSpacing = (o.letterSpacing * scale) + 'px';
      const w = Math.ceil(ctx.measureText(text).width / scale) + 14 + (o.letterSpacing || 0) * 2, h = Math.ceil(size * 1.3);
      c.width = w * scale; c.height = h * scale;
      ctx.scale(scale, scale);
      if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(0, 0, w, h); }
      ctx.font = `${o.weight || 700} ${size}px ${font}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (o.letterSpacing) ctx.letterSpacing = o.letterSpacing + 'px';
      ctx.fillStyle = o.color || '#fff6e4';
      ctx.fillText(text, w / 2, h / 2 + 1);
      const tex = new T.CanvasTexture(c);
      tex.colorSpace = T.SRGBColorSpace;
      tex.anisotropy = 4;
      const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, side: T.DoubleSide });
      const geo = new T.PlaneGeometry(w, h);
      const m = new T.Mesh(geo, mat);
      m.castShadow = false; m.receiveShadow = false;
      m.userData.noHit = true;
      m.userData.__disposeTex = tex;
      // the world is y-flipped; flip the plane back so the writing reads the right way up
      K.tr(m, { x: o.x || 0, y: o.y || 0, z: o.z || 0, sy: -1, s: o.s || 1, sx: o.s || 1, r: o.r || 0, ry: o.ry || 0, rx: o.rx || 0 });
      m.renderOrder = 3;
      if (o.parent) o.parent.add(m);
      return m;
    },

    /** a canvas-painted texture for a plane (wall paper, floorboards, a drawing) */
    canvasTex(w, h, paint, o) {
      o = o || {};
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      paint(c.getContext('2d'), w, h);
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      if (o.repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(o.repeat[0], o.repeat[1]); }
      t.anisotropy = 8;
      return t;
    },

    // ------------------------------------------------------------ housekeeping
    /** free the geometry (and one-off textures) under a group; cached materials stay */
    dispose(obj) {
      obj.traverse((o) => {
        if (o.geometry && !geoCacheHas(o.geometry)) o.geometry.dispose();
        if (o.userData && o.userData.__disposeTex) o.userData.__disposeTex.dispose();
        if (o.material && o.material.map && o.userData && o.userData.__disposeTex) o.material.dispose();
        if (o.isSprite && o.material) { o.material.dispose(); }
      });
    },

    /** bounding box centre of an object in stage units (its world, before the root flip) */
    center(obj, root) {
      const b = new T.Box3().setFromObject(obj);
      const c = b.getCenter(new T.Vector3());
      root.worldToLocal(c);
      return { x: c.x, y: c.y, z: c.z, w: (b.max.x - b.min.x) * 100, h: (b.max.y - b.min.y) * 100 };
    },
  };

  const _m = new T.Matrix4();
  const geoSet = () => { const s = new Set(); geoCache.forEach((v) => { if (v && v.isBufferGeometry) s.add(v); }); return s; };
  let _geoSetCache = null, _geoSetSize = -1;
  function geoCacheHas(geo) {
    if (_geoSetSize !== geoCache.size) { _geoSetCache = geoSet(); _geoSetSize = geoCache.size; }
    return _geoSetCache.has(geo);
  }

  CH.K = K;
  CH.S = { NS: K.NS }; // the HTML inventory icons still build svg
})();
