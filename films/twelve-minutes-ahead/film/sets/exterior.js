/* TWELVE MINUTES AHEAD — exteriors and voids (EXT). Full-frame design space, (c, t, o).
   EXT.city {zoom} the sleeping city with the traffic center; EXT.bridgeReal {p, bus} the real bridge at midnight (sodium + patrol light);
   EXT.entrance {p, ada, dan} the doors of the traffic center; EXT.walk {t} the walk home; EXT.pullback {k} the last shot;
   EXT.collapse {k} the simulation coming apart into white; EXT.title {k} the title card. */
(function (G) {
  'use strict';
  const X = G.X, K = X.K, TAU = Math.PI * 2, O = G.OTM, RIG = G.RIG, V = X.V;
  const cl = (v, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v));
  const EXT = G.EXT = {};

  function stars(g, n, seed, h) { const r = O.rng(seed || 'st'); g.fillStyle = 'rgba(233,229,220,0.55)'; for (let i = 0; i < n; i++) g.fillRect(r() * 1280, r() * (h || 260), 1.5, 1.5); }
  function centre(g, x, y, o) {
    o = o || {};
    g.fillStyle = X.SIL; g.fillRect(x, y, 380, 320); g.fillRect(x - 20, y - 14, 420, 18);
    g.fillStyle = '#1d8fe6'; g.fillRect(x + 48, y + 54, 284, 102);
    X.txt(g, 'CITY TRAFFIC CONTROL', x + 30, y + 26, { size: 13, color: 'rgba(233,229,220,0.55)' });
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(200,236,255,0.55)'; g.fillRect(x + 58 + (i % 3) * 92, y + 62 + Math.floor(i / 3) * 46, 80, 38); }
    g.fillStyle = 'rgba(255,180,100,0.7)'; g.fillRect(x + 158, y + 218, 64, 102);
    // the satellite dish on the roof
    g.strokeStyle = X.SIL; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 330, y - 14); g.lineTo(x + 330, y - 60); g.stroke(); g.beginPath(); g.ellipse(x + 330, y - 66, 26, 12, -0.4, 0, TAU); g.stroke();
    if (Math.floor((o.t || 0) * 1.2) % 2) { g.fillStyle = K.red; g.fillRect(x + 328, y - 82, 4, 4); }
  }
  EXT.centre = centre;

  EXT.city = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    X.layer(c, 'extCity', bg => { X.fogWorld(bg, { seed: 7, base: 470, windows: true, cx: 620, cy: 300, crane: 260 }); bg.fillStyle = X.SIL; bg.fillRect(0, 560, 1280, 200); });
    // a highway of headlights across the city
    for (let i = 0; i < 26; i++) { const q = ((t * 0.04 + i / 26) % 1); const x = q * 1400 - 60; g.fillStyle = i % 2 ? 'rgba(255,214,160,0.95)' : 'rgba(255,80,60,0.85)'; g.fillRect(i % 2 ? x : 1280 - x, 548 + (i % 2) * 8, 6, 3); }
    g.fillStyle = X.SIL; g.fillRect(-200, 556, 1680, 6);
    centre(g, 760, 300, { t });
    X.lamp(c, 950, 405, 200, '#1d8fe6', 0.35);
    X.vig(g, 0.55); X.floor(g, 0.4);
  };

  EXT.bridgeReal = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    X.layer(c, 'extBridge', bg => G.FEEDS.bridgeBase(bg, 0, { lampA: 0.6 }));
    const on = Math.floor(t * 2) % 2;
    g.fillStyle = X.SIL; g.fillRect(166, 220, 8, 180); g.fillRect(110, 196, 120, 36); X.txt(g, 'CLOSED', 170, 222, { size: 18, align: 'center', color: on ? '#ff4a3a' : '#5a1510', weight: 500 }); if (on) X.lamp(c, 170, 214, 110, K.red, 0.5);
    g.fillStyle = X.SIL; g.fillRect(330, 372, 200, 12); g.fillStyle = 'rgba(255,90,70,0.8)'; for (let i = 0; i < 5; i++) g.fillRect(340 + i * 40, 374, 18, 8); g.fillStyle = X.SIL; g.fillRect(340, 384, 6, 16); g.fillRect(514, 384, 6, 16);
    V.bus(g, 40, 400, 1, { lit: true, people: true });
    X.headlight(g, 292, 378, 1, 0.45);
    X.glow(g, 1180, 360, 380, on ? K.red : K.patrolBlue, 0.28);
    G.FEEDS.rail(g, 0, 0);
    X.vig(g, 0.55); X.floor(g, 0.45);
  };

  EXT.entrance = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g;
    X.layer(c, 'extEnt', bg => {
      X.fogWorld(bg, { seed: 9, base: 430, windows: true, cx: 380, cy: 330 });
      bg.fillStyle = X.SIL; bg.fillRect(560, 90, 760, 540); bg.fillRect(540, 76, 800, 18);
      X.txt(bg, 'CITY TRAFFIC CONTROL', 600, 140, { size: 22, color: 'rgba(160,210,255,0.55)', track: 3 });
      bg.fillStyle = '#1d8fe6'; bg.fillRect(820, 330, 220, 280); bg.fillStyle = X.SIL; bg.fillRect(926, 330, 8, 280); bg.fillRect(820, 330, 220, 10);
      bg.fillStyle = '#16232e'; bg.fillRect(0, 608, 1280, 112); bg.fillStyle = X.SIL; bg.fillRect(0, 640, 1280, 80);
      bg.fillStyle = X.SIL; bg.fillRect(250, 250, 8, 360); bg.fillRect(250, 250, 60, 7);
    });
    X.lamp(c, 930, 470, 260, '#1d8fe6', 0.3);
    X.lamp(c, 300, 258, 80, '#ffb35a', 0.9);
    g.save(); g.globalCompositeOperation = 'screen'; const cone = g.createLinearGradient(0, 260, 0, 610); cone.addColorStop(0, 'rgba(255,170,80,0.45)'); cone.addColorStop(1, 'rgba(255,170,80,0.08)'); g.fillStyle = cone; g.beginPath(); g.moveTo(290, 262); g.lineTo(312, 262); g.lineTo(480, 610); g.lineTo(130, 610); g.fill(); g.restore();
    const tt = G.FILM.twos(t);
    if (o.ada !== false) RIG.figure(g, Object.assign({ x: 330, y: 610 - 84 * 1.9 * 0.88, s: 1.9, f: 1, who: 'ada', prop: 'bag', fill: X.SIL, rim: '#ffc27a', light: [-0.4, -1] }, o.ada || {}));
    if (o.dan) RIG.figure(g, Object.assign({ x: 780, y: 610 - 84 * 1.9, s: 1.9, f: -1, who: 'daniel', fill: X.SIL, rim: '#9fd8ff', light: [1, -0.3] }, o.dan));
    X.vig(g, 0.55); X.floor(g, 0.5);
  };

  EXT.walk = function (c, t, o) {
    o = o || {}; X.cam(c, o.cam || {}); const g = c.g; const ground = 600;
    X.layer(c, 'extWalkSky', bg => X.fogSky(bg, { cx: 640, cy: 330 }));
    g.save(); g.translate(-(t * 4) % 300, 0); X.fogCity(g, 470, X.FOG.far, 'wa', { hmin: 80, hmax: 260 }); X.fogCity(g, 470, X.FOG.far, 'wa', { hmin: 80, hmax: 260, ox: 1340 }); g.restore();
    X.mist(g, 280, 560, 0.45);
    g.save(); g.translate(-(t * 10) % 1340, 0); X.fogCity(g, 500, X.FOG.mid, 'wb', { hmin: 40, hmax: 170, wmax: 100, windows: 'rgba(255,190,110,0.7)' }); X.fogCity(g, 500, X.FOG.mid, 'wb', { hmin: 40, hmax: 170, wmax: 100, ox: 1340, windows: 'rgba(255,190,110,0.7)' }); g.restore();
    X.mist(g, 400, 620, 0.3);
    g.fillStyle = '#16232e'; g.fillRect(-200, ground, 1680, 10); g.fillStyle = X.SIL; g.fillRect(-200, ground + 10, 1680, 200);
    const off = (t * 40) % 460;
    for (let i = -1; i < 4; i++) {
      const lx = i * 460 + 200 - off; g.fillStyle = X.SIL; g.fillRect(lx, 230, 8, ground - 230); g.fillRect(lx, 230, 60, 7);
      g.save(); g.globalCompositeOperation = 'screen'; const cone = g.createLinearGradient(0, 240, 0, ground); cone.addColorStop(0, 'rgba(255,170,80,0.42)'); cone.addColorStop(1, 'rgba(255,170,80,0.06)'); g.fillStyle = cone; g.beginPath(); g.moveTo(lx + 44, 240); g.lineTo(lx + 64, 240); g.lineTo(lx + 170, ground); g.lineTo(lx - 60, ground); g.fill(); g.restore();
      X.glow(g, lx + 54, ground, 170, '#ffb35a', 0.3); X.lamp(c, lx + 54, 240, 60, '#ffd9a0', 0.9);
    }
    const ph = G.FILM.twos(t) * 3.6;
    RIG.figure(g, { x: 470, y: ground - 84 * 1.7 * 0.88 - RIG.bob(ph + 0.6, 4), s: 1.7, f: 1, who: 'ada', prop: 'bag', pose: RIG.walk(ph + 0.6), fill: X.SIL, rim: '#ffc27a', light: [0.2, -1], sway: Math.sin(ph), headTilt: o.talk === 'ada' ? -0.1 : 0 });
    RIG.figure(g, { x: 630, y: ground - 84 * 1.7 - RIG.bob(ph, 4), s: 1.7, f: 1, who: 'daniel', pose: RIG.walk(ph), fill: X.SIL, rim: '#ffc27a', light: [0.2, -1], headTilt: o.talk === 'dan' ? 0.15 : 0.05 });
    X.vig(g, 0.55); X.floor(g, 0.45);
  };

  // the last shot: pull away from the street to the building's lit window
  EXT.pullback = function (c, t, o) {
    o = o || {}; const k = cl(o.k || 0);
    X.cam(c, { x: 640, y: 380, zoom: 1.6 - 0.6 * k });
    const g = c.g; g.fillStyle = '#3f5b70'; g.fillRect(-400, -400, 2080, 1520);
    X.layer(c, 'extPull', bg => { X.fogWorld(bg, { seed: 11, base: 470, windows: true, cx: 640, cy: 300 }); bg.fillStyle = X.SIL; bg.fillRect(0, 600, 1280, 120); });
    centre(g, 450, 290, { t });
    const a = cl((k - 0.15) / 0.4);
    g.fillStyle = '#04223a'; g.fillRect(498, 344, 284, 102);
    X.txt(g, 'NO PREDICTION', 640, 390, { size: 22, weight: 500, align: 'center', color: '#bfe6ff', alpha: 0.4 + 0.6 * a }); X.txt(g, 'AVAILABLE', 640, 418, { size: 22, weight: 500, align: 'center', color: '#bfe6ff', alpha: 0.4 + 0.6 * a });
    X.lamp(c, 640, 395, 220, '#1d8fe6', 0.35);
    const ph = G.FILM.twos(t) * 3.6; const wx = 900 + t * 14;
    for (let i = 0; i < 4; i++) { const lx = 760 + i * 170; g.fillStyle = X.SIL; g.fillRect(lx, 500, 4, 100); X.lamp(c, lx + 2, 500, 36, '#ffd9a0', 0.8); X.glow(g, lx, 600, 80, '#ffb35a', 0.3); }
    RIG.figure(g, { x: wx, y: 600 - 84 * 0.55 * 0.88 - RIG.bob(ph + 0.6, 1.5), s: 0.55, f: 1, who: 'ada', pose: RIG.walk(ph + 0.6), prop: 'bag', fill: X.SIL });
    RIG.figure(g, { x: wx + 46, y: 600 - 84 * 0.55 - RIG.bob(ph, 1.5), s: 0.55, f: 1, who: 'daniel', pose: RIG.walk(ph), fill: X.SIL });
    X.vig(g, 0.6); X.floor(g, 0.45);
  };

  // the simulation coming apart: the room's monitors and lines dissolve into white
  EXT.collapse = function (c, t, o) {
    o = o || {}; const k = cl(o.k || 0); X.cam(c, { zoom: 1 + k * 0.25 }); const g = c.g;
    G.CR.drawRoom(g, t, Object.assign({ clock: 9 * 60 + 2, collapse: Math.min(1, k * 1.4), dan: { arms: 'desk' } }, o.room || {}), c);
    // map overlays vanishing
    const R = O.rng('maps'); g.strokeStyle = X.hexA(K.cyan, 0.5 * (1 - k)); g.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const x = R() * 1280, y = R() * 720, l = 80 + R() * 400; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * (1 - k), y + (R() - 0.5) * 40); g.stroke(); }
    g.fillStyle = `rgba(240,250,252,${cl((k - 0.35) / 0.6)})`; g.fillRect(-200, -200, 1680, 1120);
    X.glitch(c, (1 - Math.abs(k - 0.5) * 2) * 120, Math.floor(t * 12));
  };

  EXT.title = function (c, t, o) {
    o = o || {}; c.reset(); const g = c.g; const k = cl(o.k == null ? 1 : o.k);
    g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080);
    const jitter = o.glitch ? (O.rng('tt' + Math.floor(t * 12))() - 0.5) * 16 : 0;
    X.txt(g, 'TWELVE MINUTES', 960 + jitter, 520, { family: 'Oswald', weight: 500, size: 150, align: 'center', color: K.paper, track: 10, alpha: k });
    X.txt(g, 'AHEAD', 960 - jitter, 680, { family: 'Oswald', weight: 500, size: 150, align: 'center', color: K.amber, track: 40, alpha: k });
    c.em.save(); c.em.setTransform(0.25, 0, 0, 0.25, 0, 0); c.em.globalAlpha = 0.35 * k; c.em.fillStyle = K.amber; c.em.font = '500 150px "Oswald"'; c.em.textAlign = 'center'; c.em.fillText('AHEAD', 960, 680); c.em.restore();
    if (o.sub) X.txt(g, o.sub, 960, 790, { size: 26, align: 'center', color: 'rgba(233,229,220,0.6)', track: 6, alpha: k });
  };
})(window);
