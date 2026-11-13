/* S02 — The man behind the cameras. The city, the job, the route home. Ada's call. "I'll be fine." The wife. */
(function () {
  const P = TM.plan([1.0, { m: 'city' }, 'L010', { m: 'wide' }, 'L011', { m: 'feeds' }, 'L012', { m: 'route' }, 'L013', { m: 'lean' }, 'L014', 0.4,
    { m: 'buzz' }, 2.2, { m: 'call' }, 'L015', 'L016', { m: 'c2' }, 'L017', { m: 'c3' }, 'L018', { m: 'c4' }, 'L019', { m: 'c5' }, 'L020', { m: 'c6' }, { id: 'L021', gap: 0.4 }, { m: 'ended' }, 1.6,
    { m: 'face' }, 'L022', { m: 'mem' }, { id: 'L023', gap: 0.8 }, { m: 'photo' }, { id: 'L024', gap: 1.2 }, { m: 'room' }, 'L025', 1.2, { m: 'flick' }, 1.4]);
  const m = P.m, sec = lt => 4 + lt * 0.4;   // the wall clock drifts through 11:48
  const talk = id => lt => TM.speaking(P, id, lt);
  FILM.seq({
    id: 'Q02', title: 'The man behind the cameras', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('wind', 0, m.wide + 0.5, { level: -30, fi: 1 }); S.bed('city', 0, m.wide + 0.5, { level: -34 });
      S.bed('hum', m.wide, P.dur, { level: -36 }); S.bed('tick', m.wide, P.dur, { level: -28 });
      S.bed('pad', 0, m.buzz, { notes: [45, 52, 57, 60], level: -30, fi: 3, fo: 2 });
      S.cue('buzz', m.buzz, { n: 2 }); S.cue('click', m.call - 0.2);
      S.cue('click', m.ended - 0.1, { level: -14 }); S.cue('beep', m.ended, { n: 3, f: 620, level: -26 });
      S.bed('drone', m.face, m.room, { f: 49, level: -30, fi: 2 });
      S.cue('piano', m.mem + 0.5, { notes: [69, null, 67, 64, null, 62], gap: 0.9, level: -20 });
      S.bed('pulse', m.room, P.dur, { bpm: 70, f: 45, level: -22 });
      S.cue('glitch', m.flick, { dur: 0.6 }); S.cue('sting', m.flick + 0.6, { level: -16 });
    },
    shots: [
      { at: 0, name: 'black', draw(c) { TM.black(c); } },
      { at: m.city, name: 'the sleeping city', fade: TM.fade(1.2, 0), draw(c, st) { EXT.city(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1.0, 1.15), x: 700, y: 360 } }); } },
      { at: m.wide, name: 'wide: the night shift', draw(c, st) { CR.wide(c, c.t, { clock: sec(c.lt), dan: { arms: 'desk' }, cam: { zoom: TM.push(st, c.shotDur, 1.05, 1.0) } }); } },
      { at: m.feeds, name: 'feed: the on-ramp', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'onramp', c.t, { p: 1 + st, grade: 'live', stampBase: 23 * 3600 + 48 * 60 + sec(c.lt), stampP: 0 }); } },
      { at: m.feeds + 1.8, name: 'feed: King St', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'top', c.t, { p: 0, scenario: 'none', grade: 'live', stampBase: 23 * 3600 + 48 * 60 + sec(c.lt), stampP: 0 }); } },
      { at: m.feeds + 3.4, name: 'feed: the bridge', draw(c, st) { X.cam(c, { zoom: 1.05 }); FEEDS.draw(c.g, 'bridge', c.t, { p: 0, cut: false, grade: 'live', stampBase: 23 * 3600 + 48 * 60 + sec(c.lt), stampP: 0 }); } },
      { at: m.route, name: 'over: bus 26, ringed', draw(c, st) { CR.over(c, c.t, { feed: { kind: 'top', scenario: 'live', ring: true, p: 0.5 + st * 0.3, grade: 'live', stampBase: 23 * 3600 + 48 * 60 + sec(c.lt), stampP: 0 }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.12) } }); } },
      { at: m.lean, name: 'close: from behind', draw(c, st) { CR.close(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.06) } }); } },
      { at: m.buzz, name: 'the phone: Ada', draw(c, st) { INS.phone(c, c.t, { state: 'ring', cam: { zoom: TM.push(st, c.shotDur, 1.1, 1.0) } }); } },
      { at: m.call, name: 'side: on the phone', draw(c, st) { CR.side(c, c.t, { dan: { pose: RIG.P.sitPhone, prop: 'phone', headTilt: talk('L016')(c.lt) ? 0.08 : 0 } }); } },
      { at: m.c2, name: 'close: from behind, on the phone', draw(c, st) { CR.close(c, c.t, { dan: { arms: 'phone', turn: 0.5 } }); } },
      { at: m.c3, name: 'side: how far', draw(c, st) { CR.side(c, c.t, { dan: { pose: RIG.P.sitPhone, prop: 'phone', headTilt: 0.12 } }); } },
      { at: m.c4, name: 'phone: Dad.', draw(c, st) { INS.phone(c, c.t, { state: 'call', p: 9 + st }); } },
      { at: m.c5, name: 'side: humour me', draw(c, st) { CR.side(c, c.t, { dan: { pose: RIG.P.sitPhone, prop: 'phone', headTilt: -0.05 } }); } },
      { at: m.c6, name: 'phone: I’ll be fine', draw(c, st) { INS.phone(c, c.t, { state: st > c.shotDur - 1.8 ? 'ended' : 'call', p: 14 + st, cam: { zoom: TM.push(st, c.shotDur, 1, 1.15) } }); } },
      { at: m.face, name: 'profile: those three words', draw(c, st) { CR.ecu(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.08) } }); } },
      { at: m.mem, name: 'memory: she leaves for work', draw(c, st) { INS.memory(c, c.t, { p: st / c.shotDur, cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
      { at: m.photo, name: 'the photograph', draw(c, st) { INS.photo(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1, 1.18), x: 760, y: 300 } }); } },
      { at: m.room, name: 'wide: watching closely enough', draw(c, st) { CR.wide(c, c.t, { clock: sec(c.lt), dan: { arms: 'desk' }, cam: { zoom: TM.push(st, c.shotDur, 1.0, 1.2), y: 330 } }); } },
      { at: m.flick, name: 'the main screen flickers', draw(c, st) {
        CR.over(c, c.t, { alert: st > 0.6, feed: st < 0.6 ? { kind: 'bridge', grade: 'live', p: 0, cut: false } : { kind: 'bridge', grade: 'future', p: 0.5 + st * 0.5 } });
        if (st < 0.7) X.glitch(c, 80 * (1 - st / 0.7), Math.floor(c.t * 24));
      } },
    ],
  });
})();
