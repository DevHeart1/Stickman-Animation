/* TWELVE MINUTES AHEAD — inserts (INS) and CityWatch's screens (CW). All full-frame, design space, (c, t, o).
   INS.clock {sec, mode: 'analog'|'digital', color}, INS.phone {state: 'ring'|'call'|'ended'|'voicemail', p}, INS.photo {focus},
   INS.desk {p}, INS.note {p}, INS.mic {tx}, INS.key {press}, INS.sign {mode}
   CW.screen {mode: 'count'|'voice'|'archive'|'console'|'terminated'|'objective', ...} */
(function (G) {
  'use strict';
  const X = G.X, K = X.K, TAU = Math.PI * 2, O = G.OTM, RIG = G.RIG;
  const cl = (v, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v));
  const INS = G.INS = {}, CW = G.CW = {};

  INS.clock = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const sec = o.sec || 0;
    g.fillStyle = '#05070a'; g.fillRect(-200, -200, 1680, 1120);
    const col = o.color || K.amber;
    if (o.mode === 'digital') {
      X.glow(g, 640, 330, 620, col, 0.22);
      X.txt(g, o.text || X.clock(sec), 640, 400, { size: 190, weight: 500, align: 'center', color: col });
      c.em.save(); c.em.globalAlpha = 0.6; c.em.fillStyle = col; c.em.font = '500 190px "IBM Plex Mono"'; c.em.textAlign = 'center'; c.em.fillText(o.text || X.clock(sec), 640, 400); c.em.restore();
      if (o.sub) X.txt(g, o.sub, 640, 470, { size: 26, align: 'center', color: 'rgba(233,229,220,0.7)' });
    } else {
      const cx = 640, cy = 320, r = 240;
      X.glow(g, cx, cy, 520, K.cyan, 0.08);
      g.fillStyle = '#0f141b'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.strokeStyle = '#2a323d'; g.lineWidth = 18; g.stroke();
      g.strokeStyle = '#8a94a0'; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0; g.lineWidth = big ? 6 : 2; g.beginPath(); g.moveTo(cx + Math.sin(a) * r * (big ? 0.78 : 0.85), cy - Math.cos(a) * r * (big ? 0.78 : 0.85)); g.lineTo(cx + Math.sin(a) * r * 0.9, cy - Math.cos(a) * r * 0.9); g.stroke(); }
      const tot = 23 * 3600 + 48 * 60 + sec; const hh = (Math.floor(tot) / 3600) % 12, mm = (Math.floor(tot) / 60) % 60, ss = Math.floor(tot) % 60;
      const hand = (a, l, w, c2) => { g.strokeStyle = c2; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - Math.sin(a) * 20, cy + Math.cos(a) * 20); g.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); g.stroke(); };
      hand(hh / 12 * TAU, r * 0.5, 16, K.paper); hand(mm / 60 * TAU, r * 0.74, 10, K.paper); hand(ss / 60 * TAU, r * 0.82, 4, K.red);
      g.fillStyle = K.red; g.beginPath(); g.arc(cx, cy, 10, 0, TAU); g.fill();
      X.txt(g, X.clock24(sec), cx, cy + 110, { size: 34, weight: 500, align: 'center', color: col });
    }
    X.vig(g, 0.7); X.floor(g, 0.4);
  };

  INS.phone = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const st = o.state || 'ring';
    g.fillStyle = '#06080b'; g.fillRect(-200, -200, 1680, 1120);
    // the desk surface, the phone face up
    g.fillStyle = '#0c1016'; g.fillRect(-200, 300, 1680, 600); X.glow(g, 640, 360, 500, st === 'ended' ? K.cyan : K.amber, 0.2);
    const buzz = st === 'ring' ? Math.sin(t * 70) * 3 * (Math.floor(t * 1.4) % 2) : 0;
    g.save(); g.translate(640 + buzz, 360); g.rotate(-0.08);
    g.fillStyle = '#111418'; X.rrect(g, -150, -290, 300, 580, 36); g.fill(); g.strokeStyle = '#2a3038'; g.lineWidth = 4; g.stroke();
    const sg = g.createLinearGradient(0, -270, 0, 270); sg.addColorStop(0, '#2a1d10'); sg.addColorStop(1, '#0e0a06'); g.fillStyle = st === 'ended' ? '#0b1114' : sg; X.rrect(g, -134, -272, 268, 544, 26); g.fill();
    if (st === 'voicemail') {
      X.txt(g, 'VOICEMAIL', 0, -200, { size: 18, align: 'center', color: 'rgba(233,229,220,0.6)' }); X.txt(g, 'Ada', 0, -150, { family: 'Libre Franklin', weight: 700, size: 40, align: 'center', color: K.amber });
      X.txt(g, 'Tues 10:14 PM · 0:21', 0, -112, { size: 14, align: 'center', color: 'rgba(233,229,220,0.6)' });
      g.strokeStyle = K.amber; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 60; i++) { const x = -110 + i * 3.7; const a = (o.speaking ? 0.3 + 0.7 * Math.abs(Math.sin(i * 0.9 + t * 7)) : 0.15) * 40 * Math.abs(Math.sin(i * 0.37)); g.moveTo(x, 20 - a); g.lineTo(x, 20 + a); } g.stroke();
      const prog = cl(o.p || 0); g.fillStyle = 'rgba(233,229,220,0.2)'; g.fillRect(-110, 110, 220, 4); g.fillStyle = K.amber; g.fillRect(-110, 110, 220 * prog, 4);
    } else {
      // Ada's contact picture
      g.save(); g.beginPath(); g.arc(0, -120, 74, 0, TAU); g.clip(); g.fillStyle = '#f2b451'; g.fillRect(-80, -200, 160, 160);
      RIG.back(g, { x: 0, y: -80, s: 1.9, who: 'ada', arms: 'none', fill: '#1a0f04', light: [0, 0], rimW: 0, turn: -0.9 }); g.restore();
      X.txt(g, 'Ada', 0, 0, { family: 'Libre Franklin', weight: 700, size: 46, align: 'center', color: '#fff' });
      X.txt(g, st === 'ring' ? 'mobile' : st === 'call' ? '00:' + X.pad(Math.floor(o.p || 0)) : 'Call ended', 0, 40, { size: 18, align: 'center', color: 'rgba(233,229,220,0.7)' });
      if (st === 'ring') { [[-70, '#2fa860'], [70, '#c83a3a']].forEach(([x, c2]) => { g.fillStyle = c2; g.beginPath(); g.arc(x, 200, 34, 0, TAU); g.fill(); }); }
      if (st === 'call') { g.fillStyle = '#c83a3a'; g.beginPath(); g.arc(0, 200, 34, 0, TAU); g.fill(); }
    }
    g.restore();
    if (st === 'ring') X.lamp(c, 640, 360, 300, K.amber, 0.25);
    X.vig(g, 0.7); X.floor(g, 0.45);
  };

  // ---------- noir (black and white, harsh light, ink silhouettes): memory ----------
  function noirSky(g, sx, sy, seed) {
    g.fillStyle = '#0a0a0a'; g.fillRect(-200, -200, 1680, 1120);
    const rg = g.createRadialGradient(sx, sy, 10, sx, sy, 520); rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.25, '#d8d8d8'); rg.addColorStop(1, 'rgba(20,20,20,0)'); g.fillStyle = rg; g.fillRect(-200, -200, 1680, 1120);
    const R = O.rng('cloud' + seed); g.save(); g.filter = 'blur(5px)'; for (let i = 0; i < 70; i++) { const x = sx + (R() - 0.5) * 1100, y = sy - 170 + (R() - 0.5) * 280 + Math.abs(x - sx) * 0.12, r = 14 + R() * 46; g.fillStyle = R() < 0.55 ? `rgba(240,240,240,${0.35 + R() * 0.4})` : `rgba(60,60,60,${0.4 + R() * 0.4})`; g.beginPath(); g.ellipse(x, y, r * 1.6, r, (R() - 0.5) * 0.6, 0, TAU); g.fill(); } g.restore();
  }
  INS.noirSky = noirSky;
  // the family photograph on the desk, in black and white
  INS.photo = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    g.fillStyle = '#050505'; g.fillRect(-200, -200, 1680, 1120);
    g.save(); g.translate(640, 350); g.rotate(-0.03);
    g.fillStyle = '#1a1a1a'; g.fillRect(-380, -270, 760, 540); g.fillStyle = '#0b0b0b'; g.fillRect(-352, -242, 704, 484);
    g.beginPath(); g.rect(-340, -230, 680, 460); g.clip();
    g.save(); g.translate(-640, -360); g.drawImage(c.cache('X|noirPh', sg => { sg.scale(1.5, 1.5); noirSky(sg, 820, 220, 'ph'); }, 1920, 1080), 0, 0, 1280, 720); g.restore();
    g.fillStyle = '#080808'; g.beginPath(); g.moveTo(-340, 140); g.quadraticCurveTo(0, 110, 340, 150); g.lineTo(340, 230); g.lineTo(-340, 230); g.fill();
    const W = '#f0f0f0';
    RIG.figure(g, { x: -150, y: 140 - 84 * 1.4, s: 1.4, f: 1, who: 'daniel', pose: { torso: 0.02, lt: 0.06, rt: -0.06, lu: -0.2, lf: 0.2, ru: 0.5, rf: 0.4 }, fill: '#060606', rim: W, light: [0.6, -1], rimW: 2 });
    RIG.figure(g, { x: 150, y: 140 - 84 * 1.4 * 0.95, s: 1.4, f: -1, who: 'mum', pose: { torso: 0.02, lt: 0.06, rt: -0.06, lu: -0.2, lf: 0.2, ru: 0.5, rf: 0.4 }, fill: '#060606', rim: W, light: [-0.6, -1], rimW: 2 });
    RIG.figure(g, { x: 0, y: 150 - 84 * 0.95 * 0.88, s: 0.95, f: 1, who: 'ada', backpack: false, pose: { torso: 0, lt: 0.1, rt: -0.1, lu: 1.3, lf: 0.2, ru: 1.3, rf: 0.2 }, fill: '#060606', rim: W, light: [0, -1], rimW: 2 });
    g.fillStyle = 'rgba(255,255,255,0.05)'; g.beginPath(); g.moveTo(-340, -230); g.lineTo(-100, -230); g.lineTo(-340, 80); g.fill();
    g.restore();
    X.vig(g, 0.75); X.floor(g, 0.45);
  };
  // four years ago: she leaves for work, into the hard morning light (noir)
  INS.memory = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const p = o.p || 0;
    X.layer(c, 'noirMem', bg => noirSky(bg, 900, 250, 'mem'));
    // street walls in perspective, ink
    g.fillStyle = '#050505'; g.beginPath(); g.moveTo(-200, -200); g.lineTo(420, 120); g.lineTo(420, 520); g.lineTo(-200, 920); g.fill();
    g.beginPath(); g.moveTo(1480, -200); g.lineTo(1040, 160); g.lineTo(1040, 520); g.lineTo(1480, 920); g.fill();
    g.fillStyle = '#c8c8c8'; for (let i = 0; i < 6; i++) { g.fillRect(1060 + i * 30, 200 + i * 6, 14, 200 - i * 10); }
    g.fillStyle = '#e6e6e6'; for (let i = 0; i < 5; i++) g.fillRect(300 - i * 46, 180 + i * 10, 22, 220 + i * 30);
    // the road and a long white road line
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.moveTo(420, 520); g.lineTo(1040, 520); g.lineTo(1480, 920); g.lineTo(-200, 920); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.moveTo(725, 520); g.lineTo(735, 520); g.lineTo(790, 920); g.lineTo(700, 920); g.fill();
    // the street lamp
    g.fillStyle = '#050505'; g.fillRect(960, 160, 7, 360); g.fillRect(900, 160, 66, 6); X.glow(g, 905, 168, 90, '#ffffff', 0.9);
    // her, walking away toward the light; her long shadow toward us
    const ph = G.FILM.twos(t) * 3.2; const k = cl(p); const sx = 700 + k * 40, sy = 520 - k * 30, sc = 1.6 - k * 0.7;
    g.save(); g.globalAlpha = 0.85; g.fillStyle = '#000'; g.beginPath(); g.moveTo(sx - 14 * sc, sy + 10); g.lineTo(sx + 14 * sc, sy + 10); g.lineTo(sx + 60, 920); g.lineTo(sx - 80, 920); g.fill(); g.restore();
    RIG.figure(g, { x: sx, y: sy - 84 * sc * 0.95, s: sc, f: 1, who: 'mum', pose: RIG.walk(ph, 0.8), fill: '#030303', rim: '#ffffff', light: [0.3, -1], rimW: 2, prop: 'bag' });
    X.vig(g, 0.7); X.floor(g, 0.5);
    g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(-200, -200, 1680, 1120); g.restore();
  };

  INS.desk = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const p = o.p || 0;
    g.fillStyle = '#0b0907'; g.fillRect(-200, -200, 1680, 1120);
    X.layer(c, 'insDesk', bg => { bg.fillStyle = '#16110c'; bg.fillRect(0, 0, 1280, 720); const R = O.rng('wood'); bg.strokeStyle = 'rgba(60,40,25,0.5)'; for (let i = 0; i < 70; i++) { bg.lineWidth = 1 + R() * 2; bg.beginPath(); const y = R() * 720; bg.moveTo(0, y); bg.bezierCurveTo(400, y + (R() - 0.5) * 30, 800, y + (R() - 0.5) * 30, 1280, y + (R() - 0.5) * 20); bg.stroke(); } });
    // the phone torch sweeping
    const lx = 300 + cl(p) * 380, ly = 340;
    g.save(); g.globalCompositeOperation = 'multiply'; const gr = g.createRadialGradient(lx, ly, 40, lx, ly, 520); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(20,20,20,1)'); g.fillStyle = gr; g.fillRect(-200, -200, 1680, 1120); g.restore();
    X.glow(g, lx, ly, 360, '#fff2d8', 0.25);
    // scratched letters
    const R = O.rng('scratch'); g.save(); g.translate(640, 330); g.rotate(-0.04);
    const msg = 'LOOK UNDER THE KEYBOARD'; g.font = '800 64px "Libre Franklin"'; g.textAlign = 'center';
    const reveal = cl((p - 0.2) / 0.6); const w = g.measureText(msg).width;
    g.save(); g.beginPath(); g.rect(-w / 2 - 20, -80, (w + 40) * reveal, 120); g.clip();
    for (let k = 0; k < 3; k++) { g.save(); g.translate((R() - 0.5) * 4, (R() - 0.5) * 4); g.strokeStyle = `rgba(230,214,190,${0.35 + k * 0.15})`; g.lineWidth = 1.6; g.strokeText(msg, 0, 0); g.restore(); }
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(msg, 2, 3);
    g.restore(); g.restore();
    X.vig(g, 0.8); X.floor(g, 0.4);
  };

  INS.note = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const p = cl(o.p || 0);
    g.fillStyle = '#07090c'; g.fillRect(-200, -200, 1680, 1120); X.glow(g, 640, 360, 600, '#fff2d8', 0.12);
    // the keyboard edge above
    g.fillStyle = '#141a22'; g.fillRect(100, 40, 1080, 120); for (let i = 0; i < 18; i++) { g.fillStyle = '#1d252f'; g.fillRect(120 + i * 58, 60, 50, 40); }
    // the paper unfolding: the top half rotates open
    g.save(); g.translate(640, 400); g.rotate(0.03);
    g.fillStyle = '#e9e2d0'; g.fillRect(-300, 0, 600, 190);
    const open = p, hgt = 190 * (open * 2 - 1);
    g.fillStyle = open > 0.5 ? '#efe9d9' : '#d8d0bc'; g.fillRect(-300, -Math.max(0, hgt), 600, Math.abs(hgt));
    g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-300, 0); g.lineTo(300, 0); g.stroke();
    if (open > 0.6) {
      const a = cl((open - 0.6) / 0.3); g.globalAlpha = a; const R = O.rng('hand');
      const msg1 = 'YOU HAVE BEEN', msg2 = 'HERE BEFORE.';
      [[msg1, -90], [msg2, 40]].forEach(([m, y]) => { let x = -m.length * 21; for (const ch of m) { g.save(); g.translate(x, y); g.rotate((R() - 0.5) * 0.12); X.txt(g, ch, 0, 0, { family: 'Libre Franklin', style: 'italic', weight: 800, size: 58 + (R() - 0.5) * 8, color: '#1b1a2a' }); g.restore(); x += 42; } });
    }
    g.restore();
    X.vig(g, 0.7); X.floor(g, 0.45);
  };

  INS.mic = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    g.fillStyle = '#06080b'; g.fillRect(-200, -200, 1680, 1120); X.glow(g, 760, 300, 600, K.cyan, 0.12);
    g.fillStyle = '#10151b'; g.fillRect(-200, 520, 1680, 400);
    g.fillStyle = '#1a2129'; X.rrect(g, 560, 470, 320, 70, 10); g.fill();
    g.strokeStyle = '#2a323d'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(720, 470); g.quadraticCurveTo(700, 300, 600, 240); g.stroke();
    g.fillStyle = '#20262c'; g.beginPath(); g.ellipse(585, 230, 60, 46, -0.5, 0, TAU); g.fill(); g.strokeStyle = '#2f3740'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(560 + i * 8, 200); g.lineTo(575 + i * 8, 262); g.stroke(); }
    const tx = o.tx; g.fillStyle = tx ? K.red : '#3a1414'; g.beginPath(); g.arc(820, 505, 12, 0, TAU); g.fill(); if (tx) { X.lamp(c, 820, 505, 60, K.red, 0.6); }
    X.txt(g, tx ? 'TX' : 'RX', 790, 512, { size: 18, color: tx ? K.red : 'rgba(233,229,220,0.5)', align: 'right' });
    X.txt(g, o.label || 'CH 4 · TRANSIT', 600, 515, { size: 16, color: K.cyan });
    // Daniel's hand on the push-to-talk
    RIG.limb(g, [[1300, 760], [1010, 600], [880, 520]], 4, RIG.PAPER);
    X.vig(g, 0.7); X.floor(g, 0.4);
  };

  INS.key = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const pr = cl(o.press || 0);
    g.fillStyle = '#06080b'; g.fillRect(-200, -200, 1680, 1120);
    g.fillStyle = '#121820'; g.fillRect(-200, 300, 1680, 600);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) { g.fillStyle = '#1a222c'; X.rrect(g, -60 + i * 120, 330 + r * 110, 100, 90, 10); g.fill(); }
    const kx = 520, ky = 380, dn = pr * 14;
    g.fillStyle = '#0d2a30'; X.rrect(g, kx, ky + dn, 240, 160, 16); g.fill(); g.strokeStyle = K.cyan; g.lineWidth = 3; g.stroke();
    X.txt(g, 'CONFIRM', kx + 120, ky + 92 + dn, { size: 32, weight: 500, align: 'center', color: K.cyan });
    X.lamp(c, kx + 120, ky + 80, 260, K.cyan, 0.25 + pr * 0.4);
    // the finger
    const fy = 120 + pr * 270; RIG.limb(g, [[900, -100], [700, fy - 60], [650, fy + 30]], 4.5, RIG.PAPER);
    X.vig(g, 0.7); X.floor(g, 0.4);
  };

  INS.sign = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    g.fillStyle = '#04070b'; g.fillRect(-200, -200, 1680, 1120); X.skyline(g, 560, '#0a1015', 'rgba(242,200,120,0.35)', 0.8);
    g.fillStyle = '#1d252c'; g.fillRect(140, 120, 1000, 18); g.fillRect(160, 120, 16, 600); g.fillRect(1104, 120, 16, 600);
    g.fillStyle = '#080a0c'; g.fillRect(260, 150, 760, 260);
    const on = o.mode === 'red' ? Math.floor(t * 2) % 2 : 1; const col = o.mode === 'red' ? (on ? '#ff4a3a' : '#5a1510') : '#f2c06a';
    const l1 = o.l1 || 'EASTERN BRIDGE CLOSED', l2 = o.l2 || 'DIVERT VIA KING ST';
    X.txt(g, l1, 640, 260, { size: 50, weight: 500, align: 'center', color: col }); X.txt(g, l2, 640, 340, { size: 40, weight: 500, align: 'center', color: col });
    if (on) { X.lamp(c, 640, 280, 420, o.mode === 'red' ? K.red : K.amber, 0.22); }
    X.vig(g, 0.6); X.floor(g, 0.45);
  };

  // ---------- CityWatch ----------
  function chrome(g, title, t) {
    g.fillStyle = '#031014'; g.fillRect(-200, -200, 1680, 1120);
    g.strokeStyle = 'rgba(95,211,230,0.08)'; g.lineWidth = 1; for (let x = 0; x < 1280; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 720); g.stroke(); } for (let y = 0; y < 720; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(1280, y); g.stroke(); }
    X.txt(g, 'CITYWATCH', 40, 54, { size: 20, color: K.cyan, track: 6 }); X.txt(g, title || 'PREDICTION ENGINE', 210, 54, { size: 20, color: 'rgba(95,211,230,0.55)', track: 2 });
    X.txt(g, 'v0.9.4 · OPERATOR D. OKAFOR', 1240, 54, { size: 13, color: 'rgba(95,211,230,0.45)', align: 'right' });
    g.fillStyle = 'rgba(95,211,230,0.4)'; g.fillRect(40, 70, 1200, 1);
  }
  const thumbs = ['radio', 'phone', 'smash', 'stairs', 'still', 'cry'];
  const thumbDan = {
    radio: { arms: 'radio', turn: 0.2 },
    phone: { arms: 'phone', turn: 0.6 },
    smash: { standing: true, x: 560, pose: RIG.P.smash },
    stairs: null,
    still: { arms: 'desk' },
    cry: { arms: 'head', slump: 1 },
  };
  CW.thumbDan = thumbDan;
  function sessionThumb(c, kind, i) {
    return c.cache('cwThumb|' + kind + '|' + i, (g2) => {
      g2.scale(320 / 1280, 180 / 720);
      G.CR.drawRoom(g2, 3.1 + i * 0.7, { security: true, steam: 0, clock: 60 + (i * 37) % 600, dan: thumbDan[kind], session: String(1000 + i * 4111).padStart(6, '0'), smashed: kind === 'smash', screens: kind === 'stairs' ? { 4: { kind: 'hall', p: 1, grade: 'future' } } : null }, c);
    }, 320, 180);
  }
  CW.sessionThumb = sessionThumb;

  CW.screen = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const m = o.mode || 'voice';
    if (m === 'count') {
      chrome(g, 'PREDICTION ENGINE', t);
      const n = Math.floor(o.n == null ? 182641 : o.n); const s = n.toLocaleString('en-GB');
      X.txt(g, s, 640, 360, { size: 170, weight: 500, align: 'center', color: K.paper });
      c.em.save(); c.em.globalAlpha = 0.25; c.em.fillStyle = K.cyan; c.em.fillRect(140, 220, 1000, 170); c.em.restore();
      X.txt(g, 'SIMULATIONS COMPLETED', 640, 420, { size: 24, align: 'center', color: K.cyan, track: 4 });
      if (o.more) {
        const a = cl(o.more);
        X.txt(g, 'OBJECTIVE', 300, 520, { size: 16, align: 'center', color: 'rgba(95,211,230,0.6)', alpha: a, track: 3 }); X.txt(g, "GUARANTEE ADA'S SURVIVAL", 300, 556, { size: 24, align: 'center', color: K.amber, alpha: a });
        X.txt(g, 'STATUS', 980, 520, { size: 16, align: 'center', color: 'rgba(95,211,230,0.6)', alpha: a, track: 3 }); X.txt(g, 'UNRESOLVED', 980, 556, { size: 24, align: 'center', color: K.red, alpha: a * (0.6 + 0.4 * Math.sin(t * 5)) });
      }
    } else if (m === 'voice') {
      chrome(g, o.title || 'OPERATOR LINK', t);
      const cx = 640, cy = 340, r = 170, a = o.speaking ? 1 : 0.35;
      X.glow(g, cx, cy, 420, K.cyan, 0.25); X.lamp(c, cx, cy, 260, K.cyan, 0.2 + 0.25 * a);
      g.strokeStyle = K.cyan; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
      g.globalAlpha = 0.4; g.beginPath(); g.arc(cx, cy, r * 1.18, t * 0.5, t * 0.5 + 4.4); g.stroke(); g.beginPath(); g.arc(cx, cy, r * 1.32, -t * 0.3, -t * 0.3 + 2.2); g.stroke(); g.globalAlpha = 1;
      g.beginPath(); for (let i = -60; i <= 60; i++) { const xx = cx + i * r / 66, env = Math.cos(i / 60 * Math.PI / 2); const yy = cy + Math.sin(i * 0.3 + t * 9) * Math.sin(i * 0.07 - t * 3) * r * 0.42 * env * (0.12 + 0.88 * a * (0.5 + 0.5 * Math.abs(Math.sin(t * 5.3)))); i === -60 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke();
      if (o.status) X.txt(g, o.status, 640, 600, { size: 18, align: 'center', color: o.statusColor || 'rgba(95,211,230,0.7)', track: 3 });
      if (o.unstable) { const R = O.rng('un' + Math.floor(t * 8)); for (let i = 0; i < 6; i++) { g.fillStyle = X.hexA(K.red, 0.25); g.fillRect(R() * 1280, R() * 720, 80 + R() * 300, 3); } }
    } else if (m === 'archive') {
      chrome(g, 'SESSION ARCHIVE · /sys/cw/sessions/', t);
      const scroll = (o.scroll || 0) % 1, cols = 5, tw = 220, th = 124, gx = 22;
      for (let r = -1; r < 6; r++) for (let k = 0; k < cols; k++) {
        const idx = (r + 400) * cols + k; const kind = thumbs[(idx * 7 + Math.floor(idx / 3)) % thumbs.length];
        const x = 72 + k * (tw + gx), y = 100 + (r + scroll) * (th + 44);
        if (y > 720 || y + th < 70) continue;
        g.drawImage(sessionThumb(c, kind, idx % 12), x, y, tw, th);
        const hl = o.highlight && o.highlight === kind && r === 2 && k === 2;
        g.strokeStyle = hl ? K.amber : 'rgba(95,211,230,0.35)'; g.lineWidth = hl ? 4 : 1.5; g.strokeRect(x, y, tw, th);
        X.txt(g, 'session_' + String(182641 - idx * 13).padStart(6, '0') + '.cwr', x, y + th + 20, { size: 12, color: 'rgba(95,211,230,0.6)' });
      }
      g.fillStyle = 'rgba(3,16,20,0.9)'; g.fillRect(-200, -200, 1680, 280); chrome2();
      function chrome2() { X.txt(g, 'CITYWATCH', 40, 54, { size: 20, color: K.cyan, track: 6 }); X.txt(g, 'SESSION ARCHIVE · /sys/cw/sessions/', 210, 54, { size: 20, color: 'rgba(95,211,230,0.55)', track: 2 }); X.txt(g, (o.files || '182,641') + ' FILES', 1240, 54, { size: 16, color: K.amber, align: 'right' }); g.fillStyle = 'rgba(95,211,230,0.4)'; g.fillRect(40, 70, 1200, 1); }
    } else if (m === 'console') {
      chrome(g, 'RESPONSE CONSOLE', t);
      const lines = o.lines || []; const typed = o.p == null ? 1e9 : o.p; let left = typed;
      lines.forEach((L, i) => { const n = Math.max(0, Math.min(L.length, Math.floor(left))); left -= L.length + 6; X.txt(g, (i === 0 ? '> ' : '  ') + L.slice(0, n), 90, 160 + i * 48, { size: 28, color: K.paper }); if (n > 0 && n < L.length && Math.floor(t * 3) % 2) { g.fillStyle = K.paper; g.fillRect(90 + 34 + n * 16.8, 136 + i * 48, 14, 28); } });
      if (o.dialog) {
        const d = { nozero: ['WARNING', 'This response does not guarantee', 'zero casualties.', K.amber], more: ['ADVISORY', 'Additional predictions are available.', '[ RUN 1,000,000 MORE ]', K.cyan], confirm: ['CONFIRM', 'Release unverified response?', '[ CONFIRM ]   [ CANCEL ]', K.red] }[o.dialog];
        g.fillStyle = 'rgba(2,8,10,0.92)'; g.fillRect(300, 340, 680, 220); g.strokeStyle = d[3]; g.lineWidth = 3; g.strokeRect(300, 340, 680, 220);
        X.txt(g, d[0], 640, 390, { size: 22, align: 'center', color: d[3], track: 6 }); X.txt(g, d[1], 640, 448, { size: 26, align: 'center', color: K.paper }); X.txt(g, d[2], 640, 500, { size: 24, align: 'center', color: o.dialog === 'more' ? K.cyan : K.paper });
        X.lamp(c, 640, 450, 400, d[3], 0.12);
      }
    } else if (m === 'terminated') {
      g.fillStyle = '#020608'; g.fillRect(-200, -200, 1680, 1120);
      const a = cl(o.a == null ? 1 : o.a);
      X.txt(g, 'NO PREDICTION AVAILABLE', 640, 350, { size: 62, weight: 500, align: 'center', color: K.cyan, alpha: a });
      c.em.save(); c.em.globalAlpha = 0.5 * a; c.em.fillStyle = K.cyan; c.em.font = '500 62px "IBM Plex Mono"'; c.em.textAlign = 'center'; c.em.fillText('NO PREDICTION AVAILABLE', 640, 350); c.em.restore();
      X.txt(g, 'CITYWATCH — SESSION TERMINATED', 640, 420, { size: 22, align: 'center', color: 'rgba(95,211,230,0.6)', track: 3, alpha: a * cl((o.a2 == null ? 1 : o.a2)) });
    } else if (m === 'objective') {
      chrome(g, 'SETUP · 13-11-2026 23:47:58', t);
      X.txt(g, 'OPERATOR INSTRUCTION (VOICE)', 90, 150, { size: 20, color: 'rgba(95,211,230,0.7)', track: 3 });
      g.strokeStyle = K.paper; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 220; i++) { const x = 90 + i * 5; const a = (o.speaking ? 0.25 + 0.75 * Math.abs(Math.sin(i * 0.7 + t * 9)) : 0.08) * 70 * Math.abs(Math.sin(i * 0.23)) * (i / 220 < (o.p == null ? 1 : o.p) ? 1 : 0.15); g.moveTo(x, 300 - a); g.lineTo(x, 300 + a); } g.stroke();
      X.txt(g, 'PARSED OBJECTIVE', 90, 450, { size: 20, color: 'rgba(95,211,230,0.7)', track: 3 });
      X.txt(g, 'GUARANTEE(survival: ADA OKAFOR) · HALT_CONDITION: NONE', 90, 500, { size: 28, color: K.amber });
      if (o.result) X.txt(g, o.result, 90, 570, { size: 28, color: K.red });
    }
    X.scan(g, -200, -200, 1680, 1120, 0.08); X.vig(g, 0.55); X.floor(g, 0.35);
  };
})(window);
