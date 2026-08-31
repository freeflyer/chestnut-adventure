/* Chestnut Adventure 2.5D — the shared palette and the last two small models that still live here (the
   pigeon and the leaf). Every creature of the cast has moved to its own file under js/game/cast/ (dense
   hand-cut facets, colour patches painted on the same skin), loaded after this file and before actors.js.
   Coordinates are the hero's: y down, the origin under the feet; side-view creatures face LEFT. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U, K = CH.K;
  const T = window.THREE;

  const PAL = {
    ink: '#3a2418', cream: '#f6e3c6', ginger: '#e9a659', gingerDeep: '#c9773a', blush: '#efb9a0',
    plum: '#4a3d52', plumLight: '#5f5068', amber: '#e8b64c', teal: '#5a9e8f', leaf: '#d98e3f', leafRib: '#9c5c22',
    sky: '#5a7ea0', red: '#c9584f', skin: '#efcaa6', white: '#f4efe6', slate: '#3c3648', dove: '#8a8ea0',
  };
  const mat = (c, o) => K.mat(c, Object.assign({ rough: 0.9, sheen: 0.35, sheenColor: '#fff2e0' }, o || {}));
  /** a sculpted silhouette: path d, thickness, colour, with a bevel that rounds it into a cushion */
  const cut = (parent, d, depth, color, o) => {
    o = o || {};
    const m = K.ext(d, depth, typeof color === 'string' ? mat(color, o.m) : color, parent, {
      bevel: o.bevel != null ? o.bevel : Math.min(depth * 0.45, 14), seg: o.seg || 14, x: o.x || 0, y: o.y || 0, z: o.z || 0, r: o.r || 0, ry: o.ry || 0, rx: o.rx || 0, s: o.s, ox: o.ox, oy: o.oy,
    });
    if (o.noShadow) m.castShadow = false;
    return m;
  };
  const stroke = (parent, pts, r, color, o) => {
    const m = K.tube(pts, r, typeof color === 'string' ? mat(color) : color, parent, Object.assign({ radial: 6 }, o || {}));
    m.castShadow = false; return m;
  };
  const bead = (parent, x, y, z, r, color) => { const m = K.sphere(x, y, r, typeof color === 'string' ? K.mat(color, { rough: 0.35 }) : color, parent, { z }); m.castShadow = false; return m; };

  const M = {};

  // ---------------------------------------------------------------- Biscuit
  /** a big ginger cat, loafed up, facing left. asleep unless woken. */
  M.pigeon = function (parent, x, y, z) {
    const g = K.g(parent, { x, y, z: z || 0 });
    cut(g, 'M -26 0 C -34 -12 -26 -34 -4 -36 C 6 -46 20 -44 24 -34 C 28 -26 24 -20 20 -18 C 26 -6 16 2 0 2 L -20 2 Z', 24, PAL.dove, { bevel: 9, seg: 16 });
    cut(g, 'M -18 -22 C -6 -34 12 -30 14 -20 C 6 -12 -10 -12 -18 -22 Z', 8, '#7a7e90', { bevel: 3, z: 12 });   // the folded wing
    cut(g, 'M -24 -8 C -34 -12 -34 -24 -26 -26 C -24 -18 -24 -12 -24 -8 Z', 8, '#7a7e90', { bevel: 3, z: 0 });   // tail
    cut(g, 'M 24 -32 L 34 -29 L 24 -26 Z', 4, '#e0a050', { bevel: 0.8, z: 4 });
    bead(g, 16, -35, 12, 2, '#2c2c38');
    stroke(g, [[-6, 2, 0], [-6, 10, 0]], 1.4, '#e0a050'); stroke(g, [[4, 2, 0], [4, 10, 0]], 1.4, '#e0a050');
    K.pad(-38, -50, 76, 62, g, { d: 40 });
    return g;
  };

  /** a rubber duck, facing right. origin under it. */
  M.leaf = function (parent, o) {
    o = o || {};
    const s = o.s || 1;
    const g = K.g(parent, { x: o.x || 0, y: o.y || 0, z: o.z || 0, r: o.r || 0, rx: o.rx != null ? o.rx : 84, ry: o.ry || 0, s });
    cut(g, 'M 0 -30 C 24 -22 32 4 20 26 C 14 36 -14 36 -20 26 C -32 4 -24 -22 0 -30 Z', 3, PAL.leaf, { bevel: 1.2, seg: 12, m: { side: 'double', rough: 0.85 } });
    stroke(g, [[0, -26, 2.5], [0, 0, 2.5], [0, 30, 2.5]], 1, PAL.leafRib);
    [[-8, -12], [2, -4], [12, 6], [20, 14]].forEach((p) => { stroke(g, [[0, p[0], 2.5], [-11, p[1], 2.5]], 0.7, PAL.leafRib); stroke(g, [[0, p[0], 2.5], [11, p[1], 2.5]], 0.7, PAL.leafRib); });
    K.pad(-30, -34, 60, 70, g, { d: 24 });
    return g;
  };

  /** a toy dinosaur, side view facing right. origin under it. */
  CH.models = M;
})();
