/* Chapter 2 — the living room: Biscuit, the yarn, DUSTY-3000 and the lost button. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;
  const WALL = -330;

  CH.defScene('living', {
    chapter: 3,
    pageBg: '#1a1c30',
    bg: '#15172a',
    ambient: [{ name: 'tick', every: [1400, 1500] }],
    camera: { x: 800, y: 400, z: 1590, tx: 800, ty: 480, follow: 0.1 },

    platforms: [
      { id: 'floor', x1: 30, x2: 1500, y: 800 },
    ],
    links: [],
    spots: {
      enter: { x: 220, plat: 'floor' },
    },

    build(api) {
      const st = api.state;
      const far = api.layers.far, mid = api.layers.mid, main = api.layers.main, fg = api.layers.fg, L = api.layers.lights;
      const P = CH.props;

      // the hallway is through a full doorway in the left side wall; the way back is simply walking left through it
      P.room(api, {
        floorY: 800,
        wallStops: [[0, '#28243e'], [1, '#3e3854']],
        floorStops: [[0, '#66452c'], [1, '#422c19']],
        baseboard: '#2a2542',
        leftX: 0,
        leftDoor: { top: 290, z1: -250, z2: 50, light: 12 },
      });
      const archG = K.pad(20, 300, 150, 510, mid, { d: 300, z: -100 });
      CH.props.exitMark(api, 60, 700, 'left', 40, { margin: 44, minX: 62 });   // never left of the doorway's near post (x -4..14, in front of the mark): it stays in the opening, not behind the jamb

      // window with curtains behind the sofa
      P.windowNight(far, 520, 90, 340, 300, { moon: true });
      const curtain = K.mat('#54405c', { rough: 1 });
      K.ext('M 480 70 C 512 220 478 320 508 420 L 442 420 L 442 70 Z', 22, curtain, far, { z: WALL + 34, bevel: 3 });
      K.ext('M 940 70 C 908 220 942 320 912 420 L 978 420 L 978 70 Z', 22, curtain, far, { z: WALL + 34, bevel: 3 });
      K.sun(L, 690, 100, -100, '#9db8d8', 0.8, { tx: 700, ty: 800, tz: 0 });

      // floor lamp (right of sofa) + warm pool
      const flampG = K.g(mid, { z: -200 });
      K.cylUp(1090, 800, 5, 470, K.mat('#3c2f22', { rough: 0.6, metal: 0.3 }), flampG);
      K.cylUp(1090, 800, 44, 8, K.mat('#2a2018', { rough: 0.8 }), flampG);
      const shade = K.mesh(new T.CylinderGeometry(32, 50, 90, 28, 1, true), K.mat('#e0a050', { rough: 0.75, side: 'double' }), flampG);
      K.tr(shade, { x: 1090, y: 285, r: 180 });
      K.sphere(1090, 300, 12, K.mat('#ffd489', { emissive: '#ffd489', ei: 1.2 }), flampG).castShadow = false;
      K.spot(L, 1090, 300, -200, 1090, 800, -80, '#ffcf7a', 100, { angle: 60, penumbra: 0.75, decay: 1.5, mapSize: 2048, dist: 1600 });
      K.point(L, 1090, 300, -200, '#ffb454', 6, 900);
      K.glow(mid, 1090, 330, -180, 70, '#ffb454', 0.12);

      // fireplace (right wall)
      const fireG = K.g(mid);
      K.box(1330, 420, 270, 380, 60, '#4a3a34', fireG, { z: WALL + 30 });
      K.box(1354, 470, 222, 330, 50, '#37292a', fireG, { z: WALL + 40 });
      K.box(1378, 520, 174, 280, 10, '#120c10', fireG, { z: WALL + 62 });
      K.box(1310, 400, 300, 26, 90, '#5e4a42', fireG, { z: WALL + 45 });
      // cold logs
      K.rodX(1414, 1520, 782, 14, K.mat('#3c2f22', { rough: 1 }), fireG, { z: WALL + 40 });
      K.rodX(1410, 1490, 764, 11, K.mat('#4a3a28', { rough: 1 }), fireG, { z: WALL + 58, r: -8 });
      // framed something on the mantel
      P.picture(fireG, 1400, 340, 50, 40, (ctx, w, h) => { ctx.fillStyle = '#e8a256'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 12, 0, 6.28); ctx.fill(); }, { z: WALL + 84 });

      // rug
      P.rug(main, 700, 800, 640, '#6a3f4d', '#c98a63');

      // ---------- the sofa ----------
      const sofaG = K.g(mid, { z: -170 });
      const sofa = K.mat('#7a4a58', { rough: 0.95, sheen: 0.3 });
      const sofaDeep = K.mat('#6a3f4d', { rough: 0.95, sheen: 0.3 });
      // legs & the gap under the sofa
      K.box(370, 756, 24, 44, 24, '#3c2f22', sofaG, { z: 90 });
      K.box(806, 756, 24, 44, 24, '#3c2f22', sofaG, { z: 90 });
      K.box(370, 756, 24, 44, 24, '#3c2f22', sofaG, { z: -90 });
      K.box(806, 756, 24, 44, 24, '#3c2f22', sofaG, { z: -90 });
      K.rbox(378, 736, 444, 26, 210, 8, '#472c36', sofaG);
      // body
      K.rbox(356, 560, 488, 190, 220, 26, sofa, sofaG);
      K.rbox(340, 470, 90, 290, 230, 26, sofaDeep, sofaG);
      K.rbox(770, 470, 90, 290, 230, 26, sofaDeep, sofaG);
      // back cushions
      K.pillow(400, 470, 190, 150, 70, '#8f5a6e', sofaG, { z: -70 });
      K.pillow(600, 470, 190, 150, 70, '#8f5a6e', sofaG, { z: -70 });
      // seat cushions
      K.pillow(400, 600, 190, 60, 170, '#a3667c', sofaG, { z: 20 });
      K.pillow(600, 600, 190, 60, 170, '#a3667c', sofaG, { z: 20 });

      // Biscuit asleep on the sofa (chapter 2 only — later he patrols the kitchen)
      let cat = null, purr = null;
      const catHere = !st.has('buttonDone');
      if (catHere) {
        cat = CH.actors.cat(K.g(main, { z: -150 }), 660, 560, 1.05);   // on top of the seat base (its top is at 560 this deep), not sunk into it
        api.anchor('cat', cat.anchor);
        purr = CH.audio.loop('purr');
        let zt = 0;
        api.tick((dt) => {
          zt += dt;
          if (zt > 3.4) { zt = 0; CH.fx.floaties(api, 630 + U.rand(-10, 10), 548, 'z', '#cbd6ff', -120); }
        });
      } else {
        K.cut(K.ellipseShape(0, 0, 90, 40), K.mat('#5a3444', { rough: 1 }), sofaG, { x: 660, y: 599, z: 20, rx: 90 });
      }

      // the dark gap under the sofa
      const gapZone = K.box(390, 762, 420, 38, 40, K.mat('#0c0a14', { rough: 1 }), main, { z: -60 });

      // the button peeks out after being freed
      const buttonG = K.g(main, { z: -20 });
      K.pad(-26, -26, 52, 40, buttonG, { d: 60 });
      // a mother-of-pearl coat button, lying face up on the floor
      K.disc(0, 0, 11, 3, K.mat('#f4e5ef', { rough: 0.45, metal: 0.05 }), buttonG);
      K.torus(0, 0, 8, 1, K.mat('#d9c6d4', { rough: 0.5 }), buttonG, { z: 1.6 });
      [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach((p) => K.disc(p[0], p[1], 1.6, 1, K.mat('#8f7089', { rough: 0.8 }), buttonG, { z: 1.8 }));
      // lying almost flat, face up and tilted 12 deg toward the room (78 deg over from upright): the rim that touches the ground is
      // 3.8 below its centre (radius 11, 3 thick), and it rests on the rug's top (798) or the floor (800)
      const BTN_LEAN = 78, BTN_DROP = 11 * Math.cos(BTN_LEAN * Math.PI / 180) + 1.5 * Math.sin(BTN_LEAN * Math.PI / 180);
      const BTN_ON_RUG = 798 - BTN_DROP, BTN_ON_FLOOR = 800 - BTN_DROP;
      const placeButton = () => {
        if (st.has('buttonVac')) K.tr(buttonG, { x: 1096, y: BTN_ON_FLOOR, z: -20, rx: BTN_LEAN });
        else K.tr(buttonG, { x: 866, y: BTN_ON_RUG, z: -20, rx: BTN_LEAN });
      };
      placeButton();
      const buttonVisible = () => (st.has('buttonFree') && !st.hasItem('button') && !st.has('buttonDone'));
      buttonG.visible = buttonVisible();

      // ---------- yarn ball ----------
      const yarnG = K.g(main, { z: -30 });
      // a ball of thick yarn: a core wound over and over with fat strands — twenty windings at every angle, each a
      // ring of yarn lying on the ball, so the whole surface reads as wound thread, and one strand trailing loose
      K.sphere(0, 0, 20.5, K.mat('#4f8f80', { rough: 0.95 }), yarnG, { seg: 20 });
      const yarnA = K.mat('#5a9e8f', { rough: 0.95 }), yarnB = K.mat('#4a8878', { rough: 0.95 });
      for (let i = 0; i < 20; i++) {
        const th = (i * 137.5) % 360, tilt = 18 + (i * 53) % 150, off = ((i * 7) % 5 - 2) * 3.2;   // golden-angle spread of windings, some off-centre
        K.torus(0, off, Math.sqrt(22.4 * 22.4 - off * off), 2.3, i % 3 ? yarnA : yarnB, yarnG, { r: th, rx: tilt });
      }
      K.tube([[16, 12, 12], [30, 16, 8], [44, 10, 2], [58, 12, -4], [66, 20, -6]], 2.3, yarnA, yarnG, { seg: 12, radial: 6 });   // the loose end
      K.pad(-30, -30, 90, 60, yarnG, { d: 60 });
      const yarnHome = { x: 980, y: 778 };
      K.tr(yarnG, { x: yarnHome.x, y: yarnHome.y, z: -30 });
      if (st.has('yarnUsed')) yarnG.visible = false;

      // ---------- DUSTY-3000 and the dock ----------
      const dockG = K.g(mid, { z: -160 });
      K.rbox(1150, 740, 200, 60, 120, 10, '#2c313d', dockG);   // long enough that the GO button on its face shows past his body
      K.rbox(1162, 752, 60, 20, 60, 6, '#20242e', dockG, { z: 62 });
      const cleanBtn = K.g(mid, { z: -160 });
      K.disc(1310, 766, 16, 8, K.mat('#67e8a2', { emissive: '#67e8a2', ei: 0.35, rough: 0.5 }), cleanBtn, { z: 62 });
      K.label('GO', { size: 18, color: '#0b2416', x: 1310, y: 766, z: 67, parent: cleanBtn });
      K.pad(1282, 738, 56, 56, cleanBtn, { d: 60, z: 62 });

      const dustyG = K.g(main, { z: -60 });
      const dusty = CH.actors.dusty(dustyG, 1210, 792, 1);
      api.anchor('dusty', dusty.anchor);
      let dustyBusy = false;

      async function dustyRun() {
        if (dustyBusy) return;
        dustyBusy = true;
        api.sfx('ui');
        const hum = CH.audio.loop('vacuum');
        const gen0 = api.gen();
        let sucked = false;
        const watch = api.tick(() => {
          if (sucked || CH.engine._respawning) return;
          if (Math.abs(api.hero.x - dusty.x) < 56 && api.hero.plat === 'floor' && api.hero.attached) {
            sucked = true;
            api.sfx('suck');
            api.respawn();
          }
        });
        const drive = async (toX, dur) => {
          dusty.face(toX < dusty.x ? -1 : 1);
          await CH.tw.to({ v: dusty.x }, { v: toX }, {
            dur, group: 'scene', ease: CH.tw.ease.quadInOut,
            onUpdate: (k, o) => dusty.setPos(o.v),
          });
        };
        await drive(560, 3200);
        if (api.gen() !== gen0) { hum.stop(); return; }
        api.sfx('metal', 0.3);
        await drive(430, 900);
        await drive(620, 900);
        if (!st.has('buttonFree')) {
          st.flag('buttonFree');
          st.flag('buttonVac');
          api.sfx('pop', 1.4);
        }
        await drive(1120, 2400);
        if (st.has('buttonVac')) {
          placeButton();
          buttonG.visible = buttonVisible();
          api.sfx('coin');
        }
        await drive(1210, 900);
        dusty.face(-1);
        hum.stop();
        watch();
        api.sfx('tap');
        dustyBusy = false;
      }

      // ---------- red herrings: an old radio on the mantel + a magazine ----------
      const radioG = K.g(mid, { z: WALL + 84 });
      K.rbox(1480, 352, 92, 48, 50, 8, '#7a5a3c', radioG);
      K.disc(1502, 376, 12, 4, K.mat('#d8cdb4', { rough: 0.6 }), radioG, { z: 26 });
      K.box(1494, 375, 16, 2, 2, '#8a6a42', radioG, { z: 29 });
      K.box(1501, 368, 2, 16, 2, '#8a6a42', radioG, { z: 29 });
      K.rbox(1524, 362, 38, 20, 4, 3, '#4a3a28', radioG, { z: 26 });
      const ant = K.rodX(1560, 1598, 337, 1.5, K.mat('#8a6a42', { metal: 0.6, rough: 0.4 }), radioG, { z: 0 });
      K.tr(ant, { x: 1579, y: 337, r: -52 });
      let radioBusy = false;

      // a fat glossy magazine dropped face-up by the door, bigger than he is: a block of pages ruled along every edge, its top
      // sheets slipped a little askew, and the cover — "Knitting & Cats" — lying flat on top of them
      const MW = 94, MD = 116, MT = 7;
      const magG = K.g(main, { z: -80 });   // behind his line of travel: he rolls past in front of it
      const pageEdge = new T.MeshStandardMaterial({ map: K.canvasTex(64, 32, (ctx, w, h) => {
        ctx.fillStyle = '#efe7d6'; ctx.fillRect(0, 0, w, h);
        for (let i = 1; i < h; i += 4) { ctx.fillStyle = i % 8 === 1 ? 'rgba(110,90,70,0.5)' : 'rgba(110,90,70,0.28)'; ctx.fillRect(0, i, w, 1); }
      }), roughness: 0.9 });
      const pagePlain = K.mat('#efe7d6', { rough: 0.9 });
      const pageMats = [pageEdge, pageEdge, pagePlain, pagePlain, pageEdge, pageEdge];   // ruled on the four edges, plain on top and underneath
      K.box(-MW / 2, -MT + 2, MW, MT - 2, MD, pageMats, magG);
      K.box(-MW / 2 + 1, -MT, MW - 2, 2, MD - 2, pageMats, magG, { ry: 2.5 });   // the top sheets, slipped askew
      const coverTex = K.canvasTex(224, 288, (ctx, w, h) => {
        const F = 'Comfortaa, Nunito, sans-serif';
        ctx.fillStyle = '#f3ecdf'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e2635f'; ctx.fillRect(0, 0, w, 58);   // the masthead
        ctx.fillStyle = '#fff3e2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 30px ' + F; ctx.fillText('KNITTING', w / 2, 22);
        ctx.font = '900 19px ' + F; ctx.fillText('& CATS', w / 2, 45);
        ctx.fillStyle = '#7fa8c9'; ctx.fillRect(12, 70, w - 24, 150);   // the cover photo: a ginger cat asleep among balls of yarn
        ctx.fillStyle = '#5d86a8'; ctx.fillRect(12, 190, w - 24, 30);
        const ball = (x, y, r, c, c2) => {
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
          ctx.strokeStyle = c2; ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x, y, r * 0.95, r * (0.35 + i * 0.25), i * 0.9 - 0.6, 0, 6.29); ctx.stroke(); }
        };
        ball(40, 196, 20, '#4f8f80', '#3b7466'); ball(184, 200, 17, '#c96b8a', '#a4506e'); ball(120, 207, 12, '#e2b04a', '#b8892f');
        ctx.fillStyle = '#e8a256';
        ctx.beginPath(); ctx.ellipse(112, 165, 62, 34, 0, 0, 6.29); ctx.fill();   // body
        ctx.beginPath(); ctx.arc(78, 140, 30, 0, 6.29); ctx.fill();               // head
        ctx.beginPath(); ctx.moveTo(52, 126); ctx.lineTo(56, 98); ctx.lineTo(76, 114); ctx.closePath(); ctx.fill();   // ears
        ctx.beginPath(); ctx.moveTo(80, 114); ctx.lineTo(100, 98); ctx.lineTo(104, 126); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#c9843d'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(168, 172); ctx.quadraticCurveTo(204, 156, 192, 120); ctx.stroke();   // tail
        ctx.strokeStyle = '#b8722f'; ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(126 + i * 12, 140 + i * 2); ctx.lineTo(131 + i * 12, 154 + i * 2); ctx.stroke(); }   // stripes
        ctx.beginPath(); ctx.arc(66, 138, 6, 0.3, 2.85); ctx.stroke(); ctx.beginPath(); ctx.arc(90, 138, 6, 0.3, 2.85); ctx.stroke();   // eyes shut
        ctx.beginPath(); ctx.moveTo(48, 150); ctx.lineTo(20, 146); ctx.moveTo(48, 156); ctx.lineTo(22, 162); ctx.moveTo(108, 150); ctx.lineTo(136, 146); ctx.moveTo(108, 156); ctx.lineTo(134, 162); ctx.stroke();   // whiskers
        ctx.fillStyle = '#d97a70'; ctx.beginPath(); ctx.moveTo(73, 149); ctx.lineTo(83, 149); ctx.lineTo(78, 156); ctx.closePath(); ctx.fill();   // nose
        ctx.fillStyle = '#3a3a3a'; ctx.textAlign = 'left'; ctx.font = '700 13px ' + F;   // the cover lines
        ctx.fillText('SLEEP LIKE A CAT', 14, 240); ctx.fillText('12 SCARVES FOR TAILS', 14, 262);
        ctx.fillStyle = '#e2635f'; ctx.beginPath(); ctx.arc(196, 250, 18, 0, 6.29); ctx.fill();
        ctx.fillStyle = '#fff3e2'; ctx.textAlign = 'center'; ctx.font = '900 12px ' + F; ctx.fillText('NEW', 196, 250);
        ctx.fillStyle = '#222'; for (let i = 0; i < 16; i++) ctx.fillRect(140 + i * 3, 272, i % 3 ? 1 : 2, 12);   // barcode
      });
      coverTex.flipY = false;   // its top at the far edge: upright to whoever looks at it from the room
      const cover = K.g(magG, { x: -MW / 2, y: -MT - 0.6 });   // flat on the pages
      K.hplane(0, MW, 0, -MD / 2, MD / 2, new T.MeshStandardMaterial({ map: coverTex, roughness: 0.38, metalness: 0.04 }), cover, { cast: true });
      K.tr(magG, { x: 292, y: 800, z: -80, ry: -7 });
      K.pad(-MW / 2 - 8, -46, MW + 16, 54, magG, { d: MD + 16 });

      api.hot(radioG, {
        id: 'l.radio',
        near: { x: 1420, plat: 'floor' },
        act: async () => {
          if (radioBusy) return;
          radioBusy = true;
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.tailWhip(1502, 380));
            ctx.sfx('metal', 0.12);
            ctx.sfx('chirp');
            if (cat) { cat.wake(true); }
            await ctx.w(900);
            ctx.sfx('tap');
            if (cat) cat.wake(false);
          }, { cinema: false, skippable: false });
          radioBusy = false;
          await api.think(st.bumpClick('l.radio') % 2 ? 'sd.radio.on' : 'sd.radio.off');
        },
      });
      api.hot(magG, {
        id: 'l.mag',
        near: { x: 380, plat: 'floor' },   // beside it, not standing on it
        act: async () => { await api.think(st.bumpClick('l.mag') % 2 ? 'sd.mag.look' : 'sd.mag.look2'); },
      });

      // ================= hotspots =================

      api.hot(archG, {
        id: 'l.arch',
        near: { x: 150, plat: 'floor' },
        act: async () => {
          await api.cut(async (ctx) => { await ctx.run(api.hero.rollTo(30, () => true)); }, { cinema: false, skippable: false });
          await api.go('hallway', 'fromLiving');
        },
      });

      api.hot(sofaG, {
        id: 'l.sofa',
        near: { x: 480, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('l.sofa');
          await api.think(n % 2 ? 'c2.sofa.look' : 'c2.sofa.look2');
        },
      });

      if (cat) {
        api.hot(cat.el, {
          id: 'l.cat',
          near: { x: 560, plat: 'floor' },
          act: async () => {
            const n = st.bumpClick('l.cat');
            if (n === 1) { await api.think('c2.cat.look'); }
            else if (n === 2) {
              await api.cut(async (ctx) => {
                await ctx.run(api.hero.hopTo(560, 800, { h: 30, dur: 300 }));
                ctx.sfx('meow');
                cat.wake(true);
                await ctx.w(900);
                cat.wake(false);
                await ctx.run(api.hero.hopTo(520, 800, { h: 40, dur: 300 }));
              }, { cinema: false, skippable: false });
              await api.think('c2.cat.poke');
            } else await api.think('c2.cat.leave');
          },
        });
      }

      api.hot(gapZone, {
        id: 'l.gap',
        near: { x: 520, plat: 'floor' },
        act: async () => {
          if (!st.has('buttonFree')) {
            const n = st.bumpClick('l.gap');
            if (n === 1) { await api.think('c2.gap.look'); }
            else { await api.think('c2.gap.look2'); api.toast('c2.gap.toast'); }
          } else if (buttonVisible() && !st.has('buttonVac')) {
            await api.think('c2.gap.freed');
          } else {
            await api.think('c2.gap.empty');
          }
        },
      });

      api.hot(buttonG, {
        id: 'l.button',
        get near() { return { x: st.has('buttonVac') ? 1060 : 900, plat: 'floor' }; },   // read when he goes for it: DUSTY may have moved it since the scene was built
        active: buttonVisible,
        act: async () => {
          api.sfx('coin');
          st.give('button');
          buttonG.visible = false;
          await api.think('c2.button.take');
        },
      });

      api.hot(yarnG, {
        id: 'l.yarn',
        near: { x: 930, plat: 'floor' },
        active: () => !st.has('yarnUsed'),
        act: async () => {
          const n = st.bumpClick('l.yarn');
          if (n === 1) { await api.think('c2.yarn.look'); return; }
          await api.cut(async (ctx) => {
            await ctx.run(api.hero.rollTo(910, () => true));
            api.hero.face(-1);
            await ctx.run(api.hero.tailWhip(960, 770));
            ctx.sfx('boing', 0.8);
            await ctx.tw({ t: 0 }, { t: 1 }, {
              dur: 900, ease: CH.tw.ease.quadOut,
              onUpdate: (k, o) => K.tr(yarnG, { x: U.lerp(980, 560, o.t), y: yarnHome.y, z: U.lerp(-30, -120, o.t), r: -520 * o.t }),
            });
            ctx.sfx('pop', 1.3);
            await ctx.w(300);
            const freesIt = !st.has('buttonFree');   // if DUSTY fetched it already (it lies by the lamp, or is in his pocket) the yarn just goes under: nothing comes out
            st.flag('buttonFree');
            st.flag('yarnUsed');
            if (freesIt) {
              placeButton();
              buttonG.visible = true;
              ctx.sfx('coin');
              await ctx.tw({ t: 0 }, { t: 1 }, {
                dur: 500, ease: CH.tw.ease.quadOut,
                onUpdate: (k, o) => K.tr(buttonG, { x: U.lerp(810, 866, o.t), y: BTN_ON_RUG - Math.sin(o.t * Math.PI) * 60, z: -20, ry: 300 * o.t }),   // it spins on its face like a coin and lands at its resting height, not in the rug
              });
            }
            yarnG.visible = false;
            if (cat) { ctx.sfx('meow'); }
            await ctx.w(200);
          }, { cinema: false, skippable: false });
          await api.think('c2.yarn.shot');
        },
      });

      api.hot(cleanBtn, {
        id: 'l.clean',
        near: { x: 1380, plat: 'floor' },   // round past DUSTY to the button end of the dock, where he covers neither
        act: async () => {
          if (dustyBusy) { await api.think('c2.dusty.busy'); return; }
          const n = st.bumpClick('l.clean');
          if (n === 1) { await api.think('c2.dusty.look'); return; }
          api.hero.face(-1);   // he turns to the dock and slaps its GO button with his tail
          await api.hero.tailWhip(1310, 766);
          api.toast('c2.dusty.warn');
          dustyRun();
        },
      });

      api.hot(dusty.el, {
        id: 'l.dusty',
        near: { x: 1130, plat: 'floor' },
        active: () => !dustyBusy,
        act: async () => { await api.think(st.bumpClick('l.dusty') % 2 ? 'c2.dusty.idle' : 'c2.dusty.idle2'); },
      });

      api.hot(fireG, {
        id: 'l.fire',
        near: { x: 1300, plat: 'floor' },
        act: async () => {
          const n = st.bumpClick('l.fire');
          if (n === 1) await api.think('c2.fire.look');
          else if (n === 2) await api.think('c2.fire.look2');
          else await api.think('c2.fire.look3');
        },
      });

      api.hot(flampG, {
        id: 'l.lamp', near: { x: 1040, plat: 'floor' },
        act: async () => { await api.think('c2.lamp.look'); },
      });
    },

    enter(api) {
      const st = api.state;
      if (!st.has('livingFirst')) {
        st.flag('livingFirst');
        api.cut(async (ctx) => {
          await ctx.w(400);
          await ctx.think('c2.living.first');
          if (!st.has('buttonDone')) {
            await ctx.run(api.hero.lookAround());
            await ctx.think('c2.living.cat');
          }
        }, { cinema: false });
      }
    },
  });
})();
