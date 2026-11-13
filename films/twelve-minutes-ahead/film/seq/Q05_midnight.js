/* S05 — Midnight. The run for the door. 11:59:59. The pulse. 11:48, again: the same call, the same coffee. The scratches. The note. */
(function () {
  const P = TM.plan([0.2, { m: 'run' }, 'L057', { m: 'reach' }, { id: 'L058', gap: 0 }, { m: 'tick' }, 2.4, { m: 'pulse' }, 1.6, { m: 'black' }, 2.2,
    { m: 'back' }, 2.0, { m: 'buzz' }, 2.0, { m: 'call' }, 'L059', { m: 'same1' }, 'L060', { m: 'same2' }, 'L061', { m: 'cup' }, 'L062', { m: 'clock' }, 'L063', 0.6,
    { m: 'dream' }, 'L064', 0.6, { m: 'desk' }, { id: 'L065', gap: 1.0 }, { m: 'note' }, 'L066', 1.2, { m: 'words' }, 4.0]);
  const m = P.m;
  FILM.seq({
    id: 'Q05', title: 'Midnight', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, m.pulse, { level: -36 }); S.bed('heartbeat', 0, m.pulse, { bpm: 140, level: -14 }); S.bed('drone', 0, m.pulse, { f: 46, level: -22 });
      S.cue('breath', m.run + 0.3, { dur: 0.5 }); S.cue('breath', m.run + 1.4, { dur: 0.5 });
      S.bed('tick', m.tick - 0.2, m.pulse, { level: -10 }); S.cue('riser', m.reach, { dur: m.pulse - m.reach, level: -14 });
      S.cue('reset', m.pulse, { level: -4 }); S.cue('whiteout', m.pulse - 0.6, { dur: 0.6 });
      S.silence(m.pulse + 1.4, m.back);
      S.bed('hum', m.back, P.dur, { level: -36, fi: 0.05 }); S.bed('tick', m.back, P.dur, { level: -28 });
      S.cue('buzz', m.buzz, { n: 2 }); S.cue('click', m.call - 0.2);
      S.cue('hit', m.desk + 1.2, { f: 60, decay: 2, level: -18 }); S.bed('drone', m.desk, P.dur, { f: 41, level: -26, fi: 2 });
      S.cue('sting', m.words, { level: -12 }); S.cue('piano', m.words + 0.6, { notes: [64, 63], gap: 1.4, level: -20 });
    },
    shots: [
      { at: 0, name: 'the run for the door', draw(c, st) { CR.door(c, c.t, { p: Math.min(0.999, st / (m.reach - m.run)) }); } },
      { at: m.reach, name: 'the hand reaches', draw(c, st) { CR.door(c, c.t, { p: 1, cam: { zoom: TM.push(st, c.shotDur, 1.2, 1.5), x: 900, y: 300 } }); } },
      { at: m.tick, name: '11:59:5x', draw(c, st) { const s = 57 + Math.min(2, Math.floor(st / 0.8)); INS.clock(c, c.t, { mode: 'digital', text: '11:59:' + s, color: X.K.red, sub: 'SIMULATION 182,641', cam: { zoom: 1 + Math.max(0, 1 - ((st % 0.8) / 0.12)) * 0.03 + st * 0.02 } }); } },
      { at: m.pulse, name: 'the pulse', draw(c, st) {
        INS.clock(c, c.t, { mode: 'digital', text: '11:59:59', color: X.K.red, sub: 'SIMULATION 182,641', cam: { zoom: 1.06 } });
        X.glitch(c, st < 0.5 ? 140 : 0, Math.floor(c.t * 24)); X.white(c, st < 0.4 ? st / 0.4 : Math.max(0, 1 - (st - 0.4) / 1.0));
        if (st > 1.4) X.black(c, 1);
      } },
      { at: m.black, name: 'black', draw(c) { TM.black(c); } },
      { at: m.back, name: '11:48:00', draw(c, st) { INS.clock(c, c.t, { mode: 'digital', text: '11:48:00', sub: 'SIMULATION 182,642' }); } },
      { at: m.buzz, name: 'wide: the same frame', draw(c, st) { CR.wide(c, c.t, { clock: 0 + st, dan: { arms: 'desk' }, buzz: true }); } },
      { at: m.call, name: 'the phone: the same voice', draw(c, st) { INS.phone(c, c.t, { state: 'call', p: st }); } },
      { at: m.same1, name: 'profile: same voice', draw(c, st) { CR.ecu(c, c.t, { cam: { zoom: TM.push(st, c.shotDur, 1.05, 1.1) } }); } },
      { at: m.same2, name: 'over: same feed', draw(c, st) { CR.over(c, c.t, { feed: { kind: 'onramp', p: 1 + st, grade: 'live', stampBase: 23 * 3600 + 48 * 60, stampP: 8 + st } }); } },
      { at: m.cup, name: 'wide: the same coffee', draw(c, st) { CR.wide(c, c.t, { clock: 10 + st, dan: { arms: 'desk', turn: 0.4 }, cam: { x: 856, y: 450, zoom: TM.push(st, c.shotDur, 2.2, 2.5) } }); } },
      { at: m.clock, name: 'clock: the same twelve minutes', draw(c, st) { INS.clock(c, c.t, { sec: 14 + st }); } },
      { at: m.dream, name: 'close: dreamed it', draw(c, st) { CR.close(c, c.t, { dan: { slump: 0.5 } }); } },
      { at: m.desk, name: 'under the desk: the scratches', draw(c, st) { INS.desk(c, c.t, { p: st / (c.shotDur - 0.6), cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
      { at: m.note, name: 'the note unfolds', draw(c, st) { INS.note(c, c.t, { p: Math.min(1, st / 3.2) }); } },
      { at: m.words, name: 'YOU HAVE BEEN HERE BEFORE.', fade: TM.fade(0, 1.5), draw(c, st) { INS.note(c, c.t, { p: 1, cam: { zoom: TM.push(st, c.shotDur, 1, 1.25), y: 400 } }); } },
    ],
  });
})();
