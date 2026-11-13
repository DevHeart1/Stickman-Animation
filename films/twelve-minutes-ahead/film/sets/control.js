/* TWELVE MINUTES AHEAD — the control room (CR), in the approved look: a curved wall of glowing blue panels, the operator a
   silhouette from behind, the floor reflecting the wall. Deep navy everywhere else.
   CR.drawRoom(g, t, o) draws the wide view in design space. Options:
     clock: seconds since 11:48:00 PM (the amber readout above the wall), main: { kind, ...feed opts } for the centre panel,
     screens: { index: feed opts | 'off' } overrides for the centre block (0..8, 4 = main), alert: 0..1 (red), dan: Daniel from
     behind ({ arms, turn, slump, standing, x }) or null (empty chair), security: seen by the ceiling camera, smashed, cw: every panel
     shows CityWatch, collapse: 0..1, real: the real room (S10, the headset), buzz: the phone lit on the desk, steam.
   Wrappers (frame context): CR.wide, CR.close (head and shoulders from behind, ref 3), CR.side (profile at the desk), CR.ecu
   (profile close-up), CR.over (one panel fills the frame), CR.door (the run for the door). */
(function (G) {
  'use strict';
  const X = G.X, K = X.K, TAU = Math.PI * 2, O = G.OTM, RIG = G.RIG;
  const cl = (v, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v));
  const CR = G.CR = {};
  const BLUE = '#1d8fe6', BLUE_D = '#0b3f74', WHITE = '#e6f6ff';
  CR.BLUE = BLUE;
  // centre block: 3x3 rectangles (index 4 is the main panel); wings: four skewed quads
  const C3 = []; { const xs = [[352, 498], [508, 772], [782, 928]], ys = [[96, 226], [236, 396], [406, 468]]; ys.forEach(([y0, y1]) => xs.forEach(([x0, x1]) => C3.push([x0, y0, x1 - x0, y1 - y0]))); }
  const WINGS = [
    [[30, 112], [334, 140], [334, 262], [30, 280]], [[22, 296], [334, 272], [334, 392], [22, 432]],
    [[946, 140], [1250, 112], [1250, 280], [946, 262]], [[946, 272], [1258, 296], [1258, 432], [946, 392]],
  ];
  CR.C3 = C3; CR.WINGS = WINGS;
  const KINDS = ['gauge', 'list', 'map', 'portrait', 'main', 'bars', 'list', 'wave', 'list'];
  const WKINDS = ['list', 'map', 'bars', 'wave'];

  // ---------- panel art ----------
  function panelBase(g, w, h, hot) {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, hot ? '#2fa6f2' : '#1c86d8'); gr.addColorStop(1, hot ? '#136fc0' : '#0d5aa4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(230,246,255,0.75)'; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
  }
  function uiArt(g, w, h, kind, seed) {
    const R = O.rng('ui' + kind + seed); panelBase(g, w, h, kind === 'portrait');
    g.fillStyle = WHITE; g.strokeStyle = WHITE;
    if (kind === 'gauge') {
      for (let i = 0; i < 3; i++) { const cx = 30 + i * (w - 60) / 2, cy = h * 0.5, r = Math.min(h * 0.32, 26); g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * (0.3 + R() * 0.65)); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, r * 0.6, 0, TAU); g.stroke(); }
      for (let i = 0; i < 4; i++) g.fillRect(10, 12 + i * 9, 6, 5);
    } else if (kind === 'list') {
      for (let i = 0; i < Math.floor((h - 16) / 12); i++) { g.globalAlpha = 0.85; g.fillRect(12, 12 + i * 12, (w - 24) * (0.35 + R() * 0.6), 4); g.globalAlpha = 0.5; g.fillRect(w - 40, 12 + i * 12, 26, 4); }
      g.globalAlpha = 1;
    } else if (kind === 'map') {
      g.globalAlpha = 0.5; g.lineWidth = 1; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(R() * w, 0); g.lineTo(R() * w, h); g.stroke(); g.beginPath(); g.moveTo(0, R() * h); g.lineTo(w, R() * h); g.stroke(); }
      g.globalAlpha = 1; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(R() * w, R() * h, 2.5, 0, TAU); g.fill(); }
    } else if (kind === 'portrait') {
      // Bus 26's passenger list: Ada's ID card (the clue that this wall is about her)
      g.fillStyle = 'rgba(4,20,40,0.55)'; g.fillRect(12, 12, h - 24, h - 24);
      RIG.back(g, { x: 12 + (h - 24) / 2, y: h * 0.62, s: (h - 24) / 120, who: 'ada', arms: 'none', fill: WHITE, light: [0, 0], rimW: 0, turn: 0.9 });
      g.fillStyle = WHITE; for (let i = 0; i < 4; i++) g.fillRect(h + 2, 16 + i * 14, (w - h - 16) * (0.4 + 0.15 * i), 5);
      X.txt(g, 'BUS 26 · SEAT 14', h + 2, h - 14, { size: 10, color: WHITE });
    } else if (kind === 'bars') {
      const n = 12; for (let i = 0; i < n; i++) { const bh = (h - 30) * (0.2 + R() * 0.8); g.fillRect(12 + i * (w - 24) / n, h - 12 - bh, (w - 24) / n - 4, bh); }
    } else if (kind === 'wave') {
      g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 8; x < w - 8; x += 3) { const y = h * (0.25 + k * 0.25) + Math.sin(x * 0.08 + k * 2 + seed) * (6 + k * 3); x === 8 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
    }
  }
  function panelCanvas(c, kind, w, h, seed) { return c ? c.cache('crui|' + kind + '|' + w + 'x' + h + '|' + seed, g => uiArt(g, w, h, kind, seed), w, h) : null; }
  CR.panelCanvas = panelCanvas;
  function quadDraw(g, src, q) {
    // affine map of the source rect onto the parallelogram q[0], q[1], q[3] (q[2] is close enough for these shallow wings)
    const w = src.width, h = src.height; g.save(); g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); g.clip();
    const a = (q[1][0] - q[0][0]) / w, b = (q[1][1] - q[0][1]) / w, cc = (q[3][0] - q[0][0]) / h, d = (q[3][1] - q[0][1]) / h;
    g.transform(a, b, cc, d, q[0][0], q[0][1]); g.drawImage(src, 0, 0); g.restore();
  }
  function cwEye(g, x, y, w, h, t) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = '#04223a'; g.fillRect(x, y, w, h);
    const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.32; g.strokeStyle = WHITE; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); g.globalAlpha = 0.45; g.beginPath(); g.arc(cx, cy, r * 1.22, t * 0.6, t * 0.6 + 4.2); g.stroke(); g.globalAlpha = 1;
    g.beginPath(); for (let i = -40; i <= 40; i++) { const xx = cx + i * r / 45, env = Math.cos(i / 40 * Math.PI / 2); const yy = cy + Math.sin(i * 0.4 + t * 8) * Math.sin(i * 0.11 - t * 3) * r * 0.35 * env; i === -40 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke();
    g.restore();
  }
  CR.cwEye = cwEye;
  // Bus 26's passenger manifest, Ada's row lit (full design space, for CR.over's drawScreen)
  CR.manifest = function (g, t, o) {
    o = o || {}; panelBase(g, 1280, 720, false);
    X.txt(g, 'TRANSIT · BUS 26 · ROUTE 9 · PASSENGER MANIFEST', 60, 80, { size: 28, color: WHITE, track: 2 });
    g.fillStyle = 'rgba(230,246,255,0.6)'; g.fillRect(60, 100, 1160, 2);
    g.fillStyle = 'rgba(4,24,48,0.5)'; g.fillRect(60, 140, 360, 440);
    RIG.back(g, { x: 240, y: 470, s: 3.2, who: 'ada', arms: 'none', fill: WHITE, light: [0, 0], rimW: 0, turn: 0.9 });
    const rows = [['SEAT 12', 'M. ADEYEMI'], ['SEAT 13', 'J. KOWALSKI'], ['SEAT 14', 'ADA OKAFOR'], ['SEAT 15', 'R. SINGH'], ['SEAT 16', 'L. MORENO']];
    rows.forEach(([a, b], i) => { const y = 200 + i * 80; const hot = i === 2; if (hot) { g.fillStyle = X.hexA(K.amber, 0.25 + 0.15 * Math.sin(t * 5)); g.fillRect(470, y - 46, 750, 66); }
      X.txt(g, a, 490, y, { size: 30, color: hot ? K.amber : WHITE }); X.txt(g, b, 700, y, { size: 36, weight: 500, color: hot ? '#ffe2b0' : WHITE }); });
    X.txt(g, '47 PASSENGERS ON BOARD', 60, 660, { size: 26, color: WHITE });
  };

  // the structure behind the wall, cached
  function roomShell(g, real) {
    const bg = g.createLinearGradient(0, 0, 0, 720); bg.addColorStop(0, '#01040a'); bg.addColorStop(0.55, real ? '#06142a' : '#041127'); bg.addColorStop(1, '#010309'); g.fillStyle = bg; g.fillRect(0, 0, 1280, 720);
    // ceiling beams converging
    g.strokeStyle = 'rgba(40,90,150,0.18)'; g.lineWidth = 10; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(640 + i * 60, 40); g.lineTo(640 + i * 330, -40); g.stroke(); }
    g.fillStyle = '#020611'; g.fillRect(0, 0, 1280, 50);
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(70,140,220,0.12)'; g.fillRect(180 + i * 230, 52, 120, 4); }
    // the floor
    const fl = g.createLinearGradient(0, 520, 0, 720); fl.addColorStop(0, '#062048'); fl.addColorStop(1, '#01050c'); g.fillStyle = fl; g.fillRect(0, 520, 1280, 200);
    g.strokeStyle = 'rgba(80,150,230,0.12)'; g.lineWidth = 1; for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(640 + i * 30, 520); g.lineTo(640 + i * 160, 720); g.stroke(); }
    // side consoles and empty chairs at the wings (the room is empty but for him)
    [[120, 1], [1160, -1]].forEach(([x, f]) => { g.fillStyle = '#02060d'; g.fillRect(x - 110, 470, 220, 70); RIG.chair(g, x, 520, 0.8, f, '#02060d'); });
  }

  CR.drawRoom = function (g, t, o, c) {
    o = o || {}; CR._clock = o.clock || 0;
    const pulse = (o.alert || 0) * (0.5 + 0.5 * Math.sin(t * 5.2));
    if (c) g.drawImage(c.cache('X|crShell' + (o.real ? 'R' : ''), sg => { sg.scale(1.5, 1.5); roomShell(sg, o.real); }, 1920, 1080), 0, 0, 1280, 720); else roomShell(g, o.real);
    const col = o.collapse || 0;
    const dead = i => col > 0 && O.rng('cl' + i + Math.floor(t * 12))() < col;
    // wings
    WINGS.forEach((q, i) => {
      if (dead(10 + i)) { g.fillStyle = col > 0.6 ? '#eaf8ff' : '#000'; g.beginPath(); q.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.fill(); return; }
      const src = c ? panelCanvas(c, o.cw ? 'map' : WKINDS[i], 300, 150, i) : null; if (src) quadDraw(g, src, q);
      if (o.cw) { g.save(); g.globalAlpha = 0.6; g.fillStyle = '#04223a'; g.beginPath(); q.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.fill(); g.restore(); }
      g.strokeStyle = '#02060c'; g.lineWidth = 6; g.beginPath(); q.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
    });
    // centre block
    C3.forEach(([x, y, w, h], i) => {
      g.fillStyle = '#02060c'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
      if (dead(i)) { g.fillStyle = col > 0.6 ? '#eaf8ff' : '#000'; g.fillRect(x, y, w, h); return; }
      const ov = o.screens && o.screens[i];
      if (o.cw) cwEye(g, x, y, w, h, t + i * 0.37);
      else if (ov === 'off') { g.fillStyle = '#020812'; g.fillRect(x, y, w, h); }
      else if (ov) G.FEEDS.thumb(g, ov.kind, x, y, w, h, t, Object.assign({ watermark: true }, ov));
      else if (i === 4) { const m = Object.assign({ kind: 'bridge', grade: 'live', p: 0, cut: false, stampBase: 23 * 3600 + 48 * 60 + (o.clock || 0), stampP: 0 }, o.main || {}); G.FEEDS.thumb(g, m.kind, x, y, w, h, t, m); }
      else if (c) { g.drawImage(panelCanvas(c, KINDS[i], w, h, i), x, y); const sy = y + ((t * 30 + i * 37) % h); g.fillStyle = 'rgba(230,246,255,0.18)'; g.fillRect(x, sy, w, 2); }
      if (i === 4 && o.smashed) { g.strokeStyle = 'rgba(230,240,240,0.85)'; g.lineWidth = 1.5; const cx = x + w * 0.55, cy = y + h * 0.45; const R = O.rng('crack'); for (let k = 0; k < 14; k++) { const a = R() * TAU; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (40 + R() * 110), cy + Math.sin(a) * (30 + R() * 70)); g.stroke(); } }
    });
    if (o.alert) { const [x, y, w, h] = C3[4]; g.strokeStyle = X.hexA(K.red, 0.35 + 0.65 * pulse); g.lineWidth = 4; g.strokeRect(x - 3, y - 3, w + 6, h + 6); }
    // the time, in amber, over the wall
    g.fillStyle = '#02060c'; g.fillRect(560, 62, 160, 28);
    X.txt(g, X.clock24(o.clock || 0), 640, 84, { size: 22, weight: 500, align: 'center', color: o.clockColor || K.amber });
    // the wall's light into the room
    X.glow(g, 640, 280, 760, o.cw ? '#3ab8ff' : BLUE, 0.22);
    if (o.alert) X.glow(g, 640, 300, 640, K.red, 0.08 + 0.25 * pulse);
    // the floor's reflection of the wall
    g.save(); g.globalAlpha = 0.18; g.globalCompositeOperation = 'screen'; g.fillStyle = BLUE; g.fillRect(352, 560, 576, 70); g.fillRect(40, 560, 290, 50); g.fillRect(950, 560, 290, 50); g.restore();
    // the desk: a long dark console with a lit edge
    g.fillStyle = '#01040a'; g.beginPath(); g.moveTo(250, 492); g.quadraticCurveTo(640, 470, 1030, 492); g.lineTo(1060, 560); g.quadraticCurveTo(640, 540, 220, 560); g.closePath(); g.fill();
    g.strokeStyle = X.hexA('#6cc4ff', 0.55); g.lineWidth = 2; g.beginPath(); g.moveTo(250, 492); g.quadraticCurveTo(640, 470, 1030, 492); g.stroke();
    // desk props in silhouette: the mug (steam lit by the wall), the photo, the phone
    g.fillStyle = '#01040a'; X.rrect(g, 846, 462, 20, 24, 3); g.fill(); g.strokeStyle = '#01040a'; g.lineWidth = 4; g.beginPath(); g.arc(868, 472, 6, -1.4, 1.4); g.stroke();
    const steam = o.steam == null ? 1 : o.steam; if (steam > 0) { g.strokeStyle = `rgba(160,210,255,${0.35 * steam})`; g.lineWidth = 2; for (let i = 0; i < 2; i++) { g.beginPath(); const sx = 852 + i * 9; g.moveTo(sx, 458); g.bezierCurveTo(sx - 6, 444 - Math.sin(t * 2 + i) * 4, sx + 6, 436, sx, 418); g.stroke(); } }
    g.save(); g.translate(430, 478); g.rotate(-0.08); g.fillStyle = '#01040a'; g.fillRect(-16, -26, 32, 26); g.fillRect(-3, 0, 6, 6); g.restore();
    if (o.buzz) { const bz = Math.sin(t * 60) * 1.5; g.fillStyle = K.amber; g.fillRect(940 + bz, 476, 30, 9); X.glow(g, 955, 480, 60, K.amber, 0.55); }
    // Daniel
    const D = o.dan;
    if (D && D.standing) {
      RIG.figure(g, Object.assign({ x: D.x || 640, y: 418, s: 1.25, f: 1, who: 'daniel', pose: RIG.P.standTense, fill: '#02050a', rim: '#7cc8ff', light: [0, -1] }, D));
      RIG.chair(g, 640, 520, 0.9, 1, '#02050a');
    } else if (D) {
      RIG.back(g, Object.assign({ x: 640, y: 452, s: 1.25, who: 'daniel', arms: 'desk', fill: '#02050a', rim: o.alert ? '#ff8a7a' : '#9ad6ff', light: [0, -1], chair: true }, D));
      if (o.real && D.headset) { g.strokeStyle = '#02050a'; g.lineWidth = 6; g.beginPath(); g.arc(640, 418, 24, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.fillStyle = '#5fd3e6'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(640 + i * 9, 397 + Math.abs(i) * 2, 2, 0, TAU); g.fill(); } g.strokeStyle = '#02050a'; g.lineWidth = 3; g.beginPath(); g.moveTo(620, 404); g.bezierCurveTo(560, 380, 520, 460, 500, 520); g.stroke(); }
    } else {
      RIG.back(g, { x: 640, y: 452, s: 1.25, who: 'daniel', fill: 'rgba(0,0,0,0)', rimW: 0, chair: true });
    }
    if (o.security) {
      X.cctv(g, 0, 0, 1280, 720, t, { snow: 0.3 });
      X.hud(g, t, { cam: 'SEC-01   CONTROL ROOM   SESSION ' + (o.session || '000412'), stamp: '13-11-2026  ' + X.clock24(o.clock || 0), stampColor: '#e9e5dc', tag: 'CITYWATCH // ARCHIVE' });
    }
  };

  // ---------- wrappers with the frame context ----------
  CR.wide = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {});
    CR.drawRoom(c.g, t, o, c);
    C3.forEach(([x, y, w, h], i) => X.emRect(c, x, y, w, h, i === 4 && o.alert ? K.red : BLUE, i === 4 ? 0.4 : 0.25));
    WINGS.forEach(q => X.emRect(c, q[0][0], q[0][1], q[1][0] - q[0][0], q[3][1] - q[0][1], BLUE, 0.18));
    if (!o.security) { X.vig(c.g, 0.55); X.floor(c.g, 0.45); }
  };
  // head and shoulders from behind, centred, the wall blurred around him (ref 3)
  CR.close = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const light = o.light || BLUE; const pulse = o.pulse ? 0.55 + 0.45 * Math.sin(t * 5.2) : 1;
    X.layer(c, 'crClose', bg => {
      bg.fillStyle = '#020a17'; bg.fillRect(0, 0, 1280, 720);
      bg.strokeStyle = 'rgba(80,170,255,0.18)'; bg.lineWidth = 1.5; bg.setLineDash([6, 6]); const R = O.rng('hex');
      for (let i = 0; i < 40; i++) { const x = R() * 1280, y = R() * 720; bg.beginPath(); bg.moveTo(x, y); bg.lineTo(x + 60, y); bg.lineTo(x + 90, y + 50); bg.stroke(); } bg.setLineDash([]);
    });
    const panels = [[90, 70, 300, 210, -0.08], [490, 60, 300, 190, 0], [890, 70, 300, 210, 0.08], [100, 330, 280, 190, -0.06], [900, 330, 280, 190, 0.06]];
    panels.forEach(([x, y, w, h, sk], i) => {
      g.save(); g.translate(x + w / 2, y + h / 2); g.transform(1, sk, 0, 1, 0, 0);
      g.fillStyle = X.hexA(light, 0.35); g.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20);
      if (i === 1 && o.screen) { g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.translate(-w / 2, -h / 2); g.scale(w / 1280, h / 720); o.screen(g); g.restore(); }
      else { g.fillStyle = X.hexA(light, 0.9 * pulse); g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = 'rgba(230,246,255,0.55)'; g.fillRect(-w / 2 + 16, -h / 2 + 16, w - 32, 10); g.fillRect(-w / 2 + 16, -h / 2 + 34, w - 32, h - 50); g.fillStyle = X.hexA(light, 0.6); g.fillRect(-w / 2 + 22, -h / 2 + 40, w - 44, h - 62); }
      g.restore(); X.emRect(c, x, y, w, h, light, 0.3 * pulse);
    });
    X.glow(g, 640, 300, 700, light, 0.25 * pulse);
    RIG.back(g, Object.assign({ x: 640, y: 560, s: 3.6, who: 'daniel', arms: 'none', fill: '#010409', rim: o.rim || '#a6dcff', light: [0, -1], rimW: 1.6 }, o.dan || {}));
    X.vig(g, 0.6); X.floor(g, 0.3);
  };
  // profile at the desk: phone calls, the radio, typing
  CR.side = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const light = o.light || BLUE; const pulse = o.pulse ? 0.55 + 0.45 * Math.sin(t * 5.2) : 1;
    X.layer(c, 'crSide', bg => { const gr = bg.createLinearGradient(0, 0, 1280, 0); gr.addColorStop(0, '#01030a'); gr.addColorStop(1, '#05173a'); bg.fillStyle = gr; bg.fillRect(0, 0, 1280, 720); bg.save(); bg.filter = 'blur(12px)'; for (let i = 0; i < 5; i++) { bg.fillStyle = 'rgba(40,150,240,0.25)'; bg.fillRect(120 + i * 180, 90 + (i % 2) * 40, 150, 110); } bg.restore(); });
    // the monitor bank, foreground right, glowing
    g.fillStyle = '#01040a'; g.fillRect(900, 40, 420, 600);
    g.fillStyle = X.hexA(light, 0.92 * pulse); g.fillRect(920, 60, 380, 300); g.fillRect(920, 376, 380, 200);
    if (o.screen) { g.save(); g.beginPath(); g.rect(920, 60, 380, 300); g.clip(); g.translate(920, 60); g.scale(380 / 1280, 300 / 720); o.screen(g); g.restore(); }
    X.emRect(c, 920, 60, 380, 516, light, 0.4 * pulse);
    X.glow(g, 900, 300, 760, light, 0.3 * pulse);
    RIG.chair(g, 470, 560, 2.2, 1, '#010307');
    const f = RIG.figure(g, Object.assign({ x: 470, y: 560, s: 2.5, f: 1, who: 'daniel', pose: RIG.P.sitType, fill: '#010307', rim: o.rim || '#a6dcff', light: [1, -0.25], rimW: 2.2, eye: o.eye }, o.dan || {}));
    // desk
    g.fillStyle = '#010307'; g.fillRect(560, 540, 900, 300); g.strokeStyle = X.hexA(light, 0.6); g.lineWidth = 2; g.beginPath(); g.moveTo(560, 540); g.lineTo(1480, 540); g.stroke();
    if (o.mic) { g.fillStyle = '#010307'; g.beginPath(); g.moveTo(700, 540); g.quadraticCurveTo(690, 470, 650, f.head[1] + 40); g.lineTo(660, f.head[1] + 46); g.quadraticCurveTo(704, 470, 714, 540); g.fill(); g.beginPath(); g.arc(648, f.head[1] + 40, 9, 0, TAU); g.fill(); if (o.tx) { g.fillStyle = K.red; g.beginPath(); g.arc(707, 528, 5, 0, TAU); g.fill(); X.lamp(c, 707, 528, 40, K.red, 0.7); } }
    if (o.desk) o.desk(g, f);
    X.vig(g, 0.6, 700, 330); X.floor(g, 0.4);
    return f;
  };
  // profile close-up: the face as a silhouette with the screen's rim and a catchlight in the eye
  CR.ecu = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const light = o.light || BLUE;
    g.fillStyle = o.bg || '#01040a'; g.fillRect(-200, -200, 1680, 1120);
    X.glow(g, o.lx || 1050, o.ly || 340, 760, light, o.la == null ? 0.42 : o.la);
    if (o.right) o.right(g);
    RIG.figure(g, Object.assign({ x: o.hx || 470, y: o.hy || 1240, s: o.s || 11, f: 1, who: 'daniel', pose: { torso: 0.1, lu: 0.1, lf: 0.2, ru: 0, rf: 0.2 }, fill: '#010307', rim: o.rim || '#bfe6ff', light: [1, -0.2], rimW: 1.6, eye: o.eye === false ? null : (o.eye || '#cfefff') }, o.dan || {}));
    X.vig(g, 0.7); X.floor(g, 0.35);
  };
  // one panel fills the frame; the back of his head in the corner
  CR.over = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    g.fillStyle = '#01040a'; g.fillRect(-200, -200, 1680, 1120);
    g.fillStyle = '#02060c'; g.fillRect(170, 30, 1040, 600);
    const feed = o.feed || { kind: 'bridge' };
    if (o.drawScreen) { g.save(); g.beginPath(); g.rect(190, 48, 1000, 562); g.clip(); g.translate(190, 48); g.scale(1000 / 1280, 562 / 720); o.drawScreen(g); g.restore(); }
    else G.FEEDS.thumb(g, feed.kind, 190, 48, 1000, 562, t, feed);
    const lc = o.light || BLUE; X.emRect(c, 190, 48, 1000, 562, lc, 0.25); X.glow(g, 690, 330, 800, lc, 0.12);
    if (o.alert) { const pulse = 0.5 + 0.5 * Math.sin(t * 5.2); g.strokeStyle = X.hexA(K.red, 0.4 + 0.6 * pulse); g.lineWidth = 6; g.strokeRect(186, 44, 1008, 570); X.glow(g, 690, 330, 700, K.red, 0.1 * pulse); }
    if (o.head !== false) RIG.back(g, Object.assign({ x: o.hx || 190, y: o.hy || 640, s: 3.8, who: 'daniel', arms: 'none', fill: '#010307', rim: o.alert ? '#ff9a8a' : '#a6dcff', light: [0.4, -1], rimW: 1.5 }, o.dan || {}));
    X.vig(g, 0.5); X.floor(g, 0.4);
  };
  // the run for the door: side view along the back of the room
  CR.door = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const p = o.p || 0;
    X.layer(c, 'crDoor', bg => {
      const gr = bg.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, '#030a18'); gr.addColorStop(1, '#01040a'); bg.fillStyle = gr; bg.fillRect(0, 0, 1280, 720);
      bg.save(); bg.filter = 'blur(10px)'; for (let i = 0; i < 4; i++) { bg.fillStyle = 'rgba(40,150,240,0.3)'; bg.fillRect(40 + i * 210, 90, 180, 120); } bg.restore();
      bg.fillStyle = '#02060e'; bg.fillRect(0, 560, 1280, 160);
      bg.fillStyle = '#071226'; bg.fillRect(960, 130, 230, 430); bg.fillStyle = '#0b1a34'; bg.fillRect(975, 145, 200, 415);
      bg.fillStyle = '#9fd8ff'; bg.fillRect(1045, 210, 60, 70); bg.fillStyle = '#071226'; bg.fillRect(1073, 210, 4, 70); bg.fillRect(1045, 243, 60, 4);
    });
    X.lamp(c, 1075, 245, 160, '#9fd8ff', 0.35);
    X.txt(g, 'EXIT', 1075, 115, { size: 22, color: '#4be08a', align: 'center', weight: 500 }); X.lamp(c, 1075, 108, 60, '#4be08a', 0.4);
    const run = G.FILM.twos(t) * 9; const x = 120 + Math.min(p, 1) * 760; const reach = p >= 1;
    RIG.figure(g, { x, y: 560 - 84 * 2.2 - (reach ? 0 : RIG.bob(run, 10)), s: 2.2, f: 1, who: 'daniel', pose: reach ? RIG.P.reach : RIG.run(run), fill: '#010307', rim: '#9fd8ff', light: [1, -0.3] });
    X.vig(g, 0.6); X.floor(g, 0.4);
  };
})(window);
