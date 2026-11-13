/* S10 — The real twelve minutes. 11:48:54. The headset comes off. The radio. The truck stopped on the hard shoulder. The bus behind the barrier. */
(function () {
  const P = TM.plan([2.0, { m: 'clock' }, 'L132', { m: 'room' }, 'L133', { m: 'off' }, 2.2, { m: 'radio' }, { id: 'L134', gap: 0.4 }, { m: 'patrol' }, 'L135', { m: 'signs' }, 'L136',
    { m: 'pull' }, 'L137', { m: 'c57' }, 1.4, { m: 'shift' }, 'L138', { m: 'nowhere' }, 'L139', { m: 'bus' }, 'L140', { m: 'calm' }, 'L141', { m: 'room2' }, 'L142', { m: 'close' }, { id: 'L143', gap: 2.0 }]);
  const m = P.m;
  FILM.seq({
    id: 'Q10', title: 'The real twelve minutes', dur: P.dur, lines: P.lines,
    sound(S) {
      S.cue('breath', 1.2, { dur: 1.2, level: -18 }); S.bed('hum', 1.0, P.dur, { level: -36, fi: 2 }); S.bed('tick', m.clock, m.radio, { level: -24 });
      S.cue('shutdown', m.off + 0.2, { dur: 0.8, level: -24 }); S.cue('click', m.off + 1.4);
      S.cue('radio_on', m.radio - 0.2); S.cue('radio_on', m.patrol - 0.1); S.bed('static', m.patrol, m.signs, { level: -40 }); S.cue('radio_off', m.signs - 0.3);
      S.bed('pulse', m.radio, m.bus, { bpm: 100, f: 49, level: -22 }); S.bed('siren', m.patrol, m.bus, { level: -30, lo: 650, hi: 900 }); S.cue('beep', m.signs + 0.2, { n: 3, f: 980 });
      S.bed('wind', m.pull, m.room2, { level: -32 }); S.cue('hit', m.c57, { f: 55, decay: 1.4, level: -18 }); S.cue('thud', m.shift + 0.5, { n: 1, level: -14 });
      S.bed('pad', m.bus, P.dur, { notes: [45, 52, 57, 61, 64], level: -26, fi: 4, fo: 3 }); S.cue('piano', m.room2 + 0.6, { notes: [69, 73, 76, null, 74, 73], gap: 1.0, level: -20 });
    },
    shots: [
      { at: 0, name: 'white to the real room', draw(c, st) { CR.wide(c, c.t, { real: true, clock: 54, dan: { headset: true, slump: 0.3 }, steam: 0.4 }); X.white(c, Math.max(0, 1 - st / 2), '#f0fafc'); } },
      { at: m.clock, name: '23:48:54', draw(c, st) { INS.clock(c, c.t, { mode: 'digital', text: '11:48:' + (54 + Math.floor(st)), color: X.K.amber, sub: 'CITYWATCH · SESSION ENDED · 0:54' }); } },
      { at: m.room, name: 'wide: the real room', draw(c, st) { CR.wide(c, c.t, { real: true, clock: 58 + st, dan: { headset: true }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.08) } }); } },
      { at: m.off, name: 'close: the headset comes off', draw(c, st) { const u = Math.min(1, st / 1.2); CR.close(c, c.t, { dan: { arms: u < 1 ? 'head' : 'none', y: 560 } }); if (u < 1) { const g = c.g; g.strokeStyle = '#010409'; g.lineWidth = 22; g.beginPath(); g.arc(640, 290 - u * 120, 70, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); } } },
      { at: m.radio, name: 'side: to highway patrol', draw(c, st) { CR.side(c, c.t, { mic: true, tx: true, dan: { pose: RIG.P.sitRadio }, light: X.K.amber, rim: '#ffd9a0' }); } },
      { at: m.patrol, name: 'on-ramp: patrol answers', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'onramp', c.t, { p: 0, grade: 'live', stampBase: 23 * 3600 + 50 * 60, stampP: st }); } },
      { at: m.signs, name: 'the signs flash red', draw(c, st) { INS.sign(c, c.t, { mode: 'red', l1: 'EASTERN BRIDGE CLOSED', l2: 'ALL TRAFFIC STOP' }); } },
      { at: m.pull, name: 'the truck pulled over', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1.05, 1.0) }); FEEDS.draw(c.g, 'onramp', c.t, { patrol: true, signsRed: true, p: st * 0.7, grade: 'none', hud: false }); } },
      { at: m.c57, name: 'clock: 11:57', draw(c, st) { INS.clock(c, c.t, { sec: 9 * 60 + st }); } },
      { at: m.shift, name: 'the beam shifts', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1.4, 1.7), x: 680, y: 470 }); FEEDS.draw(c.g, 'onramp', c.t, { patrol: true, officer: true, signsRed: true, p: 3, shiftAt: 0.3, grade: 'none', hud: false }); } },
      { at: m.nowhere, name: 'the hard shoulder', draw(c, st) { X.cam(c, { zoom: TM.push(st, c.shotDur, 1.0, 1.1) }); FEEDS.draw(c.g, 'onramp', c.t, { patrol: true, officer: true, signsRed: true, p: 6, shiftAt: 0, grade: 'none', hud: false }); } },
      { at: m.bus, name: 'the bridge at midnight: bus 26 waits', draw(c, st) { EXT.bridgeReal(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1.25, 1.1), x: 560, y: 360 } }); } },
      { at: m.calm, name: 'the bridge, empty', draw(c, st) { EXT.bridgeReal(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1.05, 1.0) } }); } },
      { at: m.room2, name: 'wide: no alarm', draw(c, st) { CR.wide(c, c.t, { real: true, clock: 12 * 60 + st, dan: { arms: 'none', slump: 0.4 }, main: { kind: 'top', scenario: 'none', grade: 'live' }, cam: { zoom: TM.push(st, c.shotDur, 1.12, 1.0) } }); } },
      { at: m.close, name: 'close: he can live with that', fade: TM.fade(0, 1.6), draw(c, st) { CR.close(c, c.t, { light: '#5a9fd6', dan: { slump: 0.2, turn: -0.2 } }); } },
    ],
  });
})();
