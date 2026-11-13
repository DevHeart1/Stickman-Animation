/* TWELVE MINUTES AHEAD — shared set helpers (X).
   Everything is authored in a 1280x720 "design space" (the style bible's frames) and scaled to the 1920x1080 film frame:
   X.cam(c, {x, y, zoom, rot, dx, dy}) places design point (x,y) at frame centre at `zoom` (1 = the authored framing).
   Palette (one meaning per light): monitor cyan = watching/CityWatch, alarm red = a future death, sodium amber = time, Ada, real life. */
(function (G) {
  'use strict';
  const O = G.OTM, TAU = Math.PI * 2;
  const K = { ink: '#07080b', night: '#05070a', panel: '#0e131b', line: '#1f2833', paper: '#ece8df', bone: '#e6e0d2', muted: '#8a94a0',
    cyan: '#5fd3e6', red: '#ff4040', amber: '#f2a73b', blood: '#b3141d', patrolBlue: '#3d7bff', green: '#4be08a' };
  const X = G.X = { K, TAU, DW: 1280, DH: 720 };
  const S = 1920 / 1280;

  X.cam = function (c, o) {
    o = o || {}; const z = (o.zoom || 1) * S;
    c.camera({ x: o.x == null ? 640 : o.x, y: o.y == null ? 360 : o.y, zoom: z, rot: o.rot || 0, dx: (o.dx || 0) * S, dy: (o.dy || 0) * S });
  };
  // a handheld drift in design px
  X.hand = (t, amp, hz, seed) => { const s = G.FILM.shake(t, amp, hz || 0.5, seed || 3); return s; };
  // impact shake that decays
  X.impact = (t, t0, amp, dur) => { if (t < t0 || t > t0 + (dur || 0.6)) return { dx: 0, dy: 0 }; const k = amp * (1 - (t - t0) / (dur || 0.6)); return { dx: k * (G.FILM.wob(t, 37, 11)), dy: k * (G.FILM.wob(t, 41, 17)) }; };

  const hexA = (hex, a) => O.rgba(hex, a);
  X.hexA = hexA;
  X.pad = n => String(n).padStart(2, '0');
  // clock helpers: seconds since 11:48:00 PM -> "11:48:05"
  X.clock = (sec, ampm) => { const base = 23 * 3600 + 48 * 60 + Math.floor(sec); const h = Math.floor(base / 3600) % 24, m = Math.floor(base / 60) % 60, s = base % 60; const h12 = ((h + 11) % 12) + 1; return h12 + ':' + X.pad(m) + ':' + X.pad(s) + (ampm ? (h >= 12 ? ' PM' : ' AM') : ''); };
  X.clock24 = sec => { const base = 23 * 3600 + 48 * 60 + Math.floor(sec); const h = Math.floor(base / 3600) % 24, m = Math.floor(base / 60) % 60, s = base % 60; return X.pad(h) + ':' + X.pad(m) + ':' + X.pad(s); };

  X.rrect = (g, x, y, w, h, r) => G.RIG.rrect(g, x, y, w, h, r);
  X.glow = function (g, x, y, r, color, a, mode) {
    g.save(); g.globalCompositeOperation = mode || 'screen';
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA(color, a)); gr.addColorStop(1, hexA(color, 0));
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  };
  // light source: a glow in the world and a core in the emissive (bloom) buffer
  X.lamp = function (c, x, y, r, color, a) { X.glow(c.g, x, y, r, color, a); c.em.save(); c.em.globalCompositeOperation = 'lighter'; const gr = c.em.createRadialGradient(x, y, 0, x, y, r * 0.35); gr.addColorStop(0, hexA(color, Math.min(1, a * 2.2))); gr.addColorStop(1, hexA(color, 0)); c.em.fillStyle = gr; c.em.fillRect(x - r, y - r, r * 2, r * 2); c.em.restore(); };
  X.emRect = function (c, x, y, w, h, color, a) { c.em.save(); c.em.globalAlpha = a == null ? 0.6 : a; c.em.fillStyle = color; c.em.fillRect(x, y, w, h); c.em.restore(); };
  X.scan = function (g, x, y, w, h, a) { g.fillStyle = `rgba(0,0,0,${a})`; for (let yy = y; yy < y + h; yy += 3) g.fillRect(x, yy, w, 1); };
  X.txt = function (g, str, x, y, o) {
    o = o || {}; g.save(); g.font = `${o.style || 'normal'} ${o.weight || 500} ${o.size || 16}px "${o.family || 'IBM Plex Mono'}"`; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
    g.letterSpacing = (o.track || 0) + 'px'; g.fillStyle = o.color || K.paper; if (o.alpha != null) g.globalAlpha = o.alpha; g.fillText(str, x, y); const w = g.measureText(str).width; g.restore(); return w;
  };
  X.vig = function (g, a, cx, cy) { const gr = g.createRadialGradient(cx || 640, cy || 360, 220, cx || 640, cy || 360, 760); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(-200, -200, 1680, 1120); };
  // darken the subtitle band (design space) with a soft floor, so white type reads
  X.floor = function (g, a) { const gr = g.createLinearGradient(0, 540, 0, 720); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a == null ? 0.55 : a})`); g.fillStyle = gr; g.fillRect(-200, 540, 1680, 400); };

  // noise tile for CCTV static and snow
  let _noise = null;
  X.noiseTile = function () { if (_noise) return _noise; const c = O.makeCanvas(256, 256), g = c.getContext('2d'), d = g.createImageData(256, 256), R = O.rng('snow'); for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); return (_noise = c); };
  X.snow = function (g, x, y, w, h, a, t, mode) {
    const tile = X.noiseTile(); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.globalAlpha = a; g.globalCompositeOperation = mode || 'overlay';
    const ox = Math.floor((t * 977) % 256), oy = Math.floor((t * 613) % 256);
    for (let xx = x - ox; xx < x + w; xx += 256) for (let yy = y - oy; yy < y + h; yy += 256) g.drawImage(tile, xx, yy);
    g.restore();
  };
  // CCTV grade on a design-space rect: drained, green, scanlines, snow, a rolling bar
  X.cctv = function (g, x, y, w, h, t, o) {
    o = o || {}; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.globalCompositeOperation = 'saturation'; g.fillStyle = 'hsl(0,0%,50%)'; g.globalAlpha = o.sat == null ? 0.85 : o.sat; g.fillRect(x, y, w, h);
    g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.fillStyle = o.tint || '#9fc4b5'; g.fillRect(x, y, w, h);
    g.globalCompositeOperation = 'source-over'; X.scan(g, x, y, w, h, 0.2);
    const ry = y + ((t * 140) % (h + 200)) - 100; const rg = g.createLinearGradient(0, ry, 0, ry + 60); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.05)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x, ry, w, 60);
    g.restore();
    X.snow(g, x, y, w, h, o.snow == null ? 0.28 : o.snow, t);
  };
  // the CCTV HUD (design space, full frame)
  X.hud = function (g, t, o) {
    o = o || {}; const x0 = o.x || 0, y0 = o.y || 0, w = o.w || 1280, h = o.h || 720, k = o.k || 1;
    X.txt(g, o.cam || 'CAM-14   EASTERN BRIDGE   NB', x0 + 28 * k, y0 + 40 * k, { size: 16 * k, color: '#e9e5dc' });
    if (o.rec !== false) { g.fillStyle = K.red; if (Math.floor(t * 2) % 2) { g.beginPath(); g.arc(x0 + w - 82 * k, y0 + 34 * k, 6 * k, 0, TAU); g.fill(); } X.txt(g, 'REC', x0 + w - 68 * k, y0 + 40 * k, { size: 16 * k, color: K.red }); }
    if (o.stamp) {
      g.save(); g.font = `600 ${22 * k}px "IBM Plex Mono"`; const sw = g.measureText(o.stamp).width; g.restore();
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x0 + 22 * k, y0 + h - 58 * k, sw + 18 * k, 36 * k);
      X.txt(g, o.stamp, x0 + 31 * k, y0 + h - 32 * k, { size: 22 * k, weight: 500, color: o.stampColor || K.amber });
    }
    if (o.tag) X.txt(g, o.tag, x0 + w - 28 * k, y0 + h - 32 * k, { size: 12 * k, color: 'rgba(233,229,220,0.7)', align: 'right' });
  };

  // ---------- full-frame post effects (run on the output after post) ----------
  // slice glitch: horizontal bands displaced; amount in px (output space)
  X.glitch = function (c, amount, seed) {
    if (amount <= 0) return;
    c.after.push(cx => {
      const W = cx.canvas.width, H = cx.canvas.height; const buf = O.pooled('glitchBuf', W, H); buf.drawImage(cx.canvas, 0, 0);
      const R = O.rng('gl' + seed); let y = 0;
      while (y < H) { const hh = 8 + Math.floor(R() * 70); const off = (R() - 0.5) * 2 * amount * (R() < 0.6 ? 1 : 0.15); cx.drawImage(buf.canvas, 0, y, W, hh, off, y, W, hh); y += hh; }
      cx.save(); cx.globalCompositeOperation = 'screen'; cx.globalAlpha = Math.min(0.5, amount / 200); cx.drawImage(buf.canvas, amount * 0.12, 0); cx.fillStyle = 'rgba(0,255,255,0.08)'; cx.fillRect(0, 0, W, H); cx.restore();
    });
  };
  X.white = function (c, a, color) { if (a <= 0) return; c.after.push(cx => { cx.save(); cx.globalAlpha = Math.min(1, a); cx.fillStyle = color || '#ffffff'; cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height); cx.restore(); }); };
  X.black = function (c, a) { X.white(c, a, '#000000'); };
  // chromatic split
  X.rgbSplit = function (c, px) { if (px <= 0) return; c.after.push(cx => { const W = cx.canvas.width, H = cx.canvas.height; const buf = O.pooled('rgbBuf', W, H); buf.drawImage(cx.canvas, 0, 0); cx.save(); cx.globalCompositeOperation = 'screen'; cx.globalAlpha = 0.35; cx.filter = 'none'; cx.drawImage(buf.canvas, px, 0); cx.drawImage(buf.canvas, -px, 0); cx.restore(); }); };
  // a title / card on black in screen space
  X.card = function (c, lines, o) {
    o = o || {}; c.reset(); const g = c.g; g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080);
    lines.forEach(L => X.txt(g, L.t, L.x || 960, L.y, Object.assign({ align: 'center', family: 'Oswald', weight: 500, size: 60, color: K.paper }, L)));
  };

  // ---------- skyline (shared by exteriors and the bridge) ----------
  X.city = (() => { const r = O.rng('city42'), b = []; let x = -40; while (x < 1500) { const w = 40 + r() * 70, h = 80 + r() * 230; b.push({ x, w, h, win: Array.from({ length: 48 }, () => r() < 0.28) }); x += w + 4; } return b; })();
  X.skyline = function (g, base, tint, winColor, alpha, ox) {
    g.save(); g.globalAlpha = alpha == null ? 1 : alpha; g.translate(ox || 0, 0);
    X.city.forEach(bd => { g.fillStyle = tint; g.fillRect(bd.x, base - bd.h, bd.w, bd.h); g.fillStyle = winColor; let i = 0; for (let yy = base - bd.h + 12; yy < base - 10; yy += 18) for (let xx = bd.x + 7; xx < bd.x + bd.w - 8; xx += 14) { if (bd.win[i++ % 48]) g.fillRect(xx, yy, 5, 7); } });
    g.restore();
  };
  // cached full design-space layer, drawn into the current transform
  X.layer = function (c, key, fn) { const cv = c.cache('X|' + key, (g) => { g.scale(1.5, 1.5); fn(g); }, 1920, 1080); c.g.drawImage(cv, 0, 0, 1280, 720); return cv; };

  // ---------- the fog-silhouette world (ref: layered silhouettes in luminous blue mist, warm lights) ----------
  X.SIL = '#0a131b';
  X.FOG = { top: '#3f5b70', glow: '#b9d0db', far: '#89a5b5', mid: '#5a7689', near: '#2c4356', front: '#0a131b' };
  // sky with a luminous horizon; o.cx is where the mist is brightest
  X.fogSky = function (g, o) {
    o = o || {}; const F = Object.assign({}, X.FOG, o.pal || {});
    const gr = g.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, F.top); gr.addColorStop(0.55, F.glow); gr.addColorStop(1, F.mid); g.fillStyle = gr; g.fillRect(-200, -200, 1680, 1120);
    const rg = g.createRadialGradient(o.cx || 520, o.cy || 380, 40, o.cx || 520, o.cy || 380, 700); rg.addColorStop(0, 'rgba(235,245,250,0.55)'); rg.addColorStop(1, 'rgba(235,245,250,0)'); g.fillStyle = rg; g.fillRect(-200, -200, 1680, 1120);
  };
  // a silhouette skyline layer: towers, cranes, antennae
  X.fogCity = function (g, base, color, seed, o) {
    o = o || {}; const R = O.rng('fc' + seed); g.fillStyle = color; let x = -60 + (o.ox || 0);
    while (x < 1340) { const w = 30 + R() * (o.wmax || 80), h = (o.hmin || 60) + R() * (o.hmax || 220); g.fillRect(x, base - h, w, h + 400);
      if (R() < 0.3) { g.fillRect(x + w * 0.45, base - h - 30 - R() * 40, 3, 60); }
      if (R() < 0.18) { g.beginPath(); g.moveTo(x + w / 2 - 8, base - h); g.lineTo(x + w / 2, base - h - 26); g.lineTo(x + w / 2 + 8, base - h); g.fill(); }
      if (o.windows) { g.save(); g.fillStyle = o.windows; for (let yy = base - h + 10; yy < base - 8; yy += 16) for (let xx = x + 6; xx < x + w - 6; xx += 12) if (R() < 0.12) g.fillRect(xx, yy, 4, 6); g.restore(); }
      x += w + R() * 14; }
    if (o.crane) { g.fillRect(o.crane, base - 380, 6, 380); g.fillRect(o.crane - 160, base - 380, 300, 5); g.beginPath(); g.moveTo(o.crane - 160, base - 375); g.lineTo(o.crane, base - 420); g.lineTo(o.crane + 140, base - 375); g.lineWidth = 2; g.strokeStyle = color; g.stroke(); }
  };
  // a band of mist laid over everything behind it
  X.mist = function (g, y0, y1, a, col) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, hexA(col || '#cfe0e8', 0)); gr.addColorStop(0.5, hexA(col || '#cfe0e8', a)); gr.addColorStop(1, hexA(col || '#cfe0e8', 0)); g.fillStyle = gr; g.fillRect(-200, y0, 1680, y1 - y0); };
  // the full layered city: far, mist, mid, mist, near
  X.fogWorld = function (g, o) {
    o = o || {}; const F = Object.assign({}, X.FOG, o.pal || {});
    X.fogSky(g, o);
    X.fogCity(g, o.base || 470, F.far, 'a' + (o.seed || 1), { hmin: 80, hmax: 260, ox: o.ox1 || 0, crane: o.crane });
    X.mist(g, 260, 560, 0.45);
    X.fogCity(g, (o.base || 470) + 20, F.mid, 'b' + (o.seed || 1), { hmin: 40, hmax: 170, wmax: 100, ox: o.ox2 || 0, windows: o.windows ? 'rgba(255,190,110,0.7)' : null });
    X.mist(g, 360, 600, 0.3);
    X.fogCity(g, (o.base || 470) + 50, F.near, 'c' + (o.seed || 1), { hmin: 20, hmax: 110, wmax: 140, ox: o.ox3 || 0, windows: o.windows ? 'rgba(255,170,90,0.8)' : null });
  };
  // the steel truss bridge, foreground (deck top at y)
  X.truss = function (g, y, o) {
    o = o || {}; const c = o.color || X.SIL; g.fillStyle = c; g.strokeStyle = c;
    g.fillRect(-200, y, 1680, 20); g.fillRect(-200, y + 104, 1680, 9);
    g.lineWidth = 6; for (let x = -180; x < 1480; x += 110) { g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x, y + 108); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x + 110, y + 108); g.moveTo(x + 110, y + 20); g.lineTo(x, y + 108); g.stroke(); g.lineWidth = 6; }
    [80, 520, 960, 1400].forEach(px => g.fillRect(px - 26, y + 113, 52, 400));
    // the rail is drawn by the scene (it can break)
  };

  // ---------- small vehicle library (side view; x = rear, y = road line; dir 1 = facing right) ----------
  const V = X.V = {};
  function wheels(g, xs, y, r) { g.fillStyle = '#0c0f10'; xs.forEach(wx => { g.beginPath(); g.arc(wx, y - r * 0.4, r, 0, TAU); g.fill(); g.fillStyle = '#3a4045'; g.beginPath(); g.arc(wx, y - r * 0.4, r * 0.4, 0, TAU); g.fill(); g.fillStyle = '#0c0f10'; }); }
  V.bus = function (g, x, y, dir, o) {
    o = o || {}; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (dir < 0) g.scale(-1, 1);
    g.fillStyle = o.body || X.SIL; X.rrect(g, 0, -86, 250, 78, 9); g.fill();
    g.fillStyle = o.glass || '#1a2630'; for (let i = 0; i < 7; i++) g.fillRect(10 + i * 32, -76, 25, 28);
    g.fillRect(226, -76, 18, 40);
    if (o.lit) { g.fillStyle = 'rgba(255,196,120,0.75)'; for (let i = 0; i < 7; i++) g.fillRect(10 + i * 32, -76, 25, 28); }
    if (o.people) { g.fillStyle = X.SIL; for (let i = 0; i < 7; i++) if ((i * 7 + 3) % 4) { g.beginPath(); g.arc(22 + i * 32, -62, 6, 0, TAU); g.fill(); g.fillRect(14 + i * 32, -56, 16, 10); } }
    wheels(g, [44, 200], -2, 15);
    g.fillStyle = '#ffb45c'; g.font = '600 16px "IBM Plex Mono"'; g.fillText('26', 228, -78);
    g.fillStyle = '#ffe2b0'; g.fillRect(244, -26, 6, 10);
    g.restore();
  };
  V.truck = function (g, x, y, dir, o) {
    o = o || {}; g.save(); g.translate(x, y); if (dir < 0) g.scale(-1, 1);
    g.fillStyle = o.bed || X.SIL; g.fillRect(0, -32, 230, 22);
    g.fillStyle = o.cab || X.SIL; X.rrect(g, 230, -74, 70, 64, 6); g.fill(); g.fillStyle = 'rgba(255,170,90,0.35)'; g.fillRect(258, -64, 36, 26);
    wheels(g, [40, 160, 270], -4, 14);
    g.fillStyle = '#fff4c9'; g.fillRect(296, -28, 6, 10);
    if (o.beam !== false) { g.save(); const sl = o.slide || 0; g.translate(115 + sl * 30, -40 + sl * 26); g.rotate(sl * 0.4); g.fillStyle = X.SIL; g.fillRect(-112, -9, 224, 12); g.fillStyle = 'rgba(255,180,110,0.35)'; g.fillRect(-112, -9, 224, 2); g.restore(); }
    if (o.strap != null) { g.strokeStyle = o.strapColor || '#e2b84a'; g.lineWidth = 3; [70, 160].forEach((sx, i) => { g.beginPath(); if (i === 1 && o.strap > 0) { g.moveTo(sx, -32); g.lineTo(sx + 8, -48 + o.strap * 10); } else { g.moveTo(sx, -32); g.lineTo(sx, -52); } g.stroke(); }); }
    g.restore();
  };
  V.ambulance = function (g, x, y, dir, t, o) {
    o = o || {}; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (dir < 0) g.scale(-1, 1);
    g.fillStyle = '#1a2530'; X.rrect(g, 0, -80, 150, 70, 6); g.fill(); X.rrect(g, 150, -60, 52, 50, 6); g.fill();
    g.fillStyle = 'rgba(255,90,80,0.55)'; g.fillRect(0, -40, 202, 5); g.fillStyle = 'rgba(255,190,120,0.35)'; g.fillRect(168, -54, 28, 20);
    g.fillStyle = 'rgba(255,90,80,0.6)'; g.fillRect(60, -70, 8, 22); g.fillRect(53, -63, 22, 8);
    wheels(g, [36, 170], -2, 14);
    const on = Math.floor(t * 6) % 2; g.fillStyle = on ? '#ff3b3b' : '#3d7bff'; g.fillRect(140, -88, 16, 8);
    g.restore();
    return on;
  };
  V.car = function (g, x, y, dir, o) {
    o = o || {}; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (dir < 0) g.scale(-1, 1);
    g.fillStyle = o.body || X.SIL; X.rrect(g, 0, -40, 130, 30, 8); g.fill(); g.beginPath(); g.moveTo(26, -40); g.lineTo(44, -62); g.lineTo(96, -62); g.lineTo(112, -40); g.fill();
    g.fillStyle = 'rgba(120,150,170,0.25)'; g.fillRect(48, -58, 22, 16); g.fillRect(74, -58, 20, 16);
    wheels(g, [28, 104], -2, 12);
    g.fillStyle = '#fff4c9'; g.fillRect(124, -32, 6, 7); g.fillStyle = '#c0262b'; g.fillRect(0, -34, 5, 7);
    if (o.patrol) { const on = Math.floor((o.t || 0) * 5) % 2; g.fillStyle = on ? '#ff3b3b' : '#3d7bff'; g.fillRect(56, -70, 24, 8); g.fillStyle = '#e9eef2'; g.fillRect(0, -26, 130, 6); g.fillStyle = '#3d7bff'; g.fillRect(0, -26, 130, 2); }
    g.restore();
  };
  V.van = function (g, x, y, dir, o) {
    o = o || {}; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (dir < 0) g.scale(-1, 1);
    g.fillStyle = o.body || X.SIL; X.rrect(g, 0, -84, 150, 74, 5); g.fill(); X.rrect(g, 150, -66, 50, 56, 8); g.fill();
    g.fillStyle = 'rgba(255,190,120,0.3)'; g.fillRect(166, -58, 28, 22);
    wheels(g, [36, 168], -2, 14); g.fillStyle = '#fff4c9'; g.fillRect(196, -28, 6, 9);
    g.restore();
  };
  V.moto = function (g, x, y, dir, o) {
    o = o || {}; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (dir < 0) g.scale(-1, 1);
    g.strokeStyle = '#0c0f10'; g.lineWidth = 5; g.beginPath(); g.arc(10, -14, 13, 0, TAU); g.stroke(); g.beginPath(); g.arc(72, -14, 13, 0, TAU); g.stroke();
    g.fillStyle = X.SIL; g.beginPath(); g.moveTo(14, -24); g.lineTo(60, -30); g.lineTo(72, -16); g.lineTo(18, -16); g.fill();
    G.RIG.figure(g, { x: 34, y: -30, s: 0.42, f: 1, who: 'rider', fill: X.SIL, pose: { torso: 0.6, lt: 1.3, ls: -0.9, rt: 1.2, rs: -0.9, lu: 1.3, lf: 0.2, ru: 1.2, rf: 0.2 } });
    g.fillStyle = '#fff4c9'; g.fillRect(78, -32, 5, 6);
    g.restore();
  };
  X.headlight = (g, x, y, dir, a) => { X.glow(g, x, y, 46, '#ffb35a', Math.min(1, a * 2.6)); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(x, y, x + dir * 260, y); gr.addColorStop(0, hexA('#ffd9a0', a * 1.3)); gr.addColorStop(1, hexA('#ffd9a0', 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + dir * 220, y - 30); g.lineTo(x + dir * 220, y + 26); g.lineTo(x, y + 6); g.fill(); g.restore(); };
})(window);
