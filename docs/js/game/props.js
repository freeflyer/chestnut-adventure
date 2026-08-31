/* Chestnut Adventure 2.5D — shared prop builders + inventory item icons */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  // ---------------------------------------------------------- item icons
  // The inventory is HTML; each icon draws into a 40×40 svg exactly as before.
  function ic(svg, inner) { svg.innerHTML = inner; }

    CH.items = {
    coin: (s) => ic(s, `
      <circle cx="20" cy="20" r="13" fill="#e8b64c" stroke="#a8792a" stroke-width="2"/>
      <g fill="#a8792a">
        <path d="M20 25.5 C19 23.4 17.1 17.2 20 12.6 C22.9 17.2 21 23.4 20 25.5 Z"/>
        <path d="M20 25.5 C19 23.4 17.1 17.2 20 12.6 C22.9 17.2 21 23.4 20 25.5 Z" transform="rotate(-32 20 25.5)"/>
        <path d="M20 25.5 C19 23.4 17.1 17.2 20 12.6 C22.9 17.2 21 23.4 20 25.5 Z" transform="rotate(32 20 25.5)"/>
        <path d="M20 25.5 C19 23.4 17.1 17.2 20 12.6 C22.9 17.2 21 23.4 20 25.5 Z" transform="rotate(-62 20 25.5)"/>
        <path d="M20 25.5 C19 23.4 17.1 17.2 20 12.6 C22.9 17.2 21 23.4 20 25.5 Z" transform="rotate(62 20 25.5)"/>
      </g>
      <path d="M20 25.5 L20 29" stroke="#a8792a" stroke-width="1.6" stroke-linecap="round"/>`),
    brolly: (s) => ic(s, `
      <path d="M20 8 C10 8 6 16 6 20 C9 17 12 17 13.5 20 C15.5 16.5 18 16.5 20 20 C22 16.5 24.5 16.5 26.5 20 C28 17 31 17 34 20 C34 16 30 8 20 8 Z" fill="#e2635f" stroke="#a83a37" stroke-width="1.6"/>
      <path d="M20 8 C16 12 15 16 15.5 19.4 M20 8 C24 12 25 16 24.5 19.4" stroke="#f7d9c4" stroke-width="1.4" fill="none"/>
      <line x1="20" y1="9" x2="20" y2="33" stroke="#c99358" stroke-width="2"/>
      <circle cx="20" cy="7" r="1.6" fill="#f7d9c4"/>`),
    floss: (s) => ic(s, `
      <rect x="10" y="12" width="20" height="17" rx="5" fill="#7fc8d6" stroke="#40808d" stroke-width="2"/>
      <rect x="14" y="8" width="12" height="6" rx="2.4" fill="#a9dde7" stroke="#40808d" stroke-width="1.6"/>
      <path d="M28 10 C34 12 34 22 30 30" stroke="#fffdf4" stroke-width="1.8" fill="none"/>
      <circle cx="20" cy="21" r="5" fill="none" stroke="#eafcff" stroke-width="2"/>`),
    cap: (s) => ic(s, `
      <circle cx="20" cy="20" r="12" fill="#d8dee6" stroke="#8b95a3" stroke-width="1.6"/>
      <circle cx="20" cy="20" r="12" fill="none" stroke="#aab4c0" stroke-width="2.4" stroke-dasharray="2.4 2.6"/>
      <circle cx="20" cy="20" r="7.4" fill="#c23f4a"/>
      <path d="M15.6 17.2 a6 6 0 0 1 5 -2.6" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.85"/>`),
    leaf: (s) => ic(s, `
      <path d="M20 5 C31 10 33 22 26 32 C24 35 17 35 15 32 C8 22 10 10 20 5 Z" fill="#d98e3f" stroke="#9c5c22" stroke-width="1.8"/>
      <path d="M20 8 V32 M20 14 L14.6 19 M20 14 L25.4 19 M20 21 L14 26.6 M20 21 L26 26.6" stroke="#9c5c22" stroke-width="1.4" fill="none"/>`),
    clip: (s) => ic(s, `
      <path d="M 13 26 L 13 12 A 6 6 0 0 1 25 12 L 25 24 A 4 4 0 0 1 17 24 L 17 14" fill="none" stroke="#8b95a3" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M 13 26 A 6 6 0 0 0 25 26 L 25 24" fill="none" stroke="#8b95a3" stroke-width="2.6" stroke-linecap="round"/>`),
    seed: (s) => ic(s, `
      <path d="M 20 8 C 28 14 30 24 20 33 C 10 24 12 14 20 8 Z" fill="#4a3a2c" stroke="#2c2016" stroke-width="1.6"/>
      <path d="M 20 10 C 25 15 26 23 20 30 C 14 23 15 15 20 10 Z" fill="none" stroke="#d8cdb4" stroke-width="2"/>
      <path d="M 20 8 L 20 33" stroke="#d8cdb4" stroke-width="1.4"/>`),
    sock: (s) => ic(s, `
      <path d="M 15 7 L 26 7 L 26 20 C 26 26 22 31 16 31 C 11 31 8 27 9 22 C 10 18 15 17 15 13 Z" fill="#5a7ea0" stroke="#3c5a78" stroke-width="2"/>
      <rect x="15" y="7" width="11" height="5" rx="2" fill="#d8e4ec"/>
      <path d="M 11 24 C 13 26 17 27 20 25" stroke="#d8e4ec" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
    crayon: (s) => ic(s, `
      <g transform="rotate(-40 20 20)">
        <rect x="7" y="16" width="25" height="9" rx="2.5" fill="#e2635f"/>
        <rect x="12" y="16" width="14" height="9" fill="#f2b3ad" opacity="0.6"/>
        <path d="M32 16 L38 20.5 L32 25 Z" fill="#e2635f"/>
        <path d="M7 16 L3.5 20.5 L7 25 Z" fill="#c9524e"/>
      </g>`),
    hairpin: (s) => ic(s, `
      <path d="M 13 31 L 13 13 A 7 7 0 0 1 27 13 L 27 31" fill="none" stroke="#c9a24b" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M 17 22 C 19 24 21 24 23 22" fill="none" stroke="#e8d08a" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M 13 31 L 12 34 M 27 31 L 28 34" stroke="#8a6a2a" stroke-width="3" stroke-linecap="round"/>`),
    feather: (s) => ic(s, `
      <path d="M 19 34 C 12 26 10 14 21 5 C 30 12 28 26 19 34 Z" fill="#f4f0e4" stroke="#b8b2a2" stroke-width="1.6"/>
      <path d="M 19 33 L 21 8" stroke="#b8b2a2" stroke-width="1.4"/>
      <path d="M 20 14 L 15 18 M 20 19 L 14 24 M 20 24 L 15 29" stroke="#c9c3b4" stroke-width="1.2" fill="none"/>`),
    key: (s) => ic(s, `
      <circle cx="13" cy="15" r="7" fill="none" stroke="#c9a24b" stroke-width="3.4"/>
      <path d="M18 19 L32 33" stroke="#c9a24b" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M26 27 L30 23 M30 31 L34 27" stroke="#c9a24b" stroke-width="3.2" stroke-linecap="round"/>`),
    button: (s) => ic(s, `
      <circle cx="20" cy="20" r="11.5" fill="#f4e5ef" stroke="#b493ad" stroke-width="2"/>
      <circle cx="20" cy="20" r="7" fill="none" stroke="#d9c0d3" stroke-width="1.6"/>
      <circle cx="17" cy="18" r="1.7" fill="#8f7089"/><circle cx="23" cy="18" r="1.7" fill="#8f7089"/>
      <circle cx="17" cy="23" r="1.7" fill="#8f7089"/><circle cx="23" cy="23" r="1.7" fill="#8f7089"/>
      <path d="M13 14 a9 9 0 0 1 7 -3.4" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.9"/>`),
  };

  // ---------------------------------------------------------- textures
  const texes = {};
  function wallTex(c1, c2) {
    const key = 'wall|' + c1 + c2;
    if (texes[key]) return texes[key];
    return (texes[key] = K.canvasTex(512, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.018)';
      for (let i = 0; i < 6; i++) ctx.fillRect(i * 86 + 10, 0, 3, h);
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < 400; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }, { repeat: [3, 1] }));
  }
  function floorTex(c1, c2) {
    const key = 'floor|' + c1 + c2;
    if (texes[key]) return texes[key];
    return (texes[key] = K.canvasTex(512, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const bw = 64; // boards run toward the viewer: seams along y
      for (let i = 0; i < w / bw; i++) {
        const x = i * bw;
        // each board its own shade
        ctx.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0' : '255,255,255') + ',' + (0.02 + Math.random() * 0.05).toFixed(3) + ')';
        ctx.fillRect(x, 0, bw, h);
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x, 0, 3, h);
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x + 3, 0, 1.5, h);
        // the odd end-of-board joint
        const jy = (i * 197 + 40) % h;
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + 3, jy, bw - 3, 2.5);
        // grain
        ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1.2;
        for (let k = 0; k < 5; k++) {
          const gx = x + 8 + Math.random() * (bw - 16);
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.bezierCurveTo(gx + 4, h * 0.3, gx - 4, h * 0.7, gx + 2, h); ctx.stroke();
        }
      }
    }, { repeat: [5, 1] }));
  }

  function tileTex(c1, c2) {
    const key = 'tile|' + c1 + c2;
    if (texes[key]) return texes[key];
    return (texes[key] = K.canvasTex(512, 512, (ctx, w, h) => {
      const n = 4, s = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        ctx.fillStyle = (i + j) % 2 ? c1 : c2;
        ctx.fillRect(i * s, j * s, s, s);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(i * s, j * s, s, 3); ctx.fillRect(i * s, j * s, 3, s);
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(i * s + 3, j * s + 3, s - 6, 2);
      }
    }, { repeat: [6, 3] }));
  }

  // ---------------------------------------------------------- shared props
  const P = {
    /** the room as a box: back wall, floor, baseboard and the side walls that
        give the picture its depth. Returns floorY. */
    room(api, o) {
      o = o || {};
      const far = api.layers.far;
      const fy = o.floorY || 800;
      const ws = o.wallStops || [[0, '#2a3550'], [1, '#3c4a6b']];
      const fs = o.floorStops || [[0, '#6b4a33'], [1, '#4a3021']];
      const Z = o.depth != null ? o.depth : -330;
      const X1 = -420, X2 = 2020;
      const wallMat = new T.MeshStandardMaterial({ map: wallTex(ws[0][1], ws[ws.length - 1][1]), roughness: 0.95 });
      if (o.holes && o.holes.length) {
        // a wall with real openings (arches, doorways): a shape with holes, uv-scaled like the plain wall
        const shape = K.rectShape(X1, -400, X2 - X1, fy + 402, 0);
        o.holes.forEach((h) => shape.holes.push(h));
        const geo = new T.ShapeGeometry(shape, 12);
        const uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - X1) / (X2 - X1), (uv.getY(i) + 400) / (fy + 402));
        const wall = K.mesh(geo, wallMat, far, { cast: false });
        K.tr(wall, { z: Z });
      } else {
        K.vplane(X1, X2, -400, fy + 2, Z, wallMat, far);
      }
      const floorMat = new T.MeshStandardMaterial({ map: o.tiles ? tileTex(fs[0][1], fs[fs.length - 1][1]) : floorTex(fs[0][1], fs[fs.length - 1][1]), roughness: o.tiles ? 0.5 : 0.78 });
      if (o.floorHole) {   // a stairwell: the floor in four pieces round the opening
        const h = o.floorHole;
        K.hplane(X1, h.x1, fy, Z - 2, 420, floorMat, far);
        K.hplane(h.x2, X2, fy, Z - 2, 420, floorMat, far);
        K.hplane(h.x1, h.x2, fy, Z - 2, h.z1, floorMat, far);
        K.hplane(h.x1, h.x2, fy, h.z2, 420, floorMat, far);
      } else {
        K.hplane(X1, X2, fy, Z - 2, 420, floorMat, far);
      }
      // baseboard
      K.box(X1, fy - 16, X2 - X1, 18, 10, o.baseboard || '#26314d', far, { z: Z + 6 });
      // side walls, a shade darker
      const sideMat = new T.MeshStandardMaterial({ color: new T.Color(ws[0][1]).multiplyScalar(0.85), roughness: 0.95 });
      if (o.sides !== false) {
        const lx = o.leftX != null ? o.leftX : -150;
        if (o.leftDoor) {
          // a full doorway through the left side wall: the wall in three pieces round the opening, a frame standing
          // a little proud of it, and the next room's dark beyond lit warm
          const d = o.leftDoor, top = d.top != null ? d.top : 300, z1 = d.z1 != null ? d.z1 : -240, z2 = d.z2 != null ? d.z2 : 40;
          K.sidewall(lx, -400, top, Z, 420, sideMat, far, { facing: 'right' });
          K.sidewall(lx, top, fy + 2, Z, z1, sideMat, far, { facing: 'right' });
          K.sidewall(lx, top, fy + 2, z2, 420, sideMat, far, { facing: 'right' });
          const frameMat = K.mat(d.frame || '#1c2338', { rough: 0.9 });
          K.box(lx - 4, top - 14, 18, fy + 16 - top, 14, frameMat, far, { z: z1 - 7 });
          K.box(lx - 4, top - 14, 18, fy + 16 - top, 14, frameMat, far, { z: z2 + 7 });
          K.box(lx - 4, top - 14, 18, 14, z2 - z1 + 28, frameMat, far, { z: (z1 + z2) / 2 });
          K.sidewall(lx - 140, top, fy + 2, z1 - 20, z2 + 20, K.mat(d.beyond || '#1a1d30', { rough: 1 }), far, { facing: 'right' });
          K.hplane(lx - 140, lx, fy - 1, z1 - 20, z2 + 20, K.mat(d.beyondFloor || '#3a2a1c', { rough: 0.9 }), far);   // a hair above the room's floor, which runs on underneath: in one plane the two would shimmer
          K.point(far, lx - 70, top + (fy - top) * 0.45, (z1 + z2) / 2, d.lightColor || '#ffcf7a', d.light != null ? d.light : 10, 700);
          K.box(lx - 10, fy - 16, 12, 18, z1 - Z, o.baseboard || '#26314d', far, { z: (Z + z1) / 2 });
          K.box(lx - 10, fy - 16, 12, 18, 420 - z2, o.baseboard || '#26314d', far, { z: (z2 + 420) / 2 });
        } else {
          K.sidewall(lx, -400, fy + 2, Z, 420, sideMat, far, { facing: 'right' });
          K.box(lx - 10, fy - 16, 12, 18, 420 - Z, o.baseboard || '#26314d', far, { z: (Z + 420) / 2 });
        }
        K.sidewall(o.rightX != null ? o.rightX : 1750, -400, fy + 2, Z, 420, sideMat, far, { facing: 'left' });
        K.box(1748, fy - 16, 12, 18, 420 - Z, o.baseboard || '#26314d', far, { z: (Z + 420) / 2 });
      }
      // ceiling, for when the camera tilts up a little
      K.hplane(X1, X2, -400, Z, 420, K.mat(ws[0][1], { rough: 1 }), far, { receive: false }).material.side = T.DoubleSide;
      return fy;
    },

    /** warm pool of lamp light (never intercepts clicks) */
    glow(parent, x, y, r, color, op, z) {
      return K.glow(parent, x, y, z != null ? z : 0, r, color || '#ffb454', op != null ? op : 0.5);
    },

    /** a crescent moon: one shape, its inner edge a wider arc, glowing softly */
    moon(parent, cx, cy, r, o) {
      o = o || {};
      const g = K.g(parent);
      const d = 'M 0 ' + (-r) + ' A ' + r + ' ' + r + ' 0 1 1 0 ' + r + ' A ' + (r * 1.18) + ' ' + (r * 1.18) + ' 0 0 0 0 ' + (-r) + ' Z';
      const m = K.ext(d, 6, K.mat(o.fill || '#f1e9d2', { emissive: o.fill || '#f1e9d2', ei: 1.4, rough: 1, fog: false }), g, { x: cx, y: cy, z: o.z || 0, r: -18, bevel: 1 });
      m.castShadow = false;
      K.glow(g, cx, cy, (o.z || 0) + 8, r * 1.6, o.fill || '#f1e9d2', 0.22);
      return g;
    },

    /** night window: a deep frame in the wall, cool glass, mullions, a sill and a moon in the pane */
    windowNight(parent, x, y, w, h, o) {
      o = o || {};
      const g = K.g(parent);
      const Z = o.z != null ? o.z : -330; // the wall plane
      const frame = o.frame || '#20283e';
      const glass = K.canvasTex(256, 256, (ctx, cw, ch) => {
        const gr = ctx.createLinearGradient(0, 0, cw * 0.6, ch);
        gr.addColorStop(0, '#5f7ea8'); gr.addColorStop(0.5, '#33507c'); gr.addColorStop(1, '#141f3a');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 14; i++) ctx.fillRect(Math.random() * cw, Math.random() * ch * 0.5, 2, 2);
      });
      const gm = new T.MeshStandardMaterial({ map: glass, emissiveMap: glass, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.1 });
      const pane = K.vplane(x, x + w, y, y + h, Z + 3, gm, g);
      pane.userData.__disposeTex = glass;
      pane.scale.y = -1;
      if (o.moon) {
        const mx = x + w * (o.moonX != null ? o.moonX : 0.72), my = y + h * (o.moonY != null ? o.moonY : 0.26);
        const md = K.disc(mx, my, Math.min(w, h) * 0.13, 3, K.mat('#f4ecd7', { emissive: '#f4ecd7', ei: 1.3 }), g, { z: Z + 6 });
        md.castShadow = false;
        K.glow(g, mx, my, Z + 10, Math.min(Math.min(w, h) * 0.4, my - y - 6, y + h - my - 6, mx - x - 6, x + w - mx - 6), '#dfe8ff', 0.25);   // never past the frame
      }
      // the reveal: a deep box frame standing proud of the wall
      const d = 34, t = 14;
      K.box(x - t, y - t, w + 2 * t, t, d, frame, g, { z: Z + d / 2 });
      K.box(x - t, y + h, w + 2 * t, t, d, frame, g, { z: Z + d / 2 });
      K.box(x - t, y, t, h, d, frame, g, { z: Z + d / 2 });
      K.box(x + w, y, t, h, d, frame, g, { z: Z + d / 2 });
      // mullions, set a little into the reveal
      K.box(x + w / 2 - 5, y, 10, h, 10, frame, g, { z: Z + 14 });
      K.box(x, y + h / 2 - 5, w, 10, 10, frame, g, { z: Z + 14 });
      // sill
      K.box(x - 22, y + h + t, w + 44, 14, 90, frame, g, { z: Z + d + 18, round: 3 });   // deep enough for what stands on it
      // cool light spilling in
      if (o.light !== false) {
        const l = K.point(g, x + w / 2, y + h / 2, Z + 170, '#9db8d8', o.lightI != null ? o.lightI : 1.6, 900);
        l.decay = 1.2;
      }
      g.userData.pane = pane;
      return g;
    },

    /** a simple interior door, set into the back wall */
    door(parent, x, y, w, h, o) {
      o = o || {};
      const g = K.g(parent);
      const Z = o.z != null ? o.z : -330;
      K.box(x - 10, y - 10, w + 20, h + 10, 30, o.frame || '#26314d', g, { z: Z + 15 });
      const face = K.box(x, y, w, h, 12, o.c1 || '#7e5a3c', g, { z: Z + 12 });
      K.box(x + w * 0.14, y + h * 0.08, w * 0.72, h * 0.34, 6, o.c2 || '#6a4a2e', g, { z: Z + 20 });
      K.box(x + w * 0.14, y + h * 0.5, w * 0.72, h * 0.4, 6, o.c2 || '#6a4a2e', g, { z: Z + 20 });
      const hx = o.handleLeft ? x + w * 0.12 : x + w * 0.88;
      const gold = K.mat('#c9a24b', { rough: 0.35, metal: 0.6 });
      K.rodX(hx - 1, hx + 1, y + h * 0.52, 3.5, gold, g, { z: Z + 24 });
      K.sphere(hx, y + h * 0.52, 7, gold, g, { z: Z + 30 });
      g.userData.face = face;
      return g;
    },

    /** an oval rug lying on the floor */
    rug(parent, cx, y, w, c1, c2) {
      const g = K.g(parent);
      const mk = (rx, ry, color, z) => {
        const m = K.cut(K.ellipseShape(0, 0, rx, ry), K.mat(color, { rough: 1 }), g, { rx: 90 });
        K.tr(m, { x: cx, y: y - 1.2 - z, z: 0, rx: 90 });
        return m;
      };
      mk(w / 2, w / 4.2, c1 || '#8a4a52', 0);
      const ring = mk(w / 2 - 24, w / 4.2 - 12, c2 || '#c98a63', 0.4);
      const inner = mk(w / 2 - 30, w / 4.2 - 16, c1 || '#8a4a52', 0.8);
      void ring; void inner;
      return g;
    },

    /** a framed picture on the back wall; artFn paints on a canvas 2D context (w×h) */
    picture(parent, x, y, w, h, artFn, o) {
      o = o || {};
      const g = K.g(parent);
      const Z = o.z != null ? o.z : -330;
      K.box(x - 8, y - 8, w + 16, h + 16, 12, o.frame || '#8a6a42', g, { z: Z + 6 });
      const tex = K.canvasTex(Math.round(w * 2), Math.round(h * 2), (ctx, cw, ch) => {
        ctx.fillStyle = o.paper || '#d8cdb4'; ctx.fillRect(0, 0, cw, ch);
        ctx.scale(2, 2);
        if (artFn) artFn(ctx, w, h);
      });
      const m = K.vplane(x, x + w, y, y + h, Z + 12.5, new T.MeshStandardMaterial({ map: tex, roughness: 0.9 }), g);
      m.scale.y = -1;
      m.userData.__disposeTex = tex;
      return g;
    },

    /** a leafy potted plant */
    pottedPlant(parent, x, y, s) {
      s = s || 1;
      const g = K.g(parent, { x, y, s });
      K.cylUp(0, 0, 18, 34, K.mat('#b06a3d', { rough: 0.85 }), g, { rTop: 26 });
      K.cylUp(0, -30, 30, 10, K.mat('#c07845', { rough: 0.85 }), g);
      K.cylUp(0, -38, 22, 4, K.mat('#3a2a1c', { rough: 1 }), g);
      const leaf = 'M 0 -6 C -16 -40 -8 -78 0 -86 C 10 -70 12 -34 0 -6 Z';
      for (let i = -2; i <= 2; i++) {
        const l = K.ext(leaf, 3, i % 2 ? '#5c8a4a' : '#6f9e55', g, { x: i * 6, y: -30, ry: i * 26, r: i * 9, bevel: 1 });
        void l;
      }
      for (let i = 0; i < 3; i++) {
        K.ext(leaf, 3, '#4f7a3f', g, { x: (i - 1) * 8, y: -34, ry: 180 + (i - 1) * 40, r: (i - 1) * 12, bevel: 1, s: 0.8 });
      }
      return g;
    },

    /** a small dust puff burst at (x,y,z) */
    dust(api, x, y, n, z) {
      for (let i = 0; i < (n || 5); i++) {
        const sp = K.glow(api.layers.fx, x + U.rand(-8, 8), y + U.rand(-4, 2), (z || 0) + 20, U.rand(6, 11), '#cbb9a0', 0.55);
        sp.material.blending = T.NormalBlending;
        const o = { dx: U.rand(-22, 22), dy: U.rand(-20, -6), op: 0.55, r: sp.scale.x / 2 };
        CH.tw.to(o, { dx: o.dx * 2, dy: o.dy * 2, op: 0, r: o.r + 8 }, {
          dur: U.rand(400, 700), ease: CH.tw.ease.quadOut, group: 'scene',
          onUpdate: () => {
            sp.position.set(x + o.dx, y + o.dy, (z || 0) + 20);
            sp.material.opacity = o.op; sp.scale.set(o.r * 2, o.r * 2, 1);
          },
        }).then(() => { sp.parent && sp.parent.remove(sp); sp.material.dispose(); });
      }
    },

    /** a drooping chestnut leaf — 5 broad leaflets hanging from one stalk; a flat cut-out */
    chestnutLeaf(parent, x, y, size, rot, tone, o) {
      o = o || {};
      const g = K.g(parent, { x, y, r: rot || 0, s: (size || 34) / 34, ry: o.ry || 0 });
      const mat = K.mat(tone || '#57853f', { rough: 0.9, side: 'double' });
      for (let i = 0; i < 5; i++) {
        const a = 180 - 52 + i * 26;
        const len = i === 2 ? 34 : (i === 1 || i === 3 ? 30 : 23);
        const d = `M 0 0 C -3 ${-len * 0.3} -8.5 ${-len * 0.62} -7 ${-len * 0.85} C -5 ${-len * 1.02} 5 ${-len * 1.02} 7 ${-len * 0.85} C 8.5 ${-len * 0.62} 3 ${-len * 0.3} 0 0 Z`;
        const m = K.cut(d, mat, g, { r: a, z: i * 0.4 });
        m.castShadow = true;
      }
      return g;
    },

    /** one upright chestnut blossom "candle" */
    candle(parent, x, y, s) {
      const g = K.g(parent, { x, y, s: s || 1 });
      K.ext('M 0 -26 C 5.5 -18 7 -8 5.5 0 L -5.5 0 C -7 -8 -5.5 -18 0 -26 Z', 6, K.mat('#f8f2e0', { rough: 0.9, emissive: '#f8f2e0', ei: 0.12 }), g, { bevel: 1.5 });
      K.sphere(-2, -18, 1.6, '#f2b3c4', g, { z: 4 });
      K.sphere(2.4, -11, 1.6, '#f2b3c4', g, { z: 4 });
      K.sphere(-1.4, -5, 1.6, '#e8a13c', g, { z: 4 });
      return g;
    },

    /**
     * A living fractal chestnut tree in three dimensions — one continuous organism,
     * the same api as before: growTo, leafProgress, flowers[], candleTipAbs, gust, finish, crownTop.
     */
    fractalTree(parent, x, y, o) {
      o = o || {};
      const s = o.s || 1;
      const g = K.g(parent, { x, y, s });
      const segsG = K.g(g), folG = K.g(g);
      const MAXD = 5;
      const segs = [], tips = [];
      const segGeo = new T.CylinderGeometry(0.36, 0.5, 1, 9);   // tapering toward the tip
      segGeo.translate(0, 0.5, 0); // base at the origin, grows along +y (we aim it ourselves)
      const knotGeo = new T.SphereGeometry(0.5, 12, 9);           // the rounded node at each fork
      const woodYoung = new T.Color(109 / 255, 154 / 255, 76 / 255);
      const mk = (rel, len, w, depth, t0) => {
        const n = {
          rel, len, w, depth, t0,
          span: 0.17 + depth * 0.02,
          phase: U.rand(0, 6.28),
          bow: U.rand(-0.14, 0.14) * len,
          zrel: depth === 0 ? 0 : U.rand(-1, 1) * len * (0.28 + depth * 0.05),
          children: [], tx: 0, ty: 0, tz: 0, dir: -90, growCur: o.grown ? 1 : 0,
        };
        n.mat = new T.MeshStandardMaterial({ color: woodYoung.clone(), roughness: 0.85 });
        n.el = new T.Mesh(segGeo, n.mat);
        n.el.castShadow = true; n.el.receiveShadow = true;
        n.el.visible = false;
        segsG.add(n.el);
        if (depth < MAXD - 1) { n.knot = new T.Mesh(knotGeo, n.mat); n.knot.castShadow = true; n.knot.receiveShadow = true; n.knot.visible = false; segsG.add(n.knot); }
        n.baseColor = depth < 2 ? [90, 61, 40] : [107, 74, 48];
        segs.push(n);
        if (depth < MAXD - 1) {
          const kids = depth === 0 ? 3 : (depth === 1 && U.rand(0, 1) < 0.5 ? 3 : 2);
          for (let i = 0; i < kids; i++) {
            const spread = (i - (kids - 1) / 2) * U.rand(26, 36) + U.rand(-9, 9);
            n.children.push(mk(spread, len * U.rand(0.62, 0.74), Math.max(2.6, w * 0.58), depth + 1, t0 + n.span * 0.7));
          }
        } else tips.push(n);
        return n;
      };
      const root = mk(0, 165, 30, 0, 0);
      let tmax = 0;
      segs.forEach((n) => { tmax = Math.max(tmax, n.t0 + n.span); });
      segs.forEach((n) => { n.t0 /= tmax; n.span /= tmax; });

      // the canopy: tufts of real leaves along the outer branches
      const leaves = [];
      const leafHosts = segs.filter((n) => n.depth >= 2);
      const tuftGeos = [];
      leafHosts.forEach((n) => {
        const count = n.depth === MAXD - 1 ? 6 : (n.depth === 3 ? 4 : 2);
        for (let i = 0; i < count; i++) {
          const wrap = K.g(folG);
          const tuft = U.randi(2, 3);
          for (let k = 0; k < tuft; k++) {
            P.chestnutLeaf(wrap, U.rand(-20, 20), U.rand(-16, 16), U.rand(30, 46), U.rand(0, 360),
              U.pick(['#57853f', '#649347', '#4c7a38', '#6f9e55', '#5d8d46']), { ry: U.rand(-40, 40) });
          }
          wrap.visible = false;
          leaves.push({
            el: wrap, node: n,
            along: n.depth === MAXD - 1 ? U.rand(0.4, 1) : U.rand(0.45, 1),
            ox: U.rand(-34, 34), oy: U.rand(-32, 20), oz: U.rand(-40, 40),
            rot: U.rand(-20, 20), uf: o.grown ? 1 : 0, unfurling: o.grown,
            delay: U.rand(0, 0.9), phase: U.rand(0, 6.28),
          });
        }
      });
      void tuftGeos;

      // flowers in stages: bud → candle → pink specks
      const flowers = [];
      const flowerHosts = segs.filter((n) => n.depth >= 3).sort(() => Math.random() - 0.5).slice(0, 28);
      flowerHosts.forEach((n) => {
        const fg = K.g(folG);
        const inner = U.rand(0.9, 1.2);
        const coneG = K.g(fg);
        K.ext('M 0 -26 C 5.5 -18 7 -8 5.5 0 L -5.5 0 C -7 -8 -5.5 -18 0 -26 Z', 6, K.mat('#f8f2e0', { rough: 0.9, emissive: '#f8f2e0', ei: 0.12 }), coneG, { bevel: 1.5, s: inner });
        const dotsG = K.g(coneG);
        K.sphere(-2 * inner, -18 * inner, 1.7, '#f2b3c4', dotsG, { z: 4 });
        K.sphere(2.4 * inner, -11 * inner, 1.7, '#f2b3c4', dotsG, { z: 4 });
        K.sphere(-1.4 * inner, -5 * inner, 1.7, '#e8a13c', dotsG, { z: 4 });
        const bud = K.sphere(0, -2, 5, '#7fae58', fg);
        fg.visible = false;
        flowers.push({
          el: fg, coneG, dotsG, bud, node: n,
          along: n.depth === MAXD - 1 ? U.rand(0.6, 1) : U.rand(0.5, 0.95),
          oz: U.rand(-30, 30),
          budS: o.grown ? 1 : 0, coneS: o.grown ? 1 : 0, dotsO: o.grown ? 1 : 0,
          lean: 0, h: 26 * inner, phase: U.rand(0, 6.28),
        });
      });

      // the seedling's two cotyledon leaves
      const cots = [];
      [-1, 1].forEach((side) => {
        const cg = K.g(folG);
        K.cut(`M 0 0 C ${18 * side} -4 ${28 * side} -18 ${23 * side} -30 C ${8 * side} -25 ${2 * side} -12 0 0 Z`, K.mat(side < 0 ? '#7fae58' : '#8fbe62', { side: 'double' }), cg);
        cg.visible = !o.grown;
        cots.push({ el: cg, side, uf: o.grown ? 1 : 0, falling: false, fallT: 0, fx: 0, fy: 0, phase: U.rand(0, 6.28) });
      });

      // ---------------- living kinematics ----------------
      let TT = U.rand(0, 10), G = o.grown ? 1 : 0, gustBoost = 0;
      let unfurled = o.grown ? leaves.length : 0;
      const lerpC = (a, b, t) => (a + (b - a) * t) / 255;
      const _q = new T.Quaternion(), _up = new T.Vector3(0, 1, 0), _d = new T.Vector3();
      const walk = (n, bx, by, bz, paDir, wind) => {
        const gr = U.clamp((G - n.t0) / n.span, 0, 1);
        n.growCur = gr;
        const sway = wind * (0.25 + n.depth * 0.45) * Math.sin(TT * (1.0 + n.depth * 0.31) + n.phase);
        const dir = paDir + n.rel + sway;
        const rad = (dir * Math.PI) / 180;
        const L = n.len * gr;
        const tx2 = bx + Math.cos(rad) * L, ty2 = by + Math.sin(rad) * L, tz2 = bz + n.zrel * gr;
        if (gr > 0.01) {
          n.el.visible = true;
          _d.set(tx2 - bx, ty2 - by, tz2 - bz);
          const len = _d.length();
          _d.normalize();
          _q.setFromUnitVectors(_up, _d);
          n.el.position.set(bx, by, bz);
          n.el.quaternion.copy(_q);
          let wdt;
          if (n.depth === 0) {
            const lig = U.clamp(G * 2.6, 0, 1);
            n.mat.color.setRGB(lerpC(109, 90, lig), lerpC(154, 61, lig), lerpC(76, 40, lig));
            wdt = 6 + (n.w - 6) * lig;
          } else {
            const lig = U.clamp(gr * 1.6, 0, 1);
            n.mat.color.setRGB(lerpC(109, n.baseColor[0], lig), lerpC(154, n.baseColor[1], lig), lerpC(76, n.baseColor[2], lig));
            wdt = n.w * (0.35 + 0.65 * gr);
          }
          n.el.scale.set(wdt, len, wdt);
          if (n.knot) { n.knot.visible = true; n.knot.position.set(tx2, ty2, tz2); const kr = wdt * 0.82; n.knot.scale.set(kr, kr, kr); }
        } else { n.el.visible = false; if (n.knot) n.knot.visible = false; }
        n.bx = bx; n.by = by; n.bz = bz; n.tx = tx2; n.ty = ty2; n.tz = tz2; n.dir = dir;
        n.children.forEach((c) => walk(c, tx2, ty2, tz2, dir, wind));
      };

      CH.tw.tick((dt) => {
        TT += dt;
        const wind = (0.55 + Math.max(0, Math.sin(TT * 0.8) * 0.55 + Math.sin(TT * 0.44) * 0.45)) * (1.7 - 0.7 * G) + gustBoost;
        walk(root, 0, 0, 0, -90, wind);

        leaves.forEach((l) => {
          if (!l.unfurling && G > 0 && l.node.growCur >= 1) {
            if (l.readyT == null) l.readyT = TT + l.delay * 1.1;
            else if (TT >= l.readyT) {
              l.unfurling = true;
              CH.tw.to(l, { uf: 1 }, { dur: 700 + l.delay * 800, ease: CH.tw.ease.backOut, group: 'scene' })
                .then(() => { unfurled++; });
            }
          }
          if (l.uf <= 0.02) { l.el.visible = false; return; }
          l.el.visible = true;
          const ax = l.node.bx + (l.node.tx - l.node.bx) * l.along;
          const ay = l.node.by + (l.node.ty - l.node.by) * l.along;
          const az = l.node.bz + (l.node.tz - l.node.bz) * l.along;
          K.tr(l.el, {
            x: ax + l.ox * l.uf, y: ay + l.oy * l.uf, z: az + l.oz * l.uf,
            s: l.uf, r: l.rot + (1 - l.uf) * 70 + Math.sin(TT * 1.5 + l.phase) * 3,
          });
        });

        flowers.forEach((f) => {
          const vis = f.budS > 0.02 && f.node.growCur > 0.9;
          f.el.visible = vis;
          if (!vis) return;
          const fx2 = f.node.bx + (f.node.tx - f.node.bx) * f.along;
          const fy2 = f.node.by + (f.node.ty - f.node.by) * f.along;
          const fz2 = f.node.bz + (f.node.tz - f.node.bz) * f.along + f.oz;
          K.tr(f.el, { x: fx2, y: fy2, z: fz2, r: f.lean + Math.sin(TT * 1.3 + f.phase) * 1.6 });
          const bs = 5 * f.budS * (1 - 0.55 * f.coneS);
          K.tr(f.bud, { x: 0, y: -2, s: Math.max(0.001, bs / 5) });
          K.tr(f.coneG, { sx: 1, sy: Math.max(0.001, f.coneS), sz: 1 });
          f.dotsG.visible = f.dotsO > 0.05;
        });

        cots.forEach((c) => {
          if (!c.falling && G > 0.34 && !o.grown) { c.falling = true; c.fx = root.tx * 0.9; c.fy = root.ty * 0.86; }
          if (o.grown) { c.el.visible = false; return; }
          if (!c.falling) {
            const gr0 = U.clamp(G / 0.13, 0, 1);
            c.uf = gr0;
            c.el.visible = gr0 > 0.05;
            K.tr(c.el, { x: root.tx * 0.82, y: root.ty * 0.82, z: 8, sx: Math.max(0.001, c.uf * c.side), sy: Math.max(0.001, c.uf), sz: 1, r: Math.sin(TT * 1.6 + c.phase) * 4 });
          } else if (c.fallT < 1) {
            c.fallT += dt / 3.2;
            const t2 = c.fallT;
            const fx2 = c.fx + c.side * 40 * t2 + Math.sin(t2 * 9 + c.phase) * 16;
            const fy2 = c.fy + (0 - c.fy) * (t2 * t2 * 0.9 + t2 * 0.1);
            c.el.visible = t2 < 0.98;
            K.tr(c.el, { x: fx2, y: Math.min(-4, fy2), z: 8, sx: c.side, sy: 1, sz: 1, r: Math.sin(t2 * 7 + c.phase) * 60 });
          } else c.el.visible = false;
        });
      }, 'scene');

      return {
        g, leaves, flowers,
        growTo(target, ms) {
          const obj = { v: G };
          return CH.tw.to(obj, { v: target }, { dur: ms, ease: CH.tw.ease.quadInOut, group: 'scene', onUpdate: () => { G = obj.v; } });
        },
        leafProgress() { return unfurled / leaves.length; },
        finish() {
          G = 1;
          leaves.forEach((l) => { l.unfurling = true; l.uf = 1; });
          unfurled = leaves.length;
          flowers.forEach((f) => { f.budS = 1; f.coneS = 1; f.dotsO = 1; });
          cots.forEach((c) => { c.falling = true; c.fallT = 1; });
        },
        gust(power, ms) {
          const obj = { v: power };
          gustBoost = power;
          CH.tw.to(obj, { v: 0 }, { dur: ms || 2200, ease: CH.tw.ease.quadOut, group: 'scene', onUpdate: () => { gustBoost = obj.v; } });
        },
        candleTipAbs(i) {
          const f = flowers[i];
          const fx2 = f.node.bx + (f.node.tx - f.node.bx) * f.along;
          const fy2 = f.node.by + (f.node.ty - f.node.by) * f.along;
          const fz2 = f.node.bz + (f.node.tz - f.node.bz) * f.along + f.oz;
          return { x: x + fx2 * s, y: y + fy2 * s - f.h * s * Math.max(f.coneS, 0.05), z: fz2 * s };
        },
        setLean(i, r) { flowers[i].lean = r; },
        crownTop() { return { x, y: y - 440 * s }; },
      };
    },

    /** exit arrow marker for scene transitions: a small amber chevron that breathes */
    exitMark(api, x, y, dir, z, opt) {
      opt = opt || {};
      const g = K.g(api.layers.fx);
      // with a margin the mark follows the screen edge instead of a stage x, so it sits the same on every scene
      // whatever the camera's follow and parallax are doing
      const edgeX = () => {
        if (opt.margin == null) return x;
        const cam = CH.engine.camera, sx = dir === 'left' ? -1 : 1;
        const p = new T.Vector3(sx, 0, 0.5).unproject(cam), d = p.sub(cam.position).normalize();
        const zw = (z != null ? z : 60) * 0.01, t = (zw - cam.position.z) / d.z;
        const hit = cam.position.x + d.x * t;
        return hit * 100 + 800 - sx * opt.margin;
      };
      // opt.minX / opt.maxX: the edge-following x, kept clear of anything the mark must not sink behind (a doorway's near post)
      const markX = () => { let ex = edgeX(); if (opt.minX != null && ex < opt.minX) ex = opt.minX; if (opt.maxX != null && ex > opt.maxX) ex = opt.maxX; return ex; };
      const rot = { right: 0, left: 180, up: -90, down: 90 }[dir || 'right'];
      const a = K.cut('M -8 -10 L 8 0 L -8 10 Z', new T.MeshBasicMaterial({ color: new T.Color('#ffb454'), transparent: true, opacity: 0.55, fog: false }), g);
      a.userData.noHit = true;
      // opt.pad: the click pad of the exit, carried with the mark — from a little short of the arrow out past the screen edge,
      // the duct's height around it, and well behind the sheet so nothing drawn there is hidden under it
      g.pad = opt.pad ? K.pad(-30, -175, 430, 350, g, { d: 40, z: 0 }) : null;   // at the arrow's own depth, so what the player sees as "near the arrow" is what the pad covers
      K.tr(g, { x, y, z: z != null ? z : 60, r: rot });
      const o = { t: 0 };
      CH.tw.tick(() => {
        o.t += 0.04;
        const p = (Math.sin(o.t) + 1) / 2;
        a.material.opacity = 0.3 + p * 0.4;
        K.tr(g, { x: markX() + Math.cos(rot * Math.PI / 180) * p * 7, y: y + Math.sin(rot * Math.PI / 180) * p * 7, z: z != null ? z : 60, r: rot });
      }, 'scene');
      return g;
    },
  };

  /**
   * The house, seen from the garden: clapboard walls, a gable roof with real eaves, a chimney,
   * deep-set windows and a porch with a lamp. o: { night (warm windows + lamp lit), day }
   * Origin: the house's left-bottom corner at (0, 656); it is 520 wide and 356 tall, like the old drawing.
   */
  P.house = function (parent, x, y, o) {
    o = o || {};
    const g = K.g(parent, { x, y: y || 0, z: o.z || -420 });
    const night = !o.day;
    const wallC = night ? ['#4a3f52', '#3a3242'] : ['#b8a8c4', '#9a8aa8'];
    const trim = night ? '#2a2433' : '#6a5c78';
    const paintWall = (ctx, w, h) => {
      const gr = ctx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, wallC[0]); gr.addColorStop(1, wallC[1]);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(0, i * 42 + 38, w, 4); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, i * 42, w, 2); }
    };
    const wallMat = new T.MeshStandardMaterial({ map: K.canvasTex(256, 512, paintWall, { repeat: [2, 1] }), roughness: 0.95 });
    const D = 420;
    // the wall: a solid block behind (its face at z 26) and, in front of it, a facade slab with the windows cut
    // out — so every window is a recess with the glass at its back and room inside for whoever comes to it
    const WINS = [[60, 350, 100, 84], [350, 350, 100, 84], [60, 510, 100, 90]];
    K.box(0, 300, 520, 356, D - 24, wallMat, g, { z: -172 });
    const faceTex = K.canvasTex(256, 512, paintWall, { repeat: [2 / 520, 1 / 356] });   // the extrusion's uvs are stage units: same brick lines as the block
    faceTex.offset.set(0, -300 / 356);
    const faceMat = new T.MeshStandardMaterial({ map: faceTex, roughness: 0.95 });
    const holes = WINS.map(([wx, wy, w, h]) => `M ${wx} ${wy} L ${wx} ${wy + h} L ${wx + w} ${wy + h} L ${wx + w} ${wy} Z`).join(' ');
    K.ext(`M 0 300 L 520 300 L 520 656 L 0 656 Z ${holes}`, 24, faceMat, g, { z: 38, bevel: 0 });
    K.box(-6, 640, 532, 20, D + 12, K.mat(trim, { rough: 0.95 }), g, { z: -160 });                 // foundation
    // gable roof with eaves, overhanging all round
    K.ext('M -60 314 L 260 160 L 580 314 L 580 326 L 260 176 L -60 326 Z', D + 90, K.mat(trim, { rough: 0.85 }), g, { z: -160, bevel: 2 });
    K.ext('M -56 316 L 260 164 L 576 316 Z', D + 60, K.mat(night ? '#2f2a3a' : '#7a6c88', { rough: 0.9 }), g, { z: -160, bevel: 0 });
    K.box(380, 196, 42, 100, 42, K.mat(night ? '#3a3242' : '#8a7a98', { rough: 0.9 }), g, { z: -230 });  // chimney
    K.box(372, 188, 58, 14, 58, K.mat(trim, { rough: 0.9 }), g, { z: -230 });
    // windows: deep frames, sills, mullions, glass that glows at night
    const glass = night ? K.mat('#ffd489', { emissive: '#ffb454', ei: 1.1, rough: 0.6 }) : K.mat('#cfe6f2', { rough: 0.2, metal: 0.1 });
    const win = (wx, wy, w, h) => {
      K.box(wx - 10, wy - 10, w + 20, 10, 24, trim, g, { z: 58 }); K.box(wx - 10, wy + h, w + 20, 10, 24, trim, g, { z: 58 });
      K.box(wx - 10, wy, 10, h, 24, trim, g, { z: 58 }); K.box(wx + w, wy, 10, h, 24, trim, g, { z: 58 });
      K.vplane(wx, wx + w, wy, wy + h, 28, glass, g).castShadow = false;                                   // the lit back of the recess
      K.box(wx + w / 2 - 3, wy, 6, h, 8, trim, g, { z: 58 });
      K.box(wx, wy + h / 2 - 3, w, 6, 8, trim, g, { z: 58 });
      K.box(wx - 16, wy + h + 10, w + 32, 10, 40, trim, g, { z: 76, round: 2 });
      if (night) { K.glow(g, wx + w / 2, wy + h / 2, 80, w * 0.9, '#ffb454', 0.07); K.point(g, wx + w / 2, wy + h / 2, 140, '#ffb454', 2.2, 500); }
    };
    WINS.forEach((wn) => win(wn[0], wn[1], wn[2], wn[3]));
    // door, step and porch lamp
    K.box(326, 494, 104, 162, 24, trim, g, { z: 58 });
    K.box(340, 508, 76, 148, 10, P.woodMat(night ? '#57422e' : '#7a5a3c', night ? '#3e2f20' : '#5f412a', 0.8), g, { z: 70 });
    K.box(352, 520, 52, 54, 6, K.mat(night ? '#4a3626' : '#6a4a2e', { rough: 0.9 }), g, { z: 78 });
    K.box(352, 588, 52, 54, 6, K.mat(night ? '#4a3626' : '#6a4a2e', { rough: 0.9 }), g, { z: 78 });
    K.sphere(404, 586, 5, K.mat('#c9a24b', { metal: 0.6, rough: 0.35 }), g, { z: 80 });
    K.box(306, 650, 144, 14, 140, K.mat(trim, { rough: 0.9 }), g, { z: 120 });
    K.box(318, 664, 120, 10, 150, K.mat(night ? '#241f2c' : '#5a4c68', { rough: 0.9 }), g, { z: 130 });
    K.rbox(298, 470, 8, 30, 8, 2, trim, g, { z: 74 });
    K.rbox(292, 500, 20, 24, 20, 4, K.mat(night ? '#ffd489' : '#d8d0c4', night ? { emissive: '#ffd489', ei: 1.4 } : { rough: 0.6 }), g, { z: 74 }).castShadow = false;
    if (night) K.point(g, 302, 512, 150, '#ffb454', 7, 420);
    // drainpipe down the right corner
    K.cylUp(513, 656, 5, 340, K.mat(trim, { rough: 0.6 }), g, { z: 72 });
    return g;
  };

  /**
   * A door standing open toward the room, hinged on one side of its frame in the back wall:
   * the dark room beyond, a proud frame, the leaf swung out with its panels and knob.
   * o: { z, hinge: 'left'|'right', angle, frame, c1, c2 }
   */
  P.openDoor = function (parent, x, y, w, h, o) {
    o = o || {};
    const g = K.g(parent);
    const Z = o.z != null ? o.z : -330;
    const frame = o.frame || '#26314d';
    K.vplane(x, x + w, y, y + h, Z + 1, K.mat('#0b0f18', { rough: 1 }), g);
    K.box(x - 12, y - 12, w + 24, 12, 30, frame, g, { z: Z + 15 });
    K.box(x - 12, y, 12, h, 30, frame, g, { z: Z + 15 });
    K.box(x + w, y, 12, h, 30, frame, g, { z: Z + 15 });
    const right = o.hinge === 'right';
    const leaf = K.g(g);
    const lx = right ? -w : 0;
    K.box(lx, 0, w, h, 10, P.woodMat(o.c1 || '#7e5a3c', o.c2 || '#5f412a', 0.7), leaf);
    K.box(lx + w * 0.14, h * 0.08, w * 0.72, h * 0.34, 6, o.c2 || '#6a4a2e', leaf, { z: 8 });
    K.box(lx + w * 0.14, h * 0.5, w * 0.72, h * 0.4, 6, o.c2 || '#6a4a2e', leaf, { z: 8 });
    K.sphere(right ? lx + w * 0.12 : w * 0.88, h * 0.52, 7, K.mat('#c9a24b', { rough: 0.35, metal: 0.6 }), leaf, { z: 12 });
    const ang = o.angle != null ? o.angle : 62;
    K.tr(leaf, { x: right ? x + w : x, y, z: Z + 20, ry: right ? ang : -ang });
    return g;
  };

  P.wallTex = wallTex;
  P.floorTex = floorTex;
  /** warm wood grain for desks and tables */
  P.woodTex = function (c1, c2) {
    const key = 'wood|' + c1 + c2;
    if (texes[key]) return texes[key];
    return (texes[key] = K.canvasTex(512, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,0.09)'; ctx.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const y = i * 34 + Math.random() * 10;
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 14, w * 0.7, y + (Math.random() - 0.5) * 14, w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const y = i * 44 + 20;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(w * 0.4, y + 6, w * 0.6, y - 6, w, y); ctx.stroke();
      }
    }, { repeat: [3, 3] }));
  };
  P.woodMat = function (c1, c2, rough) {
    const key = 'woodmat|' + c1 + c2 + rough;
    if (texes[key]) return texes[key];
    return (texes[key] = new T.MeshStandardMaterial({ map: P.woodTex(c1, c2), roughness: rough != null ? rough : 0.7 }));
  };

  CH.props = P;
})();
