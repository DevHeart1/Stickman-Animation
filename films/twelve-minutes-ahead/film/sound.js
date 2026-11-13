/* TWELVE MINUTES AHEAD — the sound engine. Everything is synthesised (Web Audio, rendered offline per sequence for export).
   Beds: hum, tick {rate}, city, wind, drone {f, level, bright}, pulse {bpm, f}, heartbeat {bpm}, static, siren, tinnitus, pad {notes}.
   Cues: buzz {n}, ring {n}, click, key {n}, beep {n}, alarm {n}, radio_on, radio_off, crash, screech, horn, glitch {dur}, reset,
   whiteout {dur}, rewind {dur}, hit {f, decay}, riser {dur}, sting, thud {n, gap}, shatter, splash, confirm, shutdown, piano {notes, gap},
   swell {notes, dur}, whoosh {dur}, breath, ui. Unknown names play a soft tick so a sequence can name a sound before it exists.
   S.silence(t0, t1) drops the world out completely: the film's resets and its three silences. */
(function (G) {
  'use strict';
  const SOUND = G.SOUND = { cues: {}, beds: {} };
  const db = d => Math.pow(10, d / 20); SOUND.db = db;
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const nb = {};
  function noise(ac, secs, colour) {
    const key = colour + secs + ac.sampleRate; if (nb[key] && nb[key].ac === ac) return nb[key].b;
    const n = Math.max(1, Math.ceil(secs * ac.sampleRate)), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); const R = G.OTM.rng('n' + colour);
    let last = 0, p = [0, 0, 0]; for (let i = 0; i < n; i++) { const w = R() * 2 - 1; if (colour === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else if (colour === 'pink') { p[0] = 0.99765 * p[0] + w * 0.099; p[1] = 0.963 * p[1] + w * 0.2965; p[2] = 0.57 * p[2] + w * 1.0527; d[i] = (p[0] + p[1] + p[2] + w * 0.1848) * 0.2; } else d[i] = w; }
    nb[key] = { ac, b }; return b;
  }
  const src = (ac, buf, loop) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = !!loop; return s; };
  const filt = (ac, type, f, q) => { const x = ac.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q != null) x.Q.value = q; return x; };
  const gain = (ac, v) => { const g = ac.createGain(); g.gain.value = v; return g; };
  const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };
  function env(g, t0, t1, level, fi, fo) { const p = g.gain; fi = fi == null ? 0.6 : fi; fo = fo == null ? 0.8 : fo; p.setValueAtTime(0, t0); p.linearRampToValueAtTime(level, t0 + fi); p.setValueAtTime(level, Math.max(t0 + fi, t1 - fo)); p.linearRampToValueAtTime(0, t1); }
  function tone(ac, out, t, f, dur, level, type, att) { const o = ac.createOscillator(); o.type = type || 'sine'; o.frequency.value = f; const g = gain(ac, 0); chain(o, g, out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + (att || 0.006)); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); o.start(t); o.stop(t + dur + 0.05); return o; }
  function burst(ac, out, t, dur, f, q, level, type) { const s = src(ac, noise(ac, 3, 'white'), true); const fl = filt(ac, type || 'bandpass', f, q || 1.2); const g = gain(ac, 0); chain(s, fl, g, out); g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); s.start(t, (t * 7.3) % 2); s.stop(t + dur + 0.05); return fl; }
  function sweep(ac, out, t, dur, f0, f1, level, type) { const o = ac.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); const g = gain(ac, 0); chain(o, g, out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + dur * 0.15); g.gain.linearRampToValueAtTime(0, t + dur); o.start(t); o.stop(t + dur + 0.05); }

  function buses(ac) {
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2; comp.connect(ac.destination);
    const master = gain(ac, 0.9); master.connect(comp);
    // a short room reverb for the world
    const rv = ac.createConvolver(); { const n = Math.floor(ac.sampleRate * 1.8), b = ac.createBuffer(2, n, ac.sampleRate); const R = G.OTM.rng('rev'); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / n, 3); } rv.buffer = b; }
    const rvg = gain(ac, 0.22); chain(rv, rvg, master);
    const world = gain(ac, 1); world.connect(master); world.connect(rv);
    const score = gain(ac, 1); score.connect(master); score.connect(rv);
    // the radio: band-limited and a little crunchy
    const radio = gain(ac, 1); const hp = filt(ac, 'highpass', 400, 0.7), lp = filt(ac, 'lowpass', 3000, 0.9);
    const sh = ac.createWaveShaper(); const k = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; k[i] = Math.tanh(2.2 * x) / Math.tanh(2.2); } sh.curve = k; chain(radio, hp, lp, sh, world);
    return { master, world, score, radio };
  }

  // ---------- beds (ac, B, t0, t1, p) ----------
  const L = (p, d) => db(p.level != null ? p.level : d);
  const nbed = (colour, type, f, q, lv, bus) => (ac, B, t0, t1, p) => { const s = src(ac, noise(ac, 4, colour), true); const fl = filt(ac, type, p.f || f, q); const g = gain(ac, 0); chain(s, fl, g, B[bus || 'world']); env(g, t0, t1, L(p, lv), p.fi, p.fo); s.start(t0, (t0 * 3.1) % 3); s.stop(t1 + 0.1); };
  const BD = SOUND.beds;
  BD.hum = (ac, B, t0, t1, p) => { nbed('pink', 'lowpass', 900, 0.5, (p.level || -34) - 4)(ac, B, t0, t1, p); [50, 100, 150].forEach((f, i) => { const o = ac.createOscillator(); o.frequency.value = f; const g = gain(ac, 0); chain(o, g, B.world); env(g, t0, t1, L(p, -34) * [0.5, 0.3, 0.12][i], p.fi, p.fo); o.start(t0); o.stop(t1 + 0.1); }); };
  BD.tick = (ac, B, t0, t1, p) => { const rate = p.rate || 1; let k = 0; for (let t = Math.ceil(t0 * rate) / rate; t < t1; t += 1 / rate, k++) { burst(ac, B.world, t, 0.035, k % 2 ? 2800 : 3400, 6, L(p, -22)); tone(ac, B.world, t, k % 2 ? 1900 : 2200, 0.03, L(p, -22) * 0.3, 'square'); } };
  BD.city = nbed('brown', 'lowpass', 520, 0.6, -32);
  BD.wind = (ac, B, t0, t1, p) => { const s = src(ac, noise(ac, 4, 'pink'), true); const fl = filt(ac, 'bandpass', 500, 0.8); const lfo = ac.createOscillator(); lfo.frequency.value = 0.13; const lg = gain(ac, 260); chain(lfo, lg, fl.frequency); const g = gain(ac, 0); chain(s, fl, g, B.world); env(g, t0, t1, L(p, -30), p.fi || 1.5, p.fo || 1.5); s.start(t0); s.stop(t1 + 0.1); lfo.start(t0); lfo.stop(t1 + 0.1); };
  BD.static = nbed('white', 'bandpass', 2400, 0.6, -38);
  BD.drone = (ac, B, t0, t1, p) => {
    const f = p.f || 55; const out = gain(ac, 0); env(out, t0, t1, L(p, -24), p.fi == null ? 2 : p.fi, p.fo == null ? 2 : p.fo);
    const lp = filt(ac, 'lowpass', p.bright || 420, 1.2); const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lg = gain(ac, (p.bright || 420) * 0.4); chain(lfo, lg, lp.frequency); lfo.start(t0); lfo.stop(t1 + 0.1);
    chain(lp, out, B.score);
    [[1, -6], [1.005, 7], [1.5, 0], [2, -4]].forEach(([m, det], i) => { const o = ac.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'triangle'; o.frequency.value = f * m; o.detune.value = det; const g = gain(ac, [0.5, 0.5, 0.22, 0.15][i]); chain(o, g, lp); o.start(t0); o.stop(t1 + 0.1); });
  };
  BD.pulse = (ac, B, t0, t1, p) => { const bpm = p.bpm || 112, f = p.f || 55; const gap = 60 / bpm; let k = 0; for (let t = t0; t < t1; t += gap, k++) { const acc = 1 + 0.15 * Math.min(1, (t - t0) / Math.max(1, t1 - t0)); const o = ac.createOscillator(); o.frequency.setValueAtTime(f * 2.2, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.09); const g = gain(ac, 0); chain(o, g, B.score); g.gain.setValueAtTime(L(p, -18) * acc, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.35); o.start(t); o.stop(t + 0.4); if (p.hat && k % 2) burst(ac, B.score, t + gap / 2, 0.05, 7000, 1, L(p, -18) * 0.25, 'highpass'); } };
  BD.heartbeat = (ac, B, t0, t1, p) => { const gap = 60 / (p.bpm || 72); for (let t = t0; t < t1; t += gap) { [0, 0.24].forEach((d, i) => { const o = ac.createOscillator(); o.frequency.setValueAtTime(70, t + d); o.frequency.exponentialRampToValueAtTime(38, t + d + 0.12); const g = gain(ac, 0); chain(o, g, B.score); g.gain.setValueAtTime(L(p, -16) * (i ? 0.6 : 1), t + d); g.gain.exponentialRampToValueAtTime(0.0005, t + d + 0.28); o.start(t + d); o.stop(t + d + 0.3); }); } };
  BD.siren = (ac, B, t0, t1, p) => { const o = ac.createOscillator(); o.type = 'triangle'; const g = gain(ac, 0); const lp = filt(ac, 'lowpass', 2200); chain(o, lp, g, B.world); env(g, t0, t1, L(p, -34), 1.5, 1.5); for (let t = t0; t < t1; t += 1.2) { o.frequency.setValueAtTime(p.lo || 700, t); o.frequency.setValueAtTime(p.hi || 940, t + 0.6); } o.start(t0); o.stop(t1 + 0.1); };
  BD.tinnitus = (ac, B, t0, t1, p) => { const o = ac.createOscillator(); o.frequency.value = p.f || 6800; const g = gain(ac, 0); chain(o, g, B.master); env(g, t0, t1, L(p, -40), p.fi || 2, p.fo || 0.5); o.start(t0); o.stop(t1 + 0.1); };
  BD.pad = (ac, B, t0, t1, p) => { const notes = p.notes || [57, 64, 69, 72]; const out = gain(ac, 0); env(out, t0, t1, L(p, -26), p.fi || 3, p.fo || 3); const lp = filt(ac, 'lowpass', p.bright || 1400, 0.5); chain(lp, out, B.score); notes.forEach((n, i) => { [-5, 5].forEach(det => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(n); o.detune.value = det; const g = gain(ac, 0.12); chain(o, g, lp); o.start(t0); o.stop(t1 + 0.1); }); }); };

  // ---------- cues (ac, B, t, p) ----------
  const C = SOUND.cues; const lv = (p, d) => L(p, d);
  C.buzz = (ac, B, t, p) => { for (let i = 0; i < (p.n || 2); i++) { const s = ac.createOscillator(); s.type = 'square'; s.frequency.value = 160; const fl = filt(ac, 'lowpass', 400); const g = gain(ac, 0); chain(s, fl, g, B.world); const a = t + i * 0.9; g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(lv(p, -20), a + 0.02); g.gain.setValueAtTime(lv(p, -20), a + 0.42); g.gain.linearRampToValueAtTime(0, a + 0.46); s.start(a); s.stop(a + 0.5); } };
  C.ring = (ac, B, t, p) => { for (let r = 0; r < (p.n || 1); r++) [76, 79, 83, 79].forEach((n, i) => tone(ac, B.world, t + r * 1.6 + i * 0.16, NOTE(n), 0.3, lv(p, -24), 'triangle')); };
  C.click = (ac, B, t, p) => burst(ac, B.world, t, 0.03, 3200, 2, lv(p, -18));
  C.key = (ac, B, t, p) => { const R = G.OTM.rng('k' + t); for (let i = 0; i < (p.n || 8); i++) burst(ac, B.world, t + i * (p.gap || 0.11) + R() * 0.04, 0.025, 2200 + R() * 1800, 3, lv(p, -22)); };
  C.beep = (ac, B, t, p) => { for (let i = 0; i < (p.n || 2); i++) tone(ac, B.world, t + i * 0.16, p.f || 1760, 0.1, lv(p, -22), 'square'); };
  C.ui = (ac, B, t, p) => { tone(ac, B.world, t, 1320, 0.12, lv(p, -26), 'sine'); tone(ac, B.world, t + 0.07, 1980, 0.18, lv(p, -28), 'sine'); };
  C.alarm = (ac, B, t, p) => { for (let i = 0; i < (p.n || 4); i++) { tone(ac, B.world, t + i * 0.5, 880, 0.22, lv(p, -20), 'square'); tone(ac, B.world, t + i * 0.5 + 0.25, 660, 0.2, lv(p, -22), 'square'); } };
  C.radio_on = (ac, B, t, p) => { burst(ac, B.world, t, 0.18, 2600, 0.6, lv(p, -20)); tone(ac, B.world, t + 0.02, 1200, 0.06, lv(p, -24), 'square'); };
  C.radio_off = (ac, B, t, p) => { burst(ac, B.world, t, 0.35, 3000, 0.5, lv(p, -20)); };
  C.hit = (ac, B, t, p) => { const o = ac.createOscillator(); o.frequency.setValueAtTime((p.f || 50) * 2.5, t); o.frequency.exponentialRampToValueAtTime(p.f || 50, t + 0.15); const g = gain(ac, 0); chain(o, g, B.score); g.gain.setValueAtTime(lv(p, -10), t); g.gain.exponentialRampToValueAtTime(0.0005, t + (p.decay || 2.5)); o.start(t); o.stop(t + (p.decay || 2.5) + 0.1); burst(ac, B.score, t, 0.4, 180, 0.7, lv(p, -10) * 0.6, 'lowpass'); };
  C.crash = (ac, B, t, p) => {
    C.hit(ac, B, t, { f: 42, decay: 2.2, level: (p.level || -8) });
    burst(ac, B.world, t, 1.6, 1200, 0.4, lv(p, -8), 'lowpass'); burst(ac, B.world, t, 0.7, 3500, 0.6, lv(p, -12));
    const R = G.OTM.rng('cr' + t); for (let i = 0; i < 26; i++) { const a = t + 0.05 + R() * 1.4; tone(ac, B.world, a, 1800 + R() * 4000, 0.12 + R() * 0.3, lv(p, -8) * (0.2 + R() * 0.3), 'triangle'); }
    for (let i = 0; i < 6; i++) { const a = t + R() * 0.5; const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(300 + R() * 500, a); o.frequency.exponentialRampToValueAtTime(80 + R() * 80, a + 0.8); const g = gain(ac, 0); const fl = filt(ac, 'bandpass', 900, 3); chain(o, fl, g, B.world); g.gain.setValueAtTime(lv(p, -8) * 0.25, a); g.gain.exponentialRampToValueAtTime(0.0005, a + 0.9); o.start(a); o.stop(a + 1); }
  };
  C.screech = (ac, B, t, p) => { const d = p.dur || 1.4; const fl = burst(ac, B.world, t, d, 2400, 8, lv(p, -16)); fl.frequency.setValueAtTime(2600, t); fl.frequency.linearRampToValueAtTime(1700, t + d); sweep(ac, B.world, t, d, 2100, 1500, lv(p, -16) * 0.4, 'sawtooth'); };
  C.horn = (ac, B, t, p) => { const d = p.dur || 1; [311, 392].forEach(f => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const fl = filt(ac, 'lowpass', 1400); const g = gain(ac, 0); chain(o, fl, g, B.world); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv(p, -18), t + 0.03); g.gain.setValueAtTime(lv(p, -18), t + d - 0.05); g.gain.linearRampToValueAtTime(0, t + d); o.start(t); o.stop(t + d + 0.05); }); };
  C.glitch = (ac, B, t, p) => { const d = p.dur || 0.5; const R = G.OTM.rng('g' + t); for (let x = 0; x < d; x += 0.035) { if (R() < 0.6) tone(ac, B.master, t + x, 200 + R() * 3000, 0.03, lv(p, -18), 'square'); else burst(ac, B.master, t + x, 0.03, 500 + R() * 6000, 2, lv(p, -16)); } };
  C.reset = (ac, B, t, p) => { // the midnight pulse: a huge low drop and a crack of white noise, then nothing
    sweep(ac, B.master, t, 2.6, 180, 24, lv(p, -6), 'sine'); burst(ac, B.master, t, 0.9, 5000, 0.3, lv(p, -10), 'highpass'); burst(ac, B.master, t, 2.2, 140, 0.5, lv(p, -6), 'lowpass'); C.glitch(ac, B, t - 0.4, { dur: 0.4, level: -16 }); };
  C.whiteout = (ac, B, t, p) => { const d = p.dur || 2; sweep(ac, B.score, t, d, 220, 1760, lv(p, -20), 'sine'); sweep(ac, B.score, t, d, 330, 2640, lv(p, -24), 'sine'); const s = src(ac, noise(ac, 3, 'white'), true); const fl = filt(ac, 'highpass', 3000); const g = gain(ac, 0); chain(s, fl, g, B.score); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv(p, -20), t + d); g.gain.linearRampToValueAtTime(0, t + d + 0.05); s.start(t); s.stop(t + d + 0.1); };
  C.rewind = (ac, B, t, p) => { const d = p.dur || 1.2; sweep(ac, B.master, t, d, 120, 1600, lv(p, -16), 'sawtooth'); const fl = burst(ac, B.master, t, d, 400, 2, lv(p, -16)); fl.frequency.setValueAtTime(400, t); fl.frequency.exponentialRampToValueAtTime(5000, t + d); };
  C.riser = (ac, B, t, p) => { const d = p.dur || 3; sweep(ac, B.score, t, d, 60, 240, lv(p, -16), 'sawtooth'); const s = src(ac, noise(ac, 3, 'white'), true); const fl = filt(ac, 'bandpass', 300, 1.5); fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(6000, t + d); const g = gain(ac, 0); chain(s, fl, g, B.score); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv(p, -16), t + d); g.gain.linearRampToValueAtTime(0, t + d + 0.03); s.start(t); s.stop(t + d + 0.1); };
  C.sting = (ac, B, t, p) => { [36, 37, 43, 48, 49].forEach(n => tone(ac, B.score, t, NOTE(n + (p.up || 0)), p.decay || 3.5, lv(p, -16) * 0.5, 'sawtooth', 0.01)); C.hit(ac, B, t, { f: 40, decay: 2, level: (p.level || -16) + 2 }); };
  C.thud = (ac, B, t, p) => { for (let i = 0; i < (p.n || 3); i++) { const a = t + i * (p.gap || 0.33); tone(ac, B.world, a, 70, 0.3, lv(p, -12), 'sine'); burst(ac, B.world, a, 0.12, 600, 1, lv(p, -16)); } };
  C.shatter = (ac, B, t, p) => { burst(ac, B.world, t, 0.6, 5000, 0.5, lv(p, -12)); const R = G.OTM.rng('sh' + t); for (let i = 0; i < 30; i++) tone(ac, B.world, t + R() * 0.8, 3000 + R() * 5000, 0.08 + R() * 0.2, lv(p, -12) * 0.3, 'triangle'); };
  C.splash = (ac, B, t, p) => { burst(ac, B.world, t, 1.8, 600, 0.4, lv(p, -12), 'lowpass'); burst(ac, B.world, t + 0.05, 1.2, 2500, 0.5, lv(p, -16)); };
  C.confirm = (ac, B, t, p) => { tone(ac, B.world, t, 880, 0.5, lv(p, -18), 'sine'); tone(ac, B.world, t, 1320, 0.7, lv(p, -20), 'sine'); C.hit(ac, B, t, { f: 55, decay: 1.5, level: -16 }); };
  C.shutdown = (ac, B, t, p) => { sweep(ac, B.master, t, p.dur || 1.6, 900, 40, lv(p, -16), 'square'); };
  C.piano = (ac, B, t, p) => { const notes = p.notes || [69, 72, 76, 74]; notes.forEach((n, i) => { if (n == null) return; const a = t + i * (p.gap || 0.7); [1, 2, 3].forEach((h, k) => tone(ac, B.score, a, NOTE(n) * h, 2.4 / h, lv(p, -18) * [1, 0.25, 0.1][k], 'sine', 0.004)); }); };
  C.swell = (ac, B, t, p) => BD.pad(ac, B, t, t + (p.dur || 6), Object.assign({ fi: (p.dur || 6) * 0.4, fo: (p.dur || 6) * 0.5 }, p));
  C.whoosh = (ac, B, t, p) => { const d = p.dur || 0.6; const fl = burst(ac, B.world, t, d, 600, 0.8, lv(p, -20)); fl.frequency.setValueAtTime(400, t); fl.frequency.exponentialRampToValueAtTime(2400, t + d * 0.5); };
  C.breath = (ac, B, t, p) => burst(ac, B.world, t, p.dur || 0.7, 1100, 0.7, lv(p, -26));
  C.door = (ac, B, t, p) => { tone(ac, B.world, t, 90, 0.4, lv(p, -12)); burst(ac, B.world, t, 0.1, 1500, 1, lv(p, -18)); };
  const tick = (ac, B, t, p) => burst(ac, B.world, t, 0.025, 2600, 3, lv(p, -30));

  SOUND.ready = async function () { };
  SOUND.build = function (ac, ev) {
    const B = buses(ac);
    for (const b of ev.beds) { const fn = BD[b.name]; if (fn) fn(ac, B, Math.max(0, b.t0), b.t1, b.p || {}); }
    for (const q of ev.cues) { if (q.t < 0) continue; (C[q.name] || tick)(ac, B, q.t, q.p || {}); }
    for (const s of ev.silences) [B.world, B.score].forEach(bus => { const p = bus.gain; p.setValueAtTime(1, Math.max(0, s.t0 - 0.01)); p.linearRampToValueAtTime(0, s.t0 + 0.02); p.setValueAtTime(0, s.t1); p.linearRampToValueAtTime(1, s.t1 + 0.25); });
    for (const d of ev.ducks) { const p = B.score.gain; p.setValueAtTime(1, d.t0); p.linearRampToValueAtTime(d.level, d.t0 + 0.4); p.setValueAtTime(d.level, d.t1); p.linearRampToValueAtTime(1, d.t1 + 0.5); }
  };
})(window);
