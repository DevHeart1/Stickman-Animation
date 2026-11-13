/* S03 — The first rescue. Bus 26, twelve minutes out. The diversion. King Street. */
(function () {
  const P = TM.plan([0.4, { m: 'bus' }, 'L026', { m: 'live' }, 'L027', { m: 'clock' }, 'L028', { m: 'time' }, 'L029', { m: 'type' }, 2.2, { m: 'sign' }, 1.6,
    { m: 'radio' }, { id: 'L030', gap: 0.4 }, { m: 'driver' }, 'L031', { m: 'turn' }, 1.8, { m: 'safe' }, 'L032', 'L033', 0.6, { m: 'new' }, 1.0, 'L034', { m: 'king' }, 'L035', { m: 'impact' }, 2.6,
    { m: 'no' }, { id: 'L036', gap: 0.8 }, { m: 'wide' }, 'L037', 'L038', 1.6]);
  const m = P.m, clk = lt => 30 + lt * 0.5;
  const kingP0 = 4.3 - (m.impact - m.king);   // the ambulance is hit at m.impact
  FILM.seq({
    id: 'Q03', title: 'The first rescue', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, P.dur, { level: -36 }); S.bed('tick', 0, m.new, { level: -26 });
      S.bed('pulse', 0, m.safe, { bpm: 104, f: 49, level: -22, hat: true });
      S.cue('key', m.type, { n: 16, gap: 0.12 }); S.cue('ui', m.sign - 0.2); S.cue('radio_on', m.radio - 0.2); S.cue('radio_off', m.driver - 0.3);
      S.cue('radio_on', m.driver - 0.1); S.bed('static', m.driver, m.turn, { level: -40 }); S.cue('radio_off', m.turn - 0.2);
      S.bed('pad', m.safe, m.new, { notes: [57, 64, 69, 73], level: -28, fi: 1.5, fo: 0.4 });
      S.cue('glitch', m.new, { dur: 0.5 }); S.cue('alarm', m.new + 0.4, { n: 3, level: -24 }); S.bed('drone', m.new, P.dur, { f: 44, level: -24, fi: 1 });
      S.bed('siren', m.king, m.impact + 0.2, { level: -28 }); S.cue('screech', m.impact - 1.6, { dur: 1.5, level: -14 }); S.cue('crash', m.impact, { level: -6 });
      S.bed('static', m.impact + 1.9, m.no, { level: -26 }); S.bed('heartbeat', m.no, P.dur, { bpm: 104, level: -18 }); S.cue('sting', m.wide, { level: -18 });
    },
    shots: [
      { at: 0, name: 'over: bus 26', draw(c, st) { CR.over(c, c.t, { feed: { kind: 'top', scenario: 'live', ring: true, p: 1.2 + st * 0.3, grade: 'live', stampBase: 23 * 3600 + 48 * 60, stampP: clk(c.lt) }, cam: { zoom: 1.1 } }); } },
      { at: m.live, name: 'live: rolling toward the bridge', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1, 1.08) }); FEEDS.draw(c.g, 'top', c.t, { scenario: 'live', ring: true, p: 1.6 + st * 0.35, grade: 'live', stampBase: 23 * 3600 + 48 * 60, stampP: clk(c.lt) }); } },
      { at: m.clock, name: 'clock: twelve minutes', draw(c, st) { INS.clock(c, c.t, { sec: clk(c.lt) }); } },
      { at: m.time, name: 'close: enough time', draw(c, st) { CR.close(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.05) } }); } },
      { at: m.type, name: 'side: typing', draw(c, st) { CR.side(c, c.t, { dan: { pose: RIG.mix(RIG.P.sitType, RIG.P.sitLean, 0.5 + 0.5 * Math.sin(FILM.twos(c.t) * 14)) } }); } },
      { at: m.sign, name: 'the signs change', draw(c, st) { INS.sign(c, c.t, { mode: 'amber', cam: { zoom: TM.push(st, c.shotDur, 1.08, 1) } }); } },
      { at: m.radio, name: 'side: the radio', draw(c, st) { CR.side(c, c.t, { mic: true, tx: true, dan: { pose: RIG.P.sitRadio, headTilt: 0.05 }, cam: { zoom: 1.05, x: 600 } }); } },
      { at: m.driver, name: 'top: the bus diverts', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'top', c.t, { scenario: 'divert', p: 2.6 + (c.lt - m.driver) * 0.75, grade: 'live', stampBase: 23 * 3600 + 48 * 60, stampP: clk(c.lt) }); } },
      { at: m.safe, name: 'wide: safe', draw(c, st) { CR.wide(c, c.t, { clock: clk(c.lt), dan: { arms: 'desk', slump: Math.min(1, st / 2) * 0.6 }, main: { kind: 'top', scenario: 'divert', p: 7, grade: 'live' }, cam: { zoom: TM.push(st, c.shotDur, 1.1, 1.0) } }); } },
      { at: m.new, name: 'over: a new recording', draw(c, st) { CR.over(c, c.t, { alert: true, feed: { kind: 'kingst', p: Math.max(0, kingP0 - (m.king - m.new) + st) * (st < 0.5 ? 0 : 1) }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.15) } }); if (st < 0.5) X.glitch(c, 70, Math.floor(c.t * 24)); } },
      { at: m.king, name: 'CCTV: King Street', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'kingst', c.t, { p: kingP0 + st }); } },
      { at: m.no, name: 'profile: no', draw(c, st) { CR.ecu(c, c.t, { light: X.K.red, la: 0.3 + 0.12 * Math.sin(c.t * 5.2), cam: { zoom: TM.push(st, c.shotDur, 1, 1.12) }, dan: { headTilt: -0.15 } }); } },
      { at: m.wide, name: 'wide: built another', draw(c, st) { CR.wide(c, c.t, { clock: clk(c.lt), alert: 1, dan: { arms: 'head' }, main: { kind: 'kingst', p: 7 }, cam: { zoom: TM.push(st, c.shotDur, 1.2, 1.0), y: 330 } }); } },
    ],
  });
})();
