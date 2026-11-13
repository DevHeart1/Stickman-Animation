/* S09 — The one thing he missed. 11:57: the truck, the strap, the beam, the swerve. He never once stopped the truck. The response. Confirm. */
(function () {
  const P = TM.plan([0.4, { m: 'clock' }, 'L118', { m: 'truck' }, 'L119', { m: 'strap' }, 'L120', { m: 'beam' }, 'L121', { m: 'swerve' }, 'L122', { m: 'freeze' }, { id: 'L123', gap: 0.8 },
    { m: 'lives' }, 'L124', { m: 'never' }, { id: 'L125', gap: 0.8 }, { m: 'type' }, 7.0, { m: 'warn' }, 'L126', { m: 'know' }, 'L127', { m: 'more' }, 'L128', { m: 'no' }, { id: 'L129', gap: 0.8 },
    { m: 'conf' }, 'L130', { m: 'say' }, { id: 'L131', gap: 0.3 }, { m: 'key' }, 1.4, { m: 'collapse' }, 3.6, { m: 'white' }, 1.5]);
  const m = P.m;
  const CMD = ['CLOSE EASTERN BRIDGE.', 'STOP HEAVY GOODS VEHICLE 52.', 'ALERT HIGHWAY PATROL.'];
  const T57 = 23 * 3600 + 57 * 60;
  FILM.seq({
    id: 'Q09', title: 'The one thing he missed', dur: P.dur, lines: P.lines,
    sound(S) {
      S.bed('hum', 0, m.collapse, { level: -40 }); S.bed('tick', 0, m.type, { rate: 0.5, level: -24 });
      S.bed('drone', 0, m.collapse, { f: 36.7, level: -26, fi: 2 }); S.cue('hit', m.clock, { f: 50, decay: 1.6, level: -16 });
      [m.truck, m.strap, m.beam, m.swerve].forEach(t => S.cue('ui', t + 0.2, { level: -26 })); S.cue('screech', m.swerve + 0.6, { dur: 1, level: -22 }); S.cue('hit', m.freeze, { f: 45, decay: 2, level: -16 });
      for (let i = 0; i < 8; i++) S.cue('glitch', m.lives + i * 0.55, { dur: 0.08, level: -24 });
      S.bed('pulse', m.type, m.key, { bpm: 96, f: 41, level: -20 }); S.cue('key', m.type + 0.3, { n: 22, gap: 0.1 }); S.cue('key', m.type + 3, { n: 26, gap: 0.09 }); S.cue('key', m.type + 5.6, { n: 14, gap: 0.09 });
      S.cue('alarm', m.warn, { n: 1, level: -26 }); S.cue('ui', m.more); S.cue('alarm', m.conf, { n: 1, level: -24 });
      S.bed('heartbeat', m.warn, m.key, { bpm: 76, level: -18 }); S.silence(m.say + 1.0, m.key);
      S.cue('confirm', m.key + 0.35, { level: -14 }); S.cue('whiteout', m.collapse, { dur: 3.6, level: -14 }); S.cue('glitch', m.collapse + 0.5, { dur: 1.6, level: -20 });
      S.silence(m.white, P.dur);
    },
    shots: [
      { at: 0, name: 'black', draw(c) { TM.black(c); } },
      { at: m.clock, name: '11:57', draw(c, st) { INS.clock(c, c.t, { mode: 'digital', text: '11:57:00', color: X.K.cyan, sub: 'SESSION 000001 · FRAME BY FRAME' }); } },
      { at: m.truck, name: 'on-ramp: HGV 52', draw(c, st) { X.cam(c); FEEDS.draw(c.g, 'onramp', c.t, { p: 1.2 + st * 0.5, mark: 'HGV 52', stampBase: T57, stampP: 6 + st }); } },
      { at: m.strap, name: 'on-ramp: the strap', draw(c, st) { const p = 2.6 + st * 0.15; const tx = -320 + p * 230; X.cam(c, { x: tx + 170, y: 470, zoom: TM.push(st, c.shotDur, 1.6, 2.3) }); FEEDS.draw(c.g, 'onramp', c.t, { p, mark: 'STRAP 2 · LOOSE', stampBase: T57, stampP: 14 + st, hud: false }); } },
      { at: m.beam, name: 'bridge: the beam slides', draw(c, st) { X.cam(c, { zoom: 1.15, x: 760 }); FEEDS.draw(c.g, 'bridge', c.t, { p: 2.6 + st * 0.3, cut: false, tag: 'SESSION 000001 · ×0.3' }); const S = FEEDS.bridgeState(2.6 + st * 0.3); FEEDS.mark(c.g, S.tf + 140, 340, 'BEAM SHIFT', c.t); } },
      { at: m.swerve, name: 'bridge: the swerve', draw(c, st) { X.cam(c, { zoom: 1.1 }); FEEDS.draw(c.g, 'bridge', c.t, { p: 3.5 + st * 0.3, cut: false, tag: 'SESSION 000001 · ×0.3' }); } },
      { at: m.freeze, name: 'freeze: everything begins there', draw(c, st) {
        X.cam(c, { zoom: TM.push(st, c.shotDur, 1.1, 1.25), x: 700 }); FEEDS.draw(c.g, 'bridge', 0, { p: 3.7, cut: false, tag: 'PAUSED', snow: 0.12 });
        const S = FEEDS.bridgeState(3.7); FEEDS.mark(c.g, S.tf + 150, 345, 'ORIGIN', c.t);
      } },
      { at: m.lives, name: 'flash: a hundred and eighty thousand lifetimes', draw(c, st) {
        const k = Math.floor(st / 0.55); const kinds = ['radio', 'phone', 'smash', 'still', 'cry', 'stairs', 'radio', 'phone', 'still', 'cry'];
        if (k % 2 === 0) { X.cam(c); c.g.drawImage(CW.sessionThumb(c, kinds[k % kinds.length], k % 12), 0, 0, 1280, 720); X.glitch(c, (st % 0.55) < 0.08 ? 50 : 0, k); }
        else { const list = [['top', { scenario: 'divert', p: 5, grade: 'live' }], ['map', { attempts: [], n: 0, grade: 'none', hud: false }], ['top', { scenario: 'green', p: 3, grade: 'live' }], ['kingst', { p: 2 }], ['harbour', { p: 1 }]]; const L = list[k % list.length]; X.cam(c); FEEDS.draw(c.g, L[0], c.t, L[1]); }
      } },
      { at: m.never, name: 'profile: never once', draw(c, st) { CR.ecu(c, c.t, { la: 0.38, dan: { headTilt: -0.1 }, cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
      { at: m.type, name: 'console: the response', draw(c, st) { CW.screen(c, c.t, { mode: 'console', lines: CMD, p: st * 11.5, cam: { zoom: TM.push(st, c.shotDur, 1, 1.06) } }); } },
      { at: m.warn, name: 'warning: no guarantee', draw(c, st) { CW.screen(c, c.t, { mode: 'console', lines: CMD, dialog: 'nozero' }); } },
      { at: m.know, name: 'close: I know', draw(c, st) { CR.close(c, c.t, { light: X.K.amber, rim: '#ffd9a0' }); } },
      { at: m.more, name: 'advisory: more predictions', draw(c, st) { CW.screen(c, c.t, { mode: 'console', lines: CMD, dialog: 'more' }); } },
      { at: m.no, name: 'side: no', draw(c, st) { CR.side(c, c.t, { dan: { pose: RIG.P.sitBack, headTilt: -0.1 }, light: X.K.amber, rim: '#ffd9a0' }); } },
      { at: m.conf, name: 'confirm?', draw(c, st) { CW.screen(c, c.t, { mode: 'console', lines: CMD, dialog: 'confirm', cam: { zoom: TM.push(st, c.shotDur, 1, 1.1) } }); } },
      { at: m.say, name: 'profile: confirm', draw(c, st) { CR.ecu(c, c.t, { light: X.K.amber, rim: '#ffd9a0', eye: '#ffe2b0', la: 0.35, cam: { zoom: TM.push(st, c.shotDur, 1.05, 1.15) } }); } },
      { at: m.key, name: 'the key', draw(c, st) { INS.key(c, c.t, { press: TM.ss(Math.min(1, st / 0.4)) }); } },
      { at: m.collapse, name: 'the simulation collapses', draw(c, st) { EXT.collapse(c, c.t, { k: st / 3.6 }); } },
      { at: m.white, name: 'white', draw(c) { c.reset(); c.g.fillStyle = '#f0fafc'; c.g.fillRect(0, 0, 1920, 1080); } },
    ],
  });
})();
