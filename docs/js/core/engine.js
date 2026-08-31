/* Chestnut Adventure 2.5D — renderer, camera, input, scene manager, walk graph, hotspots.
   The walk graph and the click rules are the old game's, verbatim in spirit: the stage is
   still 1600×900 and the hero still rolls along one line; depth is for the eye only. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, tw = CH.tw;
  const T = window.THREE, X = window.THREE_X;

  const W = 1600, H = 900;
  const UNIT = 0.01; // one stage px = one centimetre

  const E = {
    W, H,
    gen: 0,
    layers: {},
    sceneId: null,
    def: null,
    inst: null,
    locked: false,
    boxW: 0, boxH: 0,
    walkToken: 0,
    hotspots: [],
    lastInteract: performance.now(),
    renderer: null, scene: null, camera: null, root: null, composer: null, bloom: null,
    cam: null,

    // ---------------------------------------------------------------- setup
    init() {
      const canvas = document.getElementById('stage');
      E.box = document.getElementById('stage-box');
      E.ui = document.getElementById('ui');

      const r = E.renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));   // native pixels (capped at 2): a canvas resampled 1.5→1.75 crawled with moiré on every thin edge
      r.shadowMap.enabled = true;
      r.shadowMap.type = T.PCFSoftShadowMap;
      r.toneMapping = T.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.08;
      r.outputColorSpace = T.SRGBColorSpace;

      const s = E.scene = new T.Scene();
      s.background = new T.Color('#1d2433');

      E.camera = new T.PerspectiveCamera(32, 16 / 9, 0.5, 80);
      // a small painted room to be reflected in anything glossy (the nut, a mug, a knob)
      s.environment = makeEnvironment(r);
      s.environmentIntensity = 0.32;

      // the world: stage units under a flip, so y goes down like it always did
      const root = E.root = new T.Group();
      root.scale.set(UNIT, -UNIT, UNIT);
      root.position.set(-W / 2 * UNIT, H / 2 * UNIT, 0);
      s.add(root);
      ['far', 'mid', 'main', 'fg', 'fx', 'lights'].forEach((n) => {
        const g = new T.Group(); g.name = n; root.add(g); E.layers[n] = g;
      });

      // post: a whisper of bloom on the lamps, then tone mapping
      const target = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: Math.min(8, r.capabilities.maxSamples || 4) }); // MSAA so edges stop shimmering
      const comp = E.composer = new X.EffectComposer(r, target);
      comp.addPass(new X.RenderPass(s, E.camera));
      E.bloom = new X.UnrealBloomPass(new T.Vector2(1024, 576), 0.32, 0.5, 0.9);
      comp.addPass(E.bloom);
      E.extraPasses = [];
      E.outputPass = new X.OutputPass();
      comp.addPass(E.outputPass);

      E.cam = makeCameraRig();

      window.addEventListener('resize', E.resize);
      E.resize();
      window.addEventListener('pointerdown', () => CH.audio.unlock(), { once: false });

      stageInputSetup();
      sparkleSetup();

      tw.tick((dt) => {
        E.cam.update(dt);
        comp.render();
      }, 'global');
    },

    resize() {
      const ww = window.innerWidth, wh = window.innerHeight;
      const w = Math.min(ww, (wh * 16) / 9), h = (w * 9) / 16;
      E.boxW = w; E.boxH = h;
      E.box.style.width = w + 'px';
      E.box.style.height = h + 'px';
      E.ui.style.fontSize = (w * 0.0125) + 'px';
      E.renderer.setSize(w, h, false);
      E.composer.setSize(w, h);
      E.camera.aspect = 16 / 9;
      E.camera.updateProjectionMatrix();
    },

    // stage (px) ↔ world (m)
    wv(x, y, z) { return new T.Vector3((x - W / 2) * UNIT, (H / 2 - y) * UNIT, (z || 0) * UNIT); },
    /** where a stage point (optionally with depth) lands on the screen, in box px */
    toScreen(x, y, z) {
      const v = E.wv(x, y, z || 0).project(E.camera);
      return { x: (v.x + 1) / 2 * E.boxW, y: (1 - v.y) / 2 * E.boxH };
    },
    /** the stage point under a client position, on the hero's plane (z = 0) */
    toStage(clientX, clientY, z) {
      const r = E.box.getBoundingClientRect();
      const nx = ((clientX - r.left) / r.width) * 2 - 1, ny = -(((clientY - r.top) / r.height) * 2 - 1);
      _ray.setFromCamera(_v2.set(nx, ny), E.camera);
      _plane.set(new T.Vector3(0, 0, 1), -(z || 0) * UNIT);
      const p = _ray.ray.intersectPlane(_plane, _v3);
      if (!p) return { x: W / 2, y: H / 2 };
      return { x: p.x / UNIT + W / 2, y: H / 2 - p.y / UNIT };
    },

    lock(v) { E.locked = v; },

    // ------------------------------------------------------------- scenes
    async go(sceneId, spotName, opts) {
      opts = opts || {};
      const def = CH.scenes[sceneId];
      if (!def) { console.error('no scene', sceneId); return; }

      const curtain = document.getElementById('curtain');
      if (!opts.instant && E.sceneId) {
        curtain.classList.add('show');
        await U.wait(460);
      }

      E.teardown();
      E.sceneId = sceneId;
      E.def = def;
      E.gen++;

      document.body.style.setProperty('--page-bg', def.pageBg || '#1d2433');
      E.scene.background = new T.Color(def.bg || def.pageBg || '#1d2433');
      E.scene.fog = def.fog === false ? null : new T.Fog(new T.Color(def.fogColor || def.bg || def.pageBg || '#1d2433'), def.fogNear != null ? def.fogNear : 17.5, def.fogFar != null ? def.fogFar : 36);
      E.bloom.strength = def.bloom != null ? def.bloom : 0.32;
      E.bloom.threshold = def.bloomThreshold != null ? def.bloomThreshold : 0.9;
      E.renderer.toneMappingExposure = def.exposure != null ? def.exposure : 1.08;
      CH.audio.setHush(def.sneak ? 0.3 : 1);
      CH.audio.setDream(!!def.dream);
      E.box.classList.toggle('dream', !!def.dream);
      CH.audio.setDuct(!!def.duct);
      E.box.classList.toggle('duct', !!def.duct);

      // a soft fill for everything, then the scene brings its own lamps
      const hemi = new T.HemisphereLight(new T.Color(def.skyLight || '#5d6a9a'), new T.Color(def.groundLight || '#4a3222'), def.fill != null ? def.fill : 1.7);
      E.layers.lights.add(hemi);
      const amb = new T.AmbientLight(new T.Color(def.ambientLight || '#2c2a3a'), def.ambient2 != null ? def.ambient2 : 0.8);
      E.layers.lights.add(amb);

      E.cam.setScene(def.camera || {});
      E.cam.enter();

      const st = CH.state;
      const inst = E.inst = {
        platforms: (typeof def.platforms === 'function' ? def.platforms(st) : def.platforms || []).map((p) => Object.assign({}, p)),
        links: (typeof def.links === 'function' ? def.links(st) : def.links || []).map((l) => Object.assign({}, l)),
        spots: def.spots || {},
        anchors: {},
      };

      const api = makeApi(def, inst);
      def.build(api);

      if (def.ambient) CH.audio.ambient(def.ambient);

      if (!def.noHero) {
        const spot = inst.spots[spotName] || inst.spots.enter || { x: 200, plat: inst.platforms[0] && inst.platforms[0].id };
        CH.hero.attach(E.layers.main);
        CH.hero.setScale(def.heroScale || 1);
        CH.hero.sneakMode = !!def.sneak;
        CH.hero.place(spot.x, E.platY(spot.plat), spot.plat, E.platZ(spot.plat));
        st.data.scene = sceneId;
        st.data.spot = spotName || 'enter';
        if (!opts.noCheckpoint) st.setCheckpoint(sceneId, st.data.spot);
        st.save();
      } else {
        CH.hero.detach();
      }

      CH.bus.emit('scene', { id: sceneId });
      curtain.classList.remove('show');

      if (def.enter && !opts.silent) def.enter(api);
      return api;
    },

    teardown() {
      tw.kill('scene');
      tw.kill('cut');
      tw.killTicks('scene');
      CH.audio.stopAmbient();
      CH.audio.stopLoops();
      if (CH.dialog) CH.dialog.flush();
      E.hotspots = [];
      hideLabel();
      if (CH.ui.hideCredits) CH.ui.hideCredits();   // a scene change always clears the end card, whatever left it up
      E.box.classList.remove('hot-cursor');
      if (CH.hero.attached) CH.hero.detach();
      for (const n in E.layers) {
        const g = E.layers[n];
        K.dispose(g);
        while (g.children.length) g.remove(g.children[0]);
        g.matrixAutoUpdate = true; g.matrix.identity(); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.set(1, 1, 1);
        delete g.__t;
      }
      E.extraPasses.forEach((p) => E.composer.removePass(p));
      E.extraPasses = [];
      E.walkToken++;
    },

    /** a scene-specific post pass, slotted in before the output */
    addPass(p) {
      E.composer.removePass(E.outputPass);
      E.composer.addPass(p);
      E.composer.addPass(E.outputPass);
      E.extraPasses.push(p);
      return p;
    },

    platY(id) {
      const p = E.inst && E.inst.platforms.find((p) => p.id === id);
      return p ? p.y : 780;
    },
    plat(id) { return E.inst && E.inst.platforms.find((p) => p.id === id); },
    /** the depth a platform's walking line lies at (0: the front line of the room) */
    platZ(id) {
      const p = E.inst && E.inst.platforms.find((p) => p.id === id);
      return p && p.z ? p.z : 0;
    },

    // ------------------------------------------------------------- walking
    activeLinks() {
      return E.inst.links.filter((l) => !l.when || l.when(CH.state));
    },

    findPath(fromId, toId) {
      if (fromId === toId) return [];
      const links = E.activeLinks();
      const queue = [[fromId, []]];
      const seen = { [fromId]: true };
      while (queue.length) {
        const [cur, path] = queue.shift();
        for (const l of links) {
          let next = null, forward = null;
          const dir = l.dir || 'both';
          if (l.a === cur && (dir === 'both' || dir === 'ab')) { next = l.b; forward = true; }
          else if (l.b === cur && (dir === 'both' || dir === 'ba')) { next = l.a; forward = false; }
          if (next == null || seen[next]) continue;
          const newPath = path.concat([{ link: l, forward }]);
          if (next === toId) return newPath;
          seen[next] = true;
          queue.push([next, newPath]);
        }
      }
      return null;
    },

    targetFromClick(x, y) {
      let best = null, bestScore = Infinity;
      for (const p of E.inst.platforms) {
        if (p.noWalk) continue;
        const cx = U.clamp(x, p.x1, p.x2);
        const dy = Math.abs(y - p.y);
        if (dy > 300) continue;
        const score = dy * 1.6 + Math.abs(x - cx);
        if (score < bestScore) { bestScore = score; best = { plat: p.id, x: cx }; }
      }
      return best;
    },

    linkTargetFromClick(x, y) {
      const hero = CH.hero;
      if (!E.inst || !hero.plat) return null;
      const links = E.activeLinks();
      let best = null, bestD = 56;
      for (const l of links) {
        const ay = E.platY(l.a), by = E.platY(l.b);
        if (Math.abs(ay - by) < 40) continue;
        const low = E.plat(ay > by ? l.a : l.b);
        if (!(low && low.noWalk) && y > Math.max(ay, by) - 24) continue;
        const dx = l.bx - l.ax, dy = by - ay;
        const t = ((x - l.ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy);
        if (t < -0.08 || t > 1.08) continue;
        const d = Math.hypot(x - (l.ax + dx * t), y - (ay + dy * t));
        if (d < bestD) { bestD = d; best = l; }
      }
      if (!best) return null;
      const hy = E.platY(hero.plat);
      const toB = hero.plat === best.a || (hero.plat !== best.b && Math.abs(E.platY(best.b) - hy) > Math.abs(E.platY(best.a) - hy));
      let from, dest, destX;
      if (toB) { from = best.a; dest = best.b; destX = best.bx; }
      else { from = best.b; dest = best.a; destX = best.ax; }
      const goingUp = E.platY(dest) < E.platY(from);
      let prev = from, guard = 0;
      while (E.plat(dest) && E.plat(dest).noWalk && guard++ < 8) {
        const next = links.find((l) => {
          const other = l.a === dest ? l.b : l.b === dest ? l.a : null;
          if (!other || other === prev) return false;
          const dir = l.dir || 'both';
          if ((l.a === dest && dir === 'ba') || (l.b === dest && dir === 'ab')) return false;
          return goingUp ? E.platY(other) < E.platY(dest) : E.platY(other) > E.platY(dest);
        });
        if (!next) break;
        prev = dest;
        dest = next.a === dest ? next.b : next.a;
        destX = next.a === dest ? next.ax : next.bx;
      }
      if (E.findPath(hero.plat, dest) == null) return null;
      return { plat: dest, x: destX };
    },

    async walkTo(tx, tplatId) {
      const hero = CH.hero;
      if (!E.inst || !hero.plat) return false;
      const token = ++E.walkToken;
      const gen0 = E.gen;
      const alive = () => token === E.walkToken && gen0 === E.gen;

      tplatId = tplatId || hero.plat;
      const path = E.findPath(hero.plat, tplatId);
      if (path == null) { hero.headShake(); return false; }

      for (const step of path) {
        const l = step.link;
        const fromX = step.forward ? l.ax : l.bx;
        const toX = step.forward ? l.bx : l.ax;
        const fromPlat = step.forward ? l.a : l.b;
        const toPlat = step.forward ? l.b : l.a;
        const toY = E.platY(toPlat);
        // a link may start and end at a depth of its own (a ramp lying deeper in the room than the walking line)
        const fromZ = step.forward ? (l.az != null ? l.az : E.platZ(l.a)) : (l.bz != null ? l.bz : E.platZ(l.b));
        const toZ = step.forward ? (l.bz != null ? l.bz : E.platZ(l.b)) : (l.az != null ? l.az : E.platZ(l.a));

        if (!(await hero.rollTo(fromX, alive))) return false;
        if (!alive()) return false;
        if (Math.abs((hero.z || 0) - fromZ) > 1) {   // in (or out) to where the link begins
          if (!(await hero.rollDepth(fromZ, alive))) return false;
          if (!alive()) return false;
        }

        const type = l.type || 'hop';
        const goingDown = toY > E.platY(fromPlat);
        if (type === 'ramp') await hero.slideTo(toX, toY, goingDown, { z: toZ });
        else if (type === 'climb') await (goingDown ? hero.climbDown(toX, toY) : hero.climbUp(toX, toY));
        else if (type === 'drop') await hero.dropTo(toX, toY);
        else if (type === 'hops') await hero.stairHops(toX, toY, l.steps || 4, { z: toZ });
        else if (type === 'float') await hero.floatTo(toX, toY);
        else if (type === 'custom') { if ((await l.run(step.forward)) === false) return false; }
        else await hero.hopTo(toX, toY, { z: toZ });

        hero.plat = toPlat;
        if (!alive()) return false;
        const platZ = E.platZ(toPlat);
        if (!E.plat(toPlat).noWalk && Math.abs((hero.z || 0) - platZ) > 1) {   // back out to the platform's own walking line
          if (!(await hero.rollDepth(platZ, alive))) return false;
          if (!alive()) return false;
        }
      }

      const p = E.plat(tplatId);
      const cx = U.clamp(tx, p.x1 + 10, p.x2 - 10);
      if (!(await hero.rollTo(cx, alive))) return false;
      return alive();
    },

    // ---------------------------------------------------- respawn (soft "death")
    async respawn() {
      if (E._respawning) return;
      E._respawning = true;
      E.lock(true);
      await CH.hero.dizzy(1100);
      const curtain = document.getElementById('curtain');
      curtain.classList.add('show');
      await U.wait(480);
      const cp = CH.state.checkpoint;
      if (cp && cp.scene === E.sceneId) {
        const spot = E.inst.spots[cp.spot] || E.inst.spots.enter;
        CH.hero.place(spot.x, E.platY(spot.plat), spot.plat, E.platZ(spot.plat));
      } else if (cp) {
        await E.go(cp.scene, cp.spot, { instant: true });
      }
      curtain.classList.remove('show');
      E.lock(false);
      E._respawning = false;
      CH.audio.sfx('sad');
    },

    // ------------------------------------------------------------ hotspots
    /**
     * Make an Object3D (and everything under it) an interactive hotspot.
     * opts: { id, label?, near?: {x, plat}, act?, item?: {itemId: fn | '*': fn}, look?, active?: () => bool }
     */
    hot(obj, opts) {
      const rec = { obj, opts, busy: false };
      obj.userData.hot = rec;
      E.hotspots.push(rec);
      rec.fire = (held) => fireHotspot(rec, held);
      return rec;
    },
    unhot(obj) {
      const i = E.hotspots.findIndex((h) => h.obj === obj);
      if (i >= 0) E.hotspots.splice(i, 1);
      delete obj.userData.hot;
    },
  };

  const _ray = new T.Raycaster();
  const _v2 = new T.Vector2();
  const _v3 = new T.Vector3();
  const _plane = new T.Plane();

  const isActive = (rec) => (!rec.opts.active || rec.opts.active()) && rec.obj.parent && !E.locked;
  const accepts = (rec, item) => !!(rec.opts.item && (rec.opts.item[item] || rec.opts.item['*']));

  async function fireHotspot(rec, selected) {
    const opts = rec.opts;
    if (CH.dialog.isOpen()) CH.dialog.advance();
    E.lastInteract = performance.now();
    CH.audio.unlock();
    const gen0 = E.gen;
    let waited = 0;
    while (rec.busy && waited++ < 100) await U.wait(50);
    if (rec.busy || gen0 !== E.gen) return;
    rec.busy = true;
    try {
      CH.ui.selectItem(null);
      if (opts.near) {
        const ok = await E.walkTo(opts.near.x, opts.near.plat);
        if (!ok || gen0 !== E.gen) return;
      }
      let patience = 0;
      while (E.locked && gen0 === E.gen && patience++ < 200) await U.wait(100);
      if (E.locked || gen0 !== E.gen) return;
      const ctx = makeApi(E.def, E.inst);
      try {
        if (selected) {
          const h = opts.item && (opts.item[selected] || opts.item['*']);
          if (h) await h(ctx, selected);
          else {
            CH.audio.sfx('sad');
            await CH.dialog.think(U.pick(['generic.nowork', 'generic.nowork2']));
          }
        } else if (opts.act) {
          await opts.act(ctx);
        } else if (opts.look) {
          await CH.dialog.think(opts.look);
        }
      } catch (err) { console.error('hotspot error', opts.id, err); }
    } finally { rec.busy = false; }
  }

  // ---------------------------------------------------------- scene api
  function makeApi(def, inst) {
    const gen0 = E.gen;
    return {
      W, H, K,
      layers: E.layers,
      root: E.root,
      cam: E.cam,
      state: CH.state,
      t: CH.t,
      hero: CH.hero,
      sfx: (n, o) => CH.audio.sfx(n, o),
      loop: (n) => CH.audio.loop(n),
      say: (who, key, opts) => CH.dialog.say(who, key, opts),
      think: (key, opts) => CH.dialog.think(key, opts),
      toast: (key) => CH.ui.toast(key),
      hot: (el, opts) => E.hot(el, opts),
      unhot: (el) => E.unhot(el),
      spot: (n) => inst.spots[n],
      platY: (id) => E.platY(id),
      go: (scene, spot, opts) => (E.gen === gen0 ? E.go(scene, spot, opts) : Promise.resolve()),
      walkTo: (x, plat) => (E.gen === gen0 ? E.walkTo(x, plat) : Promise.resolve(false)),
      anchor: (id, fn) => { inst.anchors[id] = fn; },
      anchorOf: (id) => inst.anchors[id],
      tick: (fn) => tw.tick(fn, 'scene'),
      tw: (target, to, opts) => tw.to(target, to, Object.assign({ group: 'scene' }, opts)),
      delay: (ms) => tw.delay(ms, 'scene'),
      gen: () => E.gen,
      cut: (script, opts) => (E.gen === gen0 ? CH.cut.play(script, opts) : Promise.resolve()),
      chapterDone: (n) => CH.chapters.complete(n),
      respawn: () => E.respawn(),
      addPass: (p) => E.addPass(p),
    };
  }

  // ---------------------------------------------------------- picking
  function ndc(clientX, clientY) {
    const r = E.box.getBoundingClientRect();
    return _v2.set(((clientX - r.left) / r.width) * 2 - 1, -(((clientY - r.top) / r.height) * 2 - 1));
  }
  const _roots = [];
  function recOf(o) {
    while (o) { if (o.userData && o.userData.hot) return o.userData.hot; o = o.parent; }
    return null;
  }
  /** the topmost active hotspot under a client point, or null */
  function hotspotAt(clientX, clientY, wantItem) {
    _roots.length = 0;
    for (const h of E.hotspots) if (isActive(h) && h.obj.parent) _roots.push(h.obj);
    if (!_roots.length) return null;
    _ray.setFromCamera(ndc(clientX, clientY), E.camera);
    const hits = _ray.intersectObjects(_roots, true);
    for (const hit of hits) {
      if (hit.object.userData.noHit) continue;
      const rec = recOf(hit.object);
      if (rec && isActive(rec)) return rec;
    }
    return null;
  }
  function sizeOf(rec) {
    const b = new T.Box3().setFromObject(rec.obj);
    return (b.max.x - b.min.x) * (b.max.y - b.min.y);
  }
  function widthOf(rec) {
    const b = new T.Box3().setFromObject(rec.obj);
    return b.max.x - b.min.x;
  }
  /** the hotspot the player most likely meant, or null. With an item in hand,
      things the item can be used on win; otherwise the smallest thing in reach. */
  function nearestHotspotAround(cx, cy, item) {
    let best = null, bestKey = null;
    const radii = item ? [0, 9, 17, 26, 36] : [0, 9, 17, 26];
    radii.forEach((r, ri) => {
      const n = r === 0 ? 1 : 8;
      for (let i = 0; i < n; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rec = hotspotAt(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        if (!rec) continue;
        // the reach is for small things. A wide one (a sofa, the gap under it, an exit pad) is either hit outright or not meant:
        // a click on the floor beside it is a step past it, not a look at it. With an item in hand the reach stays.
        if (r > 0 && !item && widthOf(rec) >= 1.6) continue;
        const score = item ? (accepts(rec, item) ? 0 : (rec.opts.item ? 1 : 2)) : 0;
        const key = [score, ri, sizeOf(rec)];
        if (!bestKey || key[0] < bestKey[0] || (key[0] === bestKey[0] && (key[1] < bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])))) { best = rec; bestKey = key; }
      }
    });
    return best;
  }

  function stageInputSetup() {
    const canvas = document.getElementById('stage');

    // while a line is showing, any click on the stage just turns the page
    E.box.addEventListener('pointerdown', (ev) => {
      if (!CH.dialog.isOpen()) return;
      const t = ev.target;
      if (t.closest && t.closest('.btn, .inv-slot, .overlay, .toggle, select, #hud, #skip-hint')) return;
      if (!E.locked && t === canvas && hotspotAt(ev.clientX, ev.clientY)) return; // the hotspot turns the page itself and acts
      if (CH.dialog.advance()) { ev.stopPropagation(); ev.preventDefault(); }
    }, true);

    let hoverPending = null;
    canvas.addEventListener('pointermove', (ev) => {
      hoverPending = ev;
    });
    tw.tick(() => {
      if (!hoverPending) return;
      const ev = hoverPending; hoverPending = null;
      if (E.locked || !E.def || E.def.noHero) { hideLabel(); E.box.classList.remove('hot-cursor'); return; }
      const rec = hotspotAt(ev.clientX, ev.clientY);
      if (rec) {
        showLabel(CH.t(rec.opts.label || ('hs.' + rec.opts.id)), ev.clientX, ev.clientY);
        E.box.classList.add('hot-cursor');
      } else { hideLabel(); E.box.classList.remove('hot-cursor'); }
    }, 'global');
    canvas.addEventListener('pointerleave', () => { hideLabel(); E.box.classList.remove('hot-cursor'); });

    canvas.addEventListener('pointerdown', (ev) => {
      if (E.locked) { if (CH.cut && CH.cut.running) CH.cut.clickSkipHint(); return; }
      if (CH.dialog.isOpen()) { CH.dialog.advance(); return; }
      if (!E.def || E.def.noHero) return;
      E.lastInteract = performance.now();
      CH.audio.unlock();
      const held = CH.ui.selectedItem;
      // players click at the thing they see, not at its exact silhouette
      const rec = nearestHotspotAround(ev.clientX, ev.clientY, held);
      if (rec) { hideLabel(); rec.fire(held); return; }
      if (held) { CH.ui.selectItem(null); return; }

      const p = E.toStage(ev.clientX, ev.clientY);
      const via = E.linkTargetFromClick(p.x, p.y);
      const target = via || E.targetFromClick(p.x, p.y);
      if (!target) return;
      clickRipple(p.x, via ? p.y : Math.min(p.y, E.platY(target.plat)));
      E.walkTo(target.x, target.plat);
    });

    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (CH.ui.selectedItem) { CH.ui.selectItem(null); return; }
        CH.ui.togglePause();
      }
    });
    window.addEventListener('contextmenu', (ev) => {
      if (CH.ui.selectedItem) { ev.preventDefault(); CH.ui.selectItem(null); }
    });
  }

  function clickRipple(x, y) {
    const geo = new T.RingGeometry(5, 7, 32);
    const mat = new T.MeshBasicMaterial({ color: '#ffb454', transparent: true, opacity: 0.9, depthWrite: false, fog: false });
    const m = new T.Mesh(geo, mat);
    m.userData.noHit = true;
    K.tr(m, { x, y, z: 30 });
    E.layers.fx.add(m);
    const o = { s: 1, op: 0.9 };
    tw.to(o, { s: 4.2, op: 0 }, {
      dur: 420, ease: tw.ease.quadOut, group: 'scene',
      onUpdate: () => { K.tr(m, { s: o.s }); mat.opacity = o.op; },
    }).then(() => { m.parent && m.parent.remove(m); geo.dispose(); mat.dispose(); });
  }

  function makeEnvironment(renderer) {
    const env = new T.Scene();
    const room = new T.Mesh(new T.SphereGeometry(10, 24, 12), new T.MeshBasicMaterial({ color: new T.Color('#2a3350'), side: T.BackSide }));
    env.add(room);
    const win = (x, y, z, w, h, c, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c), side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry || 0; env.add(m); };
    win(-3, 2.5, -6, 4, 3, '#ffd9a0', 0.3);
    win(4, 3, -5, 2.5, 2.5, '#9db8d8', -0.4);
    win(0, 6, 0, 3, 3, '#fff4e0', 0);
    const floor = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshBasicMaterial({ color: new T.Color('#3a2a1c') })); floor.rotation.x = -Math.PI / 2; floor.position.y = -4; env.add(floor);
    const pm = new T.PMREMGenerator(renderer);
    const tex = pm.fromScene(env, 0.05).texture;
    pm.dispose();
    return tex;
  }

  // ---------------------------------------------------------- camera rig
  function makeCameraRig() {
    const cam = E.camera;
    const base = { x: 800, y: 400, z: 1590, tx: 800, ty: 480, fov: 32, follow: 0.1, parallax: 1, flat: false };
    const R = {
      base, mouse: { x: 0, y: 0 }, m: { x: 0, y: 0 }, follow: { x: 0 }, kick: 0, push: 0, t: 0,
      shake: 0, drift: 1,
      setScene(o) {
        Object.assign(base, { x: 800, y: 400, z: 1590, tx: 800, ty: 480, fov: 32, follow: 0.1, parallax: 1, flat: false }, o);
      },
      enter() { R.kick = 1; },
      /** a quick nudge, for thuds and landings */
      bump(k) { R.shake = Math.max(R.shake, k || 1); },
      update(dt) {
        R.t += dt;
        R.m.x += (R.mouse.x - R.m.x) * Math.min(1, dt * 2.4);
        R.m.y += (R.mouse.y - R.m.y) * Math.min(1, dt * 2.4);
        const hero = CH.hero;
        const hx = hero.attached ? (hero.x - 800) * base.follow : 0;
        R.follow.x += (hx - R.follow.x) * Math.min(1, dt * 1.6);
        if (R.kick > 0) R.kick = Math.max(0, R.kick - dt / 1.7);
        const kick = R.kick * R.kick;
        const cine = CH.cut && CH.cut.running && CH.cut.cinema ? 1 : 0;
        R.push += (cine - R.push) * Math.min(1, dt * 1.2);
        R.shake = Math.max(0, R.shake - dt * 3);
        const sh = R.shake * R.shake;
        const px = -R.m.x * 68 * base.parallax;   // the view leans the way you look: mouse right → camera slides left (inverted), twice the old range
        let py = -R.m.y * 32 * base.parallax;     // mouse down → the camera rises and peers down into the room
        if (py > 0) py = 0;                       // it never drops below its authored height: that tilts the view up, and the floor's near edge would open as a gap
        const flat = !!base.flat;   // a flat (2D) scene: the camera slides with the hero rather than turning toward him, so the sheet never skews
        const drift = R.drift * 4;
        // the hero-follow pans the camera (it turns toward him, below); the mouse parallax moves it, always
        // symmetrically about the base, so the play of viewpoint feels the same wherever he stands
        const cx = base.x + (flat ? R.follow.x : 0) + px + Math.sin(R.t * 0.23) * drift + (Math.random() - 0.5) * sh * 6;
        const cy = base.y + py + Math.cos(R.t * 0.31) * drift * 0.6 + (Math.random() - 0.5) * sh * 5;
        const cz = base.z + kick * 110 - R.push * 70;
        const fov = base.fov + kick * 2.5 - R.push * 2.2;
        cam.position.copy(E.wv(cx, cy, cz));
        let ty;
        if (flat) ty = base.ty + py;
        else {
          // the frame's bottom edge is pinned where it meets the floor's near edge at rest (z 420 in every room): however the camera
          // rises or drifts, it looks down just enough to keep that edge on the bottom line — so peering in from above never opens a gap
          const half = fov * Math.PI / 360, dE = cz - 414;
          const yE = base.y + dE * Math.tan(Math.atan((base.ty - base.y) / base.z) + half);   // the anchor: where the authored bottom ray crosses that depth
          ty = cy + cz * Math.tan(Math.atan((yE - cy) / dE) - half);
        }
        _v3.copy(E.wv(base.tx + R.follow.x + px * (flat ? 1 : 0.25), ty, 0));
        cam.lookAt(_v3);
        if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
      },
    };
    window.addEventListener('pointermove', (ev) => {
      R.mouse.x = (ev.clientX / window.innerWidth - 0.5) * 2;
      R.mouse.y = (ev.clientY / window.innerHeight - 0.5) * 2;
    });
    return R;
  }

  // ---------------------------------------------------------- idle sparkles
  function sparkleSetup() {
    let lastSparkle = 0;
    tw.tick(() => {
      const now = performance.now();
      if (E.locked || !E.def || E.def.noHero) return;
      if (now - E.lastInteract < 13000 || now - lastSparkle < 9000) return;
      lastSparkle = now;
      const actives = E.hotspots.filter((h) => isActive(h) && h.obj.parent);
      if (!actives.length) return;
      actives
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .forEach((h, i) => setTimeout(() => sparkleOn(h), i * 350));
    }, 'global');
  }

  let starTex = null;
  function sparkleOn(rec) {
    if (!rec.obj.parent) return;
    const c = K.center(rec.obj, E.root);
    if (!starTex) {
      starTex = K.canvasTex(64, 64, (ctx) => {
        ctx.fillStyle = '#ffdf9e';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4, r = i % 2 ? 8 : 30;
          ctx[i ? 'lineTo' : 'moveTo'](32 + Math.cos(a) * r, 32 + Math.sin(a) * r);
        }
        ctx.closePath(); ctx.fill();
      });
    }
    const mat = new T.SpriteMaterial({ map: starTex, transparent: true, opacity: 0, depthTest: false, fog: false });
    const s = new T.Sprite(mat);
    s.userData.noHit = true;
    s.renderOrder = 9;
    const x = c.x + U.rand(-10, 10), y = c.y - c.h / 200 * 100 * 0.3 + U.rand(0, 8), z = c.z + 40;
    s.position.set(x, y, z);
    E.layers.fx.add(s);
    const o = { s: 6, op: 0, r: 0 };
    tw.to(o, { s: 18, op: 0.95, r: 1.5 }, {
      dur: 450, ease: tw.ease.quadOut, group: 'scene',
      onUpdate: () => { s.scale.set(o.s, o.s, 1); mat.opacity = o.op; mat.rotation = o.r; },
    }).then(() => tw.to(o, { s: 3, op: 0, r: 3 }, {
      dur: 500, ease: tw.ease.quadIn, group: 'scene',
      onUpdate: () => { s.scale.set(o.s, o.s, 1); mat.opacity = o.op; mat.rotation = o.r; },
    })).then(() => { s.parent && s.parent.remove(s); mat.dispose(); });
  }

  // ---------------------------------------------------------- hover label
  let labelEl = null;
  function showLabel(text, clientX, clientY) {
    if (!labelEl) labelEl = U.el('div', '', E.ui);
    labelEl.id = 'hover-label';
    labelEl.textContent = text;
    const r = E.box.getBoundingClientRect();
    labelEl.style.left = (clientX - r.left) + 'px';
    labelEl.style.top = (clientY - r.top) + 'px';
    labelEl.classList.add('show');
  }
  function hideLabel() { if (labelEl) labelEl.classList.remove('show'); }
  E.hideLabel = hideLabel;
  E.showLabel = showLabel;
  E.hotspotAt = hotspotAt;

  CH.scenes = {};
  CH.defScene = (id, def) => { def.id = id; CH.scenes[id] = def; };
  CH.engine = E;
})();
