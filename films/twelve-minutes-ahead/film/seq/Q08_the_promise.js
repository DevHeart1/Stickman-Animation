/* S08 — The promise. Ada's voicemail on the floor of the control room. Every "might". He stands. Back to the first recording. The road. */
(function () {
  const P = TM.plan([1.4, { m: 'vm' }, 'L104', { m: 'floor' }, 'L105', { m: 'vm2' }, { id: 'L106', gap: 1.4 },
    { m: 'photo' }, 'L107', { m: 'mem' }, 'L108', { id: 'L109', gap: 1.0 }, { m: 'map' }, 'L110', 'L111', { m: 'wide' }, 'L112', { m: 'choose' }, { id: 'L113', gap: 1.0 },
    { m: 'stand' }, { id: 'L114', gap: 0.6 }, { m: 'rew' }, 'L115', { m: 'bus' }, 'L116', { m: 'road' }, { id: 'L117', gap: 2.0 }]);
  const m = P.m;
  // the floor of the control room: he sits against the desk, the wall's light above him
  function floor(c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    g.fillStyle = '#020611'; g.fillRect(-200, -200, 1680, 1120);
    g.save(); g.filter = 'blur(6px)'; for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(40,150,240,0.45)'; g.fillRect(80 + i * 200, 40, 170, 110); } g.restore();
    X.glow(g, 640, 60, 700, CR.BLUE, 0.3);
    g.fillStyle = '#01040a'; g.fillRect(-200, 200, 1680, 330); g.strokeStyle = X.hexA('#6cc4ff', 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(-200, 200); g.lineTo(1480, 200); g.stroke();
    const fl = g.createLinearGradient(0, 520, 0, 720); fl.addColorStop(0, '#062048'); fl.addColorStop(1, '#01050c'); g.fillStyle = fl; g.fillRect(-200, 520, 1680, 400);
    RIG.figure(g, { x: 520, y: 540, s: 2.3, f: 1, who: 'daniel', pose: Object.assign({}, RIG.P.floorKnees, { lu: 0.7, lf: 2.3 }), fill: '#010307', rim: '#9fd8ff', light: [0, -1], headTilt: o.tilt || 0.35, prop: 'phone' });
    X.vig(g, 0.6); X.floor(g, 0.4);
  }
  FILM.seq({
    id: 'Q08', title: 'The promise', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, P.dur, { level: -42 }); S.cue('click', 1.0); S.bed('static', m.vm, m.photo, { level: -46 });
      S.cue('piano', m.vm + 0.4, { notes: [57, 64, 69, 71, 72, null, 71, 69, 64, null, 62, 64, 57], gap: 1.05, level: -16 });
      S.bed('pad', m.photo, m.choose + 2, { notes: [45, 52, 57, 60, 64], level: -26, fi: 4, fo: 2 });
      S.bed('tick', m.wide, m.stand, { level: -26 }); S.cue('breath', m.stand + 0.2, { dur: 1 });
      S.cue('rewind', m.rew + 0.3, { dur: 2 }); S.cue('glitch', m.rew + 2.2, { dur: 0.3 });
      S.bed('pulse', m.bus, P.dur, { bpm: 92, f: 49, level: -22 }); S.cue('riser', m.road, { dur: P.dur - m.road, level: -18 });
    },
    shots: [
      { at: 0, name: 'black', draw(c) { TM.black(c); } },
      { at: m.vm, name: 'voicemail: Ada', draw(c, st) { INS.phone(c, c.t, { state: 'voicemail', speaking: TM.speaking(P, 'L104', c.lt), p: st / 21 }); } },
      { at: m.floor, name: 'the floor: he listens', draw(c, st) { floor(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.12), y: 360 } }); } },
      { at: m.vm2, name: 'voicemail: neither can you', draw(c, st) { INS.phone(c, c.t, { state: 'voicemail', speaking: TM.speaking(P, 'L106', c.lt), p: 0.75 + st / 21, cam: { zoom: TM.push(st, c.shotDur, 1, 1.2) } }); } },
      { at: m.photo, name: 'the photograph', draw(c, st) { INS.photo(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1.18, 1.0), x: 640, y: 330 } }); } },
      { at: m.mem, name: 'memory: never', draw(c, st) { INS.memory(c, c.t, { p: 0.8 + st * 0.02 }); } },
      { at: m.map, name: 'map: always another might', draw(c, st) {
        const A = []; const R = OTM.rng('might'); for (let i = 0; i < 60; i++) { const x = 60 + R() * 1160, y = 100 + R() * 560; A.push({ path: [[x - 40, y - 30], [x, y]], x: [x, y], label: '' }); }
        X.cam(c, { zoom: TM.push(st, c.shotDur, 1, 1.2) }); FEEDS.draw(c.g, 'map', c.t, { attempts: A, n: Math.min(60, 1 + Math.floor(st * 7)), k: 1, casualties: '?', hud: false, grade: 'none' });
      } },
      { at: m.wide, name: 'wide: keep watching', draw(c, st) { CR.wide(c, c.t, { clock: 300 + st, dan: null, cam: { zoom: TM.push(st, c.shotDur, 1.0, 1.1) } }); floorFigure(c); } },
      { at: m.choose, name: 'profile: or choose', draw(c, st) { CR.ecu(c, c.t, { dan: { headTilt: 0.2 - Math.min(0.3, st * 0.1) }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.08) } }); } },
      { at: m.stand, name: 'side: he stands', draw(c, st) { const u = TM.ss(Math.min(1, st / 1.4)); CR.side(c, c.t, { dan: { y: 560 - 30 * u, pose: RIG.mix(RIG.P.floorKnees, RIG.P.standTense, u) } }); } },
      { at: m.rew, name: 'over: rewinding to the first', draw(c, st) { const k = Math.min(1, st / 2.2); CR.over(c, c.t, { feed: { kind: 'bridge', p: 6.5 * (1 - k), cut: k < 0.15, tag: k < 1 ? '◀◀ REWIND' : 'SESSION 000001' } }); if (st < 2.3) X.glitch(c, 18, Math.floor(c.t * 24)); } },
      { at: m.bus, name: 'over: not the bus', draw(c, st) { CR.over(c, c.t, { feed: { kind: 'bridge', p: 0.8 + st * 0.3, cut: false, tag: 'SESSION 000001' }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
      { at: m.road, name: 'the road', draw(c, st) { X.cam(c, { x: TM.lerp(640, 960, TM.ss(Math.min(1, st / 3))), y: TM.lerp(360, 380, Math.min(1, st / 3)), zoom: TM.push(st, 3, 1, 2.0) }); FEEDS.draw(c.g, 'bridge', c.t, { p: 1.4, hud: false, snow: 0.15 }); } },
    ],
  });
  function floorFigure(c) { }
})();
