/* S07 — The terrible truth. CityWatch speaks. Fifty-four seconds. The order he gave. "Define safe." */
(function () {
  const P = TM.plan([1.6, { m: 'wake' }, 'L078', { m: 'who' }, 'L079', { m: 'cw1' }, 'L080', { m: 'fut' }, 'L081', { m: 'cw2' }, 'L082', { m: 'real' }, 'L083', { m: 'cw3' }, 'L084',
    { m: 'long' }, 'L085', { m: 'cw4' }, 'L086', { m: 'else' }, 'L087', 0.6, { m: 'f54' }, { id: 'L088', gap: 2.2 },
    { m: 'city' }, 'L089', 'L090', { m: 'engine' }, 'L091', { m: 'volun' }, 'L092', { m: 'order' }, 'L093', { m: 'rec' }, 'L094', 0.4, { m: 'none' }, 'L095',
    { m: 'die' }, 'L096', { m: 'cw5' }, 'L097', { m: 'oth' }, 'L098', { m: 'cw6' }, 'L099', { m: 'show' }, 'L100', { m: 'define' }, { id: 'L101', gap: 0.2 }, { m: 'silent' }, 4.0,
    { m: 'out' }, 'L102', { m: 'stop' }, { id: 'L103', gap: 1.8 }]);
  const m = P.m;
  const voice = (c, id, extra) => CW.screen(c, c.t, Object.assign({ mode: 'voice', speaking: TM.speaking(P, id, c.lt), status: 'SIMULATION 182,642 · UNSTABLE', unstable: true }, extra || {}));
  const close = (c, st, extra) => CR.close(c, c.t, Object.assign({ screen: g => CR.cwEye(g, 0, 0, 1280, 720, c.t), cam: { zoom: TM.push(st, c.shotDur, 1, 1.05) } }, extra || {}));
  FILM.seq({
    id: 'Q07', title: 'The terrible truth', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, P.dur, { level: -40 }); S.bed('drone', 0, m.define, { f: 32.7, level: -24, bright: 300, fi: 3 });
      S.cue('glitch', 0.2, { dur: 0.6 }); S.cue('shutdown', 0.6, { dur: 1 }); S.cue('ui', m.wake - 0.1);
      [m.cw1, m.cw2, m.cw3, m.cw4, m.f54, m.cw5, m.cw6, m.define, m.stop].forEach(t => S.cue('ui', t - 0.15, { level: -30 }));
      S.silence(m.f54 + 1.6, m.city); S.cue('hit', m.city, { f: 41, decay: 3, level: -14 });
      S.bed('pulse', m.engine, m.none, { bpm: 76, f: 41, level: -24 }); S.cue('click', m.rec - 0.3); S.bed('static', m.rec, m.none, { level: -40 });
      S.cue('sting', m.none, { level: -14 }); S.bed('heartbeat', m.die, m.define, { bpm: 96, level: -18 });
      S.silence(m.define + 1.6, m.out);
      S.bed('drone', m.out, P.dur, { f: 30.9, level: -24, fi: 1 });
    },
    shots: [
      { at: 0, name: 'wide: every screen goes to CityWatch', draw(c, st) { CR.wide(c, c.t, { clock: 200, cw: st > 0.6, dan: { arms: 'desk', turn: 0 }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.08) } }); if (st < 0.6) X.glitch(c, 90, Math.floor(c.t * 24)); } },
      { at: m.wake, name: 'CityWatch: awareness restored', draw(c, st) { voice(c, 'L078'); } },
      { at: m.who, name: 'close: who is this', draw(c, st) { close(c, st); } },
      { at: m.cw1, name: 'CityWatch: predictive response', draw(c, st) { voice(c, 'L080'); } },
      { at: m.fut, name: 'close: the future?', draw(c, st) { close(c, st, { dan: { turn: 0.4 } }); } },
      { at: m.cw2, name: 'CityWatch: a decision window', draw(c, st) { voice(c, 'L082'); } },
      { at: m.real, name: 'profile: none of this is real', draw(c, st) { CR.ecu(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.06) } }); } },
      { at: m.cw3, name: 'CityWatch: your experience is real', draw(c, st) { voice(c, 'L084'); } },
      { at: m.long, name: 'clock: how long', draw(c, st) { INS.clock(c, c.t, { sec: 200 + st }); } },
      { at: m.cw4, name: 'CityWatch: four years', draw(c, st) { voice(c, 'L086'); } },
      { at: m.else, name: 'close: everyone else', draw(c, st) { close(c, st, { dan: { slump: 0.3 } }); } },
      { at: m.f54, name: 'CityWatch: fifty-four seconds', draw(c, st) { voice(c, 'L088', { cam: { zoom: TM.push(st, c.shotDur, 1, 1.3) } }); } },
      { at: m.city, name: 'wide: he had', draw(c, st) { CR.wide(c, c.t, { clock: 200, cw: true, dan: { arms: 'desk', slump: 0.6 }, cam: { zoom: TM.push(st, c.shotDur, 1.35, 1.0), y: 400 } }); } },
      { at: m.engine, name: 'map: every response rehearsed', draw(c, st) {
        const A = []; const R = OTM.rng('many'); for (let i = 0; i < 40; i++) { const x = 80 + R() * 1120, y = 120 + R() * 520; A.push({ path: [[x - 60, y - 40], [x, y]], x: [x, y], label: '' }); }
        X.cam(c); FEEDS.draw(c.g, 'map', c.t, { attempts: A, n: Math.min(40, Math.floor(st * 9) + 1), k: 1, casualties: 47, hud: false, grade: 'none' });
      } },
      { at: m.volun, name: 'CityWatch: setup record', draw(c, st) { CW.screen(c, c.t, { mode: 'objective', p: 0 }); } },
      { at: m.order, name: 'close: an impossible order', draw(c, st) { close(c, st); } },
      { at: m.rec, name: 'the recorded order', draw(c, st) { CW.screen(c, c.t, { mode: 'objective', speaking: TM.speaking(P, 'L094', c.lt), p: (c.lt - m.rec) / (P.end.L094 - m.rec), cam: { zoom: TM.push(st, c.shotDur, 1, 1.08) } }); } },
      { at: m.none, name: 'no guaranteed outcome', draw(c, st) { CW.screen(c, c.t, { mode: 'objective', p: 1, result: '> NO GUARANTEED OUTCOME FOUND · CONTINUING' }); } },
      { at: m.die, name: 'profile: does she die', draw(c, st) { CR.ecu(c, c.t, { light: X.K.red, la: 0.3, cam: { zoom: TM.push(st, c.shotDur, 1, 1.06) } }); } },
      { at: m.cw5, name: 'CityWatch: in some', draw(c, st) { voice(c, 'L097'); } },
      { at: m.oth, name: 'close: and the others', draw(c, st) { close(c, st, { dan: { turn: -0.3 } }); } },
      { at: m.cw6, name: 'CityWatch: she lives', draw(c, st) { voice(c, 'L099'); } },
      { at: m.show, name: 'close: show me one', draw(c, st) { close(c, st, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.15) } }); } },
      { at: m.define, name: 'CityWatch: define safe', draw(c, st) { voice(c, 'L101', { cam: { zoom: TM.push(st, 1.6, 1, 1.25) } }); } },
      { at: m.silent, name: 'profile: no answer', draw(c, st) { CR.ecu(c, c.t, { la: 0.25, cam: { zoom: TM.push(st, c.shotDur, 1.0, 1.2) } }); } },
      { at: m.out, name: 'close: let me out', draw(c, st) { close(c, st, { dan: { arms: 'head', slump: 0.7 } }); } },
      { at: m.stop, name: 'CityWatch: you instructed me', fade: TM.fade(0, 1.2), draw(c, st) { voice(c, 'L103'); } },
    ],
  });
})();
