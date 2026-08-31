/* Title screen — the house at dusk, a little model of a world. After the game, the tree blooms here. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  CH.defScene('title', {
    noHero: true,
    pageBg: '#12172a',
    bg: '#0f1428',
    fogNear: 20, fogFar: 46,
    fill: 0.6, ambient2: 0.35, skyLight: '#3a4a7a', groundLight: '#1a2014',
    camera: { x: 800, y: 380, z: 1640, tx: 800, ty: 500, fov: 31, follow: 0, parallax: 1.4 },

    build(api) {
      const far = api.layers.far, mid = api.layers.mid, fg = api.layers.fg, fx = api.layers.fx;

      // sky: a painted dome far behind everything
      const skyTex = K.canvasTex(64, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0d1226'); g.addColorStop(0.5, '#273356'); g.addColorStop(0.8, '#544760'); g.addColorStop(1, '#8a6353');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      const sky = K.vplane(-2600, 5200, -1400, 1200, -2400, new T.MeshBasicMaterial({ map: skyTex, fog: false }), far);
      sky.scale.y = -1;
      sky.userData.__disposeTex = skyTex;

      // stars
      const stars = [];
      for (let i = 0; i < 70; i++) {
        const s = K.glow(far, U.rand(-1200, 3200), U.rand(-900, 380), -2300, U.rand(6, 13), '#e8ecff', U.rand(0.3, 0.9));
        s.__ph = U.rand(0, 6.28);
        stars.push(s);
      }
      let t = 0;
      api.tick((dt) => {
        t += dt;
        stars.forEach((s) => { s.material.opacity = 0.35 + 0.45 * (Math.sin(t * 1.4 + s.__ph) + 1) / 2; });
      });

      // moon
      CH.props.moon(far, 1420, 60, 90, { z: -2200, sky: '#1b2340' });
      K.sun(api.layers.lights, 1500, -300, -1200, '#9db8d8', 0.9, { tx: 700, ty: 700, tz: 0, shadow: true, size: 1400 });

      // distant hills, ridge behind ridge
      K.ext('M -800 640 Q 300 520 900 620 T 2800 600 L 2800 900 L -800 900 Z', 40, K.mat('#151b2e', { rough: 1, fog: false }), far, { z: -1500, bevel: 0 });
      K.ext('M -800 660 Q 200 600 700 650 T 2600 640 L 2600 900 L -800 900 Z', 40, K.mat('#1a2138', { rough: 1, fog: false }), far, { z: -1150, bevel: 0 });

      // ground: a wide meadow rolling toward us
      const groundMat = new T.MeshStandardMaterial({ color: new T.Color('#2a3a24'), roughness: 1 });
      K.hplane(-2000, 3600, 656, -1200, 1900, groundMat, far);
      

      // ----- the house -----
      CH.props.house(mid, 210, 0, { z: -420 });

      // a stone path from the porch, and tufts of grass in the lawn
      [[560, 40], [640, 180], [700, 330], [740, 500], [760, 700], [770, 920]].forEach((p, i) => {
        const s = K.cut(K.ellipseShape(0, 0, 60 + i * 6, 30 + i * 4), K.mat('#3e4340', { rough: 1 }), mid, { rx: 90 });
        K.tr(s, { x: p[0], y: 655.4, z: p[1] - 180, rx: 90 });
      });
      const tuft = K.mat('#233318', { rough: 1, side: 'double' });
      for (let i = 0; i < 70; i++) {
        const gx = U.rand(-300, 1900), gz = U.rand(-500, 1500), h = U.rand(14, 34);
        if (gx > 520 && gx < 820 && gz > -200) continue;
        K.cut(`M -3 0 Q ${U.rand(-6, 2)} ${-h * 0.6} ${U.rand(-6, 6)} ${-h} Q ${U.rand(1, 5)} ${-h * 0.5} 3 0 Z`, tuft, mid, { x: gx, y: 656, z: gz, ry: U.rand(-50, 50) });
      }
      // a bush by the corner of the house
      [[120, 660, -200, 70], [180, 660, -160, 50], [60, 660, -150, 44]].forEach((b) => K.ellipsoid(b[0], b[1] - b[3] * 0.55, b[3], b[3] * 0.7, b[3] * 0.8, K.mat('#1e2c18', { rough: 1 }), mid, { z: b[2], seg: 20 }));
      // fence
      for (let i = 0; i < 9; i++) K.box(920 + i * 78, 596, 14, 60, 14, '#241f2c', mid, { z: -80, round: 3 });
      K.box(900, 604, 700, 9, 9, '#241f2c', mid, { z: -80 });

      // flowerbed / the tree spot
      const bed = K.cut(K.ellipseShape(0, 0, 120, 60), K.mat('#191108', { rough: 1 }), mid, { rx: 90 });
      K.tr(bed, { x: 1130, y: 655, z: -40, rx: 90 });
      if (CH.state.data.finished) {
        CH.props.fractalTree(mid, 1130, 656, { s: 0.62, grown: true });
      } else {
        K.tube([[1122, 656, -40], [1126, 646, -40], [1130, 640, -40], [1134, 646, -40], [1138, 656, -40]], 2, K.mat('#4a5c33'), mid, { seg: 10, radial: 6 });
      }

      // fireflies
      const flies = [];
      for (let i = 0; i < 9; i++) {
        const f = K.glow(fx, 0, 0, 0, U.rand(4, 7), '#ffe9a3', 0.8);
        flies.push({ el: f, x: U.rand(700, 1560), y: U.rand(520, 700), z: U.rand(-300, 200), ph: U.rand(0, 6.28), sp: U.rand(0.4, 0.9) });
      }
      api.tick((dt) => {
        flies.forEach((f) => {
          f.ph += dt * f.sp;
          f.el.position.set(f.x + Math.sin(f.ph) * 46 + Math.sin(f.ph * 0.37) * 60, f.y + Math.cos(f.ph * 0.8) * 26, f.z + Math.sin(f.ph * 0.6) * 40);
          f.el.material.opacity = 0.25 + 0.6 * (Math.sin(f.ph * 2.2) + 1) / 2;
        });
      });

      // foreground grass silhouettes, close to the lens
      const grassMat = K.mat('#0c0e08', { rough: 1, side: 'double' });
      for (let i = 0; i < 30; i++) {
        const gx = U.rand(-200, 1800), h = U.rand(50, 110);
        const blade = K.cut(`M -4 0 Q ${U.rand(-10, 4)} ${-h * 0.55} ${U.rand(-14, 14)} ${-h} Q ${U.rand(2, 8)} ${-h * 0.5} 4 0 Z`, grassMat, fg, { x: gx, y: 910, z: U.rand(220, 330) });
        blade.castShadow = false;
      }
    },
  });
})();
