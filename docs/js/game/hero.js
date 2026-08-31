/* Chestnut Adventure 2.5D — the hero, now with a third dimension.
   The chestnut itself IS the eye: the glossy nut peeks out of the cracked husk,
   and blinking is the two spiky halves closing together. Movement verbs are the
   old game's, so every scene script drives him exactly as before. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, tw = CH.tw;
  const T = window.THREE, X = window.THREE_X;

  const R = 30;      // husk radius at scale 1
  const NC = -32;    // nut centre y (relative to the ground origin; y is DOWN)

  // animated state — tweens write here, the render tick reads it
  const A = {
    scale: 1,
    rock: 0,        // body rocking (deg)
    bounce: 0,      // px lifted off the ground
    sx: 1, sy: 1,   // squash & stretch (origin at the ground)
    flip: 1,        // 1 = facing right
    lid: 0,         // 0 = husk open … 1 = husk fully closed (blink!)
    lidLo: 0,       // lower husk raised (squint / happy) 0..1
    pupX: 0, pupY: 0, // gaze: the gloss cluster drifts across the nut
    tailA: 193,     // tail base angle (deg, from the nut centre)
    tailCurl: 1.15,
    tailLen: 50,
    tailTx: null, tailTy: null,
    lidJitter: 0,
  };

  let root = null, parts = null;
  let idleTimer = 0, blinkTimer = 1.6, lookTimer = 4;
  let rollLoop = null;

  // a ring of spikes on a hemisphere: cones standing on the surface, merged into one geometry
  function spikeGeo(radius, rings, down) {
    const parts = [];
    rings.forEach((ring) => {
      const [theta, n, len] = ring;
      for (let i = 0; i < n; i++) {
        const phi = (i / n) * Math.PI * 2 + (theta * 7) % 1;
        const th = theta * K.DEG;
        const dir = new T.Vector3(Math.sin(th) * Math.cos(phi), (down ? 1 : -1) * Math.cos(th), Math.sin(th) * Math.sin(phi));
        const c = new T.ConeGeometry(3.2, len, 6);
        c.translate(0, len / 2 - 1, 0);
        c.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir));
        c.translate(dir.x * radius, dir.y * radius, dir.z * radius);
        parts.push(c);
      }
    });
    return X.BufferGeometryUtils.mergeGeometries(parts, false);
  }
  let bowlSpikes = null, lidSpikes = null;

  function buildParts(parent) {
    const g = K.g(parent);
    g.name = 'hero';
    const shadow = K.shadowBlob(g, 0, 0, 0, R * 1.15, R * 0.7, 0.42);
    const squash = K.g(g);
    const rock = K.g(squash);
    const flipG = K.g(rock);

    // ---- tail (behind the body)
    const tail = K.tubeDyn(12, 8, 3.4, K.mat('#7d5a35', { rough: 0.7 }), flipG);
    const tailTip = K.sphere(0, 0, 5.2, '#93704a', flipG, { z: -8 });

    // ---- the nut: glossy, warm, alive — this IS the eye
    const nut = K.sphere(0, NC, 25, K.mat('#7a3d1a', { rough: 0.28, clearcoat: 1, ccRough: 0.12, envI: 1.6 }), flipG, { seg: 48 });
    // no painted gloss, no beads: what shines on him is the room itself, reflected
    const glossG = K.g(flipG);

    // ---- lower husk half (the cradle / lower lid)
    const bowlG = K.g(flipG);
    const husk = K.mat('#6d9a44', { rough: 0.78 });
    const huskDeep = K.mat('#5a873a', { rough: 0.8 });
    if (!bowlSpikes) bowlSpikes = spikeGeo(R - 1, [[24, 6, 10], [50, 10, 11], [74, 14, 11]], true);
    if (!lidSpikes) lidSpikes = spikeGeo(27.5, [[22, 6, 10], [48, 10, 11], [72, 13, 11]], false);
    const bowlGeo = new T.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bowl = K.mesh(bowlGeo, huskDeep, bowlG);
    K.tr(bowl, { y: NC + 2 });
    const bowlSp = K.mesh(bowlSpikes, husk, bowlG);
    K.tr(bowlSp, { y: NC + 2 });
    // creamy inner lining, visible while the shell is open
    const rimMat = new T.MeshStandardMaterial({ color: new T.Color('#f2e3c9'), roughness: 0.9, transparent: true, opacity: 1 });
    const bowlRim = K.mesh(new T.TorusGeometry(R - 1.2, 2.6, 8, 40), rimMat, bowlG);
    K.tr(bowlRim, { y: NC + 2, rx: 90 });
    bowlRim.castShadow = false;
    // the thin green vein where the halves meet, visible only when shut tight
    const seamMat = new T.MeshStandardMaterial({ color: new T.Color('#4d7434'), roughness: 0.9, transparent: true, opacity: 0 });
    const seam = K.mesh(new T.TorusGeometry(R - 0.5, 1.4, 6, 40), seamMat, bowlG);
    K.tr(seam, { y: NC + 2, rx: 90 });
    seam.castShadow = false;

    // ---- upper husk half (the cap / upper lid), hinged at the back
    const lidG = K.g(flipG);
    const lidGeo = new T.SphereGeometry(28.5, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    K.mesh(lidGeo, K.mat('#78a84c', { rough: 0.78 }), lidG);
    K.mesh(lidSpikes, husk, lidG);
    const lidRim = K.mesh(new T.TorusGeometry(27.2, 2.4, 8, 40), rimMat, lidG);
    K.tr(lidRim, { y: 0.6, rx: 90 });
    lidRim.castShadow = false;

    return { g, shadow, squash, rock, flipG, tail, tailTip, nut, glossG, bowlG, lidG, rimMat, seamMat, bowlRim, lidRim, seam };
  }

  function renderTail() {
    const baseX = Math.cos((A.tailA * Math.PI) / 180) * R * 0.8;
    const baseY = NC + Math.sin((A.tailA * Math.PI) / 180) * R * 0.8;
    let tipX, tipY;
    if (A.tailTx != null) { tipX = A.tailTx; tipY = A.tailTy; }
    else {
      tipX = baseX - A.tailLen * 0.9;
      tipY = baseY - A.tailLen * 0.28 * A.tailCurl;
    }
    const midX = (baseX + tipX) / 2 - 8 * A.tailCurl;
    const midY = (baseY + tipY) / 2 + 18 * A.tailCurl;
    parts.tail.set((t) => {
      const u = 1 - t;
      return [u * u * baseX + 2 * u * t * midX + t * t * tipX, u * u * baseY + 2 * u * t * midY + t * t * tipY, -8 - t * 4];
    }, (t) => 3.8 - t * 1.6);
    K.tr(parts.tailTip, { x: tipX, y: tipY, z: -12 });
  }

  let closedT = 9;
  let rimO = 0, seamO = 1;
  function renderShell(dt) {
    const t = U.clamp(A.lid + A.lidJitter + (hero.sneakMode ? 0.24 : 0), 0, 1);
    K.tr(parts.lidG, {
      x: -2 * (1 - t),
      y: U.lerp(NC - 9, NC + 1, t),
      r: U.lerp(-24, 0, t),
      ox: -24, oy: 2,
    });
    K.tr(parts.bowlG, { x: 0, y: -A.lidLo * 7 });
    // his gaze: the nut itself turns a little, and the highlights slide with it
    K.tr(parts.nut, { x: 0, y: NC, ry: A.pupX * 3.2, rx: -A.pupY * 3.2 });

    if (t > 0.8) closedT += dt; else closedT = 0;
    const sealed = closedT > 0.3;
    const k = Math.min(1, (dt || 0.016) * 9);
    rimO += ((sealed ? 0 : 1) - rimO) * k;
    seamO += ((sealed && t > 0.8 ? 1 : 0) - seamO) * k;
    parts.rimMat.opacity = rimO;
    parts.bowlRim.visible = parts.lidRim.visible = rimO > 0.03;
    parts.seamMat.opacity = seamO;
    parts.seam.visible = seamO > 0.03;
  }

  const hero = {
    x: 0, y: 0, z: 0, plat: null,   // z: depth off his usual plane (0), only ever used to go into things
    attached: false,
    sneakMode: false,
    A,

    attach(parent) {
      if (root) root.parent && root.parent.remove(root);
      parts = buildParts(parent);
      root = parts.g;
      hero.attached = true;
      hero.z = 0;
    },
    detach() {
      if (root) { root.parent && root.parent.remove(root); parts.tail.mesh.geometry.dispose(); }
      root = null; parts = null;
      hero.attached = false;
      hero.plat = null;
      if (rollLoop) { rollLoop.stop(); rollLoop = null; }
    },

    setScale(k) { A.scale = k; },

    place(x, y, plat, z) {
      hero.x = x; hero.y = y; hero.plat = plat || hero.plat;
      if (z != null) hero.z = z;
      A.bounce = 0; A.rock = 0; A.sx = 1; A.sy = 1;
    },

    face(dir) { A.flip = dir >= 0 ? 1 : -1; },

    // ------------------------------------------------- movement verbs
    async rollTo(tx, alive) {
      if (!root) return false;
      const dist = Math.abs(tx - hero.x);
      if (dist < 2) return true;
      hero.face(tx - hero.x);
      const sneak = hero.sneakMode;
      const dur = (dist / ((sneak ? 205 : 430) * A.scale)) * 1000;
      if (!rollLoop) rollLoop = CH.audio.loop('roll');
      rollLoop.set(sneak ? 0.09 : 0.8);
      const turns = (!sneak && !CH.cut.running && dist > 150 && Math.random() < 0.55) ? U.randi(1, 2) : 0;
      const x0 = hero.x, span = tx - x0;
      const tumbleFrom = 0.26, tumbleTo = tumbleFrom + 0.22 + 0.16 * turns;
      let spinning = false, spun = false;
      const o = { x: hero.x, ph: 0 };
      const ok = await tw.to(o, { x: tx, ph: dist / (14 * A.scale) }, {
        dur, ease: tw.ease.quadInOut, group: 'hero',
        onUpdate: () => {
          hero.x = o.x;
          const u = span ? U.clamp((o.x - x0) / span, 0, 1) : 1;
          if (turns && !spun && u > tumbleFrom && u < tumbleTo) {
            if (!spinning) spinning = true;
            const k = (u - tumbleFrom) / (tumbleTo - tumbleFrom);
            A.rock = A.flip * 360 * turns * k;
            A.bounce = Math.abs(Math.sin(k * Math.PI * turns)) * 13 * A.scale;
            return;
          }
          if (spinning && !spun) spun = true;
          A.rock = Math.sin(o.ph) * (sneak ? 4.5 : 9);
          A.bounce = Math.abs(Math.sin(o.ph)) * (sneak ? 2.2 : 5) * A.scale;
        },
      });
      A.rock = 0; A.bounce = 0;
      if (rollLoop) rollLoop.set(0);
      if (alive && !alive()) return false;
      return ok;
    },

    /** roll straight into or out of the room (along z): to the foot of a ramp lying deeper in, and back out to the walking line */
    async rollDepth(tz, alive) {
      if (!root) return false;
      const z0 = hero.z || 0, dist = Math.abs(tz - z0);
      if (dist < 2) return true;
      const dur = (dist / (430 * A.scale)) * 1000;
      if (!rollLoop) rollLoop = CH.audio.loop('roll');
      rollLoop.set(0.6);
      const o = { z: z0, ph: 0 };
      const ok = await tw.to(o, { z: tz, ph: dist / (14 * A.scale) }, {
        dur, ease: tw.ease.quadInOut, group: 'hero',
        onUpdate: () => {
          hero.z = o.z;
          A.rock = Math.sin(o.ph) * 6;
          A.bounce = Math.abs(Math.sin(o.ph)) * 4 * A.scale;
        },
      });
      A.rock = 0; A.bounce = 0;
      if (rollLoop) rollLoop.set(0);
      if (alive && !alive()) return false;
      return ok;
    },

    async hopTo(tx, ty, opts) {
      opts = opts || {};
      hero.face(tx - hero.x);
      const sneak = hero.sneakMode;
      if (sneak) CH.audio.sfx('rustle', opts.pitch || 1);
      else if (CH.audio.isDuct && CH.audio.isDuct()) CH.audio.sfx('metal', 0.32);
      else CH.audio.sfx('boing', opts.pitch || 1);
      const x0 = hero.x, y0 = hero.y, z0 = hero.z || 0, tz = opts.z != null ? opts.z : z0;   // opts.z: land deeper in the scene
      const h = (opts.h || Math.max(40, Math.abs(ty - y0) * 0.6 + 30)) * A.scale * (sneak ? 0.72 : 1);
      await tw.to({ t: 0 }, { t: 1 }, {
        dur: opts.dur || (sneak ? 760 : 460), ease: tw.ease.linear, group: 'hero',
        onUpdate: (k, o) => {
          hero.x = U.lerp(x0, tx, o.t);
          hero.y = U.lerp(y0, ty, o.t) - Math.sin(Math.PI * o.t) * h;
          hero.z = U.lerp(z0, tz, o.t);
          A.rock = Math.sin(o.t * Math.PI) * (sneak ? 4 : 14) * A.flip;
          A.sy = 1 + Math.sin(o.t * Math.PI) * (sneak ? 0.07 : 0.12);
          A.sx = 1 - Math.sin(o.t * Math.PI) * (sneak ? 0.06 : 0.1);
        },
      });
      hero.x = tx; hero.y = ty; hero.z = tz; A.rock = 0;
      await hero.landSquash();
      return true;
    },

    async stairHops(tx, ty, steps, opts) {
      const x0 = hero.x, y0 = hero.y, z0 = hero.z || 0, tz = opts && opts.z != null ? opts.z : z0;
      for (let i = 1; i <= steps; i++) {
        await hero.hopTo(U.lerp(x0, tx, i / steps), U.lerp(y0, ty, i / steps), { dur: 330, h: 34, pitch: 1 + i * 0.06, z: U.lerp(z0, tz, i / steps) });
      }
      return true;
    },

    async slideTo(tx, ty, down, opts) {
      hero.face(tx - hero.x);
      CH.audio.sfx(hero.sneakMode ? 'rustle' : 'slide', !down);
      const x0 = hero.x, y0 = hero.y, z0 = hero.z || 0, tz = opts && opts.z != null ? opts.z : z0;   // opts.z: the ramp's far end lies at another depth
      await tw.to({ t: 0 }, { t: 1 }, {
        dur: 620, ease: down ? tw.ease.quadIn : tw.ease.quadOut, group: 'hero',
        onUpdate: (k, o) => {
          hero.x = U.lerp(x0, tx, o.t);
          hero.y = U.lerp(y0, ty, o.t);
          hero.z = U.lerp(z0, tz, o.t);
          A.rock = (down ? 14 : -12) * A.flip;
        },
      });
      A.rock = 0;
      if (down) await hero.landSquash();
      return true;
    },

    async climbUp(tx, ty) {
      hero.face(tx - hero.x);
      const x0 = hero.x, y0 = hero.y;
      const pulls = Math.max(2, Math.round(Math.abs(y0 - ty) / (52 * A.scale)));
      for (let i = 1; i <= pulls; i++) {
        CH.audio.sfx('pluck', 0.9 + i * 0.08);
        A.tailTx = 26; A.tailTy = NC - R * 1.6;
        await tw.to({ t: 0 }, { t: 1 }, {
          dur: 300, ease: tw.ease.quadInOut, group: 'hero',
          onUpdate: (k, o) => {
            hero.x = U.lerp(x0, tx, (i - 1 + o.t) / pulls);
            hero.y = U.lerp(y0, ty, (i - 1 + o.t) / pulls);
            A.sy = 1 + Math.sin(o.t * Math.PI) * 0.16;
            A.sx = 1 - Math.sin(o.t * Math.PI) * 0.12;
          },
        });
      }
      A.tailTx = null; A.tailTy = null;
      A.sx = 1; A.sy = 1;
      return true;
    },

    async climbDown(tx, ty) { return hero.climbUp(tx, ty); },

    async dropTo(tx, ty) {
      hero.face(tx - hero.x);
      const x0 = hero.x, y0 = hero.y;
      await tw.to({ t: 0 }, { t: 1 }, {
        dur: Math.max(300, Math.abs(ty - y0) * 1.1), ease: tw.ease.quadIn, group: 'hero',
        onUpdate: (k, o) => {
          hero.x = U.lerp(x0, tx, o.t);
          hero.y = U.lerp(y0, ty, o.t);
          A.sy = 1 + o.t * 0.15; A.sx = 1 - o.t * 0.1;
        },
      });
      CH.audio.sfx(hero.sneakMode ? 'rustle' : 'thud');
      await hero.landSquash(1.5);
      return true;
    },

    async floatTo(tx, ty) {
      hero.face(tx - hero.x);
      CH.audio.sfx('float');
      const x0 = hero.x, y0 = hero.y;
      const dist = Math.hypot(tx - x0, ty - y0);
      const dur = Math.max(700, (dist / 240) * 1000);
      await tw.to({ t: 0 }, { t: 1 }, {
        dur, ease: tw.ease.sinInOut, group: 'hero',
        onUpdate: (k, o) => {
          hero.x = U.lerp(x0, tx, o.t);
          hero.y = U.lerp(y0, ty, o.t) - Math.sin(o.t * Math.PI) * 34;
          A.bounce = Math.sin(o.t * Math.PI * 6) * 4;
          A.rock = Math.sin(o.t * Math.PI * 5) * 7 * A.flip;
          A.lid = 0.16 + Math.abs(Math.sin(o.t * Math.PI * 9)) * 0.3;
        },
      });
      A.lid = 0; A.bounce = 0; A.rock = 0;
      hero.x = tx; hero.y = ty;
      await hero.landSquash(0.6);
      return true;
    },

    async landSquash(k) {
      k = k || 1;
      A.sy = 1 - 0.22 * k; A.sx = 1 + 0.18 * k;
      if (CH.engine.cam && !hero.sneakMode) CH.engine.cam.bump(0.3 * k);
      await tw.to(A, { sy: 1, sx: 1 }, { dur: 320, ease: tw.ease.elasticOut, group: 'hero' });
    },

    // ------------------------------------------------- expressive verbs
    async blink(times) {
      for (let i = 0; i < (times || 1); i++) {
        await tw.to(A, { lid: 1 }, { dur: 80, group: 'hero' });
        await tw.to(A, { lid: 0 }, { dur: 130, group: 'hero' });
        if (times > 1) await tw.delay(90, 'hero');
      }
    },

    async slowBlink() {
      await tw.to(A, { lid: 1 }, { dur: 300, group: 'hero' });
      await tw.delay(160, 'hero');
      await tw.to(A, { lid: 0 }, { dur: 500, group: 'hero' });
    },

    async headShake() {
      CH.audio.sfx('sad');
      for (const r of [-10, 10, -7, 7, 0]) {
        await tw.to(A, { rock: r }, { dur: 90, group: 'hero' });
      }
    },

    async nod() {
      for (const s of [0.9, 1.05, 0.95, 1]) {
        await tw.to(A, { sy: s }, { dur: 110, group: 'hero' });
      }
    },

    async excite() {
      CH.audio.sfx('squeak', 1.3);
      await tw.to(A, { bounce: 16 }, { dur: 140, ease: tw.ease.quadOut, group: 'hero' });
      await tw.to(A, { bounce: 0 }, { dur: 220, ease: tw.ease.bounceOut, group: 'hero' });
      await tw.to(A, { lidLo: 0.55 }, { dur: 120, group: 'hero' });
      await tw.delay(500, 'hero');
      await tw.to(A, { lidLo: 0 }, { dur: 200, group: 'hero' });
    },

    async dizzy(ms) {
      const end = performance.now() + (ms || 1400);
      A.lid = 0.5;
      while (performance.now() < end) {
        await tw.to(A, { pupX: 6, pupY: -3, rock: 5 }, { dur: 130, group: 'hero' });
        await tw.to(A, { pupX: 0, pupY: 4, rock: -5 }, { dur: 130, group: 'hero' });
        await tw.to(A, { pupX: -6, pupY: -2, rock: 3 }, { dur: 130, group: 'hero' });
      }
      A.lid = 0; A.pupX = 0; A.pupY = 0; A.rock = 0;
    },

    async lookAround() {
      await tw.to(A, { pupX: -6, rock: -4 }, { dur: 280, group: 'hero' });
      await tw.delay(420, 'hero');
      await tw.to(A, { pupX: 6, rock: 4 }, { dur: 380, group: 'hero' });
      await tw.delay(420, 'hero');
      await tw.to(A, { pupX: 0, rock: 0 }, { dur: 260, group: 'hero' });
    },

    async squint() {
      await tw.to(A, { lid: 0.55, lidLo: 0.35 }, { dur: 220, group: 'hero' });
    },
    async unsquint() {
      await tw.to(A, { lid: 0, lidLo: 0 }, { dur: 220, group: 'hero' });
    },

    async tailWhip(sx, sy) {
      const dx = (sx - hero.x) * A.flip / A.scale;
      const dy = (sy - hero.y) / A.scale;
      CH.audio.sfx('pluck', 1.2);
      A.tailTx = U.clamp(dx, -90, 90);
      A.tailTy = U.clamp(dy, -110, 30);
      await tw.delay(260, 'hero');
      A.tailTx = null; A.tailTy = null;
    },

    async spin(times) {
      CH.audio.sfx('screw');
      for (let i = 0; i < (times || 3); i++) {
        await tw.to(A, { rock: 360 }, { dur: 380, ease: tw.ease.quadInOut, group: 'hero' });
        A.rock = 0;
      }
    },

    stopSounds() { if (rollLoop) { rollLoop.stop(); rollLoop = null; } },
  };

  // ------------------------------------------------- render + idle tick
  tw.tick((dt) => {
    if (!root || !parts) return;

    K.tr(parts.g, { x: hero.x, y: hero.y, z: hero.z || 0, s: A.scale });
    const psx = A.sx * (hero.sneakMode ? 1.06 : 1);
    const psy = A.sy * (hero.sneakMode ? 0.9 : 1);
    K.tr(parts.squash, { y: -A.bounce, sx: psx, sy: psy, sz: 1 });
    K.tr(parts.rock, { r: A.rock, ox: 0, oy: NC });
    K.tr(parts.flipG, { sx: A.flip, sy: 1, sz: 1 });
    const lifted = A.bounce > 1;
    K.tr(parts.shadow, { y: A.bounce - 0.6, sx: R * 1.15 * (lifted ? 0.8 : 1), sz: R * 0.7 * (lifted ? 0.8 : 1) });
    parts.shadow.material.opacity = lifted ? 0.28 : 0.42;
    renderTail();
    renderShell(dt);

    if (CH.engine.locked) return;
    blinkTimer -= dt;
    if (blinkTimer <= 0) { blinkTimer = U.rand(2.2, 5.5); hero.blink(Math.random() < 0.18 ? 2 : 1); }
    lookTimer -= dt;
    if (lookTimer <= 0) { lookTimer = U.rand(6, 12); if (Math.random() < 0.6) hero.lookAround(); }
    idleTimer += dt;
    A.tailCurl = 1.15 + Math.sin(idleTimer * 1.4) * 0.18;
  }, 'global');

  CH.hero = hero;
})();
