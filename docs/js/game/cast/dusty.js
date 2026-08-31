/* Chestnut Adventure 2.5D — DUSTY-3000, from the character sheet: a low round robot vacuum, one faceted body
   of revolution — a near-black cylindrical bumper with a flat blue lid on top and a pale band where the lid
   meets the rim — a big matte green GO button in a black ring on the lid, a glowing green LED strip and a flat
   red square button on the front bumper, two treaded wheels with pale rims sunk into wells cut into the sides
   (toward the viewer and away from it), the chassis riding on them, and a wide side brush spinning under the
   front edge. Origin under the chassis on the floor, the brush end faces RIGHT (face(1)).
   API kept from the old model: M.dusty(parent, x, y, s) → { el, x, setPos(x, y), face(dir), anchor() }. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K, LP = CH.LP;
  const T = window.THREE;
  const M = CH.models;

  const BUMPER = '#1c2029', BUMPER_LIGHT = '#2a303c', BUMPER_DEEP = '#0f1218', LID = '#2b57a8', LID_DEEP = '#24488c', LID_LIGHT = '#3565bb', BAND = '#7d93b0';
  const GO = '#3f8224', GO_DEEP = '#22421a', GO_LIGHT = '#5a9c34', LED = '#5ef07a', RED = '#c8402a', RED_DEEP = '#9c2e1e';
  const WHEEL = '#22262e', TREAD = '#555c6a', RIM = '#a4abb8', HUB = '#3a4050';
  const pick = (p) => Math.random() < p;

  M.dusty = function (parent, x, y, s) {
    s = s || 1;
    const g = K.g(parent);
    const LIFT = -8;                                   // the chassis rides 8 above the floor on its wheels
    const body = K.g(g, { y: LIFT });
    const R = 56, H = 26;                              // the bumper: radius and height

    // ---- the body: one faceted solid of revolution — a cylinder under a flat lid — its tiers painted on its own
    //      rows; two wheel wells cut out of the bumper toward the rear, one facing the viewer, one away
    const profile = [[0, 0], [52, 0], [R, 3], [R, H], [55, H + 1], [53.5, H + 1.6], [53.5, H + 3.2], [31, H + 3.5], [29, H + 3.1], [27, H + 3.5], [0, H + 3.9]];   // a flat lid with a shallow groove ringing the button panel
    const geo = new T.LatheGeometry(profile.map((p) => new T.Vector2(p[0], p[1])), 28);
    {
      const pos = geo.attributes.position, idx = geo.index.array, keep = [];
      for (let i = 0; i < idx.length; i += 3) {
        let cx = 0, cy = 0, cz = 0;
        for (let k = 0; k < 3; k++) { cx += pos.getX(idx[i + k]); cy += pos.getY(idx[i + k]); cz += pos.getZ(idx[i + k]); }
        cx /= 3; cy /= 3; cz /= 3;
        const inWell = cy > 0.5 && cy < H - 6 && Math.abs(cz) > 36 && cx > 2 && cx < 34;      // lathe +x is stage −x once the mesh is flipped
        if (!inWell) keep.push(idx[i], idx[i + 1], idx[i + 2]);
      }
      geo.setIndex(keep);
    }
    const shell = K.mesh(geo, LP.mat(BUMPER), body, {});
    K.tr(shell, { r: 180 });
    {   // hand-cut jitter on the bumper only: the lid stays a true flat plate (jittered fan facets read as a pinwheel)
      const pos = shell.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { if (pos.getY(i) < H + 0.2) pos.setXYZ(i, pos.getX(i) + U.rand(-0.35, 0.35), pos.getY(i) + U.rand(-0.35, 0.35), pos.getZ(i) + U.rand(-0.35, 0.35)); } shell.geometry.computeVertexNormals();
    }
    LP.paint(shell, BUMPER, (cx, cy, cz) => { const rr = Math.hypot(cx, cz); if (cy > H + 2.6) return rr > 28 && rr < 31 ? LID_DEEP : LID; return cy > H + 0.4 ? BAND : pick(0.12) ? BUMPER_LIGHT : null; }, { rough: 0.88 });   // lid, the groove, the thin band, the bumper — matte, so the lamp does not silver the plate
    shell.material.side = T.DoubleSide;                // the wells show the dark inside of the shell
    // charging contacts at the back
    K.box(-6, -3, 6, 2, 8, LP.mat('#c08a4a'), body, { z: -54 });
    K.box(4, -3, 6, 2, 8, LP.mat('#c08a4a'), body, { z: -54 });

    // ---- the wheels: treaded tyres with a pale rim and a dark hub, sunk into the wells, rolling along x
    const WX = -18, WR = 16, WY = -8, WZ = 41;         // the tread touches the floor (body y +6); the face sits just behind the rim at the well's far edge
    const wheels = [1, -1].map((sd) => {
      const w = K.g(body, { x: WX, y: WY, z: sd * WZ });
      K.disc(0, 0, WR, 9, LP.mat(WHEEL), w, { seg: 18 });
      for (let i = 0; i < 14; i++) K.box(-1.4, -WR - 0.8, 2.8, 2.6, 9.6, LP.mat(TREAD), w, { r: i * (360 / 14), ox: 0, oy: 0 });
      K.torus(0, 0, 10, 1.6, LP.mat(RIM), w, { z: sd * 4.7 });
      K.disc(0, 0, 8.8, 9.8, LP.mat(HUB), w, { seg: 14 });
      K.disc(0, 0, 3, 10.4, LP.mat(RIM), w, { seg: 6 });
      // the fender: a dark lip arching over the well on the bumper's own curve, so the wheel reads as housed
      const pts = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI + i * (Math.PI / 10), px = WX + Math.cos(a) * (WR + 3), py = WY + Math.sin(a) * (WR + 3); pts.push([px, py, sd * (Math.sqrt(R * R - px * px) + 1.2)]); }
      K.tube(pts, 2.2, LP.mat(BUMPER_LIGHT), body, { seg: 12, radial: 6 });
      return { g: w, sd };
    });

    // ---- the GO button on the lid: a black ring standing on the plate, the green button inside it, letters that fit
    const BX = 0, BZ = 0, LIDY = -(H + 3.9);   // dead centre of the lid
    K.cylUp(BX, LIDY + 0.6, 20, 1.9, LP.mat(BUMPER_DEEP), body, { seg: 24, z: BZ });                        // sunk 0.6 into the lid, so the lid never shows through the ring
    K.cylUp(BX, LIDY - 1.1, 15.5, 3.2, K.mat(GO, { rough: 0.9, flat: true }), body, { seg: 24, rTop: 14.5, z: BZ });
    K.torus(BX, LIDY - 4.2, 13.6, 0.8, LP.mat(GO_LIGHT), body, { rx: 90, z: BZ });
    const goLabel = K.label('GO', { size: 12, color: '#123310', weight: 900, letterSpacing: 1, parent: body });
    K.tr(goLabel, { x: BX, y: LIDY - 4.9, z: BZ, rx: 90, sy: -1 });

    // ---- the front bumper: a flat red square button toward the brush end, the LED strip beside it, both hugging the rim
    const onRim = (px, py, w, h, d, r, mat) => {
      const a = Math.asin(px / R);
      const grp = K.g(body, { x: px, y: py, z: Math.cos(a) * R, ry: a / K.DEG });
      return K.rbox(-w / 2, -h / 2, w, h, d, r, mat, grp, { z: d / 2 - 0.6 });
    };
    onRim(27, -16, 13, 13, 2.4, 1.4, LP.mat(RED));
    onRim(27, -16, 9.5, 9.5, 3.2, 1, LP.mat(RED_DEEP)).castShadow = false;                                  // the pressed centre
    const ledMat = new T.MeshStandardMaterial({ color: new T.Color(LED), emissive: new T.Color(LED), emissiveIntensity: 0.35, roughness: 0.6 });
    onRim(5, -14, 17, 7, 2.4, 1.6, LP.mat(BUMPER_DEEP));
    onRim(5, -14, 12, 2.6, 3.2, 1, ledMat).castShadow = false;

    // ---- the side brush: a wide spinning star of bristles under the front edge, sweeping out past the bumper
    const brush = K.g(g, { x: R - 15, y: -3, z: 14 });   // its hub 15 inside the bumper's edge: the 30-long bristles sweep half under the body, half out past it
    for (let i = 0; i < 18; i++) { const r = K.rodX(0, 30, 0, 1.9, K.mat('#dde2ea', { rough: 0.9 }), brush); r.castShadow = false; r.__i = i; r.__a = Math.floor(i / 3) * 60 + (i % 3 - 1) * 9; r.__tilt = (i % 3 - 1) * 4; }
    K.disc(R - 15, -3, 4.5, 3, LP.mat(HUB), g, { z: 14, rx: 90 });   // the brush hub

    // ---- idle life: the LED breathes, the shell hums when driving, the wheels turn with the distance travelled
    let t = 0, lastX = x, roll = 0, dir = 1, hum = 0;
    LP.tick((dt) => {
      t += dt;
      ledMat.emissiveIntensity = 0.7 + 0.6 * (Math.sin(t * 5) + 1) / 2;
      const moving = Math.abs(x - lastX) > 0.01;
      roll += (x - lastX) * 5; lastX = x;
      hum += ((moving ? 1 : 0) - hum) * Math.min(1, dt * 6);
      brush.children.forEach((b) => K.tr(b, { ry: b.__a + t * 400, r: b.__tilt }));
      wheels.forEach((w) => K.tr(w.g, { x: WX, y: WY, z: w.sd * WZ, r: roll }));
      K.tr(body, { sx: dir, sy: 1, sz: 1, y: LIFT + Math.sin(t * 43) * 0.5 * hum, r: Math.sin(t * 37) * 0.35 * hum });
      K.tr(g, { x, y, s });
    });

    return {
      el: g,
      get x() { return x; },
      setPos(nx, ny) { x = nx; if (ny != null) y = ny; },
      face(d) { dir = d >= 0 ? 1 : -1; brush.visible = d >= 0; },
      anchor: () => ({ x, y: y - 60 }),
    };
  };
})();
