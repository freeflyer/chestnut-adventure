/* Chapter 2 — Behind the Walls. The house's ducts, drawn the way the house was planned:
   graph paper, thin cyan lines, hatching, rivets, and warm light where a grate looks into
   a room — only now the duct is a real tin tunnel and the lines glow along its edges.
   Four scenes: ductA (the junction) → ductB (the fan) → ductC (the dark bend) → ductD (the hallway grate). */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  const INK = '#8fd3ff';       // the drawn line
  const INK_DIM = '#4a7a99';   // faded ink
  const PAPER = '#0e1826';     // the sheet
  const METAL = '#132236';     // inside the duct
  const METAL_LIT = '#1a2e46';
  const WARM = '#ffd489';      // light from a room
  const FLOOR = 800;
  const FLOORLINE = FLOOR + 26;   // where the drawn floor is: he stands a step in front of the sheet, so the line sits lower
  const MONO = '"Courier New", Courier, monospace';
  // the drawing plane sits just behind him: he walks along the drawn floor line, and the whole level is one sheet
  const WALL = -90;
  const Z = { paper: WALL - 10, fill: WALL, hatch: WALL + 4, ink: WALL + 8, prop: WALL + 16, front: WALL + 28 };
  const FZ = WALL + 32;      // the feather, in front of the fan
  const FLUFFZ = WALL + 34;  // Fluff, in front of the drawing

  const inkLine = (parent, pts, op, w) => {
    const g = new T.BufferGeometry().setFromPoints(pts.map((p) => new T.Vector3(p[0], p[1], p[2] || 0)));
    const l = new T.Line(g, new T.LineBasicMaterial({ color: new T.Color(INK), transparent: true, opacity: op != null ? op : 0.8, fog: false }));
    l.userData.noHit = true;
    parent.add(l);
    return l;
  };
  /** a trapezoid of light that fades smoothly from the top edge to nothing at the bottom */
  const fadeQuad = (parent, x1a, x1b, y1, x2a, x2b, y2, color, top, z) => {
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute([x1a, y1, z, x1b, y1, z, x2b, y2, z, x2a, y2, z], 3));
    const c = new T.Color(color).multiplyScalar(top);
    geo.setAttribute('color', new T.Float32BufferAttribute([c.r, c.g, c.b, c.r, c.g, c.b, 0, 0, 0, 0, 0, 0], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, blending: T.AdditiveBlending, transparent: true, depthWrite: false, fog: false, side: T.DoubleSide }));
    m.castShadow = false; m.receiveShadow = false; m.userData.noHit = true;
    parent.add(m);
    return m;
  };
  const inkMat = (op) => K.mat(INK, { emissive: INK, ei: 0.5, rough: 1, opacity: op != null ? op : 1, fog: false });
  let hatchTex = null;
  const hatchMat = () => {
    if (!hatchTex) hatchTex = K.canvasTex(64, 64, (ctx, w, h) => {
      ctx.fillStyle = '#10203a'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(143,211,255,0.55)'; ctx.lineWidth = 2;
      for (let i = -64; i < 128; i += 12) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 64, 64); ctx.stroke(); }
    }, { repeat: [6, 1] });
    return new T.MeshStandardMaterial({ map: hatchTex, roughness: 0.9, emissive: new T.Color('#1b3350'), emissiveIntensity: 0.4 });
  };

  // ============================================================ the look
  const DUCT = CH.ductfx = {
    /** graph paper, dust in the air, a cool rim on the hero, the house breathing */
    apply(api) {
      const L = api.layers;
      // the sheet the world is drawn on: graph paper, far behind everything
      const grid = K.canvasTex(512, 512, (ctx, w, h) => {
        ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(143,211,255,0.09)'; ctx.lineWidth = 1;
        for (let i = 0; i <= w; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(143,211,255,0.18)'; ctx.lineWidth = 1.4;
        for (let i = 0; i <= w; i += 200) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
      }, { repeat: [5, 3] });
      const sheet = K.vplane(-800, 2400, -600, 1300, Z.paper, new T.MeshBasicMaterial({ map: grid, fog: false }), L.far);
      sheet.userData.__disposeTex = grid;
      // a title block in the corner, like every sheet has
      const tb = K.g(L.far, { z: Z.paper + 2 });
      inkLine(tb, [[1236, 870], [1556, 870], [1556, 924], [1236, 924], [1236, 870]], 0.5);
      inkLine(tb, [[1236, 897], [1556, 897]], 0.4);
      DUCT.text(tb, 1396, 888.5, CH.t('duct.lbl.plan'), 16, 0.8);    // the capitals' visual centre sits 5 above the given y: these centre each line in its cell (870..897, 897..924)
      DUCT.text(tb, 1396, 915.5, CH.t('duct.lbl.scale'), 16, 0.65);

      // dust in the air — the only thing that moves when nothing moves
      const motes = [];
      const spawnMote = (x, y, tmp) => {
        const el = K.glow(L.fx, 0, 0, 0, U.rand(3, 6), '#cfe6f5', 0.4);
        const m = { el, x: x != null ? x : U.rand(0, 1600), y: y != null ? y : U.rand(560, 830), z: U.rand(-250, 150), v: U.rand(4, 11), ph: U.rand(0, 6.28), k: U.rand(0.55, 1.45), tmp: !!tmp, life: 1 };
        motes.push(m);
        return m;
      };
      for (let i = 0; i < 34; i++) spawnMote();
      const rim = K.glow(L.fx, 0, 0, 0, 74, INK, 0.16);
      const rimLight = K.point(L.lights, 0, 0, 220, INK, 7, 600);
      const ctl = { wind: 0, gust: 0, shake: 0, loose: [] };
      ctl.spawn = (x, y) => spawnMote(x, y, true);
      ctl.wind = api.state.has('fanJammed') ? 0 : -55;
      api._duct = ctl;
      // the house breathes: slow, uneven, never on a metronome
      const breath = K.vplane(-1500, 3100, -1500, 2400, 380, new T.MeshBasicMaterial({ color: new T.Color(WARM), transparent: true, opacity: 0, depthWrite: false, fog: false }), L.fg);
      breath.userData.noHit = true; breath.renderOrder = 20;
      const br = { next: U.rand(2.5, 5), t: -1, inhale: 2, hold: 0.5, exhale: 3, level: 0.04, count: 0 };
      const planBreath = () => {
        br.count++;
        br.inhale = U.rand(1.5, 2.6); br.hold = U.rand(0.25, 0.9); br.exhale = U.rand(2.4, 4.4); br.level = U.rand(0.09, 0.17);
        if (br.count % 4 === 3) br.next = U.rand(14, 20);
        else if (Math.random() < 0.25) br.next = U.rand(2.5, 4);
        else br.next = U.rand(5, 11);
      };
      let tt = U.rand(0, 100);
      api.tick((dt) => {
        const wind = ctl.wind + ctl.gust * 440;
        const windy = Math.abs(ctl.gust);
        if (windy > 0.3 && motes.length < 90 && Math.random() < dt * 16) spawnMote(ctl.gust > 0 ? -20 : 1620, U.rand(600, 820), true);
        for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i];
          m.ph += dt * (0.7 + windy * 2.5);
          m.x += (Math.sin(m.ph) * 6 + wind * m.k) * dt;
          m.y -= (m.v + windy * 22 * Math.sin(m.ph * 2.3)) * dt;
          if (m.tmp) {
            m.life -= dt * (windy > 0.15 ? 0.12 : 0.9);
            if (m.life <= 0) { m.el.parent.remove(m.el); m.el.material.dispose(); motes.splice(i, 1); continue; }
          }
          if (m.y < 540) { m.y = 840; m.x = U.rand(0, 1600); }
          if (m.x < -20) m.x = 1620; else if (m.x > 1620) m.x = -20;
          m.el.position.set(m.x, m.y, m.z);
          m.el.material.opacity = (0.12 + 0.28 * (Math.sin(m.ph * 1.3) + 1) / 2 + windy * 0.2) * (m.tmp ? Math.min(1, m.life) : 1);
        }
        if (CH.hero.attached) {
          rim.position.set(CH.hero.x, CH.hero.y - 30 * CH.hero.A.scale, 10); rim.visible = true;
          rimLight.position.set(CH.hero.x, CH.hero.y - 40, 220); rimLight.intensity = 7;
        } else { rim.visible = false; rimLight.intensity = 0; }
        tt += dt;
        let k = 0, gust = 0;
        if (br.t < 0) {
          br.next -= dt;
          if (br.next <= 0) { br.t = 0; planBreath(); api.sfx('breath', { inhale: br.inhale, hold: br.hold, exhale: br.exhale, level: br.level }); }
        } else {
          br.t += dt;
          const I = br.inhale, H = br.hold, E = br.exhale;
          if (br.t < I) { const u = br.t / I; k = u * u * (3 - 2 * u); }
          else if (br.t < I + H) k = 1 - 0.1 * ((br.t - I) / H);
          else { const u = Math.min(1, (br.t - I - H) / E); k = 0.9 * Math.pow(1 - u, 1.8); }
          const gStart = 0.6 * I, gPeak = I + H + 0.25 * E;
          let w = 0;
          if (br.t >= gStart && br.t < gPeak) { const u = (br.t - gStart) / (gPeak - gStart); w = u * u * (3 - 2 * u); }
          else if (br.t >= gPeak) { const u = Math.min(1, (br.t - gPeak) / (I + H + E - gPeak)); w = Math.pow(1 - u, 1.6); }
          gust = -w;
          breath.material.opacity = k * 0.05 * (br.level / 0.12) * 0.1;   // the veil is blended in linear light before the output curve, so a tenth of the reference opacity reads about the same; the gust itself is full strength
          if (br.t >= br.inhale + br.hold + br.exhale) { br.t = -1; breath.material.opacity = 0; k = 0; gust = 0; }
        }
        const strength = br.level / 0.13;
        ctl.gust = gust * strength;
        ctl.shake = k * strength;
        const sh = ctl.shake * 1.6;
        const jx = sh * (Math.sin(tt * 41) * 0.9 + Math.sin(tt * 67.3) * 0.6 + (Math.random() - 0.5) * 0.8);
        const jy = sh * (Math.sin(tt * 53.7) * 0.7 + Math.sin(tt * 29.1) * 0.5 + (Math.random() - 0.5) * 0.6);
        K.tr(L.far, { x: jx, y: jy }); K.tr(L.mid, { x: jx * 1.25, y: jy * 0.8 });
        ctl.loose.forEach((o) => {
          const fl = Math.sin(tt * o.f + o.ph) * 0.35 + Math.sin(tt * o.f * 1.73 + o.ph * 2.1) * 0.22;
          const g = ctl.gust * (0.75 + fl) + ctl.shake * fl * 0.25;
          K.tr(o.el, { r: g * o.amp, ox: o.ox, oy: o.oy, x: g * (o.xAmp || 0) });
        });
      });
      // the light in here: dim, blue, from nowhere in particular
      K.spot(L.lights, 800, -200, 200, 800, 800, -100, '#6fa8d8', 40, { angle: 75, penumbra: 0.9, decay: 1.3, shadow: false, dist: 2400 });
      return ctl;
    },

    /** stencil text, the way the plans are lettered */
    text(parent, x, y, str, size, op, z) {
      const l = K.label(str, { size: size || 17, color: INK, font: MONO, weight: 400, letterSpacing: 2, x, y: y - (size || 17) * 0.4, z: z != null ? z : 2, parent });
      l.material.opacity = op == null ? 0.85 : op;
      l.userData.noHit = true;
      return l;
    },

    /** a straight run of duct from x1 to x2 with its ceiling at `top`; the floor is FLOOR. A real tin tunnel. */
    tube(parent, x1, x2, top, o) {
      o = o || {};
      const g = K.g(parent);
      const metal = K.mat(METAL, { rough: 0.85, metal: 0.1 });
      const metalLit = K.mat(METAL_LIT, { rough: 0.55, metal: 0.4 });
      void metalLit;
      // the metal fill, hatched flanges above and below, their drawn edges, rivets, dashed joints — all on one sheet
      K.vplane(x1, x2, top, FLOORLINE, Z.fill, metal, g).receiveShadow = true;
      K.vplane(x1, x2, top - 24, top, Z.hatch, hatchMat(), g);
      K.vplane(x1, x2, FLOORLINE, FLOORLINE + 24, Z.hatch, hatchMat(), g);
      if (o.gap) {   // the top edge is interrupted where a chute opens into the duct
        inkLine(g, [[x1, top - 24, Z.ink], [o.gap[0], top - 24, Z.ink]], 0.9); inkLine(g, [[o.gap[1], top - 24, Z.ink], [x2, top - 24, Z.ink]], 0.9);
        inkLine(g, [[x1, top, Z.ink], [o.gap[0], top, Z.ink]], 0.9); inkLine(g, [[o.gap[1], top, Z.ink], [x2, top, Z.ink]], 0.9);
      } else {
        inkLine(g, [[x1, top - 24, Z.ink], [x2, top - 24, Z.ink]], 0.9); inkLine(g, [[x1, top, Z.ink], [x2, top, Z.ink]], 0.9);
      }
      inkLine(g, [[x1, FLOORLINE, Z.ink], [x2, FLOORLINE, Z.ink]], 0.9); inkLine(g, [[x1, FLOORLINE + 24, Z.ink], [x2, FLOORLINE + 24, Z.ink]], 0.9);
      for (let x = x1 + 24; x < x2 - 10; x += 48) {
        K.torus(x, top - 12, 3, 0.9, inkMat(0.8), g, { z: Z.ink });
        K.torus(x, FLOORLINE + 12, 3, 0.9, inkMat(0.8), g, { z: Z.ink });
      }
      const joint = o.joint || 320;
      for (let x = x1 + joint; x < x2 - 40; x += joint) {
        for (let y = top; y < FLOORLINE; y += 16) K.box(x - 0.8, y, 1.6, 7, 1.6, K.mat(INK_DIM, { emissive: INK_DIM, ei: 0.4, fog: false }), g, { z: Z.ink }).castShadow = false;
      }
      if (o.code) DUCT.text(g, (o.labelX != null ? o.labelX : x1 + 120), (o.labelY != null ? o.labelY : top - 36), CH.t('duct.lbl.duct') + ' ' + o.code, 17, 0.8, Z.front);
      if (o.dim) DUCT.dim(g, x1 + joint, x1 + joint * 2, top - 56, String(joint), Z.ink);
      return g;
    },

    /** a pinned sheet of the plans; paint(ctx, w, h) draws it (in stage-px scale) */
    sheet(parent, x, y, w, h, paint) {
      const g = K.g(parent, { z: Z.prop - 2 });
      const tex = K.canvasTex(Math.round(w * 1.5), Math.round(h * 1.5), (ctx) => {
        ctx.scale(1.5, 1.5);
        ctx.fillStyle = '#122a40'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
        ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.font = '12px ' + MONO; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (paint) paint(ctx, w, h);
      });
      const m = K.vplane(x, x + w, y, y + h, 0, new T.MeshStandardMaterial({ map: tex, roughness: 0.9, emissive: new T.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 0.35 }), g);
      m.scale.y = -1; m.userData.__disposeTex = tex;
      [[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + h - 6], [x + w - 6, y + h - 6]].forEach((p) => K.sphere(p[0], p[1], 3, K.mat(WARM, { emissive: WARM, ei: 0.6 }), g, { z: 3 }).castShadow = false);
      return g;
    },

    /** the plans of the house, pinned high on the wall: the house in section with the ducts running
        through it, a mark for where he is, and this stretch drawn out large in a callout. */
    plansheet(api, code, detail) {
      const at = { 'A-1': 132, 'B-2': 310, 'C-3': 420, 'D-4': 510 }[code] || 132;
      const g = DUCT.sheet(api.layers.mid, 640, 90, 880, 440, (ctx) => {
        const ink = (op, w) => { ctx.strokeStyle = 'rgba(143,211,255,' + (op == null ? 0.85 : op) + ')'; ctx.lineWidth = w || 1.6; };
        const path = (d) => { const p = new Path2D(d); ctx.stroke(p); };
        // the corner that came unpinned, a fold, a ring from a cup
        ink(0.9, 1.4); ctx.fillStyle = PAPER; ctx.beginPath(); ctx.moveTo(838, 0); ctx.lineTo(880, 42); ctx.lineTo(880, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ink(0.14, 1); path('M 0 228 L 880 216');
        ctx.strokeStyle = 'rgba(255,212,137,0.13)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(796, 386, 26, 0, 6.28); ctx.stroke();
        // the house in section
        ink(0.85, 2); path('M 40 172 L 310 58 L 580 172'); path('M 60 172 L 60 352 M 560 172 L 560 352');
        ink(0.85, 1.6); path('M 60 262 L 560 262 M 60 352 L 560 352');
        ink(0.55, 1.4); ctx.setLineDash([6, 6]); path('M 60 172 L 560 172'); ctx.setLineDash([]);   // the attic floor, at the eaves
        ink(0.55, 1.2); path('M 260 172 L 260 262 M 410 172 L 410 262'); path('M 190 262 L 190 352 M 320 262 L 320 352 M 450 262 L 450 352');
        ctx.fillStyle = 'rgba(143,211,255,0.18)'; ctx.fillRect(60, 352, 500, 16);
        ink(0.45, 1.2); path('M 60 368 L 60 410 L 560 410 L 560 368');
        ctx.setLineDash([5, 5]); path('M 60 368 L 560 368'); ctx.setLineDash([]);
        ink(0.55, 1); [[120, 216], [490, 216], [490, 306], [130, 306]].forEach((p) => ctx.strokeRect(p[0] - 10, p[1] - 14, 20, 28));
        ink(0.5, 1.2); ctx.strokeRect(360, 134, 30, 30);   // the attic window, clear of the attic-floor dashes
        // the ducts through it
        ink(0.9, 3); path('M 120 352 L 120 360 L 510 360 L 510 352');
        ink(0.5, 1.4); ctx.setLineDash([6, 6]); path('M 420 360 L 420 110'); ctx.setLineDash([]);
        ctx.fillStyle = PAPER; ink(1, 1.2); [120, 510].forEach((x) => { ctx.fillRect(x - 9, 345, 18, 8); ctx.strokeRect(x - 9, 345, 18, 8); });
        ctx.beginPath(); ctx.arc(310, 360, 8, 0, 6.28); ctx.fill(); ctx.stroke(); path('M 305 355 L 315 365 M 315 355 L 305 365');
        ctx.fillStyle = 'rgba(143,211,255,0.7)'; ctx.font = '11px ' + MONO;
        ctx.fillText(CH.t('duct.lbl.attic'), 265, 126); ctx.fillText(CH.t('duct.lbl.study'), 66, 282); ctx.fillText(CH.t('duct.lbl.hall'), 196, 282);
        ctx.fillText(CH.t('duct.lbl.living'), 326, 282); ctx.fillText(CH.t('duct.lbl.kitchen'), 456, 282); ctx.fillText(CH.t('duct.lbl.cellar'), 66, 402);
        // this stretch, drawn out large
        ink(0.8, 1.4); ctx.strokeRect(610, 30, 250, 210);
        ink(0.5, 1); ctx.setLineDash([4, 5]); path('M ' + at + ' 371 L ' + at + ' 424 L 596 424 L 596 240 L 610 240'); ctx.setLineDash([]);
        if (detail) detail(ctx, { x: 610, y: 30, w: 250, h: 210 });
      });
      // where he is: a live mark
      const mark = K.g(g, { z: 4 });
      K.torus(640 + at, 90 + 360, 11, 1.4, K.mat(WARM, { emissive: WARM, ei: 0.8, fog: false }), mark).castShadow = false;
      DUCT.text(mark, 640 + at + 30, 90 + 384, code, 12, 0.9, 1).material.color.set(WARM);
      let mt = U.rand(0, 9);
      api.tick((dt) => { mt += dt; mark.visible = ((Math.sin(mt * 2.6) + Math.sin(mt * 4.1) * 0.5) / 1.5 + 1) / 2 > 0.25; });
      K.pad(636, 86, 888, 448, g, { d: 30 });
      return g;
    },

    /** the duct hangs from the joists on threaded rods */
    hangers(api, o) {
      o = o || {};
      const g = K.g(api.layers.far, { z: Z.ink });
      // the joist they hang from, running the length of the frame
      K.box(-700, 14, 3000, 28, 6, K.mat(METAL, { rough: 0.7, metal: 0.3, emissive: METAL, ei: 0.2 }), g);
      if (o.gap) { inkLine(g, [[-700, 42, 4], [o.gap[0], 42, 4]], 0.5); inkLine(g, [[o.gap[1], 42, 4], [2300, 42, 4]], 0.5); }   // its edge line stops where a chute comes through it
      else inkLine(g, [[-700, 42, 4], [2300, 42, 4]], 0.5);
      [420, 560].forEach((x) => {
        K.cylUp(x, 576, 2.4, 540, K.mat(INK_DIM, { emissive: INK_DIM, ei: 0.3 }), g);   // the rod runs right down to the flange's drawn edge
        K.box(x - 14, 28, 28, 8, 8, K.mat(METAL, { rough: 0.6 }), g);
        K.torus(x, 46, 4, 1, inkMat(0.8), g);
        K.box(x - 12, 566, 24, 10, 10, K.mat(METAL, { rough: 0.6 }), g, { z: -6 });   // its foot plate sits behind the ink, so the edge line runs on unbroken
      });
      inkLine(g, [[380, 36], [380, 576]], 0.6); inkLine(g, [[373, 36], [387, 36]], 0.6); inkLine(g, [[373, 576], [387, 576]], 0.6);
      DUCT.text(g, 356, 312, '540', 12, 0.6);
      DUCT.dim(g, 420, 560, 74, '140');
      return g;
    },

    /** a grate in the duct's ceiling with the light of the room above falling through it */
    lightShaft(parent, x, w) {
      const g = K.g(parent);
      K.vplane(x, x + w, 578, 598, Z.prop, K.mat('#0a1420', { rough: 0.8 }), g);
      inkLine(g, [[x, 578, Z.prop + 2], [x + w, 578, Z.prop + 2], [x + w, 598, Z.prop + 2], [x, 598, Z.prop + 2], [x, 578, Z.prop + 2]], 0.8);
      for (let i = 1; i < 5; i++) K.box(x + (w / 5) * i - 2.5, 581, 5, 14, 3, K.mat(WARM, { emissive: WARM, ei: 0.9 }), g, { z: Z.prop + 2 }).castShadow = false;
      // the light through it, drawn the way the plans draw light: a cone that fades toward the floor
      fadeQuad(g, x + 4, x + w - 4, 598, x - 46, x + w + 46, FLOORLINE, WARM, 0.14, Z.prop + 3);
      K.spot(g, x + w / 2, 570, Z.front - 20, x + w / 2, 808, 12, WARM, 150, { angle: 24, penumbra: 0.5, decay: 1.3, dist: 700, mapSize: 1024 });   // the real light: down through his plane, so whatever rolls under it is lit
      K.glow(g, x + w / 2, 790, Z.front + 2, 130, WARM, 0.06);
      return g;
    },

    /** a dimension line with tick ends and a number */
    dim(parent, x1, x2, y, str, z) {
      const g = K.g(parent, { z: z || 0 });
      inkLine(g, [[x1, y], [x2, y]], 0.7); inkLine(g, [[x1, y - 7], [x1, y + 7]], 0.7); inkLine(g, [[x2, y - 7], [x2, y + 7]], 0.7);
      DUCT.text(g, (x1 + x2) / 2, y - 10, str, 13, 0.7);
      return g;
    },

    /** a grate in the back wall with light coming through from a room */
    grate(parent, x, y, w, h, o) {
      o = o || {};
      const g = K.g(parent);
      const gz = Z.prop;
      K.vplane(x, x + w, y, y + h, gz, K.mat('#0a1420', { rough: 0.8 }), g);
      inkLine(g, [[x, y, gz + 2], [x + w, y, gz + 2], [x + w, y + h, gz + 2], [x, y + h, gz + 2], [x, y, gz + 2]], 0.9);
      const n = o.slits || 5, sh = (h - 12) / n;
      for (let i = 0; i < n; i++) K.rbox(x + 8, y + 8 + i * sh, w - 16, sh - 5, 3, 1.5, K.mat(o.color || WARM, { emissive: o.color || WARM, ei: 0.8 }), g, { z: gz + 3 }).castShadow = false;
      K.glow(g, x + w / 2, y + h / 2, gz + 14, o.glow || 170, o.color || WARM, o.op || 0.16);
      K.point(g, x + w / 2, y + h / 2, gz + 180, o.color || WARM, o.light != null ? o.light : 8, 700);
      if (o.label) DUCT.text(g, x + w / 2, y - 12, o.label, 13, 0.7, gz + 4);
      return g;
    },

    /** navy fade for moving between duct scenes; fn does the scene change */
    async veil(fn) {
      const c = document.getElementById('curtain');
      c.classList.add('ducty');
      c.classList.add('show');
      await U.wait(520);
      await fn();
      setTimeout(() => c.classList.remove('ducty'), 800);
    },

    /** Blink the firefly — a small warm light with wings. Sits, follows the hero, or flies off. */
    blink(api, o) {
      o = o || {};
      const L = api.layers;
      const g = K.g(L.fx);
      const glow = K.glow(L.fx, 0, 0, 0, 62, WARM, 0.21);
      const light = K.point(L.lights, 0, 0, 40, WARM, 5, 500);
      const vis = CH.models.blink(g);   // the firefly herself, from the cast
      const pad = K.pad(-44, -44, 88, 88, g, { d: 40 });
      const B = {
        el: g, pad, x: 0, y: 0, z: 40, tx: 0, ty: 0, push: 0, mode: 'hidden', t: U.rand(0, 6), on: true, shown: false, s: 1, fade: 1,
        show(v) { B.shown = v; g.visible = v; glow.visible = v; light.intensity = v ? 5 : 0; },
        sit(x, y, z) { B.x = B.tx = x; B.y = B.ty = y; if (z != null) B.z = z; B.mode = 'sit'; pad.visible = false; B.show(true); },
        follow() { B.mode = 'follow'; B.z = 40; if (!B.shown) B.fresh = true; pad.visible = true; B.show(true); },   // she comes in behind him (placed on the first tick, once he stands at his spot)
        focus: null,   // a spot she prefers while the hero is near it: { x, y, r } — e.g. above Fluff, lighting him
        offset: { x: -66, y: -116 },   // a little off his shoulder, up and to the side
        async flyTo(x, y, dur, z) {   // z: where to end up in depth (her usual plane, 40, unless told otherwise)
          B.mode = 'fly';
          const x0 = B.x, y0 = B.y, z0 = B.z, z1 = z != null ? z : 40;
          await CH.tw.to({ t: 0 }, { t: 1 }, {
            dur: dur || 900, group: 'scene', ease: CH.tw.ease.sinInOut,
            onUpdate: (k, q) => { B.x = U.lerp(x0, x, q.t); B.y = U.lerp(y0, y, q.t) - Math.sin(q.t * Math.PI) * 30; B.z = U.lerp(z0, z1, q.t); },
          });
          B.x = x; B.y = y; B.z = z1;
        },
        async fadeOut(dur) {
          await CH.tw.to({ v: 1 }, { v: 0 }, {
            dur: dur || 700, group: 'scene',
            onUpdate: (k, q) => { B.fade = q.v; vis.setLit(q.v); },
          });
          B.show(false); B.fade = 1;
        },
        async vanish(dur) {   // away into the distance: glow and light go, and she dwindles to nothing — still lit, never a dark speck against the light
          await CH.tw.to({ v: 1 }, { v: 0 }, {
            dur: dur || 700, group: 'scene', ease: CH.tw.ease.quadIn,
            onUpdate: (k, q) => { B.fade = q.v; B.s = 0.1 + 0.9 * q.v; },
          });
          B.show(false); B.fade = 1; B.s = 1;
        },
        anchor: () => ({ x: B.x - 6, y: B.y - 62, z: B.z }),   // the tail just over her glow; the body hangs to her left (see dialog TAILS)
      };
      B.show(false);
      api.tick((dt) => {
        if (!B.shown) return;
        B.t += dt;
        if (B.mode === 'follow' && CH.hero.attached) {
          if (B.fresh) { B.fresh = false; B.x = CH.hero.x + (CH.hero.x < 800 ? -150 : 150); B.y = CH.hero.y - 100; }   // she trails in from the edge he came in by, never across the screen
          B.tx = CH.hero.x + B.offset.x * CH.hero.A.flip;
          B.ty = CH.hero.y + B.offset.y;
          if (B.focus && Math.abs(CH.hero.x - B.focus.x) < B.focus.r) { B.tx = B.focus.x; B.ty = B.focus.y; }   // near her focus she flies ahead and hangs there
          const k = Math.min(1, dt * 2.6);
          B.x += (B.tx - B.x) * k; B.y += (B.ty - B.y) * k;
        } else if (B.mode === 'sit') { B.x = B.tx; B.y = B.ty; }
        const bob = Math.sin(B.t * 3.1) * 4;
        const gu = api._duct ? api._duct.gust * (B.mode === 'sit' ? 0.28 : 1) : 0;   // stuck in the web she only sways a little
        B.push += ((gu * 170) - B.push) * Math.min(1, dt * 3.5);
        const eff = Math.min(1, Math.abs(gu) * 1.2);
        K.tr(g, { x: B.x + B.push, y: B.y + bob - eff * 6, z: B.z, r: -B.push * 0.18, s: B.s });
        const flap = Math.sin(B.t * (40 + eff * 55)) * (22 + eff * 10);
        vis.flap(flap);
        vis.face(CH.hero.attached && B.mode === 'follow' ? CH.hero.A.flip : 1);
        const cyc = B.t % 2.4;
        B.on = cyc < 1.5 || (cyc > 1.75 && cyc < 1.9);
        const lit = B.on ? 1 : 0.12;
        vis.setLit(lit);
        glow.position.set(B.x + B.push, B.y + bob + 4, B.z + 4); glow.material.opacity = 0.28 * lit * B.fade;
        light.position.set(B.x + B.push, B.y + bob, B.z + 20); light.intensity = 5 * lit * B.fade;
      });
      api.anchor('blink', B.anchor);
      return B;
    },

    /** the companion in a scene after the junction: follows if he is with the hero */
    companion(api, st) {
      const B = DUCT.blink(api);
      if (st.has('blinkFree') && !st.has('blinkGone')) B.follow();
      api.hot(B.pad, {
        id: 'v.blink', near: null,
        active: () => B.shown && B.mode === 'follow',
        act: async () => { await api.say('blink', st.bumpClick('v.blink') % 2 ? 'v.blink.idle1' : 'v.blink.idle2'); },
      });
      return B;
    },

    /** the pillow feather: a sliver of white with a quill and three barbs, its pad with it. The caller places it. */
    featherArt(parent, z) {
      const g = K.g(parent, { z: z != null ? z : FZ });
      const mat = K.mat('#f4f0e4', { rough: 0.9, side: 'double', emissive: '#f4f0e4', ei: 0.22 });
      const art = K.g(g); art.scale.setScalar(1.4);   // a sliver, but one you can see in the dark
      K.cut('M 0 26 C -9 14 -10 -4 4 -22 C 14 -6 10 14 0 26 Z', mat, art);
      K.tube([[0, 25, 0.5], [2, 0, 0.5], [4, -20, 0.5]], 0.8, K.mat('#b8b2a2', { rough: 0.9 }), art, { seg: 6, radial: 4 });
      [[-10, -5], [-2, 4], [6, 12]].forEach((p) => K.tube([[2, p[0], 0.6], [-4, p[1], 0.6]], 0.5, K.mat('#c9c3b4', { rough: 0.9 }), art, { seg: 3, radial: 4 }));
      K.pad(-38, -36, 76, 76, g, { d: 60, z: 10 });   // its pad reaches forward of the fan's, so a click on the feather is a click on the feather
      g.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });   // a flat sliver: shadows on it only flicker as the camera moves
      return g;
    },

    /** the draught takes a loose feather: it lifts, tumbles and sways, and is gone left out of the frame */
    async featherAway(g, x0, y0, r0, z) {
      await CH.tw.to({ t: 0 }, { t: 1 }, {
        dur: 1900, group: 'scene', ease: CH.tw.ease.linear,
        onUpdate: (k, o) => {
          const t = o.t;
          const x = U.lerp(x0, -200, t) + Math.sin(t * 9.5) * 26;
          const y = U.clamp(y0 - Math.sin(Math.min(1, t * 1.6) * Math.PI / 2) * 110 + Math.sin(t * 15) * 16 * t, 616, 812);   // never above the duct's ceiling or into its floor
          K.tr(g, { x, y, z, r: r0 + t * 1000 + Math.sin(t * 12) * 40 });
        },
      });
      if (g.parent) g.parent.remove(g);
    },

    /** the draught brings a feather in from off the right edge and lays it down at (x1, y1) with the quill at r1 */
    async featherIn(g, x0, y0, x1, y1, r1, z) {
      g.visible = true;
      await CH.tw.to({ t: 0 }, { t: 1 }, {
        dur: 2400, group: 'scene', ease: CH.tw.ease.linear,
        onUpdate: (k, o) => {
          const t = o.t, e = 1 - Math.pow(1 - t, 2);   // it comes in fast and settles
          const x = U.lerp(x0, x1, e) + Math.sin(t * 9) * 22 * (1 - t);
          const y = U.clamp(U.lerp(y0, y1, Math.pow(t, 1.6)) + Math.sin(t * 13) * 20 * (1 - t), 616, 812);   // within the duct
          K.tr(g, { x, y, z, r: r1 - 900 * (1 - t) + Math.sin(t * 12) * 40 * (1 - t) });
        },
      });
      K.tr(g, { x: x1, y: y1, z, r: r1 });
    },

    /** a doorway pad at a duct end: the whole opening is the exit */
    exit(api, side, id, plat, go) {
      const x = side === 'right' ? 1440 : 100;
      const mark = CH.props.exitMark(api, side === 'right' ? 1500 : 160, 700, side, 40, { margin: 44, pad: true });   // the pad rides with the arrow
      const pad = mark.pad;
      mark.traverse((o) => { o.renderOrder = 9; });   // above the sheet of night in C
      api.hot(pad, {
        id, near: { x: side === 'right' ? 1436 : 234, plat },
        act: async () => { await DUCT.veil(go); },
      });
      return pad;
    },
  };

  // ============================================================ A — the junction
  CH.defScene('ductA', {
    chapter: 2,
    duct: true,
    bloom: 0.25, bloomThreshold: 1.15,
    pageBg: PAPER,
    bg: PAPER,
    fogColor: PAPER, fogNear: 20, fogFar: 44,
    heroScale: 1.15,
    ambient: [],
    fill: 0.9, ambient2: 0.4, skyLight: '#3a6a9a', groundLight: '#0a1420',
    camera: { x: 800, y: 420, z: 1590, tx: 800, ty: 500, follow: 0.1, parallax: 0, flat: true },   // a drawing: no play of viewpoint
    platforms: [
      { id: 'left', x1: 200, x2: 1470, y: FLOOR },
    ],
    links: [],
    spots: {
      fromStudy: { x: 300, plat: 'left' },
      fromB: { x: 1400, plat: 'left' },
    },

    build(api) {
      const st = api.state;
      const L = api.layers;
      const fx = DUCT.apply(api);

      // the chute's lines: it runs at one slant from the joist at the top of the frame (y 42) down to the tube's top edge (y 600)
      const CT = 42, CK = (218 - 40) / (600 - 120);   // top y, and the slant (x per y)
      const cx = (x600, y) => x600 - (600 - y) * CK;  // x of a wall line at y, given its x at the mouth
      const iL = cx(218, CT), iR = cx(348, CT), oL = cx(194, CT), oR = cx(372, CT);
      DUCT.tube(L.far, -700, 2300, 600, { code: 'A-1', labelX: 268, labelY: 556, gap: [218, 348] });   // the chute's mouth opens into the duct: no edge line across it; the duct's code sits inside the chute, down by the mouth
      DUCT.hangers(api, { gap: [oL, oR] });   // the joist's edge line stops where the chute comes down through it
      DUCT.lightShaft(L.far, 664, 84);
      // the feather: blown here from B it lies in the pool of light under the ceiling grate, and here it stays.
      // If it still lies by the fan in B when he comes back here, the next gust here brings it in from the right and drops it in that light.
      if (!st.has('featherTaken') && (st.has('featherBlown') || st.has('fanJammed'))) {
        const fG = DUCT.featherArt(L.mid, FZ);
        let ft = 0, fState = st.has('featherBlown') ? 'lying' : 'away';
        const lie = () => { fState = 'lying'; fG.visible = true; K.tr(fG, { x: 706, y: 808, z: FZ, r: 84 }); };   // flat on the drawn floor line
        if (fState === 'lying') lie(); else fG.visible = false;
        api.tick((dt) => {
          if (!fG.parent) return;
          ft += dt;
          if (fState === 'away' && fx.gust < -0.35) {   // here comes the draught, and the feather with it
            fState = 'flying';
            DUCT.featherIn(fG, 1760, 700, 706, 808, 84, FZ).then(async () => {
              st.flag('featherBlown'); lie();
              if (CH.hero.attached && !CH.engine.locked && !CH.dialog.isOpen()) await api.think('v.a.feather.in');
            });
            return;
          }
          if (fState !== 'lying') return;
          const g = fx.gust * 0.45; K.tr(fG, { x: 706 + g * 4, y: 808 - Math.max(0, -g) * 2, z: FZ, r: 84 + g * 7 + Math.sin(ft * 2.1) * 0.8 });   // it only stirs a little here
        });
        api.hot(fG, {
          id: 'v.feather',
          near: { x: 660, plat: 'left' },
          active: () => !!fG.parent && fState === 'lying',
          act: async () => {
            await api.cut(async (ctx) => {
              api.hero.face(1);
              await ctx.run(api.hero.tailWhip(706, 786));
              ctx.sfx('paper');
              L.mid.remove(fG);
              st.flag('featherTaken');
              st.give('feather');
            }, { cinema: false, skippable: false });
            await api.think('v.a.feather.take');
          },
        });
      }
      // the chute he arrives by (top left, coming down at a slant)
      // a chute wide enough for him, standing in the duct's own depth so he really slides down it
      const chute = K.g(L.mid, { z: Z.ink + 2 });   // drawn at the tube's own ink depth: its feet land on the tube's top edge, not a pixel below it
      // it comes down through the joist at the top of the frame: its top end is cut at the joist's edge (the top edge of the view is at y≈30 here)
      K.ext(`M ${iL} ${CT} L ${iR} ${CT} L 348 600 L 218 600 Z`, 4, K.mat('#0a1420', { rough: 0.9 }), chute, { bevel: 0 });                                 // the open channel — dark, we look into it, down into the duct
      K.ext(`M ${oL} ${CT} L ${iL} ${CT} L 218 600 L 194 600 Z`, 4, K.mat(METAL, { rough: 0.85, metal: 0.1, emissive: METAL, ei: 0.3 }), chute, { bevel: 0, z: 2 });   // its solid walls
      K.ext(`M ${iR} ${CT} L ${oR} ${CT} L 372 600 L 348 600 Z`, 4, K.mat(METAL, { rough: 0.85, metal: 0.1, emissive: METAL, ei: 0.3 }), chute, { bevel: 0, z: 2 });
      inkLine(chute, [[iL, CT, 5], [218, 600, 5]], 0.9); inkLine(chute, [[iR, CT, 5], [348, 600, 5]], 0.9);   // the channel's inner edges — open at both ends
      inkLine(chute, [[oL, CT, 5], [194, 600, 5]], 0.7); inkLine(chute, [[oR, CT, 5], [372, 600, 5]], 0.7);   // the walls' outer edges
      inkLine(chute, [[oL, CT, 5], [iL, CT, 5]], 0.7); inkLine(chute, [[iR, CT, 5], [oR, CT, 5]], 0.7);      // and the walls' end caps, top…
      inkLine(chute, [[194, 600, 5], [218, 600, 5]], 0.7); inkLine(chute, [[348, 600, 5], [372, 600, 5]], 0.7);      // …and bottom, lying on the tube's top edge (only the walls are capped; the channel stays open)
      {   // both open ends of the channel are section cuts: the same dashed line as the tube's joints, run across
        const dashMat = K.mat(INK_DIM, { emissive: INK_DIM, ei: 0.4, fog: false });
        const across = (x1, x2, y) => { for (let x = x1; x < x2; x += 16) K.box(x, y - 0.8, Math.min(7, x2 - x), 1.6, 1.6, dashMat, chute, { z: 5 }).castShadow = false; };
        across(iL, iR, CT); across(218, 348, 600);
      }
      DUCT.text(chute, (cx(218, 80) + cx(348, 80)) / 2, 80, CH.t('duct.lbl.study') + ' ↑', 13, 0.7, 8);   // inside the chute, up by its top end

      // the shaft down to the cellar, in the back wall
      const downG = K.g(L.mid, { z: Z.prop });
      K.vplane(400, 512, 626, FLOORLINE - 3, 0, K.mat('#040910', { rough: 1 }), downG);
      inkLine(downG, [[400, 626, 2], [512, 626, 2], [512, FLOORLINE - 3, 2], [400, FLOORLINE - 3, 2], [400, 626, 2]], 0.9);
      inkLine(downG, [[400, 626, 2], [512, FLOORLINE - 3, 2]], 0.35); inkLine(downG, [[512, 626, 2], [400, FLOORLINE - 3, 2]], 0.35);
      DUCT.text(downG, 456, 614, CH.t('duct.lbl.cellar') + ' ↓', 13, 0.75, 6);
      K.pad(400, 626, 112, 202, downG, { d: 30, z: 4 });
      api.hot(downG, {
        id: 'v.down',
        near: { x: 456, plat: 'left' },
        act: async () => {
          const n = st.bumpClick('v.down');
          await api.cut(async (ctx) => {
            api.hero.face(1);
            await ctx.run(api.hero.squint());
            await ctx.w(500);
            await ctx.run(api.hero.unsquint());
          }, { cinema: false, skippable: false });
          await api.think(n === 1 ? 'v.a.down1' : 'v.a.down2');
        },
      });

      // the plans of the house, pinned high on the wall
      const planG = DUCT.plansheet(api, 'A-1', (ctx, b) => {
        const ink = (op, w) => { ctx.strokeStyle = 'rgba(143,211,255,' + op + ')'; ctx.lineWidth = w; };
        ink(0.9, 2); ctx.stroke(new Path2D('M 650 212 L 650 122 L 740 122 L 740 92 L 822 92 M 740 122 L 740 174 L 698 174 M 650 212 L 822 212'));
        ctx.fillStyle = PAPER; ink(0.9, 1.6); ctx.beginPath(); ctx.arc(740, 122, 9, 0, 6.28); ctx.fill(); ctx.stroke();
        ctx.stroke(new Path2D('M 734 116 L 746 128 M 746 116 L 734 128'));
        ctx.fillStyle = 'rgba(143,211,255,0.85)'; ctx.font = '12px ' + MONO;
        ctx.fillText(CH.t('duct.lbl.hall') + ' ?', 752, 92); ctx.fillText(CH.t('duct.lbl.hall') + ' ↓', 656, 232); ctx.fillText(CH.t('duct.lbl.fan'), 752, 140); ctx.fillText('A-1', 660, 112);
      });
      fx.loose.push({ el: planG, ox: 646, oy: 96, amp: 0.45, f: 7.5, ph: 2 });
      api.hot(planG, {
        id: 'v.plan',
        near: { x: 1000, plat: 'left' },
        act: async () => {
          const n = st.bumpClick('v.plan');
          api.hero.face(1);
          await api.think(n === 1 ? 'v.a.plan1' : n === 2 ? 'v.a.plan2' : 'v.a.plan3');
        },
      });

      // the grate over the kitchen: warm light up through the floor of the duct
      const kg = DUCT.grate(L.mid, 900, 738, 120, 84, { label: CH.t('duct.lbl.kitchen'), light: 8 });
      K.pad(890, 716, 140, 116, kg, { d: 60, z: Z.front });
      api.hot(kg, {
        id: 'v.kgrate',
        near: { x: 1078, plat: 'left' },
        act: async () => {
          const n = st.bumpClick('v.kgrate');
          await api.cut(async (ctx) => {
            api.hero.face(-1);
            await ctx.run(api.hero.squint());
            await ctx.w(600);
            await ctx.run(api.hero.unsquint());
          }, { cinema: false, skippable: false });
          await api.think(n === 1 ? 'v.a.kgrate1' : 'v.a.kgrate2');
        },
      });

      // the dust drift: everything the house ever lost, and a hairpin in it
      const dustG = K.g(L.main, { z: -60 });
      const FOOT = FLOORLINE - 18;   // its foot lands on the drawn floor line: the bevel adds ~6, and standing 40 nearer the camera than the sheet it projects ~5 lower
      const drift = K.ext(K.blobShape([[1150, FOOT], [1180, 758], [1230, 744], [1290, 756], [1320, FOOT]]), 14, K.mat('#4a5a70', { rough: 1, opacity: 0.9 }), dustG, { bevel: 6, seg: 12 });
      for (let i = 0; i < 10; i++) K.sphere(1165 + U.rand(0, 140), 754 + U.rand(0, 36), U.rand(6, 11), K.mat('#5b6b80', { rough: 1, flat: true }), dustG, { z: U.rand(4, 10), seg: 7 });
      const driftHatch = K.ext(K.blobShape([[1150, FOOT], [1180, 758], [1230, 744], [1290, 756], [1320, FOOT]]), 16, hatchMat(), dustG, { bevel: 6, seg: 12 });
      driftHatch.material = driftHatch.material.clone(); driftHatch.material.transparent = true; driftHatch.material.opacity = 0.45;
      const pinGlint = K.torus(1250, 757, 9, 2.4, K.mat(WARM, { emissive: WARM, ei: 0.9 }), dustG, { z: 14, arc: Math.PI, r: 180 });
      pinGlint.castShadow = false;
      K.pad(1140, 720, 190, 86, dustG, { d: 100 });
      if (st.has('hairpinTaken')) dustG.remove(pinGlint);
      let dtt = U.rand(0, 9);
      api.tick((dt) => {
        dtt += dt;
        const g = fx.gust;
        // like the drawing: the foot of the drift stays put, the crest (56 px up) leans downwind — the gust is
        // negative, back down the duct — and flattens a little, with its own flutter
        const fl = Math.sin(dtt * 7 + 3.8) * 0.4 + Math.sin(dtt * 11.3 + 2) * 0.25;
        const lean = (g * 16 * (1 + fl) + fx.shake * fl * 3) / 56;
        const squash = 1 - (Math.abs(g) * 4 - g * fl * 3) / 56;
        // x' = x + lean * (FOOT - y); y' = FOOT + (y - FOOT) * squash  (local y grows downward, like the sheet)
        dustG.matrix.set(1, -lean, 0, lean * FOOT, 0, squash, 0, FOOT * (1 - squash), 0, 0, 1, -60, 0, 0, 0, 1);
        dustG.matrixWorldNeedsUpdate = true;
        if (Math.abs(g) > 0.3 && Math.random() < dt * 7) fx.spawn(1200 + U.rand(0, 90), 745 + U.rand(0, 18));
      });
      api.hot(dustG, {
        id: 'v.dust',
        near: { x: 1110, plat: 'left' },
        act: async () => {
          if (st.has('hairpinTaken')) { await api.think('v.a.dust3'); return; }
          await api.cut(async (ctx) => {
            api.hero.face(1);
            await ctx.think('v.a.dust1');
            await ctx.run(api.hero.tailWhip(1200, 770));
            ctx.sfx('rustle');
            CH.props.dust(api, 1210, 770, 10);
            await ctx.w(250);
            await ctx.run(api.hero.tailWhip(1250, 764));
            CH.props.dust(api, 1250, 766, 8);
            ctx.sfx('coin');
            dustG.remove(pinGlint);
            st.flag('hairpinTaken');
            st.give('hairpin');
          }, { cinema: false, skippable: false });
          await api.think('v.a.dust2');
        },
      });

      // an old web in the top corner, and something blinking in it
      const webG = K.g(L.mid, { z: Z.ink + 2 });
      const webMat = new T.LineBasicMaterial({ color: new T.Color('#c9d8e6'), transparent: true, opacity: 0.55 });
      const seg = (pts) => { const gg = new T.BufferGeometry().setFromPoints(pts.map((p) => new T.Vector3(p[0], p[1], 0))); const l = new T.Line(gg, webMat); l.userData.noHit = true; webG.add(l); return l; };
      const webLines = [seg([[1560, 600], [1330, 600]]), seg([[1560, 600], [1360, 640]]), seg([[1560, 600], [1420, 700]]), seg([[1560, 600], [1500, 730]]),
        seg([[1370, 606], [1385, 636], [1436, 682], [1508, 712]]), seg([[1400, 604], [1410, 626], [1452, 660], [1522, 690]])];
      K.pad(1320, 590, 240, 150, webG, { d: 30 });
      {   // the web is silk, not a sheet of tin: each strand's points sway with the gust in proportion to their distance from the corner it hangs from
        const base = webLines.map((l) => l.geometry.attributes.position.array.slice());
        let wt = U.rand(0, 6);
        api.tick((dt) => {
          wt += dt;
          const g = fx.gust, sh = fx.shake || 0;
          webLines.forEach((l, li) => {
            const pos = l.geometry.attributes.position, b = base[li];
            for (let i = 0; i < pos.count; i++) {
              const bx = b[i * 3], by = b[i * 3 + 1], d = Math.hypot(bx - 1560, by - 600) / 240;
              const sway = g * 26 * d + Math.sin(wt * 3.1 + bx * 0.02 + li) * (1.6 + sh * 2) * d;
              pos.setXY(i, bx + sway, by + Math.sin(wt * 2.3 + by * 0.03 + li * 1.7) * 1.2 * d - Math.abs(g) * 5 * d * d);
            }
            pos.needsUpdate = true;
          });
        });
      }
      const blink = DUCT.blink(api);
      if (!st.has('blinkFree')) blink.sit(1418, 662, Z.ink + 6);
      else if (!st.has('blinkGone')) blink.follow();
      if (st.has('blinkFree')) webMat.opacity = 0.2;
      api.hot(webG, {
        id: 'v.web',
        near: { x: 1300, plat: 'left' },   // a step short of the web: from here his bubble cannot reach her
        active: () => !st.has('blinkFree'),
        act: async () => {
          await api.cut(async (ctx) => {
            api.hero.face(1);
            await ctx.think('v.a.web1', { tail: 'right' });   // the web is up to his right: the bubble hangs left, off it and off her
            await ctx.run(api.hero.rollTo(1380, () => true));
            await ctx.run(api.hero.tailWhip(1420, 690));
            ctx.sfx('paper');
            await ctx.tw({ v: 0.55 }, { v: 0.2 }, { dur: 400, onUpdate: (k, o) => { webMat.opacity = o.v; } });
            await ctx.run(blink.flyTo(1400, 720, 500));
            await ctx.run(blink.flyTo(CH.hero.x - 110, CH.hero.y - 54, 700));   // she hovers at his left shoulder, below the height his bubbles take
            await ctx.say('blink', 'v.a.blink.free1');
            await ctx.think('v.a.hero.free1');
            await ctx.say('blink', 'v.a.blink.free2');
            await ctx.think('v.a.hero.free2');
          }, { cinema: false, skippable: false });
          st.flag('blinkFree');
          blink.follow();
          api.toast('v.a.blink.toast');
        },
      });
      api.hot(blink.pad, {
        id: 'v.blink', near: null,
        active: () => st.has('blinkFree') && blink.mode === 'follow',
        act: async () => { await api.say('blink', st.bumpClick('v.blink') % 2 ? 'v.blink.idle1' : 'v.blink.idle2'); },
      });
      void webLines;

      // the way on sits below the web, by the floor
      const exitMark = CH.props.exitMark(api, 1520, 700, 'right', 40, { margin: 44, pad: true });   // the pad rides with the arrow: the web beside it is never part of the exit
      const exitPad = exitMark.pad;
      api.hot(exitPad, {
        id: 'v.toB',
        near: { x: 1460, plat: 'left' },
        act: async () => {
          if (!st.has('ductAExit')) { st.flag('ductAExit'); await api.think('v.a.exit'); }
          await DUCT.veil(() => api.go('ductB', 'fromA'));
        },
      });
    },

    enter(api, spot) {
      const st = api.state;
      if (st.has('ductFirst')) return;
      st.flag('ductFirst');
      api.cut(async (ctx) => {
        const h = api.hero;
        h.place(38, -60, 'left');   // out of sight above the frame, in the chute's line
        h.face(1);
        const card = document.getElementById('chapter-card');
        let guard = 0;
        while (card && card.classList.contains('show') && guard++ < 120) await ctx.w(100);
        await ctx.w(500);
        ctx.sfx('slide', false);
        await ctx.tw({ t: 0 }, { t: 1 }, {
          dur: 1600, ease: CH.tw.ease.quadIn,
          onUpdate: (k, o) => { h.place(U.lerp(38, 323, o.t), U.lerp(-60, 700, o.t), 'left'); h.A.rock = o.t * 900; },   // down the chute's centre line, from above the frame to the mouth
        });
        ctx.sfx('metal', 0.5);
        api.cam.bump(0.8);
        await ctx.run(h.hopTo(345, FLOOR, { h: 30, dur: 260 }));
        h.A.rock = 0;
        await ctx.run(h.dizzy(700));
        await ctx.think('v.a.first1');
        await ctx.run(h.lookAround());
        await ctx.think('v.a.first2');
      }, { cinema: false }).then(() => {
        const h = api.hero;
        h.A.rock = 0; h.A.sx = 1; h.A.sy = 1;
        if (h.y !== FLOOR) h.place(345, FLOOR, 'left');
        api.toast('v.goal1');
      });
    },
  });

  // ============================================================ B — the fan
  CH.defScene('ductB', {
    chapter: 2,
    duct: true,
    bloom: 0.25, bloomThreshold: 1.15,
    pageBg: PAPER,
    bg: PAPER,
    fogColor: PAPER, fogNear: 20, fogFar: 44,
    heroScale: 1.15,
    ambient: [],
    fill: 0.9, ambient2: 0.4, skyLight: '#3a6a9a', groundLight: '#0a1420',
    camera: { x: 800, y: 420, z: 1590, tx: 800, ty: 500, follow: 0.1, parallax: 0, flat: true },   // a drawing: no play of viewpoint
    platforms: [
      { id: 'left', x1: 200, x2: 690, y: FLOOR },
      { id: 'right', x1: 910, x2: 1470, y: FLOOR },
    ],
    links: [
      { a: 'left', b: 'right', ax: 690, bx: 910, type: 'custom', run: () => CH.scenes.ductB._cross() },
    ],
    spots: {
      fromA: { x: 260, plat: 'left' },
      fromC: { x: 1400, plat: 'right' },
    },

    build(api) {
      const st = api.state;
      const L = api.layers;
      const fx = DUCT.apply(api);
      DUCT.tube(L.far, -700, 2300, 600, { code: 'B-2', labelX: 220 });

      // the wheel, set in a ring in the duct
      const bulk = K.g(L.mid, { z: Z.prop });
      // a bulkhead fills the duct's section exactly; the wheel sits in its round cut-out
      const bulkhead = K.rectShape(690, 600, 220, FLOORLINE - 3 - 600, 0);   // down to the floor line, not onto it
      bulkhead.holes.push(new T.Path().absarc(800, 709, 109, 0, Math.PI * 2, false));
      const plate = K.cut(bulkhead, hatchMat(), bulk, { z: 0 });
      plate.material.transparent = true; plate.material.opacity = 0.92;
      inkLine(bulk, [[690, 600, 2], [910, 600, 2], [910, FLOORLINE - 3, 2], [690, FLOORLINE - 3, 2], [690, 600, 2]], 0.8);
      K.torus(800, 709, 108, 1.4, inkMat(0.8), bulk, { z: 3 });
      K.torus(800, 709, 104, 5, K.mat('#0a1626', { rough: 0.5, metal: 0.5 }), bulk, { z: 2 });
      K.disc(800, 709, 101, 2, K.mat('#040a12', { rough: 1 }), bulk, { z: 1 });
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + Math.PI / 8;
        K.torus(800 + Math.cos(a) * 105, 709 + Math.sin(a) * 105, 3.4, 0.9, inkMat(0.9), bulk, { z: 8 });
      }
      inkLine(bulk, (() => { const p = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; p.push([800 + Math.cos(a) * 107, 709 + Math.sin(a) * 107, 9]); } return p; })(), 0.8);
      DUCT.hangers(api);
      DUCT.plansheet(api, 'B-2', (ctx) => {
        const ink = (op, w) => { ctx.strokeStyle = 'rgba(143,211,255,' + op + ')'; ctx.lineWidth = w; };
        ink(0.85, 1.8); ctx.strokeRect(630, 100, 210, 70);
        ctx.fillStyle = 'rgba(143,211,255,0.25)'; ctx.fillRect(630, 90, 210, 10); ctx.fillRect(630, 170, 210, 10);
        ink(0.85, 1.8); ctx.beginPath(); ctx.ellipse(735, 135, 9, 32, 0, 0, 6.28); ctx.stroke(); ctx.fillStyle = 'rgba(143,211,255,0.8)'; ctx.beginPath(); ctx.arc(735, 135, 4, 0, 6.28); ctx.fill();
        ink(0.8, 1.4); [118, 135, 152].forEach((y) => { ctx.stroke(new Path2D('M 820 ' + y + ' L 760 ' + y + ' M 760 ' + y + ' L 768 ' + (y - 5) + ' M 760 ' + y + ' L 768 ' + (y + 5))); ctx.stroke(new Path2D('M 710 ' + y + ' L 650 ' + y + ' M 650 ' + y + ' L 658 ' + (y - 5) + ' M 650 ' + y + ' L 658 ' + (y + 5))); });
        ctx.fillStyle = 'rgba(143,211,255,0.75)'; ctx.font = '12px ' + MONO; ctx.fillText('Ø 200', 744, 76); ctx.fillText('440', 720, 200); ctx.fillText('4 ×', 660, 226);
      });
      const fanG = K.g(L.mid, { x: 800, y: 709, z: Z.prop + 6 });
      const blades = K.g(fanG);
      for (let i = 0; i < 4; i++) {
        K.ext('M 0 -14 C 30 -70 70 -96 96 -70 C 72 -28 34 -8 0 14 Z', 6, K.mat('#1b3350', { rough: 0.5, metal: 0.4, emissive: '#1b3350', ei: 0.2 }), blades, { r: i * 90, bevel: 1.5 });
        inkLine(blades, K.pathPoints('M 0 -14 C 30 -70 70 -96 96 -70 C 72 -28 34 -8 0 14 Z', 24).map((p) => [p[0], p[1], 4]), 0.8).rotation.z = i * Math.PI / 2 * (-1);
      }
      blades.children.filter((c) => c.isLine).forEach((l, i) => { l.rotation.z = 0; l.matrixAutoUpdate = true; K.tr(l, { r: i * 90 }); });
      K.disc(0, 0, 18, 10, K.mat('#122236', { rough: 0.5, metal: 0.5 }), fanG, { z: 6 });
      K.torus(0, 0, 18, 1.4, inkMat(0.8), fanG, { z: 12 });
      K.disc(0, 0, 6, 12, inkMat(0.8), fanG, { z: 8 });
      K.pad(-112, -112, 224, 224, fanG, { d: 60 });
      DUCT.text(L.mid, 800, 566, CH.t('duct.lbl.fan') + ' Ø 200', 13, 0.75, WALL + 30);
      // the hairpin, once it is in the works
      const pinG = K.g(L.mid, { x: 858, y: 646, z: Z.prop + 14, r: 40 });
      K.tube([[0, 0, 0], [0, -34, 0], [4, -42, 0], [12, -42, 0], [16, -34, 0], [16, -6, 0]], 1.8, K.mat(WARM, { emissive: WARM, ei: 0.5 }), pinG, { seg: 20, radial: 6 });
      pinG.visible = st.has('fanJammed');

      let angle = 0, speed = st.has('fanJammed') ? 0 : 150, wob = 0, jammed = st.has('fanJammed');
      fx.wind = jammed ? 0 : -90;
      api.tick((dt) => {
        if (!jammed) speed = 150 * (1 + Math.abs(fx.gust) * 1.6);
        angle += speed * dt;
        if (speed === 0 && wob > 0) { wob -= dt; angle += Math.sin(wob * 40) * 2 * wob; }
        K.tr(blades, { r: angle, s: 0.8 });
      });
      let gust = 0;
      api.tick((dt) => {
        if (speed === 0 || !CH.hero.attached) return;
        gust += dt;
        if (CH.hero.x > 480 && CH.hero.plat === 'left') CH.hero.A.rock = Math.sin(gust * 22) * 3;
      });

      // the feather: caught in the wheel, set free when the wheel stops
      // it is in the wheel until the wheel stops; then on the floor, if the air is still — but any gust takes it away left,
      // back down the duct to the junction, where it fetches up in the light under the ceiling grate (see A)
      const featherG = DUCT.featherArt(L.mid, FZ);
      let featherState = (st.has('featherTaken') || st.has('featherBlown')) ? 'gone' : (st.has('fanJammed') ? 'down' : 'inFan');
      if (featherState === 'gone') L.mid.remove(featherG);
      else K.tr(featherG, featherState === 'down' ? { x: 600, y: 776, z: FZ, r: 70 } : { x: 748, y: 630, z: FZ, r: -30 });
      let ft = 0, blownNow = false;
      const blowAway = async (x0, y0, r0) => {
        featherState = 'flying';
        api.sfx('paper');
        await DUCT.featherAway(featherG, x0, y0, r0, FZ);
        st.flag('featherBlown');
        featherState = 'gone';
      };
      api.tick((dt) => {
        if (!featherG.parent) return;
        ft += dt;
        if (featherState === 'inFan') { K.tr(featherG, { x: 748, y: 630, z: FZ, r: -30 + Math.sin(ft * 18) * 14 }); return; }
        if (featherState !== 'down') return;
        if (fx.gust < -0.3) {   // the next gust lifts it off the floor and it is gone
          blowAway(600, 776, 70).then(async () => {
            if (CH.hero.attached && !CH.engine.locked && !CH.dialog.isOpen()) { await api.think('v.b.feather.blown'); api.toast('v.b.feather.blown.toast'); }
          });
          return;
        }
        const g = fx.gust * (0.8 + Math.sin(ft * 7.3) * 0.3);
        K.tr(featherG, { x: 600 + g * 6, y: 776 - Math.max(0, -g) * 5, z: FZ, r: 70 + g * 16 });
      });

      const jam = async () => {
        await api.cut(async (ctx) => {
          api.hero.face(1);
          await ctx.run(api.hero.tailWhip(690, 690));
          ctx.sfx('metal', 0.6);
          pinG.visible = true;
          jammed = true; speed = 0; wob = 1.2;
          fx.wind = 0;
          await ctx.w(500);
          ctx.sfx('metal', 0.35);
          await ctx.w(300);
          ctx.sfx('paper');
          if (fx.gust < -0.2) {   // a gust is blowing this very moment: the wind has it before it ever reaches the floor
            blownNow = true;
            await ctx.run(blowAway(748, 630, -30));
          } else {
            featherState = 'falling';
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 1400, ease: CH.tw.ease.sinInOut,
              onUpdate: (k, o) => K.tr(featherG, { x: U.lerp(748, 600, o.t) + Math.sin(o.t * 9) * 26, y: U.lerp(630, 776, o.t), z: FZ, r: -30 + Math.sin(o.t * 9) * 40 + o.t * 100 }),
            });
            featherState = 'down';
          }
        }, { cinema: false, skippable: false });
        st.take('hairpin');
        st.flag('fanJammed');
        await api.think('v.b.fan.jammed');
        api.toast('v.b.fan.toast');
        if (blownNow) { blownNow = false; await api.think('v.b.feather.blown'); api.toast('v.b.feather.blown.toast'); }
      };

      api.hot(fanG, {
        id: 'v.fan',
        near: { x: 640, plat: 'left' },
        act: async () => {
          api.hero.face(CH.hero.x < 800 ? 1 : -1);
          if (st.has('fanJammed')) { await api.think('v.b.fan.done'); return; }
          const n = st.bumpClick('v.fan');
          await api.think(n === 1 ? 'v.b.fan.look' : 'v.b.fan.look2');
          if (n >= 2) api.toast('v.b.draft.toast');
        },
        item: { hairpin: jam },
      });
      api.hot(featherG, {
        id: 'v.feather',
        near: { x: 640, plat: 'left' },
        active: () => !!featherG.parent,
        act: async () => {
          if (!st.has('fanJammed')) { await api.think('v.b.feather.look'); return; }
          if (featherState !== 'down') { if (!CH.dialog.isOpen()) await api.think('v.b.feather.gone'); return; }   // the wind was quicker than he was
          featherState = 'taking';   // in hand before the next gust can have it
          await api.cut(async (ctx) => {
            api.hero.face(-1);
            await ctx.run(api.hero.tailWhip(600, 774));
            ctx.sfx('paper');
            L.mid.remove(featherG);
            st.flag('featherTaken');
            st.give('feather');
          }, { cinema: false, skippable: false });
          await api.think('v.b.feather.take');
        },
      });

      CH.scenes.ductB._cross = async () => {
        if (!st.has('fanJammed')) {
          await api.cut(async (ctx) => {
            const h = api.hero;
            h.face(1);
            ctx.sfx('swoosh');
            const x0 = h.x;
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 700, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => { h.place(U.lerp(x0, 540, o.t), FLOOR - Math.sin(o.t * Math.PI) * 26, 'left'); h.A.rock = -o.t * 360; },
            });
            h.A.rock = 0;
            await ctx.run(h.landSquash());
          }, { cinema: false, skippable: false });
          const n = st.bumpClick('v.b.draft');
          await api.think(n === 1 ? 'v.b.draft' : 'v.b.draft2');
          api.toast('v.b.draft.toast');
          return false;
        }
        await api.cut(async (ctx) => {
          const h = api.hero;
          const fromLeft = h.x < 800;
          h.face(fromLeft ? 1 : -1);
          ctx.sfx('slide', false);
          await ctx.tw(h.A, { sx: 0.78, sy: 1.14 }, { dur: 200 });
          const x0 = h.x, x1 = fromLeft ? 910 : 690;
          await ctx.tw({ t: 0 }, { t: 1 }, {
            dur: 760, ease: CH.tw.ease.sinInOut,
            onUpdate: (k, o) => { h.place(U.lerp(x0, x1, o.t), FLOOR - Math.sin(o.t * Math.PI) * 18); },
          });
          await ctx.tw(h.A, { sx: 1, sy: 1 }, { dur: 180 });
          h.place(x1, FLOOR, fromLeft ? 'right' : 'left');
        }, { cinema: false, skippable: false });
        if (!st.has('fanPassed')) { st.flag('fanPassed'); await api.think('v.b.pass'); }
        return true;
      };

      const blink = DUCT.companion(api, st);
      let told = false;
      api.tick(() => {
        if (told || !st.has('blinkFree') || st.has('fanJammed') || !CH.hero.attached) return;
        if (CH.hero.x > 520 && CH.hero.plat === 'left' && !CH.engine.locked && !CH.dialog.isOpen()) {
          told = true;
          api.say('blink', 'v.b.blink.fan');
        }
      });
      void blink;

      DUCT.exit(api, 'left', 'v.toA', 'left', () => api.go('ductA', 'fromB'));
      DUCT.exit(api, 'right', 'v.toC', 'right', () => api.go('ductC', 'fromB'));
    },

    enter(api) {
      const st = api.state;
      if (st.has('ductBFirst')) return;
      st.flag('ductBFirst');
      api.cut(async (ctx) => {
        await ctx.w(400);
        await ctx.think('v.b.first1');
        await ctx.think('v.b.first2');
      }, { cinema: false });
    },
  });

  // ============================================================ C — the dark bend
  CH.defScene('ductC', {
    chapter: 2,
    duct: true,
    bloom: 0.25, bloomThreshold: 1.15,
    pageBg: '#070d16',
    bg: '#050a12',
    fogColor: '#050a12', fogNear: 18, fogFar: 40,
    heroScale: 1.15,
    ambient: [],
    fill: 0.12, ambient2: 0.05, skyLight: '#3a6a9a', groundLight: '#0a1420',
    camera: { x: 800, y: 420, z: 1590, tx: 800, ty: 500, follow: 0.1, parallax: 0, flat: true },   // a drawing: no play of viewpoint
    platforms: [
      { id: 'left', x1: 200, x2: 560, y: FLOOR },
      { id: 'right', x1: 900, x2: 1470, y: FLOOR },
    ],
    links: [
      { a: 'left', b: 'right', ax: 570, bx: 900, type: 'custom', run: () => CH.scenes.ductC._cross() },
    ],
    spots: {
      fromB: { x: 260, plat: 'left' },
      fromD: { x: 1400, plat: 'right' },
    },

    build(api) {
      const st = api.state;
      const L = api.layers;
      const fx = DUCT.apply(api);
      // it is dark in here: only the hero, Blink and the grates give light
      L.lights.children.forEach((l) => { if (l.isSpotLight) l.intensity = 4; });
      DUCT.tube(L.far, -700, 2300, 600, { code: 'C-3', labelX: 220 });
      // the side shaft going up — where a dust bunny can go when it sneezes
      const shaft = K.g(L.far);
      const shaftMetal = K.mat(METAL, { rough: 0.85, metal: 0.1, emissive: METAL, ei: 0.25 });
      K.vplane(690, 820, 470, 610, Z.fill + 1, shaftMetal, shaft);
      K.vplane(666, 690, 470, 600, Z.hatch + 1, hatchMat(), shaft); K.vplane(820, 844, 470, 600, Z.hatch + 1, hatchMat(), shaft);
      K.vplane(690, 820, 470, 612, Z.ink + 1, K.mat('#0b1729', { rough: 1, emissive: '#0b1729', ei: 0.25 }), shaft);   // the opening: dark, through the flange, up the shaft
      inkLine(shaft, [[690, 470, Z.ink + 3], [690, 612, Z.ink + 3]], 0.9); inkLine(shaft, [[820, 470, Z.ink + 3], [820, 612, Z.ink + 3]], 0.9);
      inkLine(shaft, [[666, 470, Z.ink + 3], [666, 600, Z.ink + 3]], 0.6); inkLine(shaft, [[844, 470, Z.ink + 3], [844, 600, Z.ink + 3]], 0.6);
      inkLine(shaft, [[690, 612, Z.ink + 3], [690, 640, Z.ink + 3]], 0.4); inkLine(shaft, [[820, 612, Z.ink + 3], [820, 640, Z.ink + 3]], 0.4);
      DUCT.hangers(api);
      DUCT.plansheet(api, 'C-3', (ctx) => {
        const ink = (op, w) => { ctx.strokeStyle = 'rgba(143,211,255,' + op + ')'; ctx.lineWidth = w; };
        ink(0.85, 2); ctx.stroke(new Path2D('M 630 200 L 760 200 L 760 60 M 630 220 L 780 220 L 780 60'));
        ink(0.8, 1.6); ctx.stroke(new Path2D('M 770 160 L 770 85 M 770 85 L 764 95 M 770 85 L 776 95'));
        ctx.fillStyle = 'rgba(143,211,255,0.8)'; ctx.font = '20px ' + MONO; ctx.fillText('?', 796, 96);
        ctx.font = '12px ' + MONO; ctx.fillText('130', 690, 176);
        ctx.fillStyle = WARM; ctx.beginPath(); ctx.arc(660, 210, 4, 0, 6.28); ctx.fill();
      });

      // the grate into the living room
      const lg = DUCT.grate(L.mid, 350, 738, 120, 84, { label: CH.t('duct.lbl.living'), color: '#ffc27a', op: 0.1, light: 7 });
      K.pad(340, 716, 140, 116, lg, { d: 40, z: Z.front });
      api.hot(lg, {
        id: 'v.lgrate',
        near: { x: 526, plat: 'left' },
        act: async () => {
          await api.cut(async (ctx) => {
            api.hero.face(-1);
            await ctx.run(api.hero.squint());
            await ctx.w(600);
            await ctx.run(api.hero.unsquint());
          }, { cinema: false, skippable: false });
          await api.think(st.bumpClick('v.lgrate') % 2 ? 'v.c.lgrate1' : 'v.c.lgrate2');
        },
      });

      // scratches on the wall: someone counted something here
      const scr = K.g(L.mid, { z: Z.ink });
      const scrMat = new T.LineBasicMaterial({ color: new T.Color('#c9d8e6'), transparent: true, opacity: 0.55 });
      [[[1180, 660], [1176, 700]], [[1196, 658], [1192, 698]], [[1212, 660], [1208, 700]], [[1228, 658], [1224, 698]], [[1170, 690], [1240, 668]]].forEach((s2) => {
        const gg = new T.BufferGeometry().setFromPoints(s2.map((p) => new T.Vector3(p[0], p[1], 0))); const l = new T.Line(gg, scrMat); l.userData.noHit = true; scr.add(l);
      });
      K.pad(1150, 640, 110, 80, scr, { d: 30 });
      api.hot(scr, {
        id: 'v.scratch',
        near: { x: 1200, plat: 'right' },
        act: async () => { api.hero.face(1); await api.think(st.bumpClick('v.scratch') % 2 ? 'v.c.scratch1' : 'v.c.scratch2'); },
      });

      // Fluff, the dust bunny: as wide as the duct, and fast asleep across it
      const fluffG = K.g(L.main, { x: 730, y: 714, z: FLUFFZ });
      const fluff = CH.models.fluff(fluffG);   // the dust bunny herself, from the cast
      const fluffBody = fluff.el, eyeL = fluff.eyeL, eyeR = fluff.eyeR, eyesOpen = fluff.eyesOpen;
      K.pad(-100, -100, 200, 190, fluffG, { d: 120 });
      api.anchor('fluff', () => ({ x: 730, y: 600 }));
      if (st.has('fluffGone')) fluffG.visible = false;
      let fz = 1.5, ftt = U.rand(0, 6);
      api.tick((dt) => {
        if (!fluffG.visible || CH.engine.locked) return;
        ftt += dt;
        const g = fx.gust, ag = Math.abs(g);
        const fl = Math.sin(ftt * 5.3) * 0.3 + Math.sin(ftt * 8.9) * 0.2;
        const breathe = 1 + Math.sin(ftt * 1.1) * 0.025;
        K.tr(fluffBody, { sx: breathe * (1 + ag * 0.07 * (1 + fl)), sy: breathe * (1 - ag * 0.055), sz: 1, r: g * 3.5 * (1 + fl * 0.5), x: g * 9, ox: 0, oy: 60 });
        fz += dt;
        if (fz > 3.2) { fz = 0; CH.fx.floaties(api, 700 + U.rand(-20, 20), 620, 'z', '#9fb4c8', 40); }
      });

      const blink = DUCT.companion(api, st);
      if (!st.has('fluffGone')) blink.focus = { x: 730, y: 540, r: 300 };   // close to Fluff she flies on ahead and hovers over him, lighting him
      const darkMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false,
        uniforms: { holes: { value: [new T.Vector4(0, 0, 1, 0), new T.Vector4(0, 0, 1, 0), new T.Vector4(0, 0, 1, 0)] } },
        vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: 'uniform vec4 holes[3]; varying vec3 vW; void main() { float a = 0.992; for (int i = 0; i < 3; i++) { vec4 h = holes[i]; float d = distance(vW.xy, h.xy); float k = (1.0 - smoothstep(h.z * 0.45, h.z, d)) * h.w; a *= (1.0 - k); } gl_FragColor = vec4(0.004, 0.009, 0.016, a); }',
      });
      const DARKZ = 240;
      const dark = K.vplane(-1400, 3000, -1000, 1800, DARKZ, darkMat, L.fx);
      dark.castShadow = false; dark.receiveShadow = false; dark.userData.noHit = true; dark.renderOrder = 8;
      const E = CH.engine;
      const camW = new T.Vector3();
      const holeAt = (i, x, y, r, k) => {
        const w = E.wv(x, y, 0), pz = E.wv(0, 0, DARKZ).z;
        E.camera.getWorldPosition(camW);
        const t = (pz - camW.z) / (w.z - camW.z);   // where the line of sight to (x, y) crosses the sheet of night
        darkMat.uniforms.holes.value[i].set(camW.x + (w.x - camW.x) * t, camW.y + (w.y - camW.y) * t, r * 0.01 * t, k);
      };
      holeAt(2, 410, 780, 150, 0.7);
      api.tick(() => {
        if (CH.hero.attached) holeAt(0, CH.hero.x, CH.hero.y - 30, 150, 1);
        holeAt(1, blink.x, blink.y, 250, blink.shown ? 1 : 0);
      });

      api.hot(fluffG, {
        id: 'v.fluff',
        near: { x: 560, plat: 'left' },
        active: () => !st.has('fluffGone'),
        act: async () => {
          api.hero.face(1);
          if (!st.has('blinkFree')) { await api.think('v.c.fluff.dark'); return; }
          const n = st.bumpClick('v.fluff');
          if (n === 1) { await api.think('v.c.fluff.look'); return; }
          await api.cut(async (ctx) => {
            eyesOpen.visible = true; eyeL.visible = eyeR.visible = false;
            ctx.sfx('pop', 0.5);
            await ctx.say('fluff', 'v.c.fluff.hi');
            await ctx.think('v.c.hero.fluff');
            await ctx.say('fluff', 'v.c.fluff.hi2');
            await ctx.w(300);
            eyesOpen.visible = false; eyeL.visible = eyeR.visible = true;
          }, { cinema: false, skippable: false });
          await api.think('v.c.hero.fluff2');
          api.toast('v.c.block.toast');
        },
        item: {
          feather: async () => {
            if (!st.has('blinkFree')) { api.hero.face(1); await api.think('v.c.fluff.dark'); return; }
            await api.cut(async (ctx) => {
              const h = api.hero;
              h.face(1);
              await ctx.run(h.tailWhip(650, 700));
              ctx.sfx('rustle');
              eyesOpen.visible = true; eyeL.visible = eyeR.visible = false;
              blink.offset = { x: -70, y: -60 };
              await ctx.say('fluff', 'v.c.fluff.sneeze1', { ms: 1500 });
              await ctx.tw({ t: 0 }, { t: 1 }, { dur: 900, ease: CH.tw.ease.quadIn, onUpdate: (k, o) => K.tr(fluffBody, { s: 1 + o.t * 0.28 }) });
              await ctx.say('fluff', 'v.c.fluff.sneeze2', { ms: 1200 });
              ctx.sfx('pop', 1.6);
              ctx.sfx('swoosh');
              api.cam.bump(1);
              CH.props.dust(api, 730, 714, 16);
              const lumps = fluffBody.children.filter((c) => c.isMesh && c.__t && c.geometry && c.geometry.type === 'IcosahedronGeometry');
              const lumpBase = lumps.map((c) => Object.assign({}, c.__t));
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 1400, ease: CH.tw.ease.linear,
                onUpdate: (k, o) => {   // he floats up the shaft the way dust does: swaying and tilting, and every lump of him billowing on its own beat
                  const t = o.t, k1 = U.lerp(1.28, 0.95, t);
                  K.tr(fluffG, { x: U.lerp(730, 755, Math.min(1, t * 1.5)) + Math.sin(t * 9) * 12, y: U.lerp(714, 150, t * t), z: FLUFFZ, r: Math.sin(t * 7) * 6 });
                  K.tr(fluffBody, { sx: k1 * (1 + Math.sin(t * 13) * 0.05), sy: k1 * (1 - Math.sin(t * 13) * 0.05), sz: k1, r: 0, x: 0 });
                  lumps.forEach((c, i) => {
                    const b = lumpBase[i], f = 1 + Math.sin(t * 11 + i * 1.7) * 0.11;
                    K.tr(c, { x: b.x + Math.sin(t * 9 + i * 1.3) * 7, y: b.y + Math.cos(t * 8 + i * 0.9) * 6, sx: b.sx * f, sy: b.sy / f, sz: b.sz });
                  });
                },
              });
              fluffG.visible = false;
              const x0 = h.x;
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 1000, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => { h.place(U.lerp(x0, 1000, o.t), FLOOR - Math.abs(Math.sin(o.t * Math.PI * 2)) * 40, 'right'); h.A.rock = o.t * 900; },
              });
              h.A.rock = 0;
              h.place(1000, FLOOR, 'right');
              ctx.sfx('thud');
              await ctx.run(h.landSquash());
              await ctx.run(h.dizzy(600));
            }, { cinema: false, skippable: false });
            blink.offset = { x: -66, y: -116 };
            st.take('feather');
            st.flag('fluffGone');
            st.flag('damperOpen');
            blink.focus = null;
            await api.think('v.c.after');
            await api.say('blink', 'v.c.blink.after');
            api.toast('v.goal2');
          },
        },
      });

      CH.scenes.ductC._cross = async () => {
        if (st.has('fluffGone')) return true;
        if (!st.has('blinkFree')) {
          await api.hero.headShake();
          const n = st.bumpClick('v.c.dark');
          await api.think(n === 1 ? 'v.c.dark' : 'v.c.dark2');
          api.toast('v.c.dark.toast');
          return false;
        }
        if (!st.has('fluffGone')) {
          await api.hero.headShake();
          await api.think('v.c.block');
          api.toast('v.c.block.toast');
          return false;
        }
        return true;
      };

      DUCT.exit(api, 'left', 'v.toB2', 'left', () => api.go('ductB', 'fromC'));
      DUCT.exit(api, 'right', 'v.toD', 'right', () => api.go('ductD', 'fromC'));
    },

    enter(api) {
      const st = api.state;
      if (st.has('ductCFirst')) return;
      st.flag('ductCFirst');
      api.cut(async (ctx) => {
        await ctx.w(400);
        if (st.has('blinkFree')) {
          await ctx.think('v.c.first.lit');
          await ctx.say('blink', 'v.c.blink.first');
        } else {
          await ctx.think('v.c.first.dark');
        }
      }, { cinema: false });
    },
  });

  // ============================================================ D — the hallway grate
  CH.defScene('ductD', {
    chapter: 2,
    duct: true,
    bloom: 0.25, bloomThreshold: 1.15,
    pageBg: PAPER,
    bg: PAPER,
    fogColor: PAPER, fogNear: 20, fogFar: 44,
    heroScale: 1.15,
    ambient: [],
    fill: 0.9, ambient2: 0.4, skyLight: '#3a6a9a', groundLight: '#0a1420',
    camera: { x: 800, y: 420, z: 1590, tx: 800, ty: 500, follow: 0.1, parallax: 0, flat: true },   // a drawing: no play of viewpoint
    platforms: [
      { id: 'right', x1: 200, x2: 1200, y: FLOOR },
    ],
    links: [],
    spots: {
      fromC: { x: 260, plat: 'right' },
    },

    build(api) {
      const st = api.state;
      const L = api.layers;
      const fx = DUCT.apply(api);
      DUCT.tube(L.far, -700, 1250, 600, { code: 'D-4', labelX: 220 });
      // the duct ends in a wall with the grate into the hallway
      K.vplane(1250, 1290, 576, FLOORLINE + 24, Z.hatch + 2, hatchMat(), L.far);   // flush with the flanges' outer edges
      inkLine(L.far, [[1250, 576, Z.ink + 2], [1250, FLOORLINE + 24, Z.ink + 2], [1290, FLOORLINE + 24, Z.ink + 2], [1290, 576, Z.ink + 2], [1250, 576, Z.ink + 2]], 0.8);

      // the damper that was stuck until a sneeze happened to it
      K.box(504, 596, 32, 12, 8, K.mat(METAL, { rough: 0.6, metal: 0.4, emissive: METAL, ei: 0.25 }), L.mid, { z: Z.prop + 4 });   // the hinge bracket under the flange
      const damper = K.g(L.mid, { x: 520, y: 604, z: Z.prop + 6 });
      K.rbox(-7, 0, 14, FLOOR - 604, 8, 3, K.mat('#1b3350', { rough: 0.5, metal: 0.4, emissive: '#1b3350', ei: 0.2 }), damper);   // long enough to reach the floor when it hangs shut
      K.torus(0, 0, 7, 1.6, inkMat(0.8), damper, { z: 6 });
      inkLine(damper, [[-7, 0, 5], [7, 0, 5], [7, FLOOR - 604, 5], [-7, FLOOR - 604, 5], [-7, 0, 5]], 0.8);
      K.pad(-40, -10, 90, FLOOR - 604 + 24, damper, { d: 220 });
      let dt0 = 0;
      api.tick((dt) => { dt0 += dt; K.tr(damper, { x: 520, y: 604, z: Z.prop + 6, r: 66 + Math.sin(dt0 * 1.7) * 4 + fx.gust * 11 * (1 + Math.sin(dt0 * 6.1) * 0.3) }); });
      DUCT.text(L.mid, 500, 566, CH.t('duct.lbl.damper'), 13, 0.75, WALL + 30);
      DUCT.hangers(api);
      DUCT.plansheet(api, 'D-4', (ctx) => {
        const ink = (op, w) => { ctx.strokeStyle = 'rgba(143,211,255,' + op + ')'; ctx.lineWidth = w; };
        ink(0.85, 2); ctx.strokeRect(650, 60, 84, 124);
        ink(0.8, 1.2); for (let i = 0; i < 6; i++) ctx.strokeRect(658, 70 + i * 19, 68, 10);
        ink(0.7, 1.2); ctx.stroke(new Path2D('M 754 60 L 754 184 M 747 60 L 761 60 M 747 184 L 761 184'));
        ctx.fillStyle = 'rgba(143,211,255,0.75)'; ctx.font = '12px ' + MONO; ctx.fillText('166', 764, 126); ctx.fillText('112', 680, 206);
        ink(0.8, 2); ctx.stroke(new Path2D('M 772 210 L 840 210 M 840 210 L 830 204 M 840 210 L 830 216'));
      });
      api.hot(damper, {
        id: 'v.damper',
        near: { x: 440, plat: 'right' },
        act: async () => { api.hero.face(1); await api.think(st.bumpClick('v.damper') % 2 ? 'v.d.damper1' : 'v.d.damper2'); },
      });

      // the grate, from behind: the hallway's warm lamp through the slits
      // it sits in the back wall, clear of the end wall and up off the floor — a wall grille, held by four screws
      const GX = 1090, GY = 626, GW = 112, GH = 132;   // clear of the tube's top edge and of the floor
      const grate = K.g(L.mid, { z: Z.prop + 10 });
      const holeGlow = K.glow(L.mid, GX + GW / 2, GY + GH / 2, Z.front, 140, '#ffb454', 0.08);
      const holeLamp = K.point(L.lights, GX - 60, GY + 60, 40, '#ffcf7a', 4, 900);
      // the hole cut through the tin: a dark rim standing in the wall's thickness, and the hall's lamp-light filling the opening
      const holeMat = K.mat('#050a12', { rough: 1 });
      [[GX - 4, GY - 4, GW + 8, 6], [GX - 4, GY + GH - 2, GW + 8, 6], [GX - 4, GY - 4, 6, GH + 8], [GX + GW - 2, GY - 4, 6, GH + 8]].forEach((b) => K.box(b[0], b[1], b[2], b[3], 34, holeMat, grate, { z: -14 }));
      const holeTex = K.canvasTex(112, 132, (ctx, w, h) => {   // the hall wall beyond: lamplight from the left, warmer and dimmer lower down, the rim's shadow on the far side
        const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6d9a8'); g.addColorStop(0.6, '#e2ae70'); g.addColorStop(1, '#b8804c');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        const r = ctx.createRadialGradient(w * 0.15, h * 0.25, 6, w * 0.15, h * 0.25, w * 1.3); r.addColorStop(0, 'rgba(255,244,214,0.6)'); r.addColorStop(1, 'rgba(255,244,214,0)');
        ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
        const v = ctx.createLinearGradient(0, 0, w, 0); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(0.85, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.35)');
        ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
      });
      const holeLight = K.vplane(GX, GX + GW, GY, GY + GH, -16, new T.MeshStandardMaterial({ map: holeTex, roughness: 1, emissive: new T.Color('#ffffff'), emissiveMap: holeTex, emissiveIntensity: 0.3 }), grate);
      holeLight.scale.y = -1; holeLight.castShadow = false; holeLight.userData.__disposeTex = holeTex;
      const grateDoor = K.g(grate);
      K.box(GX, GY, GW, GH, 6, K.mat('#0a1420', { rough: 0.8 }), grateDoor, { z: 0 });
      const slits = [];
      for (let i = 0; i < 5; i++) { const m = K.rbox(GX + 10, GY + 12 + i * 24, GW - 20, 14, 4, 2, K.mat(WARM, { emissive: WARM, ei: 0.55 }), grateDoor, { z: 4 }); m.castShadow = false; slits.push(m); }
      const dullSlat = K.mat('#3c4a68', { rough: 0.5, metal: 0.4 });   // off the wall the slats are just tin again
      inkLine(grateDoor, [[GX, GY, 6], [GX + GW, GY, 6], [GX + GW, GY + GH, 6], [GX, GY + GH, 6], [GX, GY, 6]], 0.9);
      const screwMat = K.mat('#8a95ab', { rough: 0.35, metal: 0.7 });
      const screws = [[GX + 9, GY + 9], [GX + GW - 9, GY + 9], [GX + 9, GY + GH - 9], [GX + GW - 9, GY + GH - 9]].map(([sx, sy], i) => {
        const s = K.g(grateDoor);
        K.disc(sx, sy, 5, 3, screwMat, s, { z: 6 });
        K.box(sx - 3.5, sy - 1, 7, 2, 2, '#2c3550', s, { z: 8, r: i % 2 ? 35 : -20 });
        s.userData.at = [sx, sy];
        return s;
      });
      // unscrewed, the grate stands leaned against the wall beside the hole, like the one in the study
      const setDoor = (k) => {   // standing on the floor left of the hole, tilted like the study's; with the grate off, the hall's light pours out of the hole
        K.tr(grateDoor, { x: -150 * k, y: (FLOOR - GY - GH) * k, r: -12 * k, ox: GX, oy: GY + GH });
        if (k > 0.1) { slits.forEach((m) => { m.material = dullSlat; }); holeLight.material.emissiveIntensity = 0.62; holeGlow.material.opacity = 0.14; holeLamp.intensity = 8; }
      };
      if (st.has('hallGrateLoose')) { screws.forEach((s) => grateDoor.remove(s)); setDoor(1); }
      K.pad(GX - 30, GY - 30, GW + 60, GH + 50, grate, { d: 60 });
      DUCT.text(L.mid, GX + GW / 2, GY - 14, CH.t('duct.lbl.hall') + ' →', 13, 0.8, -50);

      const blink = DUCT.companion(api, st);

      api.hot(grate, {
        id: 'v.grate',
        near: { x: 1040, plat: 'right' },
        act: async () => {
          if (!st.has('hallGrateLoose')) {   // screwed shut: look, then think of the coin
            api.hero.face(1);
            await api.think(st.bumpClick('v.grate') === 1 ? 'v.d.grate.look' : 'v.d.grate.screws');
            return;
          }
          await api.cut(async (ctx) => {
            const h = api.hero;
            h.face(1);
            if (st.has('blinkFree') && !st.has('blinkGone')) {
              await ctx.run(blink.flyTo(GX - 36, GY + 40, 800));   // beside the opening, against the dark tin, where she can be seen
              await ctx.say('blink', 'v.d.blink.bye1');
              await ctx.think('v.d.hero.bye1');
              await ctx.say('blink', 'v.d.blink.bye2');
              ctx.sfx('tap', 0.5);
              await ctx.run(Promise.all([blink.flyTo(GX + GW / 2, GY + 60, 700, -66), blink.vanish(700)]));   // in through the opening and away into the hall, dwindling as she goes
              st.flag('blinkGone');
              await ctx.think('v.d.hero.bye2');
            }
            await ctx.run(h.rollTo(GX + GW / 2 - 10, () => true));
            await ctx.think('v.d.through');
            // two hops away from us: to the wall, then up into the opening; and through, into the hall's light
            const yIn = GY + GH - 6;
            await ctx.run(h.hopTo(GX + GW / 2, FLOOR, { h: 30, dur: 380, z: -28 }));
            await ctx.run(h.hopTo(GX + GW / 2, yIn, { h: 34, dur: 400, z: -64 }));   // and in: nothing else, the next scene takes him
            await ctx.w(220);
          }, { cinema: false, skippable: false });
          st.flag('ductDone');
          await api.chapterDone(2);
        },
        item: {
          coin: async () => {
            if (st.has('hallGrateLoose')) { await api.think('c1.vent.already'); return; }
            await api.cut(async (ctx) => {
              api.hero.face(1);
              for (let i = 0; i < screws.length; i++) {
                const s = screws[i], [sx, sy] = s.userData.at;
                await ctx.run(api.hero.tailWhip(sx, sy));
                await ctx.run(api.hero.spin(2));
                const dx = i % 2 ? 26 : -26;
                await ctx.tw({ t: 0 }, { t: 1 }, {
                  dur: 380, onUpdate: (k, o) => K.tr(s, { x: dx * o.t, y: -50 * o.t + 70 * o.t * o.t, z: 30 * o.t, r: (i % 2 ? -220 : 200) * o.t, ox: sx, oy: sy }),
                });
                grateDoor.remove(s);
                ctx.sfx('coin');
              }
              // the grate comes off and is stood against the wall beside the hole
              await ctx.run(api.hero.tailWhip(GX + 20, GY + GH - 20));
              ctx.sfx('metal', 0.5);
              await ctx.tw({ t: 0 }, { t: 1 }, { dur: 700, ease: CH.tw.ease.quadIn, onUpdate: (k, o) => setDoor(o.t) });
              ctx.sfx('doorThud');
              api.cam.bump(0.5);
              CH.props.dust(api, GX - 40, FLOOR, 7, -40);
              await ctx.w(250);
            }, { cinema: false, skippable: false });
            st.flag('hallGrateLoose');
            await api.hero.excite();
            await api.think('v.d.grate.unscrewed');
          },
        },
      });

      DUCT.exit(api, 'left', 'v.toC2', 'right', () => api.go('ductC', 'fromD'));
    },

    enter(api) {
      const st = api.state;
      if (st.has('ductDFirst')) return;
      st.flag('ductDFirst');
      api.cut(async (ctx) => {
        await ctx.w(400);
        await ctx.think('v.d.first1');
        await ctx.think('v.d.first2');
      }, { cinema: false });
    },
  });
})();
