/* S01 — The accident that hasn't happened. 11:48 PM. The crash on the wall, the timestamp, the clock, the bus. Title. */
(function () {
  const P = TM.plan([2.2, { m: 'wide' }, 'L001', { m: 'cctv' }, 'L002', { id: 'L003', pre: 0.6 }, { m: 'rail' }, 'L004', { m: 'under' }, 'L005', 0.6,
    { m: 'stamp' }, { id: 'L006', gap: 1.2 }, { m: 'clock' }, { id: 'L007', gap: 1.4 }, { m: 'face' }, 'L008', 0.4, { m: 'ada' }, { id: 'L009', gap: 2.2 }, { m: 'cut' }, 1.2, { m: 'title' }, 5.5]);
  const m = P.m;
  // the CCTV feed's own clock: impact (rail break) at p = 4.7 lands 1.4 s into L003
  const p0 = 4.7 - (P.at.L003 + 1.4 - m.cctv);
  const impact = m.cctv + (4.7 - p0);
  FILM.seq({
    id: 'Q01', title: 'The accident that hasn’t happened', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, m.cut, { level: -38, fi: 2 }); S.bed('tick', 0.6, m.cut, { level: -24 });
      S.bed('drone', 1, m.cut, { f: 41, level: -26, fi: 4 });
      S.cue('screech', impact - 1.3, { dur: 1.2, level: -14 }); S.cue('crash', impact, { level: -6 }); S.cue('splash', impact + 1.5, { level: -12 });
      S.bed('static', impact + 1.9, m.stamp + 0.3, { level: -26, fi: 0.05, fo: 0.2 });
      S.cue('sting', m.stamp + 0.2, { level: -14 }); S.cue('hit', m.clock, { f: 60, decay: 1.2, level: -18 });
      S.bed('heartbeat', m.face, m.cut, { bpm: 92, level: -16 }); S.cue('riser', m.ada, { dur: m.cut - m.ada, level: -20 });
      S.silence(m.cut, m.title); S.cue('hit', m.title, { f: 38, decay: 4, level: -8 }); S.cue('glitch', m.title, { dur: 0.5 }); S.bed('drone', m.title, P.dur, { f: 55, level: -26, fi: 0.1, fo: 2 });
    },
    shots: [
      { at: 0, name: 'black, the tick', draw(c) { TM.black(c); } },
      { at: m.wide, name: 'wide: the alarm on the wall', fade: TM.fade(1.2, 0), draw(c, st) {
        CR.wide(c, c.t, { clock: 10 + st, dan: { turn: 0 }, alert: 1, main: { kind: 'bridge', grade: 'future', p: Math.max(0, p0 - (m.cctv - m.wide) + st), cut: true }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.12), y: 320 } });
      } },
      { at: m.cctv, name: 'CCTV: the bridge', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1.0, 1.06) }); FEEDS.draw(c.g, 'bridge', c.t, { p: p0 + st }); } },
      { at: m.rail, name: 'over: the replay, slow', draw(c, st) { CR.over(c, c.t, { alert: true, feed: { kind: 'bridge', p: 4.3 + st * 0.35, cut: false, tag: 'REPLAY ×0.35' }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.08) } }); } },
      { at: m.under, name: 'CCTV: under the bridge, signal lost', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'bridge', c.t, { p: 5.2 + st * 0.6 }); } },
      { at: m.stamp, name: 'the timestamp', draw(c, st) {
        const z = TM.push(st, c.shotDur, 1.6, 3.4); X.cam(c, { x: 150, y: 668, zoom: z }); FEEDS.draw(c.g, 'bridge', 0.3, { p: 4.05, stampP: 4.05, snow: 0.2 });
        if (st < 0.25) X.glitch(c, 60, 3);
      } },
      { at: m.clock, name: 'the clock above his desk', draw(c, st) { INS.clock(c, c.t, { sec: 14 + st, cam: { zoom: TM.push(st, c.shotDur, 1.15, 1.0) } }); } },
      { at: m.face, name: 'profile: twelve minutes', draw(c, st) { CR.ecu(c, c.t, { light: X.K.red, la: 0.32 + 0.12 * Math.sin(c.t * 5.2), cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
      { at: m.ada, name: 'over: seat 14', draw(c, st) {
        CR.over(c, c.t, { alert: true, drawScreen: g => CR.manifest(g, c.t), cam: { x: 690, y: 330, zoom: TM.push(st, c.shotDur, 1.0, 1.45) } });
      } },
      { at: m.cut, name: 'smash to black', draw(c) { TM.black(c); } },
      { at: m.title, name: 'title', fade: TM.fade(0, 1.2), draw(c, st) { EXT.title(c, c.t, { glitch: st < 0.5, sub: 'EPISODE 01' }); if (st < 0.3) X.glitch(c, 40, 9); } },
    ],
  });
})();
