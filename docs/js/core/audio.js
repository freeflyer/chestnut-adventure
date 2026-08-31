/* Chestnut Adventure — all sound is synthesized with Web Audio. No files, no music. */
(function () {
  'use strict';
  const CH = window.CH;
  const U = CH.U;

  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let ambientTimers = [];
  let liveLoops = [];
  let hushFactor = 1; // scene-wide night hush (sneak rooms): everything plays softer
  let dreamOn = false, dreamLP = null; // dream scenes: everything through a gentle lowpass
  let ductOn = false, ductHP = null, ductWet = null; // duct scenes: thin and tinny, with a short metal echo

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = (CH.state && CH.state.settings.sound ? 0.9 : 0) * hushFactor;
      route();
      const len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function route() {
    if (!master || !ctx) return;
    if (!dreamLP) {
      dreamLP = ctx.createBiquadFilter();
      dreamLP.type = 'lowpass'; dreamLP.frequency.value = 1100; dreamLP.Q.value = 0.6;
      dreamLP.connect(ctx.destination);
    }
    if (!ductHP) {
      ductHP = ctx.createBiquadFilter();
      ductHP.type = 'highpass'; ductHP.frequency.value = 320; ductHP.Q.value = 0.7;
      const d = ctx.createDelay(0.5); d.delayTime.value = 0.082;
      const fb = ctx.createGain(); fb.gain.value = 0.36;
      ductWet = ctx.createGain(); ductWet.gain.value = 0.3;
      ductHP.connect(ctx.destination);
      ductHP.connect(d); d.connect(fb); fb.connect(d); d.connect(ductWet); ductWet.connect(ctx.destination);
    }
    try { master.disconnect(); } catch (e) {}
    master.connect(dreamOn ? dreamLP : ductOn ? ductHP : ctx.destination);
  }
  function soundOn() { return CH.state ? !!CH.state.settings.sound : true; }

  // ---- tiny builder helpers ------------------------------------------------
  function osc(type, freq) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; return o; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v != null ? v : 1; return g; }
  function noise() { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; }
  function filt(type, f, q) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; }
  function chain() { for (let i = 0; i < arguments.length - 1; i++) arguments[i].connect(arguments[i + 1]); return arguments[arguments.length - 1]; }
  /** simple attack/decay envelope on a gain node */
  function env(g, t0, a, d, peak, tail) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(tail || 0.0001, t0 + a + d);
  }
  function bend(param, t0, from, to, dur) {
    param.setValueAtTime(from, t0);
    param.exponentialRampToValueAtTime(Math.max(0.01, to), t0 + dur);
  }

  // ---- one-shot sfx library ------------------------------------------------
  const LIB = {
    ui(t) { const o = osc('triangle', 660), g = gain(); env(g, t, 0.004, 0.07, 0.25); chain(o, g, master); o.start(t); o.stop(t + 0.1); },

    pop(t, p) {
      const o = osc('sine', 300 * (p || 1)), g = gain(); bend(o.frequency, t, 300 * (p || 1), 90, 0.12);
      env(g, t, 0.003, 0.13, 0.5); chain(o, g, master); o.start(t); o.stop(t + 0.16);
      const n = noise(), f = filt('bandpass', 1800, 2), ng = gain(); env(ng, t, 0.002, 0.05, 0.25);
      chain(n, f, ng, master); n.start(t); n.stop(t + 0.07);
    },

    crack(t) {
      for (let i = 0; i < 4; i++) {
        const tt = t + i * 0.09 + Math.random() * 0.03;
        const n = noise(), f = filt('highpass', 1400 + i * 500, 1.5), g = gain();
        env(g, tt, 0.001, 0.045, 0.5 - i * 0.07);
        chain(n, f, g, master); n.start(tt); n.stop(tt + 0.06);
      }
    },

    /** hero voice blip; p in ~0.7..1.6, vol scales the peak (whispering) */
    squeak(t, p, vol) {
      p = p || 1;
      const o = osc('triangle', 500 * p), g = gain();
      o.frequency.setValueAtTime(420 * p, t);
      o.frequency.exponentialRampToValueAtTime(760 * p, t + 0.06);
      o.frequency.exponentialRampToValueAtTime(500 * p, t + 0.12);
      env(g, t, 0.008, 0.13, 0.22 * (vol || 1));
      chain(o, g, master); o.start(t); o.stop(t + 0.16);
    },

    sad(t) {
      const o = osc('triangle', 500), g = gain();
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(240, t + 0.35);
      env(g, t, 0.01, 0.4, 0.22);
      chain(o, g, master); o.start(t); o.stop(t + 0.45);
    },

    boing(t, p) {
      p = p || 1;
      const o = osc('sine', 220 * p), g = gain();
      o.frequency.setValueAtTime(260 * p, t);
      o.frequency.exponentialRampToValueAtTime(90 * p, t + 0.28);
      const lfo = osc('sine', 16), lg = gain(30); chain(lfo, lg); lg.connect(o.frequency);
      env(g, t, 0.005, 0.3, 0.45);
      chain(o, g, master); o.start(t); o.stop(t + 0.34); lfo.start(t); lfo.stop(t + 0.34);
    },

    thud(t, big) {
      const o = osc('sine', 110), g = gain(); bend(o.frequency, t, big ? 130 : 110, 38, 0.14);
      env(g, t, 0.004, big ? 0.22 : 0.15, big ? 0.9 : 0.55);
      chain(o, g, master); o.start(t); o.stop(t + 0.26);
      const n = noise(), f = filt('lowpass', 300, 1), ng = gain(); env(ng, t, 0.002, 0.08, big ? 0.5 : 0.3);
      chain(n, f, ng, master); n.start(t); n.stop(t + 0.1);
    },

    tap(t) { const o = osc('sine', 340), g = gain(); env(g, t, 0.003, 0.06, 0.3); chain(o, g, master); o.start(t); o.stop(t + 0.08); },

    tick(t) {
      LIB._tickAlt = !LIB._tickAlt;
      const o = osc('sine', LIB._tickAlt ? 1350 : 1150), g = gain(), f = filt('bandpass', 1800, 5);
      env(g, t, 0.001, 0.05, 0.07);
      chain(o, f, g, master); o.start(t); o.stop(t + 0.06);
    },

    coin(t) {
      [2000, 2600].forEach((f, i) => {
        const o = osc('sine', f), g = gain(); env(g, t + i * 0.03, 0.004, 0.5, 0.18);
        chain(o, g, master); o.start(t + i * 0.03); o.stop(t + 0.6);
      });
    },

    metal(t, len) {
      const o = osc('sawtooth', 900), g = gain(), f = filt('bandpass', 1300, 8);
      o.frequency.setValueAtTime(750, t);
      o.frequency.linearRampToValueAtTime(1150, t + (len || 0.25));
      env(g, t, 0.02, (len || 0.25) + 0.05, 0.12);
      chain(o, f, g, master); o.start(t); o.stop(t + (len || 0.25) + 0.1);
    },

    screw(t) { for (let i = 0; i < 3; i++) LIB.metal(t + i * 0.22, 0.12); },

    slide(t, up) {
      const n = noise(), f = filt('bandpass', up ? 400 : 1200, 1.6), g = gain();
      bend(f.frequency, t, up ? 400 : 1400, up ? 1400 : 350, 0.35);
      env(g, t, 0.02, 0.38, 0.3);
      chain(n, f, g, master); n.start(t); n.stop(t + 0.45);
    },

    suck(t) {
      const n = noise(), f = filt('bandpass', 300, 3), g = gain();
      bend(f.frequency, t, 300, 2600, 0.5);
      env(g, t, 0.05, 0.5, 0.5);
      chain(n, f, g, master); n.start(t); n.stop(t + 0.6);
      const o = osc('sine', 200), og = gain(); bend(o.frequency, t, 200, 900, 0.5);
      env(og, t, 0.05, 0.5, 0.2); chain(o, og, master); o.start(t); o.stop(t + 0.6);
    },

    meow(t) {
      const o = osc('triangle', 420), g = gain(), f = filt('bandpass', 900, 1.5);
      o.frequency.setValueAtTime(380, t);
      o.frequency.linearRampToValueAtTime(720, t + 0.18);
      o.frequency.linearRampToValueAtTime(300, t + 0.5);
      const v = osc('sine', 7), vg = gain(18); chain(v, vg); vg.connect(o.frequency);
      env(g, t, 0.05, 0.5, 0.3);
      chain(o, f, g, master); o.start(t); o.stop(t + 0.55); v.start(t); v.stop(t + 0.55);
    },

    chirp(t) {
      for (let i = 0; i < 2; i++) {
        const tt = t + i * 0.14;
        const o = osc('sine', 2300), g = gain();
        o.frequency.setValueAtTime(2100, tt);
        o.frequency.exponentialRampToValueAtTime(3100, tt + 0.05);
        o.frequency.exponentialRampToValueAtTime(1900, tt + 0.11);
        env(g, tt, 0.005, 0.12, 0.14);
        chain(o, g, master); o.start(tt); o.stop(tt + 0.14);
      }
    },

    /** the house breathing through its ducts: a slow swell of filtered air — the throat opens on
        the way in, a held beat, then a longer, softer way out with a thin hiss through the grate.
        opt: { inhale, hold, exhale } seconds, level 0..1. Nothing about it repeats exactly. */
    breath(t, opt) {
      t += 0.06; // a little lookahead: a curve scheduled in the past gets clamped forward and then collides with the next event
      const o = Object.assign({ inhale: 2.0, hold: 0.5, exhale: 3.2, level: 0.12 }, opt || {});
      const tIn = t + o.inhale, tHold = tIn + o.hold, tEnd = tHold + o.exhale;
      const n = noise(), f = filt('lowpass', 600, 0.6), g = gain(0.0001);
      f.frequency.setValueAtTime(420, t);
      f.frequency.linearRampToValueAtTime(1500, tIn);
      f.frequency.setValueAtTime(1500, tHold);
      f.frequency.exponentialRampToValueAtTime(380, tEnd);
      const inCurve = new Float32Array(32), outCurve = new Float32Array(64);
      for (let i = 0; i < 32; i++) { const u = i / 31; inCurve[i] = 0.0001 + o.level * (u * u * (3 - 2 * u)); }
      for (let i = 0; i < 64; i++) {
        const u = i / 63;
        const swell = Math.sin(Math.min(1, u * 4) * Math.PI / 2); // a soft push at the start of the exhale
        outCurve[i] = 0.0001 + o.level * (0.8 + 0.35 * swell) * Math.pow(1 - u, 2.2);
      }
      g.gain.setValueCurveAtTime(inCurve, t, o.inhale);
      g.gain.setValueAtTime(o.level, tIn);
      g.gain.linearRampToValueAtTime(o.level * 0.8, tHold);
      g.gain.setValueCurveAtTime(outCurve, tHold, o.exhale);
      chain(n, f, g, master); n.start(t); n.stop(tEnd + 0.1);
      // air through the grate, on the way out only
      const h = noise(), hf = filt('bandpass', 1900, 1.2), hg = gain(0.0001);
      hg.gain.setValueAtTime(0.0001, tHold);
      hg.gain.linearRampToValueAtTime(o.level * 0.35, tHold + o.exhale * 0.3);
      hg.gain.exponentialRampToValueAtTime(0.0001, tEnd);
      chain(h, hf, hg, master); h.start(tHold); h.stop(tEnd + 0.1);
    },

    swoosh(t) {
      const n = noise(), f = filt('bandpass', 500, 1), g = gain();
      bend(f.frequency, t, 380, 1800, 0.3); bend(f.frequency, t + 0.3, 1800, 500, 0.25);
      env(g, t, 0.08, 0.5, 0.4);
      chain(n, f, g, master); n.start(t); n.stop(t + 0.6);
    },

    drip(t) {
      const o = osc('sine', 900), g = gain();
      bend(o.frequency, t, 1100, 500, 0.09);
      env(g, t, 0.003, 0.1, 0.25);
      const o2 = osc('sine', 700), g2 = gain();
      bend(o2.frequency, t + 0.12, 500, 900, 0.08);
      env(g2, t + 0.12, 0.004, 0.1, 0.12);
      chain(o, g, master); chain(o2, g2, master);
      o.start(t); o.stop(t + 0.12); o2.start(t + 0.12); o2.stop(t + 0.24);
    },

    splash(t) {
      const n = noise(), f = filt('lowpass', 900, 0.8), g = gain();
      env(g, t, 0.01, 0.3, 0.5);
      chain(n, f, g, master); n.start(t); n.stop(t + 0.35);
      for (let i = 0; i < 3; i++) LIB.drip(t + 0.15 + i * 0.1);
    },

    spring(t) {
      const o = osc('sine', 400), g = gain();
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(900, t + 0.09);
      o.frequency.exponentialRampToValueAtTime(500, t + 0.22);
      const lfo = osc('sine', 22), lg = gain(60); chain(lfo, lg); lg.connect(o.frequency);
      env(g, t, 0.004, 0.3, 0.4);
      chain(o, g, master); o.start(t); o.stop(t + 0.35); lfo.start(t); lfo.stop(t + 0.35);
    },

    paper(t) {
      const n = noise(), f = filt('highpass', 2200, 0.8), g = gain();
      env(g, t, 0.01, 0.14, 0.18);
      chain(n, f, g, master); n.start(t); n.stop(t + 0.16);
    },

    /** tiptoe whisper — the hushed rustle of very careful movement */
    rustle(t) {
      const n = noise(), f = filt('highpass', 2800, 0.6), g = gain();
      env(g, t, 0.02, 0.17, 0.045);
      chain(n, f, g, master); n.start(t); n.stop(t + 0.22);
    },

    /** dream-float: a soft rising glide with a breath of air */
    float(t) {
      const o = osc('sine', 380), g = gain();
      o.frequency.setValueAtTime(380, t);
      o.frequency.exponentialRampToValueAtTime(760, t + 0.55);
      env(g, t, 0.08, 0.6, 0.07);
      chain(o, g, master); o.start(t); o.stop(t + 0.75);
      const nz = noise(), f = filt('bandpass', 1800, 0.8), g2 = gain();
      env(g2, t, 0.12, 0.5, 0.035);
      chain(nz, f, g2, master); nz.start(t); nz.stop(t + 0.7);
    },

    doorThud(t) {
      LIB.thud(t, true);
      const o = osc('square', 60), g = gain(), f = filt('lowpass', 200, 1);
      env(g, t + 0.05, 0.01, 0.3, 0.2);
      chain(o, f, g, master); o.start(t + 0.05); o.stop(t + 0.4);
    },

    bell(t) {
      const o = osc('sine', 620), g = gain();
      const o2 = osc('sine', 930), g2 = gain();
      env(g, t, 0.005, 1.4, 0.25); env(g2, t, 0.005, 0.9, 0.08);
      chain(o, g, master); chain(o2, g2, master);
      o.start(t); o.stop(t + 1.5); o2.start(t); o2.stop(t + 1);
    },

    pluck(t, p) {
      const o = osc('triangle', 500 * (p || 1)), g = gain(), f = filt('lowpass', 2200, 1);
      env(g, t, 0.002, 0.35, 0.3);
      chain(o, f, g, master); o.start(t); o.stop(t + 0.4);
    },

    grow(t) {
      const n = noise(), f = filt('bandpass', 300, 2), g = gain();
      bend(f.frequency, t, 250, 3400, 2.4);
      env(g, t, 0.6, 2.6, 0.25);
      chain(n, f, g, master); n.start(t); n.stop(t + 3.4);
      const o = osc('sine', 160), og = gain();
      bend(o.frequency, t, 140, 520, 2.6);
      env(og, t, 0.7, 2.6, 0.14);
      chain(o, og, master); o.start(t); o.stop(t + 3.4);
    },
  };

  // ---- loops ---------------------------------------------------------------
  const LOOPS = {
    roll() {
      const n = noise(), f = filt('bandpass', 260, 1.2), g = gain(0.0001);
      const lfo = osc('sine', 9), lg = gain(90); chain(lfo, lg); lg.connect(f.frequency);
      chain(n, f, g, master); n.start(); lfo.start();
      return {
        set(speed) { g.gain.setTargetAtTime(0.16 * U.clamp(speed, 0, 1.4), ctx.currentTime, 0.06); },
        stop() { g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08); setTimeout(() => { try { n.stop(); lfo.stop(); } catch (e) {} }, 300); },
      };
    },
    vacuum() {
      const o = osc('sawtooth', 58), f = filt('lowpass', 240, 1), g = gain(0.0001);
      const n = noise(), nf = filt('bandpass', 800, 0.8), ng = gain(0.0001);
      chain(o, f, g, master); chain(n, nf, ng, master);
      o.start(); n.start();
      g.gain.setTargetAtTime(0.14, ctx.currentTime, 0.2);
      ng.gain.setTargetAtTime(0.05, ctx.currentTime, 0.2);
      return {
        set() {},
        stop() {
          g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
          ng.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
          setTimeout(() => { try { o.stop(); n.stop(); } catch (e) {} }, 500);
        },
      };
    },
    purr() {
      // a sleeping cat, not a motor: every breath is its own length and loudness,
      // quiet spells come and go, and now and then the purr genuinely stalls
      const o = osc('sawtooth', 24), f = filt('lowpass', 100, 1.5), g = gain(0.0001);
      const trem = osc('sine', 7.3), tg = gain(0.011); chain(trem, tg); tg.connect(g.gain);
      chain(o, f, g, master); o.start(); trem.start();
      let stopped = false, mood = 1;
      const timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));
      const breathe = () => {
        if (stopped) return;
        const t = ctx.currentTime;
        // …sometimes the purr just stalls for a moment
        if (Math.random() < 0.16) {
          g.gain.cancelScheduledValues(t);
          g.gain.setTargetAtTime(0.0015, t, 0.22);
          later(breathe, 700 + Math.random() * 1500);
          return;
        }
        // …and sometimes the cat drifts into a softer (or fuller) spell
        if (Math.random() < 0.22) mood = 0.5 + Math.random() * 0.6;
        const dur = 1.7 + Math.random() * 1.4;
        const peak = (0.05 + Math.random() * 0.045) * mood;
        const dip = 0.003 + Math.random() * 0.006;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(Math.max(0.002, g.gain.value), t);
        g.gain.linearRampToValueAtTime(peak, t + dur * 0.35);
        g.gain.linearRampToValueAtTime(peak * 0.72, t + dur * 0.55);
        g.gain.linearRampToValueAtTime(dip, t + dur);
        // the in-breath leans the pitch up a touch
        o.frequency.cancelScheduledValues(t);
        o.frequency.setValueAtTime(23 + Math.random() * 1.5, t);
        o.frequency.linearRampToValueAtTime(25.5 + Math.random() * 2, t + dur * 0.4);
        o.frequency.linearRampToValueAtTime(23.5, t + dur);
        later(breathe, dur * 1000 + Math.random() * 300);
      };
      breathe();
      return {
        set() {},
        stop() {
          stopped = true;
          timers.forEach(clearTimeout);
          g.gain.cancelScheduledValues(ctx.currentTime);
          g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
          setTimeout(() => { [o, trem].forEach((x) => { try { x.stop(); } catch (e) {} }); }, 900);
        },
      };
    },
    rain() {
      const n = noise(), f = filt('highpass', 1500, 0.6), g = gain(0.0001);
      chain(n, f, g, master); n.start();
      g.gain.setTargetAtTime(0.09, ctx.currentTime, 1.2);
      return { set(v) { g.gain.setTargetAtTime(v, ctx.currentTime, 0.5); }, stop() { g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6); setTimeout(() => { try { n.stop(); } catch (e) {} }, 1500); } };
    },
    /** three independent bee voices — a soft, peaceful summer hum */
    bees() {
      const voices = [];
      for (let i = 0; i < 3; i++) {
        const o = osc('triangle', 152 + i * 18), f = filt('lowpass', 520, 1), g = gain(0.0001);
        const vib = osc('sine', 4.2 + i * 0.7), vg = gain(9); chain(vib, vg); vg.connect(o.frequency);
        const drift = osc('sine', 0.5 + i * 0.22), dg = gain(7); chain(drift, dg); dg.connect(o.frequency);
        chain(o, f, g, master); o.start(); vib.start(); drift.start();
        voices.push({ o, g, vib, drift });
      }
      return {
        voice(i, vol) {
          const vc = voices[i];
          if (vc) vc.g.gain.setTargetAtTime(Math.max(0.0001, vol), ctx.currentTime, 0.09);
        },
        stop() {
          voices.forEach((vc) => {
            vc.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
            setTimeout(() => { try { vc.o.stop(); vc.vib.stop(); vc.drift.stop(); } catch (e) {} }, 1600);
          });
        },
      };
    },
    /** the night outside the wall: a quiet wind the scene drives with its gusts — set(v), v in 0..1 */
    breeze() {
      const n = noise(), f = filt('bandpass', 380, 0.6), g = gain(0.0001);
      chain(n, f, g, master); n.start();
      return {
        set(v) { const t = ctx.currentTime; g.gain.setTargetAtTime(0.004 + v * 0.045, t, 0.35); f.frequency.setTargetAtTime(320 + v * 420, t, 0.4); },
        stop() { g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.8); setTimeout(() => { try { n.stop(); } catch (e) {} }, 2000); },
      };
    },
    wind() {
      const n = noise(), f = filt('bandpass', 400, 0.5), g = gain(0.0001);
      const lfo = osc('sine', 0.16), lg = gain(150); chain(lfo, lg); lg.connect(f.frequency);
      chain(n, f, g, master); n.start(); lfo.start();
      g.gain.setTargetAtTime(0.05, ctx.currentTime, 1.5);
      return { set() {}, stop() { g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.8); setTimeout(() => { try { n.stop(); lfo.stop(); } catch (e) {} }, 2000); } };
    },
  };

  CH.audio = {
    unlock() { ensure(); },

    sfx(name, opt) {
      if (!soundOn()) return;
      if (!ensure()) return;
      const fn = LIB[name];
      if (!fn) { console.warn('no sfx', name); return; }
      try { fn(ctx.currentTime + 0.001, opt); } catch (e) { console.warn('sfx fail', name, e); }
    },

    /** hero speech: series of squeaks matching text length.
        Under a night hush it turns into a short, breathy whisper. */
    blips(len) {
      if (!soundOn() || !ensure()) return;
      const hushed = hushFactor < 0.6;
      const n = hushed ? 2 : U.clamp(Math.round(len / 14), 2, 6);
      for (let i = 0; i < n; i++) {
        try {
          LIB.squeak(ctx.currentTime + 0.02 + i * (hushed ? 0.2 : 0.14),
            U.rand(0.85, 1.3) * (hushed ? 0.78 : 1), hushed ? 0.35 : 1);
        } catch (e) {}
      }
    },

    loop(name) {
      if (!soundOn() || !ensure()) return { set() {}, stop() {} };
      try {
        const h = LOOPS[name]();
        liveLoops.push(h);
        return h;
      } catch (e) { return { set() {}, stop() {} }; }
    },

    /** ambient one-shots on random intervals; returns nothing — cleared via stopAmbient */
    ambient(list) {
      list.forEach((item) => {
        const tickOnce = () => {
          const delay = U.rand(item.every[0], item.every[1]);
          const id = setTimeout(() => {
            if (soundOn() && ctx) { try { LIB[item.name](ctx.currentTime, item.opt); } catch (e) {} }
            tickOnce();
          }, delay);
          ambientTimers.push(id);
        };
        tickOnce();
      });
    },

    stopAmbient() {
      ambientTimers.forEach((id) => clearTimeout(id));
      ambientTimers = [];
    },

    stopLoops() {
      liveLoops.forEach((h) => { try { h.stop(); } catch (e) {} });
      liveLoops = [];
    },

    applyVolume() {
      if (master) master.gain.setTargetAtTime((soundOn() ? 0.9 : 0) * hushFactor, ctx.currentTime, 0.1);
    },

    /** scene-wide hush: 1 = normal, ~0.3 = a room where someone is asleep */
    setHush(f) {
      hushFactor = f;
      if (master && ctx) master.gain.setTargetAtTime((soundOn() ? 0.9 : 0) * hushFactor, ctx.currentTime, 0.25);
    },

    /** dream scenes: everything sounds underwater-soft */
    setDream(on) {
      dreamOn = !!on;
      route();
    },
    setDuct(on) {
      ductOn = !!on;
      route();
    },
    isDuct() { return ductOn; },

    /** debug tap for tests: the live context and master bus */
    _tap() { return { ctx, master, hush: () => hushFactor }; },
  };
})();
