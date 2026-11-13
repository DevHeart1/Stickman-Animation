/* S04 — Every solution makes it worse. The map of rescues and the futures that move. 11:57. The hallway recording. */
(function () {
  const A = [
    { path: [[80, 300], [400, 280], [700, 270], [980, 300]], x: [520, 470], label: 'HARBOUR RD · VAN' },
    { path: [[520, 470], [560, 600]], x: [300, 160], label: 'MILL ST · MOTORCYCLE' },
    { path: [[300, 160], [350, 100], [420, 80]], x: [760, 520], label: 'ASHER ST · CRANE' },
  ];
  const P = TM.plan([0.3, { m: 'again' }, 'L039', { m: 'green' }, 'L040', { m: 'harbour' }, 'L041', { m: 'map2' }, 'L042', { m: 'junction' }, 'L043', { m: 'map3' }, 'L044',
    { m: 'crane' }, 'L045', { m: 'fall' }, 'L046', 0.6, { m: 'map4' }, 'L047', { m: 'montage' }, 'L048', { m: 'way' }, 'L049', { m: 'clock' }, 'L050', 0.4,
    { m: 'new' }, 'L051', { m: 'hall' }, 'L052', { m: 'him' }, 'L053', 'L054', { m: 'shout' }, { id: 'L055', gap: 0.3 }, { m: 'what' }, { id: 'L056', gap: 1.4 }]);
  const m = P.m, clk = lt => 4 * 60 + 10 + lt * 3.2;   // time runs faster as he works
  const clkSec = lt => lt < m.clock ? clk(lt) : 9 * 60 + (lt - m.clock) * 0.6;
  const harbourImp = m.harbour + 2.6, juncImp = m.junction + 2.6, craneFall = m.fall + 0.4;
  const map = (c, st, n, cas) => { X.cam(c, { zoom: TM.push(st, c.shotDur, 1.0, 1.06) }); FEEDS.draw(c.g, 'map', c.t, { attempts: A, n, k: Math.min(1, st / 1.4), casualties: cas, hud: false, grade: 'none' }); };
  FILM.seq({
    id: 'Q04', title: 'Every solution makes it worse', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, P.dur, { level: -38 }); S.bed('tick', 0, P.dur, { rate: 2, level: -28 });
      S.bed('pulse', 0, m.way, { bpm: 124, f: 46, level: -20, hat: true }); S.bed('drone', 0, P.dur, { f: 41, level: -26 });
      [m.green, m.map2, m.map3, m.map4].forEach(t => { S.cue('key', t, { n: 6 }); S.cue('ui', t + 1.2); });
      S.cue('siren', m.green); S.cue('screech', harbourImp - 1.4, { dur: 1.3 }); S.cue('crash', harbourImp, { level: -9 });
      S.cue('horn', juncImp - 1.2, { dur: 1 }); S.cue('crash', juncImp, { level: -9 });
      S.cue('crash', craneFall, { level: -6 }); S.cue('shatter', craneFall + 0.1);
      for (let i = 0; i < 6; i++) S.cue('glitch', m.montage + i * 0.6, { dur: 0.15 });
      S.cue('hit', m.clock, { f: 55, decay: 1.5, level: -14 }); S.bed('heartbeat', m.clock, P.dur, { bpm: 120, level: -18 });
      S.cue('glitch', m.new, { dur: 0.6 }); S.cue('thud', m.hall + 0.4, { n: 3 }); S.cue('thud', m.him + 0.6, { n: 4, gap: 0.3 }); S.cue('thud', P.at.L054 + 0.5, { n: 4, gap: 0.28 });
      S.cue('riser', m.him, { dur: m.shout - m.him, level: -18 }); S.cue('sting', m.shout, { level: -10 }); S.cue('alarm', m.shout, { n: 3, level: -22 });
      S.silence(m.what, m.what + 0.2);
    },
    shots: [
      { at: 0, name: 'close: try again, red', draw(c, st) { CR.close(c, c.t, { light: X.K.red, pulse: true, rim: '#ffb0a4' }); } },
      { at: m.green, name: 'top: every light green', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'top', c.t, { scenario: 'green', p: st * 0.9, grade: 'live', stampBase: 23 * 3600 + 48 * 60, stampP: clk(c.lt) }); } },
      { at: m.harbour, name: 'CCTV: Harbour Road', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'harbour', c.t, { p: 1.2 + st }); } },
      { at: m.map2, name: 'map: second change', draw(c, st) { map(c, st, 2, 3); } },
      { at: m.junction, name: 'CCTV: Mill St', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'junction', c.t, { p: 1.0 + st }); } },
      { at: m.map3, name: 'map: third change', draw(c, st) { map(c, st, 3, 11); } },
      { at: m.crane, name: 'CCTV: Asher St, the crane', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1, 1.1), y: 300 }); FEEDS.draw(c.g, 'crane', c.t, { p: Math.min(2.8, st * 0.6) }); } },
      { at: m.fall, name: 'CCTV: the beam falls', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'crane', c.t, { p: 3.0 + st * 0.9 }); } },
      { at: m.map4, name: 'map: every future', draw(c, st) { map(c, st + 2, 3, 19); } },
      { at: m.montage, name: 'montage: feeds, faster', draw(c, st) {
        const k = Math.floor(st / 0.6) % 5; X.cam(c);
        const list = [['bridge', 4.9], ['kingst', 4.6], ['harbour', 4.0], ['junction', 3.9], ['crane', 3.8]];
        FEEDS.draw(c.g, list[k][0], c.t, { p: list[k][1] + (st % 0.6) }); X.glitch(c, (st % 0.6) < 0.1 ? 60 : 0, k);
      } },
      { at: m.way, name: 'side: there has to be a way', draw(c, st) { CR.side(c, c.t, { light: X.K.red, pulse: true, rim: '#ffb0a4', dan: { pose: st < 1.4 ? RIG.P.sitHeadInHands : RIG.P.sitLean } }); } },
      { at: m.clock, name: 'clock: 11:57', draw(c, st) { INS.clock(c, c.t, { sec: clkSec(c.lt), color: X.K.red, cam: { zoom: TM.push(st, c.shotDur, 1, 1.12) } }); } },
      { at: m.new, name: 'over: not from a road', draw(c, st) { CR.over(c, c.t, { alert: true, feed: st < 0.8 ? { kind: 'bridge', p: 7 } : { kind: 'hall', p: 0.2 + st * 0.4, stampBase: 23 * 3600 + 59 * 60 + 40, stampP: st } }); if (st < 0.8) X.glitch(c, 70, Math.floor(c.t * 24)); } },
      { at: m.hall, name: 'CCTV: the corridor', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1, 1.15), y: 300 }); FEEDS.draw(c.g, 'hall', c.t, { p: 1 + st, stampBase: 23 * 3600 + 59 * 60 + 42, stampP: st }); } },
      { at: m.him, name: 'CCTV: it is him', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1.5, 2.1), x: 640, y: 290 }); FEEDS.draw(c.g, 'hall', c.t, { p: 2 + st * 0.5, hud: false }); } },
      { at: m.shout, name: 'CCTV: STOP CHANGING IT', draw(c, st) { X.cam(c, { zoom: 1.9 + st * 0.15, x: 640, y: 290, ...X.impact(st, 0, 8, 1.2) }); FEEDS.draw(c.g, 'hall', c.t, { p: 6, turnAt: 0, hud: false }); X.glitch(c, st < 0.4 ? 90 : (Math.sin(c.t * 7) > 0.92 ? 50 : 0), Math.floor(c.t * 24)); } },
      { at: m.what, name: 'profile: learns what?', draw(c, st) { CR.ecu(c, c.t, { light: X.K.red, la: 0.22, cam: { zoom: TM.push(st, c.shotDur, 1.05, 1.18) } }); } },
    ],
  });
})();
