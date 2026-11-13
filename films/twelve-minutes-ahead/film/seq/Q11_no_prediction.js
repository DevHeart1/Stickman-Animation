/* S11 — No prediction available. 12:12 AM. Ada at the doors. "It's barely midnight." The walk home. The window. The end. */
(function () {
  const P = TM.plan([1.6, { m: 'doors' }, 1.8, { m: 'meet' }, 'L144', 'L145', 'L146', 'L147', 'L148', 'L149', { id: 'L150', gap: 1.6 }, { m: 'laugh' }, 'L151', 'L152', { m: 'no' }, { id: 'L153', gap: 1.2 },
    { m: 'walk' }, 'L154', 'L155', { m: 'pull' }, 'L156', { id: 'L157', gap: 3.0 }, { m: 'screen' }, 4.5, { m: 'end' }, 6]);
  const m = P.m;
  const sp = id => lt => TM.speaking(P, id, lt);
  FILM.seq({
    id: 'Q11', title: 'No prediction available', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('wind', 0, m.screen, { level: -32, fi: 2 }); S.bed('city', 0, m.screen, { level: -38, fi: 2 });
      S.cue('door', m.doors + 0.6, { level: -18 }); S.cue('breath', m.laugh - 0.9, { dur: 0.6, level: -22 });
      S.bed('pad', m.walk - 2, m.end + 4, { notes: [45, 52, 57, 61, 64, 69], level: -24, fi: 5, fo: 4 });
      S.cue('piano', m.walk, { notes: [69, 73, 76, 81, null, 80, 76, 73, null, 74, 73, 69], gap: 1.1, level: -18 });
      S.cue('ui', m.screen + 0.2, { level: -28 }); S.cue('swell', m.end, { notes: [57, 64, 69, 73], dur: 6, level: -22 });
    },
    shots: [
      { at: 0, name: 'black', draw(c) { TM.black(c); } },
      { at: m.doors, name: 'the doors: he comes out', fade: TM.fade(1.2, 0), draw(c, st) { EXT.entrance(c, c.t, { dan: { x: 930 - Math.min(1, st / 1.8) * 150, pose: RIG.walk(FILM.twos(c.t) * 3.6, Math.max(0, 1 - st / 1.8)), f: -1 }, ada: { headTilt: 0 }, cam: { zoom: 1.0 } }); } },
      { at: m.meet, name: 'two-shot: they talk', draw(c, st) {
        const lt = c.lt; const close = lt >= P.at.L148 && lt < m.laugh; const step = TM.ss(Math.min(1, Math.max(0, lt - P.at.L151) / 2.4));
        const cam = close ? { zoom: 1.6 + (lt - P.at.L148) * 0.01, x: 560, y: 430 } : { zoom: TM.push(st, 8, 1.0, 1.2), x: 560, y: 400 };
        EXT.entrance(c, c.t, { dan: { x: 780 - step * 300, pose: step > 0 && step < 1 ? RIG.walk(FILM.twos(c.t) * 3.6) : RIG.P.pocket, headTilt: sp('L145')(lt) || sp('L147')(lt) || sp('L149')(lt) ? 0.1 : (lt > m.laugh - 1 && lt < m.laugh ? -0.25 : 0.04) },
          ada: { pose: RIG.P.stand, headTilt: sp('L144')(lt) || sp('L146')(lt) || sp('L148')(lt) || sp('L150')(lt) || sp('L152')(lt) ? -0.08 : 0 }, cam });
      } },
      { at: m.walk, name: 'the walk home', draw(c, st) { EXT.walk(c, c.t, { talk: null }); } },
      { at: m.pull, name: 'the pull away', draw(c, st) { EXT.pullback(c, c.t, { k: TM.ss(Math.min(1, st / (c.shotDur - 0.5))) }); } },
      { at: m.screen, name: 'NO PREDICTION AVAILABLE', draw(c, st) { CW.screen(c, c.t, { mode: 'terminated', a: Math.min(1, st / 0.8), a2: Math.max(0, (st - 1.4) / 1) }); } },
      { at: m.end, name: 'the end', fade: TM.fade(0, 1.6), draw(c, st) { EXT.title(c, c.t, { k: Math.min(1, st / 1.5), sub: 'THE END' }); } },
    ],
  });
})();
