/* TWELVE MINUTES AHEAD — camera feeds (FEEDS).
   Every feed draws into a 1280x720 design space: FEEDS.draw(g, kind, t, o). o.p is the event clock (seconds into the incident);
   o.grade: 'future' (drained green CCTV, amber stamp), 'live' (clean cyan traffic cam), 'none'. o.hud: false hides the HUD.
   FEEDS.thumb(g, kind, x, y, w, h, t, o) draws the same feed shrunk into a monitor.
   Kinds: bridge (the crash; o.variant 'crash' | 'approach' | 'study'), kingst (ambulance), harbour (van), junction (motorbike),
   crane (falling beam), hall (Future Daniel at the door), onramp (the truck and its loose strap; o.patrol), top (top-down
   junction: o.scenario 'live' | 'divert' | 'green'), map (the city grid of rescues), room (the control room from its own
   security camera), nosignal. */
(function (G) {
  'use strict';
  const X = G.X, K = X.K, V = X.V, TAU = Math.PI * 2, O = G.OTM;
  const cl = (v, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v));
  const ss = v => v * v * (3 - 2 * v);
  const seg = (p, a, b) => cl((p - a) / (b - a));
  const FEEDS = G.FEEDS = {};
  const STAMP = (base, p) => { const t = Math.floor(base + p); const h = Math.floor(t / 3600) % 24, m = Math.floor(t / 60) % 60, s = ((t % 60) + 60) % 60; return '13-11-2026  ' + X.pad(h) + ':' + X.pad(m) + ':' + X.pad(s); };
  const T2359 = 23 * 3600 + 59 * 60;
  FEEDS.STAMP = STAMP;

  // ---------- shared backdrops ----------
  function nightSky(g, top, bot) { const gr = g.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, top || '#04070b'); gr.addColorStop(1, bot || '#0a1016'); g.fillStyle = gr; g.fillRect(0, 0, 1280, 720); }
  FEEDS.bridgeBase = function (g, t, o) {
    o = o || {};
    X.fogWorld(g, { seed: 1, base: 380, windows: true, cx: 560, cy: 330 });
    // the river under the bridge, in mist, with warm reflections
    const rv = g.createLinearGradient(0, 420, 0, 720); rv.addColorStop(0, '#6e8a9b'); rv.addColorStop(1, '#22384a'); g.fillStyle = rv; g.fillRect(-200, 420, 1680, 400);
    g.fillStyle = 'rgba(255,190,120,0.25)'; for (let i = 0; i < 30; i++) { const xx = (i * 97 + t * 6) % 1280; g.fillRect(xx, 540 + (i * 37) % 170, 26 + (i % 4) * 12, 2); }
    X.mist(g, 430, 640, 0.35);
    X.truss(g, 400);
    // lamp posts along the deck, warm
    for (let x = 120; x < 1280; x += 320) { g.fillStyle = X.SIL; g.fillRect(x, 250, 5, 150); g.fillRect(x, 250, 34, 4); X.glow(g, x + 30, 256, 90, '#ffb35a', o.lampA == null ? 0.55 : o.lampA); }
  };
  FEEDS.rail = function (g, p, brk) {
    g.strokeStyle = X.SIL; g.lineWidth = 5; g.beginPath(); g.moveTo(-40, 372);
    if (brk > 0) { g.lineTo(560, 372); g.moveTo(760, 372); } g.lineTo(1320, 372); g.stroke(); g.lineWidth = 4;
    for (let x = 0; x < 1280; x += 40) {
      if (brk > 0 && x > 560 && x < 760) { const s = brk; g.save(); g.translate(x + s * 60, 372 + s * s * 260); g.rotate(s * 3 * ((x / 40) % 2 ? 1 : -1)); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 28); g.stroke(); g.restore(); }
      else { g.beginPath(); g.moveTo(x, 372); g.lineTo(x, 400); g.stroke(); }
    }
  };
  // the crash on the eastern bridge. p: 0..10 s, the bus breaks the rail at 4.7, signal lost at 6.6
  FEEDS.bridgeState = function (p) {
    const busIn = cl(p / 4); let bx = -280 + ss(busIn) * 760, by = 400, rot = 0;
    if (p > 3.6) { const s = cl((p - 3.6) / 1.1); bx = 480 + s * 70; rot = s * 0.18; by = 400 + s * 6; }
    if (p > 4.7) { const s = cl((p - 4.7) / 1.4); bx = 550 + s * 60; rot = 0.18 + s * 0.9; by = 406 + s * s * 300; }
    const tf = 1500 - Math.min(p, 4.2) * 175;   // truck front x (it faces left)
    const slide = seg(p, 2.6, 3.8);
    return { bx, by, rot, tf, slide, brk: p > 4.7 ? cl((p - 4.7) / 1.5) : 0 };
  };
  function bridgeScene(g, t, o) {
    const p = o.p || 0, S = FEEDS.bridgeState(p);
    FEEDS.bridgeBase(g, t);
    // the truck (faces left), its beam falling into the bus's lane
    V.truck(g, S.tf + 300, 400, -1, { beam: false, strap: o.strap != null ? o.strap : (p > 2.2 ? 1 : 0.6) });
    if (S.slide < 1) { g.save(); g.translate(S.tf + 185 - S.slide * 90, 358 + S.slide * 34); g.rotate(-S.slide * 0.35); g.fillStyle = X.SIL; g.fillRect(-112, -9, 224, 12); g.restore(); }
    else { g.save(); g.translate(S.tf + 95, 393); g.rotate(-0.35); g.fillStyle = X.SIL; g.fillRect(-112, -9, 224, 12); g.restore(); }
    X.headlight(g, S.tf - 2, 378, -1, 0.35);
    // the bus
    g.save(); g.translate(S.bx + 125, S.by); g.rotate(S.rot); V.bus(g, -125, 0, 1, { lit: true, people: true }); g.restore();
    if (p < 4.8) X.headlight(g, S.bx + 252, S.by - 22, 1, 0.3);
    if (p > 3.6 && p < 4.9) sparks(g, S.bx + 120, 398, t, 18, seg(p, 3.6, 4.9));
    FEEDS.rail(g, p, S.brk);
    if (p > 5.9 && p < 6.8) { g.fillStyle = `rgba(230,240,240,${(6.8 - p) * 0.7})`; g.beginPath(); g.ellipse(650, 560, 200 * (p - 5.8), 40, 0, 0, TAU); g.fill(); }
    return S;
  }
  function sparks(g, x, y, t, n, k) {
    const R = O.rng('sp' + Math.floor(t * 12)); g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) { const a = -Math.PI * (0.1 + R() * 0.8), l = 10 + R() * 50 * k; g.strokeStyle = `rgba(255,${180 + R() * 60 | 0},90,${0.5 + R() * 0.5})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x + (R() - 0.5) * 40, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.restore();
  }
  function glass(g, x, y, t, k) { const R = O.rng('gl' + Math.floor(t * 12)); g.fillStyle = 'rgba(210,235,240,0.8)'; for (let i = 0; i < 30; i++) { const a = R() * TAU, d = R() * 120 * k; g.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.5 - 20 * k, 3, 3); } }

  // ---------- city street (side view) for the other incidents ----------
  function streetBase(g, t, o) {
    o = o || {};
    X.fogWorld(g, { seed: o.seed || 2, base: 430, windows: true, cx: 640, cy: 360, crane: o.crane });
    if (o.sign) { g.fillStyle = X.SIL; g.fillRect((o.signX || 980) + 96, 240, 6, 200); g.fillRect(o.signX || 980, 200, 200, 40); X.txt(g, o.sign, (o.signX || 980) + 100, 227, { size: 18, align: 'center', color: '#ffcf8a', weight: 500 }); }
    // pavement and road in near-black, lit by the lamps
    g.fillStyle = '#16232e'; g.fillRect(-200, 440, 1680, 22);
    g.fillStyle = '#0e1922'; g.fillRect(-200, 462, 1680, 120);
    g.fillStyle = 'rgba(220,230,235,0.22)'; for (let x = 0; x < 1280; x += 70) g.fillRect(x, 500, 36, 4);
    g.fillStyle = '#16232e'; g.fillRect(-200, 582, 1680, 30); g.fillStyle = X.SIL; g.fillRect(-200, 612, 1680, 160);
    for (let x = 80; x < 1280; x += 400) { g.fillStyle = X.SIL; g.fillRect(x, 300, 6, 145); g.fillRect(x, 300, 40, 5); X.glow(g, x + 36, 306, 130, '#ffb35a', 0.55); X.glow(g, x + 36, 520, 160, '#ffb35a', 0.18); }
  }

  function kingst(g, t, o) {
    const p = o.p || 0;
    streetBase(g, t, { sign: 'KING ST', seed: 2 });
    // bus 26 pulls out of the side street into the far lane and stops (seen behind)
    const busX = 760 + (1 - ss(seg(p, 0.4, 2.2))) * 260; V.bus(g, busX, 492, -1, { lit: true, people: true });
    // truck in the far lane heading left, brakes and swerves into the near lane
    const sw = seg(p, 2.2, 3.6); const tf = 1500 - Math.min(p, 4.3) * 210 + (p > 2.2 ? (p - 2.2) * 40 : 0);
    const ty = 492 + ss(sw) * 64; const trot = (p > 2.2 && p < 4.3) ? -Math.sin(sw * Math.PI) * 0.12 : (p >= 4.3 ? 0.22 : 0);
    g.save(); g.translate(tf + 150, ty); g.rotate(trot); V.truck(g, 150, 0, -1, { beam: false }); g.restore();
    if (p > 2.3 && p < 4.3) { g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(tf + 300, ty + 2); g.lineTo(tf + 300 + (p - 2.3) * 90, 492 + 2); g.stroke(); }
    // the ambulance in the near lane, lights on, heading right
    const ax = -260 + Math.min(p, 4.3) * 210; const arot = p > 4.3 ? seg(p, 4.3, 5.2) * 0.5 : 0;
    const on = V.ambulance(g, p > 4.3 ? ax + seg(p, 4.3, 5.2) * 60 : ax, 556 - (p > 4.3 ? seg(p, 4.3, 5.2) * 20 : 0), 1, t, { rot: arot });
    X.glow(g, ax + 150, 470, 160, on ? K.red : K.patrolBlue, 0.4);
    if (p < 4.3) X.headlight(g, ax + 200, 530, 1, 0.3);
    if (p > 4.25 && p < 5.4) { sparks(g, ax + 200, 520, t, 24, 1); glass(g, ax + 200, 520, t, seg(p, 4.3, 5.4)); }
  }
  function harbour(g, t, o) {
    const p = o.p || 0;
    streetBase(g, t, { sign: 'HARBOUR RD', seed: 3, signX: 120 });
    // the lamp post it hits
    const bend = seg(p, 3.8, 4.4);
    g.save(); g.translate(860, 590); g.rotate(-bend * 0.5); g.fillStyle = X.SIL; g.fillRect(-4, -250, 8, 250); g.fillRect(-4, -250, -40, 5); X.glow(g, -38, -244, 90, '#ffcf8a', 0.45 * (1 - bend * 0.7)); g.restore();
    V.car(g, 1200 - p * 120, 492, -1, {});
    const vx = -220 + Math.min(p, 3.8) * 250, rot = p > 1.6 ? Math.min(0.85, (p - 1.6) * 0.4) * Math.sin((p - 1.6) * 2.2 + 0.3) + (p > 3.8 ? 0.4 : 0) : 0;
    const vy = 556 + (p > 2.4 ? Math.min(30, (p - 2.4) * 22) : 0);
    g.save(); g.translate(vx + 100, vy); g.rotate(rot); V.van(g, -100, 0, 1, {}); g.restore();
    if (p > 1.6 && p < 3.8) { g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 6; g.beginPath(); g.moveTo(vx - 40, vy); g.quadraticCurveTo(vx - 160, vy - 10, vx - 300, 556); g.stroke(); }
    if (p > 3.75 && p < 4.8) sparks(g, 860, 560, t, 20, 1);
  }
  function junction(g, t, o) {
    const p = o.p || 0;
    streetBase(g, t, { sign: 'MILL ST / 4TH', seed: 4 });
    // oncoming car (far lane, heading left)
    const cx = 1400 - Math.min(p, 3.6) * 230; V.car(g, cx + 130, 492 + (p > 3.6 ? seg(p, 3.6, 4.2) * 10 : 0), -1, { rot: p > 3.6 ? -seg(p, 3.6, 4.2) * 0.15 : 0 }); X.headlight(g, cx, 470, -1, 0.35);
    // the motorcyclist swerves across into it
    const mx = -160 + Math.min(p, 3.6) * 250; const my = 556 - ss(seg(p, 2.2, 3.4)) * 64; const mr = p > 2.2 && p < 3.6 ? -0.25 : 0;
    if (p < 3.6) V.moto(g, mx, my, 1, { rot: mr });
    else { const k = seg(p, 3.6, 5); g.save(); g.translate(mx + 40, my); g.rotate(k * 2.5); V.moto(g, -40, 0, 1, {}); g.restore(); }
    if (p > 3.55 && p < 4.6) { sparks(g, mx + 80, 480, t, 22, 1); glass(g, mx + 80, 480, t, seg(p, 3.6, 4.6)); }
  }
  function crane(g, t, o) {
    const p = o.p || 0;
    streetBase(g, t, { sign: 'CONSTRUCTION — USE CAUTION', seed: 5, signX: 840 });
    // the crane over the road
    g.strokeStyle = X.SIL; g.lineWidth = 6; g.beginPath(); g.moveTo(1120, 440); g.lineTo(1120, 60); g.lineTo(200, 60); g.stroke();
    g.lineWidth = 2; for (let x = 220; x < 1120; x += 40) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x + 20, 80); g.lineTo(x + 40, 60); g.stroke(); } g.beginPath(); g.moveTo(200, 80); g.lineTo(1120, 80); g.stroke();
    g.fillStyle = K.red; if (Math.floor(t * 1.5) % 2) { g.beginPath(); g.arc(1120, 54, 5, 0, TAU); g.fill(); X.glow(g, 1120, 54, 30, K.red, 0.6); }
    // jammed traffic, brake lights
    [[60, 492, -1], [300, 492, -1], [560, 492, -1], [820, 492, -1], [-40, 556, 1], [200, 556, 1], [450, 556, 1], [700, 556, 1]].forEach(([x, y, d], i) => {
      if (i === 6 && p > 3.5) return; V.car(g, d < 0 ? x + 130 : x, y, d, {}); g.fillStyle = 'rgba(255,40,40,0.8)'; g.fillRect(d < 0 ? x + 125 : x, y - 34, 6, 7); X.glow(g, d < 0 ? x + 128 : x + 3, y - 30, 26, K.red, 0.5);
    });
    // the beam on its cable, swinging, then falling
    const sway = Math.sin(t * 1.3) * 12; const fall = seg(p, 3.0, 3.55); const bx = 520 + sway, by = 200 + fall * fall * 330;
    g.strokeStyle = '#9aa3aa'; g.lineWidth = 2; g.beginPath(); g.moveTo(520, 80); g.lineTo(bx, p > 3 ? 120 : by - 8); g.stroke();
    g.save(); g.translate(bx, by); g.rotate(fall * 0.25); g.fillStyle = X.SIL; g.fillRect(-150, -12, 300, 16); g.restore();
    if (p > 3.5 && p < 5) { sparks(g, 520, 540, t, 30, 1); g.fillStyle = `rgba(160,150,135,${0.5 * (1 - seg(p, 3.5, 5))})`; g.beginPath(); g.ellipse(520, 520, 120 + (p - 3.5) * 220, 60 + (p - 3.5) * 60, 0, 0, TAU); g.fill(); }
  }
  // the corridor outside the control room, high angle; Future Daniel at the security door
  function hall(g, t, o) {
    const p = o.p || 0;
    g.fillStyle = '#020812'; g.fillRect(0, 0, 1280, 720);
    g.fillStyle = '#0a1d36'; g.beginPath(); g.moveTo(0, 720); g.lineTo(420, 300); g.lineTo(860, 300); g.lineTo(1280, 720); g.fill();
    g.fillStyle = '#041024'; g.beginPath(); g.moveTo(0, 0); g.lineTo(420, 120); g.lineTo(420, 300); g.lineTo(0, 720); g.fill();
    g.fillStyle = '#05142b'; g.beginPath(); g.moveTo(1280, 0); g.lineTo(860, 120); g.lineTo(860, 300); g.lineTo(1280, 720); g.fill();
    for (let i = 0; i < 4; i++) { const y = 20 + i * 30, w = 220 - i * 40; g.fillStyle = '#d9f2ff'; g.fillRect(640 - w / 2, y + 60, w, 6); X.glow(g, 640, y + 63, 200, '#7cc8ff', 0.25); }
    // the door at the end of the corridor, lit from behind by the control room's blue
    g.fillStyle = '#1d8fe6'; g.fillRect(500, 150, 280, 150); X.glow(g, 640, 225, 320, '#1d8fe6', 0.35);
    g.fillStyle = '#031026'; g.fillRect(515, 160, 250, 140); g.fillStyle = '#7cc8ff'; g.fillRect(610, 180, 60, 40);
    g.fillStyle = '#020812'; g.fillRect(790, 210, 20, 34); g.fillStyle = Math.floor(t * 3) % 2 ? K.red : '#5a1414'; g.fillRect(795, 215, 10, 6);
    X.txt(g, 'CONTROL ROOM — AUTHORISED ONLY', 640, 145, { size: 11, align: 'center', color: 'rgba(200,230,255,0.6)' });
    const sm = Math.floor(seg(p, 0.6, 6) * 7);
    const R = O.rng('smear'); g.fillStyle = 'rgba(40,0,6,0.85)'; for (let i = 0; i < sm; i++) { const x = 560 + R() * 160, y = 180 + R() * 80; g.beginPath(); g.ellipse(x, y, 8 + R() * 6, 4 + R() * 10, R(), 0, TAU); g.fill(); g.fillRect(x - 2, y, 3, 10 + R() * 18); }
    const tt = G.FILM.twos(t); const beat = Math.floor(tt * 3) % 2; const turn = seg(p, o.turnAt || 4.2, (o.turnAt || 4.2) + 0.5);
    const pose = turn > 0.5 ? G.RIG.mix(G.RIG.P.pound, G.RIG.P.handsHead, 0.4) : (beat ? G.RIG.P.pound : G.RIG.P.pound2);
    G.RIG.figure(g, { x: 640, y: 370, s: 1.25, f: turn > 0.5 ? -1 : 1, who: 'daniel', pose, fill: '#01040a', rim: '#9fd8ff', light: [0, -1], blood: true, headTilt: turn > 0.5 ? -0.35 : 0 });
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(640, 470, 60, 12, 0, 0, TAU); g.fill();
  }
  // the highway on-ramp before the bridge: HGV 52 with its flapping strap; o.patrol pulls it over
  function onramp(g, t, o) {
    const p = o.p || 0;
    X.fogWorld(g, { seed: 3, base: 400, windows: true, cx: 900, cy: 340 });
    // sign gantry
    const red = o.signsRed; g.fillStyle = X.SIL; g.fillRect(140, 150, 10, 250); g.fillRect(1130, 150, 10, 250); g.fillRect(140, 150, 1000, 12);
    g.fillStyle = '#0a0d10'; g.fillRect(470, 165, 340, 70);
    if (red) { const on = Math.floor(t * 2) % 2; X.txt(g, 'E. BRIDGE CLOSED', 640, 212, { size: 30, weight: 500, align: 'center', color: on ? '#ff4a3a' : '#7a1b14' }); if (on) X.glow(g, 640, 200, 220, K.red, 0.25); }
    else X.txt(g, 'E. BRIDGE  2 MI', 640, 212, { size: 30, weight: 500, align: 'center', color: '#f2c06a' });
    // road, hard shoulder
    g.fillStyle = '#0e1922'; g.fillRect(-200, 400, 1680, 150); g.fillStyle = '#16232e'; g.fillRect(-200, 550, 1680, 50);
    g.fillStyle = 'rgba(220,230,235,0.25)'; for (let x = 0; x < 1280; x += 70) g.fillRect(x, 470, 36, 4); g.fillStyle = 'rgba(255,200,110,0.6)'; g.fillRect(-200, 548, 1680, 3);
    g.fillStyle = X.SIL; g.fillRect(-200, 600, 1680, 160);
    for (let x = 60; x < 1280; x += 360) { g.fillStyle = X.SIL; g.fillRect(x, 280, 6, 125); g.fillRect(x, 280, 40, 5); X.glow(g, x + 36, 286, 130, '#ffb35a', 0.5); }
    if (!o.patrol) {
      const tx = -320 + p * 230; const strap = Math.sin(t * 14) * 0.5 + 0.5;
      V.truck(g, tx, 520, 1, { strap: 1, slide: 0 });
      g.strokeStyle = '#ffcf6a'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx + 160, 488); g.quadraticCurveTo(tx + 140, 478 - strap * 12, tx + 110 - strap * 20, 470 - strap * 6); g.stroke();
      X.headlight(g, tx + 302, 498, 1, 0.35);
      if (o.mark) mark(g, tx + 150, 470, o.mark, t);
    } else {
      // the truck pulled onto the hard shoulder, patrol cars behind and ahead
      const k = ss(seg(p, 0, 3)); const tx = 260 + k * 260, ty = 520 + k * 52;
      const shift = seg(p, o.shiftAt || 5, (o.shiftAt || 5) + 0.6);
      V.truck(g, tx, ty, 1, { strap: 1, slide: shift * 0.35 });
      V.car(g, tx - 200 + (1 - k) * -200, ty + 2, 1, { patrol: true, t }); V.car(g, tx + 330, ty + 2, -1, { patrol: true, t: t + 0.3 });
      const on = Math.floor(t * 5) % 2; X.glow(g, tx - 120, ty - 70, 260, on ? K.red : K.patrolBlue, 0.35); X.glow(g, tx + 400, ty - 70, 220, on ? K.patrolBlue : K.red, 0.3);
      if (o.officer) G.RIG.figure(g, { x: tx + 300, y: ty - 84, s: 0.95, f: -1, who: 'officer', pose: G.RIG.P.stopHand, fill: X.SIL, rim: '#ff8a7a', light: [-1, -0.2] });
      if (o.mark) mark(g, tx + 115, ty - 50, o.mark, t);
    }
  }
  function mark(g, x, y, label, t) {
    const a = 0.7 + 0.3 * Math.sin(t * 6); g.save(); g.strokeStyle = X.hexA(K.cyan, a); g.lineWidth = 2.5;
    g.beginPath(); g.arc(x, y, 34, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x + 24, y - 24); g.lineTo(x + 70, y - 70); g.lineTo(x + 90, y - 70); g.stroke();
    X.txt(g, label, x + 96, y - 64, { size: 18, color: K.cyan }); g.restore();
  }
  FEEDS.mark = mark;

  // ---------- top-down traffic camera ----------
  function topBase(g) {
    g.fillStyle = '#0a1013'; g.fillRect(0, 0, 1280, 720);
    // blocks
    g.fillStyle = '#10181c'; [[0, 0, 520, 250], [760, 0, 520, 250], [0, 470, 520, 250], [760, 470, 520, 250]].forEach(r => g.fillRect(...r));
    g.fillStyle = '#152025'; for (let i = 0; i < 18; i++) { const R = O.rng('roof' + i); const bx = [0, 760][i % 2] + 30 + R() * 420, by = [0, 470][Math.floor(i / 2) % 2] + 30 + R() * 160; g.fillRect(bx, by, 40 + R() * 60, 30 + R() * 50); }
    // roads
    g.fillStyle = '#1a2328'; g.fillRect(0, 250, 1280, 220); g.fillRect(520, 0, 240, 720);
    g.fillStyle = 'rgba(240,230,200,0.4)'; for (let x = 0; x < 1280; x += 60) if (x < 480 || x > 780) g.fillRect(x, 358, 30, 4); for (let y = 0; y < 720; y += 60) if (y < 220 || y > 500) g.fillRect(638, y, 4, 30);
    g.fillStyle = 'rgba(240,240,240,0.25)'; for (let i = 0; i < 8; i++) { g.fillRect(470, 262 + i * 26, 30, 12); g.fillRect(780, 262 + i * 26, 30, 12); g.fillRect(532 + i * 26, 210, 12, 30); g.fillRect(532 + i * 26, 480, 12, 30); }
    X.txt(g, 'KING ST', 600, 40, { size: 16, color: 'rgba(233,229,220,0.5)', align: 'center' }); X.txt(g, 'EASTERN BRIDGE  →', 1240, 300, { size: 16, color: 'rgba(233,229,220,0.5)', align: 'right' });
  }
  function topVehicle(g, x, y, ang, w, h, color, label) { g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = color; X.rrect(g, -w / 2, -h / 2, w, h, 6); g.fill(); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(w / 2 - 22, -h / 2 + 4, 14, h - 8); if (label) { g.rotate(-ang); X.txt(g, label, 0, 7, { size: 18, align: 'center', color: '#1b2427', weight: 500 }); } g.restore(); }
  function signal(g, x, y, state) { g.fillStyle = '#0b0f12'; g.fillRect(x - 10, y - 26, 20, 52); [['#ff4040', 'red'], ['#f2a73b', 'amber'], ['#4be08a', 'green']].forEach(([c, s], i) => { g.fillStyle = state === s ? c : 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(x, y - 16 + i * 16, 6, 0, TAU); g.fill(); if (state === s) X.glow(g, x, y - 16 + i * 16, 30, c, 0.6); }); }
  function top(g, t, o) {
    const p = o.p || 0, sc = o.scenario || 'live';
    topBase(g);
    const lights = sc === 'green' ? 'green' : 'red';
    signal(g, 500, 230, sc === 'divert' ? 'amber' : lights); signal(g, 790, 490, lights);
    // background traffic
    for (let i = 0; i < 4; i++) { const q = ((t * 0.08 + i / 4) % 1); topVehicle(g, 1300 - q * 1400, 316, Math.PI, 70, 34, ['#56606a', '#6b4f45', '#4c5a4a', '#5a5470'][i]); }
    for (let i = 0; i < 3; i++) { const q = ((t * 0.06 + i / 3) % 1); topVehicle(g, 676, 760 - q * 800, -Math.PI / 2, 70, 34, ['#6c7884', '#56606a', '#7a6a50'][i]); }
    if (sc === 'live' || sc === 'divert') {
      // bus 26 heading east; diverted, it turns north up King St
      let bx, by, ang;
      const d = p * 150;
      if (sc === 'live' || d < 560) { bx = -160 + d; by = 412; ang = 0; }
      else { const k = cl((d - 560) / 230); const a = k * Math.PI / 2; bx = 400 + Math.sin(a) * 200; by = 412 - (1 - Math.cos(a)) * 200 + (d > 790 ? -(d - 790) : 0); ang = -a; if (d > 790) { bx = 600; } }
      topVehicle(g, bx, by, ang, 150, 46, '#cfc6ad', '26');
      if (o.ring) { const a = 0.6 + 0.4 * Math.sin(t * 6); g.strokeStyle = X.hexA(K.amber, a); g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 95, 0, TAU); g.stroke(); X.txt(g, 'BUS 26 · ROUTE 9', bx + 105, by - 70, { size: 16, color: K.amber }); }
      if (sc === 'divert') { g.save(); g.setLineDash([14, 10]); g.strokeStyle = X.hexA(K.cyan, 0.8); g.lineWidth = 4; g.beginPath(); g.moveTo(80, 412); g.lineTo(400, 412); g.quadraticCurveTo(600, 412, 600, 212); g.lineTo(600, -20); g.stroke(); g.strokeStyle = X.hexA(K.red, 0.7); g.beginPath(); g.moveTo(800, 412); g.lineTo(1280, 412); g.stroke(); g.restore(); X.txt(g, '✕ CLOSED', 1000, 446, { size: 18, color: K.red }); }
    }
    if (sc === 'green') {
      const ax = -200 + p * 420; const on = Math.floor(t * 6) % 2; topVehicle(g, ax, 412, 0, 120, 44, '#e8e6df'); g.fillStyle = on ? K.red : K.patrolBlue; g.fillRect(ax - 8, 404, 16, 16); X.glow(g, ax, 412, 120, on ? K.red : K.patrolBlue, 0.5);
    }
  }

  // ---------- the city map: rescues and new accidents ----------
  function map(g, t, o) {
    g.fillStyle = '#061015'; g.fillRect(0, 0, 1280, 720);
    g.strokeStyle = 'rgba(95,211,230,0.13)'; g.lineWidth = 10; for (let x = 40; x < 1280; x += 150) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 720); g.stroke(); } for (let y = 30; y < 720; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(1280, y - 30); g.stroke(); }
    g.strokeStyle = 'rgba(95,211,230,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 520); g.bezierCurveTo(300, 470, 700, 640, 1280, 560); g.stroke();
    // the river and the bridge
    g.fillStyle = 'rgba(30,70,90,0.35)'; g.beginPath(); g.moveTo(980, 0); g.bezierCurveTo(900, 200, 1080, 420, 1000, 720); g.lineTo(1100, 720); g.bezierCurveTo(1180, 420, 1000, 200, 1080, 0); g.fill();
    X.txt(g, 'E. BRIDGE', 1040, 330, { size: 13, color: 'rgba(233,229,220,0.55)', align: 'center' });
    // each attempt: a cyan change, then a red X where the future moved
    const A = o.attempts || []; const n = o.n == null ? A.length : o.n;
    A.forEach((a, i) => {
      if (i >= n) return; const fresh = i === n - 1; const k = fresh ? cl(o.k == null ? 1 : o.k) : 1;
      g.save(); g.strokeStyle = X.hexA(K.cyan, fresh ? 0.95 : 0.35); g.lineWidth = fresh ? 5 : 3; g.setLineDash([16, 10]); g.lineDashOffset = -t * 40;
      g.beginPath(); a.path.forEach((pt, j) => { const q = j / (a.path.length - 1); if (q <= k + 1e-6) j ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]); }); g.stroke(); g.restore();
      if (k >= 1 || !fresh) { const [x, y] = a.x; const pulse = fresh ? 0.6 + 0.4 * Math.sin(t * 8) : 0.5; g.strokeStyle = X.hexA(K.red, pulse); g.lineWidth = 5; g.beginPath(); g.moveTo(x - 16, y - 16); g.lineTo(x + 16, y + 16); g.moveTo(x + 16, y - 16); g.lineTo(x - 16, y + 16); g.stroke(); X.glow(g, x, y, 80, K.red, fresh ? 0.45 : 0.18); X.txt(g, a.label, x + 26, y - 18, { size: 15, color: fresh ? '#ffd2cc' : 'rgba(255,210,204,0.5)' }); }
    });
    X.txt(g, 'CITYWATCH · RESPONSE PLANNER', 30, 44, { size: 16, color: K.cyan });
    X.txt(g, 'PREDICTED CASUALTIES', 1250, 44, { size: 13, color: 'rgba(233,229,220,0.6)', align: 'right' });
    X.txt(g, String(o.casualties != null ? o.casualties : 47), 1250, 92, { size: 46, color: K.red, align: 'right', weight: 500 });
  }

  // ---------- the control room from its own security camera (the session recordings) ----------
  function room(g, t, o) { G.CR.drawRoom(g, t, Object.assign({ security: true }, o)); }

  FEEDS.nosignal = function (g, t) {
    g.fillStyle = '#0a0d0e'; g.fillRect(0, 0, 1280, 720); X.snow(g, 0, 0, 1280, 720, 0.9, t * 3, 'source-over'); X.snow(g, 0, 0, 1280, 720, 0.5, t * 5 + 1);
    g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(470, 320, 340, 72); X.txt(g, 'NO SIGNAL', 640, 368, { size: 34, weight: 500, align: 'center', color: '#e9e5dc' });
  };

  const KIND = { bridge: bridgeScene, kingst, harbour, junction, crane, hall, onramp, top, map, room };
  const CAMS = { bridge: 'CAM-14   EASTERN BRIDGE   NB', kingst: 'CAM-22   KING ST   EB', harbour: 'CAM-31   HARBOUR RD', junction: 'CAM-08   MILL ST / 4TH', crane: 'CAM-40   ASHER ST WORKS', hall: 'SEC-02   CONTROL CORRIDOR', onramp: 'CAM-09   E. BRIDGE ON-RAMP', top: 'CAM-03   KING ST JUNCTION   TOP', room: 'SEC-01   CONTROL ROOM', map: '' };
  // event clock to the moment of impact (stamp reads 00:00:00 at impact on future feeds)
  const IMPACT = { bridge: 4, kingst: 4.3, harbour: 3.8, junction: 3.6, crane: 3.5, hall: 0, onramp: 0, top: 0, room: 0 };
  FEEDS.draw = function (g, kind, t, o) {
    o = o || {}; const p = o.p || 0;
    const nos = o.cut !== false && ((kind === 'bridge' && p > 6.6) || (kind === 'kingst' && p > 6.2) || (kind === 'harbour' && p > 5.8) || (kind === 'junction' && p > 5.6) || (kind === 'crane' && p > 5.6));
    if (nos) { FEEDS.nosignal(g, t); }
    else {
      g.save(); g.beginPath(); g.rect(0, 0, 1280, 720); g.clip();
      const sh = o.shake !== false && IMPACT[kind] ? X.impact(p, IMPACT[kind] + 0.6, 10, 0.7) : { dx: 0, dy: 0 }; g.translate(sh.dx, sh.dy);
      KIND[kind](g, t, o); g.restore();
      const grade = o.grade || 'future';
      if (grade === 'future') X.cctv(g, 0, 0, 1280, 720, t, { snow: o.snow, sat: 0.7, tint: '#b8d6cc' });
      else if (grade === 'live') { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#a9cff0'; g.fillRect(0, 0, 1280, 720); g.restore(); X.scan(g, 0, 0, 1280, 720, 0.12); X.snow(g, 0, 0, 1280, 720, 0.12, t); }
    }
    if (o.hud !== false && kind !== 'map') {
      const fut = (o.grade || 'future') === 'future';
      const base = o.stampBase != null ? o.stampBase : (fut ? T2359 + 60 - IMPACT[kind] : 23 * 3600 + 48 * 60);
      X.hud(g, t, { cam: o.cam || CAMS[kind], stamp: o.stamp !== false ? STAMP(base, o.stampP != null ? o.stampP : p) : null, stampColor: fut ? K.amber : '#e9e5dc', tag: o.tag || (fut ? 'CITYWATCH // PLAYBACK' : 'LIVE'), rec: o.rec });
    }
    if (o.watermark) X.txt(g, 'CW-SIM 0.9.4', 1252, 700, { size: 10, color: 'rgba(233,229,220,0.18)', align: 'right' });
  };
  FEEDS.thumb = function (g, kind, x, y, w, h, t, o) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x, y); g.scale(w / 1280, h / 720);
    FEEDS.draw(g, kind, t, Object.assign({ hud: true }, o)); g.restore();
  };
})(window);
