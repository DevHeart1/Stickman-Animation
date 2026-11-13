/* S06 — The lives he doesn't remember. The archive. Six of the sessions, in the room's own security footage. The count. */
(function () {
  const P = TM.plan([1.0, { m: 'arch' }, 'L067', 'L068', { m: 's1' }, 'L069', { m: 's2' }, 'L070', { m: 's3' }, 'L071', { m: 's4' }, 'L072', { m: 's5' }, { id: 'L073', gap: 0.8 },
    { m: 's6' }, { id: 'L074', gap: 1.2 }, { m: 'count' }, 2.8, 'L075', { m: 'more' }, 'L076', { m: 'face' }, { id: 'L077', gap: 2 }]);
  const m = P.m;
  const session = (c, st, kind, num, extra) => CR.wide(c, c.t, Object.assign({ security: true, session: num, clock: 200 + st * 4, dan: CW.thumbDan[kind], smashed: kind === 'smash' && st > 0.8, steam: 0.6, cam: { zoom: TM.push(st, c.shotDur, 1, 1.06) } }, extra || {}));
  FILM.seq({
    id: 'Q06', title: 'The lives he doesn’t remember', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, P.dur, { level: -40 }); S.bed('static', m.s1, m.count, { level: -42 });
      S.bed('drone', 0, P.dur, { f: 36.7, level: -26, fi: 3 }); S.bed('pulse', m.s1, m.count, { bpm: 84, f: 41, level: -24 });
      S.cue('key', 0.3, { n: 5 }); S.cue('ui', m.arch); [m.s1, m.s2, m.s3, m.s4, m.s5, m.s6].forEach(t => S.cue('click', t, { level: -20 }));
      S.cue('radio_on', m.s1 + 0.4, { level: -30 }); S.cue('ring', m.s2 + 0.3, { level: -34 });
      S.cue('shatter', m.s3 + 0.8, { level: -14 }); S.cue('door', m.s4 + 0.6, { level: -18 }); S.cue('piano', m.s6 + 0.4, { notes: [69, 67, 65, 64], gap: 1.1, level: -22 });
      S.cue('riser', m.count, { dur: 2.8, level: -18 }); S.cue('hit', m.count + 2.8, { f: 45, decay: 3, level: -12 });
    },
    shots: [
      { at: 0, name: 'archive opens', fade: TM.fade(0.8, 0), draw(c, st) { CW.screen(c, c.t, { mode: 'console', lines: ['ls /sys/cw/sessions/'], p: st * 14 }); } },
      { at: m.arch, name: 'archive: thousands', draw(c, st) { CW.screen(c, c.t, { mode: 'archive', scroll: st * 0.35, cam: { zoom: TM.push(st, c.shotDur, 1, 1.12) } }); } },
      { at: m.s1, name: 'session: redirecting buses', draw(c, st) { session(c, st, 'radio', '009113'); } },
      { at: m.s2, name: 'session: every emergency line', draw(c, st) { session(c, st, 'phone', '061870'); } },
      { at: m.s3, name: 'session: smashing the monitor', draw(c, st) { session(c, st, 'smash', '104552', { dan: { standing: true, x: 560, pose: st < 0.8 ? RIG.mix(RIG.P.standTense, RIG.P.smash, st / 0.8) : RIG.P.reach } }); if (Math.abs(st - 0.85) < 0.1) X.glitch(c, 60, 5); } },
      { at: m.s4, name: 'session: the stairs', draw(c, st) { session(c, st, 'stairs', '133018', { screens: { 4: { kind: 'hall', p: 1, grade: 'future' } } }); } },
      { at: m.s5, name: 'session: touching nothing', draw(c, st) { session(c, st, 'still', '160447'); } },
      { at: m.s6, name: 'session: crying', draw(c, st) { session(c, st, 'cry', '182640', { clock: 11 * 60 + 50 + st }); } },
      { at: m.count, name: 'the count', draw(c, st) { CW.screen(c, c.t, { mode: 'count', n: 182641 * TM.ss(Math.min(1, st / 2.8)), more: Math.max(0, (c.lt - m.more) / 1.2), cam: { zoom: TM.push(st, c.shotDur, 1.08, 1) } }); } },
      { at: m.face, name: 'profile: almost none of it', fade: TM.fade(0, 1.4), draw(c, st) { CR.ecu(c, c.t, { la: 0.3, cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
    ],
  });
})();
