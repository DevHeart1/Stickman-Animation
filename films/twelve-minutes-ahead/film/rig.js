/* TWELVE MINUTES AHEAD — the characters (RIG), in the approved look: SILHOUETTES.
   Real proportions, no faces. Every figure is a flat dark shape with a thin rim of the shot's one light on the lit side
   (the shape is drawn in the rim colour, then again in the body colour shifted away from the light). Emotion is posture.
   RIG.figure(g, o): side view. o.x,o.y is the HIP.
     o = { x, y, s, f (facing 1|-1), who: 'daniel'|'ada'|'driver'|'mum'|'officer'|'rider', pose, fill, rim, light: [dx, dy] (toward the light),
           rimW (px), headTilt, prop: 'phone'|'bag'|'radio'|'mug', blood, eye (a catchlight in the eye: colour) }
   RIG.back(g, o): seen from behind, seated or standing (the control-room look): o = { x, y (shoulder line), s, who, fill, rim, light,
           arms: 'desk'|'down'|'head'|'phone'|'radio', turn (-1..1 head turn), slump (0..1), chair }
   Pose angles (radians) from straight down, + toward facing: torso, lt/ls (near thigh / shin bend), rt/rs, lu/lf (near arm), ru/rf.
   RIG.P presets, RIG.walk(ph), RIG.run(ph), RIG.mix(a, b, u). Pass FILM.twos(t) to anything that moves a pose (animate on twos). */
(function (G) {
  'use strict';
  const TAU = Math.PI * 2;
  const RIG = G.RIG = { INK: '#020406', PAPER: '#d9e6ee' };
  const seg = (p, len, ang) => [p[0] + Math.sin(ang) * len, p[1] + Math.cos(ang) * len];
  function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  RIG.rrect = rrect; RIG.seg = seg;
  function cap(g, a, b, w0, w1) {   // a tapered capsule from a to b
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    g.moveTo(a[0] + nx * w0, a[1] + ny * w0); g.lineTo(b[0] + nx * w1, b[1] + ny * w1); g.arc(b[0], b[1], w1, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
    g.lineTo(a[0] - nx * w0, a[1] - ny * w0); g.arc(a[0], a[1], w0, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true); g.closePath();
  }
  RIG.limb = function (g, pts, s, col, w) { g.save(); g.fillStyle = col || '#05080c'; g.beginPath(); for (let i = 0; i < pts.length - 1; i++) cap(g, pts[i], pts[i + 1], 7 * s * (w || 1), 6 * s * (w || 1)); g.fill(); g.restore(); };

  // ---------- poses ----------
  const BASE = { torso: 0, lt: 0.06, ls: 0, rt: -0.06, rs: 0, lu: 0.1, lf: 0.1, ru: -0.08, rf: 0.05 };
  RIG.P = {
    stand: BASE,
    standTense: { torso: 0.06, lt: 0.12, ls: 0, rt: -0.12, rs: 0, lu: 0.1, lf: 0.35, ru: -0.05, rf: 0.4 },
    sit: { torso: 0.08, lt: 1.52, ls: -1.45, rt: 1.42, rs: -1.38, lu: 0.5, lf: 0.9, ru: 0.4, rf: 0.95 },
    sitType: { torso: 0.25, lt: 1.55, ls: -1.45, rt: 1.45, rs: -1.4, lu: 1.0, lf: 0.6, ru: 0.9, rf: 0.7 },
    sitLean: { torso: 0.4, lt: 1.55, ls: -1.5, rt: 1.45, rs: -1.4, lu: 1.15, lf: 0.45, ru: 1.0, rf: 0.6 },
    sitBack: { torso: -0.12, lt: 1.5, ls: -1.3, rt: 1.4, rs: -1.25, lu: 0.25, lf: 0.6, ru: 0.15, rf: 0.5 },
    sitPhone: { torso: 0.15, lt: 1.52, ls: -1.45, rt: 1.42, rs: -1.38, lu: 0.25, lf: 2.75, ru: 0.9, rf: 0.8 },
    sitRadio: { torso: 0.28, lt: 1.55, ls: -1.45, rt: 1.45, rs: -1.4, lu: 0.75, lf: 1.7, ru: 1.1, rf: 0.6 },
    sitHeadInHands: { torso: 0.8, lt: 1.55, ls: -1.5, rt: 1.45, rs: -1.4, lu: 0.95, lf: 2.2, ru: 0.85, rf: 2.25 },
    sitSlump: { torso: -0.2, lt: 1.4, ls: -1.1, rt: 1.3, rs: -1.0, lu: 0.05, lf: 0.15, ru: 0.0, rf: 0.1 },
    reach: { torso: 0.18, lt: 0.25, ls: -0.1, rt: -0.3, rs: 0.2, lu: 1.45, lf: 0.1, ru: -0.4, rf: 0.2 },
    pound: { torso: 0.15, lt: 0.2, ls: 0, rt: -0.25, rs: 0.1, lu: 2.7, lf: 0.25, ru: 1.6, rf: 0.6 },
    pound2: { torso: 0.22, lt: 0.2, ls: 0, rt: -0.25, rs: 0.1, lu: 1.6, lf: 0.2, ru: 2.5, rf: 0.4 },
    floorKnees: { torso: -0.1, lt: 2.4, ls: -2.7, rt: 2.3, rs: -2.6, lu: 1.7, lf: 0.6, ru: 1.6, rf: 0.7 },
    point: { torso: 0.05, lt: 0.1, ls: 0, rt: -0.1, rs: 0, lu: 1.55, lf: 0.05, ru: -0.1, rf: 0.1 },
    handsHead: { torso: 0.1, lt: 0.1, ls: 0, rt: -0.1, rs: 0, lu: 2.5, lf: 1.9, ru: 2.4, rf: 2.0 },
    smash: { torso: 0.3, lt: 0.35, ls: -0.2, rt: -0.3, rs: 0.25, lu: 2.9, lf: 0.2, ru: 1.2, rf: 0.5 },
    stopHand: { torso: 0.03, lt: 0.1, ls: 0, rt: -0.1, rs: 0, lu: 1.65, lf: -0.3, ru: -0.1, rf: 0.1 },
    pocket: { torso: -0.02, lt: 0.08, ls: 0, rt: -0.08, rs: 0, lu: -0.05, lf: 0.6, ru: -0.15, rf: 0.6 },
  };
  RIG.mix = (a, b, u) => { const o = {}; for (const k in a) o[k] = a[k] + ((b[k] != null ? b[k] : a[k]) - a[k]) * u; return o; };
  RIG.walk = (ph, amp) => {
    amp = amp == null ? 1 : amp; const a = Math.sin(ph), b = Math.sin(ph + Math.PI);
    return { torso: 0.04 * amp, lt: a * 0.4 * amp, ls: -Math.max(0, -Math.cos(ph)) * 0.7 * amp, rt: b * 0.4 * amp, rs: -Math.max(0, -Math.cos(ph + Math.PI)) * 0.7 * amp,
      lu: -a * 0.35 * amp, lf: 0.2, ru: -b * 0.35 * amp, rf: 0.2 };
  };
  RIG.run = (ph) => {
    const a = Math.sin(ph), b = Math.sin(ph + Math.PI);
    return { torso: 0.3, lt: a * 0.85, ls: -Math.max(0.15, -Math.cos(ph)) * 1.5, rt: b * 0.85, rs: -Math.max(0.15, -Math.cos(ph + Math.PI)) * 1.5, lu: -a * 0.95, lf: 1.4, ru: -b * 0.95, rf: 1.4 };
  };
  RIG.bob = (ph, h) => Math.abs(Math.cos(ph)) * (h || 4);
  RIG.EXPR = {};   // the look has no faces; kept so older calls do nothing

  // ---------- side view ----------
  const PROP = { daniel: { L: 1, hr: 14, coat: true }, ada: { L: 0.88, hr: 13.5 }, mum: { L: 0.95, hr: 13.5, coat: true }, driver: { L: 1, hr: 14.5 }, officer: { L: 1.04, hr: 14.5, coat: true }, rider: { L: 0.95, hr: 15 } };
  function joints(o) {
    const s = o.s || 1, f = o.f || 1, p = Object.assign({}, BASE, o.pose || {}), P = PROP[o.who] || PROP.daniel, L = P.L * s;
    const hip = [o.x, o.y], up = Math.PI + p.torso * f;
    const sh = seg(hip, 58 * L, up), neck = seg(hip, 66 * L, up), head = seg(hip, 66 * L + P.hr * s * 1.15, up + (o.headTilt || 0) * f);
    const leg = (a, b) => { const k = seg(hip, 42 * L, a * f); return [hip, k, seg(k, 42 * L, (a + b) * f)]; };
    const arm = (a, b) => { const e = seg(sh, 30 * L, a * f); return [sh, e, seg(e, 28 * L, (a + b) * f)]; };
    return { s, f, L, P, hip, sh, neck, head, up, backLeg: leg(p.rt, p.rs), frontLeg: leg(p.lt, p.ls), backArm: arm(p.ru, p.rf), frontArm: arm(p.lu, p.lf) };
  }
  function body(g, J, o) {
    const { s, f, L, P } = J;
    g.beginPath();
    // legs and feet
    [J.backLeg, J.frontLeg].forEach(Lg => { cap(g, Lg[0], Lg[1], 8.5 * L, 6.5 * L); cap(g, Lg[1], Lg[2], 6.5 * L, 4.8 * L); const ft = Lg[2]; g.moveTo(ft[0] - f * 4 * L, ft[1] - 3 * L); g.lineTo(ft[0] + f * 13 * L, ft[1] + 1 * L); g.lineTo(ft[0] + f * 13 * L, ft[1] + 5 * L); g.lineTo(ft[0] - f * 5 * L, ft[1] + 5 * L); g.closePath(); });
    // torso (a jacket that hangs below the hip for the adults in coats)
    const hip = J.hip, sh = J.sh, ux = Math.sin(J.up), uy = Math.cos(J.up), nx = -uy, ny = ux;
    const hw = (o.who === 'ada' ? 9 : 11) * L, sw = (o.who === 'ada' ? 13 : 16) * L, hem = P.coat ? 10 * L : 2 * L;
    g.moveTo(hip[0] - nx * hw - ux * hem, hip[1] - ny * hw - uy * hem);
    g.quadraticCurveTo(sh[0] - nx * sw * 1.05 - ux * 14 * L, sh[1] - ny * sw * 1.05 - uy * 14 * L, sh[0] - nx * sw * 0.8, sh[1] - ny * sw * 0.8);
    g.quadraticCurveTo(sh[0], sh[1] + uy * -4 * L + ux * 0, sh[0] + nx * sw * 0.8, sh[1] + ny * sw * 0.8);
    g.quadraticCurveTo(sh[0] + nx * sw * 1.05 - ux * 14 * L, sh[1] + ny * sw * 1.05 - uy * 14 * L, hip[0] + nx * hw - ux * hem, hip[1] + ny * hw - uy * hem);
    g.closePath();
    cap(g, sh, J.neck, 5 * L, 4.5 * L);
    // arms and hands
    [J.backArm, J.frontArm].forEach(A => { cap(g, A[0], A[1], 5.6 * L, 4.6 * L); cap(g, A[1], A[2], 4.6 * L, 3.6 * L); g.moveTo(A[2][0] + 5 * L, A[2][1]); g.arc(A[2][0], A[2][1], 5 * L, 0, TAU); });
    // head: a skull with a nose and chin toward f
    const hr = P.hr * s, h = J.head, tilt = (o.headTilt || 0) * f + (J.up - Math.PI) * 0.4;
    g.moveTo(h[0] + hr, h[1]); g.ellipse(h[0], h[1], hr * 0.92, hr, tilt, 0, TAU);
    g.save(); g.translate(h[0], h[1]); g.rotate(tilt); g.scale(f, 1);
    g.moveTo(hr * 0.78, -hr * 0.15); g.lineTo(hr * 1.12, hr * 0.12); g.lineTo(hr * 0.8, hr * 0.28); g.lineTo(hr * 0.86, hr * 0.5); g.lineTo(hr * 0.5, hr * 0.98); g.lineTo(0, hr * 0.9); g.closePath();
    // hair / headwear
    if (o.who === 'daniel') { g.moveTo(-hr * 0.95, -hr * 0.1); for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI * 0.95; const rr = hr * (1.08 + (i % 2) * 0.1); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr - hr * 0.05); } g.closePath(); }
    if (o.who === 'ada') { g.moveTo(-hr * 0.7, -hr * 0.75); g.quadraticCurveTo(-hr * 2.0, -hr * 0.9 + (o.sway || 0) * hr * 0.3, -hr * 1.75 - (o.sway || 0) * hr * 0.4, hr * 0.9); g.quadraticCurveTo(-hr * 1.45, -hr * 0.3, -hr * 0.6, -hr * 0.35); g.closePath(); g.moveTo(-hr, 0); g.ellipse(0, -hr * 0.12, hr * 1.02, hr * 0.98, 0, Math.PI * 0.95, Math.PI * 2.02); g.closePath(); }
    if (o.who === 'mum') { g.moveTo(-hr * 1.15, hr * 0.7); g.quadraticCurveTo(-hr * 1.3, -hr * 1.3, hr * 0.3, -hr * 1.15); g.quadraticCurveTo(hr * 1.1, -hr * 0.9, hr * 0.95, -hr * 0.2); g.lineTo(-hr * 0.4, -hr * 0.3); g.lineTo(-hr * 0.6, hr * 0.85); g.closePath(); }
    if (o.who === 'driver' || o.who === 'officer') { g.moveTo(-hr * 1.0, -hr * 0.35); g.quadraticCurveTo(-hr * 0.9, -hr * 1.35, hr * 0.2, -hr * 1.3); g.quadraticCurveTo(hr, -hr * 1.2, hr * 1.0, -hr * 0.4); g.lineTo(hr * 1.75, -hr * 0.3); g.lineTo(hr * 0.9, -hr * 0.55); g.lineTo(-hr * 1.0, -hr * 0.35); g.closePath(); }
    if (o.who === 'rider') { g.moveTo(-hr * 1.15, hr * 0.4); g.arc(0, -hr * 0.05, hr * 1.18, Math.PI * 0.8, Math.PI * 2.15); g.closePath(); }
    g.restore();
    // props
    if (o.who === 'ada' && o.backpack !== false) { const bx = sh[0] - f * 15 * L - ux * 2, by = sh[1] + 2 * L; g.moveTo(bx + 12 * L, by); rrect(g, bx - 12 * L, by, 24 * L, 34 * L, 7 * L); }
    const hand = J.frontArm[2];
    if (o.prop === 'bag') rrect(g, hand[0] - 10 * L, hand[1] + 2 * L, 20 * L, 16 * L, 3 * L);
    if (o.prop === 'radio') rrect(g, hand[0] - 5 * L, hand[1] - 18 * L, 10 * L, 20 * L, 2 * L);
    if (o.prop === 'mug') rrect(g, hand[0] - 2 * L, hand[1] - 9 * L, 13 * L, 14 * L, 2 * L);
  }
  // every subpath fills on its own (the parts overlap with mixed winding; one fill would cut holes at the joints)
  function solid(g) { return new Proxy(g, { get(tg, p) { if (p === 'moveTo') return (x, y) => { tg.fill(); tg.beginPath(); tg.moveTo(x, y); }; if (p === 'rect') return (x, y, w, h) => { tg.fill(); tg.beginPath(); tg.rect(x, y, w, h); }; const v = tg[p]; return typeof v === 'function' ? v.bind(tg) : v; }, set(tg, p, v) { tg[p] = v; return true; } }); }
  RIG.figure = function (g, o) {
    const J = joints(o); const light = o.light || [0.9, -0.4]; const rw = (o.rimW == null ? 2.2 : o.rimW) * Math.max(0.6, Math.min(2.2, J.s));
    g.save();
    if (o.rim) { g.fillStyle = o.rim; g.beginPath(); body(solid(g), J, o); g.fill(); }
    g.translate(-light[0] * rw, -light[1] * rw);
    g.fillStyle = o.fill || '#05080c'; g.beginPath(); body(solid(g), J, o); g.fill();
    g.restore();
    const hand = J.frontArm[2];
    if (o.prop === 'phone') { g.save(); g.fillStyle = '#ffd08a'; g.translate(hand[0], hand[1]); g.rotate(-0.4 * J.f); g.fillRect(-3 * J.L, -9 * J.L, 6 * J.L, 12 * J.L); g.restore(); G.X && G.X.glow(g, hand[0], hand[1], 40 * J.L, '#ffb85c', 0.45); }
    if (o.blood) { g.fillStyle = '#7d0d14'; g.beginPath(); g.arc(hand[0], hand[1], 5 * J.L, 0, TAU); g.fill(); }
    if (o.eye) { const P = J.P, hr = P.hr * J.s; g.fillStyle = o.eye; g.beginPath(); g.arc(J.head[0] + J.f * hr * 0.55, J.head[1] - hr * 0.12, Math.max(1, hr * 0.09), 0, TAU); g.fill(); }
    return { head: J.head, hr: J.P.hr * J.s, hands: [J.frontArm[2], J.backArm[2]], elbows: [J.frontArm[1], J.backArm[1]], feet: [J.frontLeg[2], J.backLeg[2]], sh: J.sh, hip: J.hip, neck: J.neck };
  };

  // ---------- seen from behind ----------
  function backShape(g, o) {
    const s = o.s, x = o.x, y = o.y, turn = o.turn || 0, sl = o.slump || 0, kid = o.who === 'ada';
    const sw = (kid ? 30 : 40) * s, hr = (kid ? 15 : 16) * s, ny = y - (5 + 8 * (1 - sl)) * s;
    g.beginPath();
    // shoulders and back (down to the bottom of the frame or the chair)
    g.moveTo(x - sw + 4 * s, y + 96 * s); g.quadraticCurveTo(x - sw - 4 * s, y + 10 * s, x - sw * 0.75, y + 2 * s);
    g.quadraticCurveTo(x - sw * 0.3, y - 6 * s, x - 7 * s, ny); g.lineTo(x + 7 * s, ny);
    g.quadraticCurveTo(x + sw * 0.3, y - 6 * s, x + sw * 0.75, y + 2 * s); g.quadraticCurveTo(x + sw + 4 * s, y + 10 * s, x + sw - 4 * s, y + 96 * s); g.closePath();
    // neck and head
    const hx = x + turn * 4 * s, hy = ny - hr * 1.05 + sl * 10 * s;
    g.moveTo(x - 6 * s, ny + 4 * s); g.rect(x - 6.5 * s, hy, 13 * s, ny - hy + 6 * s);
    g.moveTo(hx + hr, hy); g.ellipse(hx, hy, hr * 0.9, hr, 0, 0, TAU);
    // ears, and a nose when the head turns
    g.moveTo(hx - hr * 0.9, hy); g.ellipse(hx - hr * 0.88, hy + hr * 0.05, hr * 0.18, hr * 0.3, 0, 0, TAU); g.moveTo(hx + hr * 0.9, hy); g.ellipse(hx + hr * 0.88, hy + hr * 0.05, hr * 0.18, hr * 0.3, 0, 0, TAU);
    if (Math.abs(turn) > 0.3) { const d = Math.sign(turn); g.moveTo(hx + d * hr * 0.75, hy - hr * 0.1); g.lineTo(hx + d * hr * (0.95 + 0.25 * Math.abs(turn)), hy + hr * 0.15); g.lineTo(hx + d * hr * 0.75, hy + hr * 0.3); g.closePath(); }
    // hair
    if (o.who === 'daniel') { g.moveTo(hx - hr * 0.95, hy - hr * 0.1); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; const rr = hr * (1.06 + (i % 2) * 0.09); g.lineTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr - hr * 0.04); } g.closePath(); }
    if (kid) { g.moveTo(hx - hr * 0.3, hy - hr * 0.8); g.quadraticCurveTo(hx + hr * 0.1, hy - hr * 1.5, hx + hr * 0.25, hy - hr * 0.6); g.quadraticCurveTo(hx + hr * 0.4, hy + hr * 1.6, hx + hr * 0.05, hy + hr * 1.9); g.quadraticCurveTo(hx - hr * 0.2, hy + hr * 0.8, hx - hr * 0.3, hy - hr * 0.8); }
    // arms
    const A = o.arms || 'desk';
    if (A === 'desk') { [[-1], [1]].forEach(([d]) => { g.moveTo(x + d * sw * 0.9, y + 12 * s); g.lineTo(x + d * (sw + 18 * s), y + 70 * s); g.lineTo(x + d * (sw * 0.55), y + 92 * s); g.lineTo(x + d * (sw * 0.45), y + 80 * s); g.lineTo(x + d * (sw + 4 * s), y + 62 * s); g.closePath(); }); }
    if (A === 'head') { [[-1], [1]].forEach(([d]) => { g.moveTo(x + d * sw * 0.85, y + 8 * s); g.lineTo(x + d * (sw + 26 * s), y - 30 * s); g.lineTo(hx + d * hr * 0.7, hy - hr * 0.2); g.lineTo(hx + d * hr * 0.4, hy - hr * 0.5); g.lineTo(x + d * (sw + 14 * s), y - 40 * s); g.lineTo(x + d * sw * 0.65, y + 4 * s); g.closePath(); }); }
    if (A === 'phone') { g.moveTo(x + sw * 0.85, y + 8 * s); g.lineTo(x + sw + 14 * s, y - 20 * s); g.lineTo(hx + hr * 0.95, hy + hr * 0.1); g.lineTo(hx + hr * 0.75, hy - hr * 0.3); g.lineTo(x + sw + 2 * s, y - 32 * s); g.lineTo(x + sw * 0.6, y + 2 * s); g.closePath(); }
    if (A === 'radio') { g.moveTo(x + sw * 0.85, y + 8 * s); g.lineTo(x + sw + 20 * s, y + 50 * s); g.lineTo(x + sw * 0.9, y + 30 * s); g.closePath(); }
  }
  RIG.back = function (g, o) {
    o = Object.assign({ s: 1, light: [0, -1] }, o); const rw = (o.rimW == null ? 2.4 : o.rimW) * Math.max(0.8, Math.min(2.5, o.s));
    g.save();
    if (o.chair) { g.fillStyle = o.chairFill || '#03060a'; rrect(g, o.x - 44 * o.s, o.y + 34 * o.s, 88 * o.s, 84 * o.s, 12 * o.s); g.fill(); }
    if (o.rim) { g.fillStyle = o.rim; g.beginPath(); backShape(solid(g), o); g.fill(); }
    g.translate(-o.light[0] * rw, -o.light[1] * rw);
    g.fillStyle = o.fill || '#04070b'; g.beginPath(); backShape(solid(g), o); g.fill();
    g.restore();
    if (o.chair) { g.fillStyle = o.chairFill || '#03060a'; rrect(g, o.x - 50 * o.s, o.y + 84 * o.s, 100 * o.s, 26 * o.s, 8 * o.s); g.fill(); g.fillRect(o.x - 5 * o.s, o.y + 108 * o.s, 10 * o.s, 40 * o.s); g.fillRect(o.x - 40 * o.s, o.y + 146 * o.s, 80 * o.s, 6 * o.s); if (o.rim) { g.strokeStyle = o.rim; g.globalAlpha = 0.4; g.lineWidth = 1.5; g.beginPath(); g.moveTo(o.x - 48 * o.s, o.y + 86 * o.s); g.lineTo(o.x + 48 * o.s, o.y + 86 * o.s); g.stroke(); g.globalAlpha = 1; } }
  };

  RIG.chair = function (g, x, y, s, f, fill) {
    g.save(); g.fillStyle = fill || '#03060a';
    rrect(g, x - f * 30 * s - 9 * s, y - 100 * s, 18 * s, 112 * s, 6 * s); g.fill();
    g.fillRect(x - 34 * s, y + 4 * s, 68 * s, 9 * s); g.fillRect(x - 4 * s, y + 13 * s, 8 * s, 58 * s); g.fillRect(x - 32 * s, y + 68 * s, 64 * s, 5 * s);
    g.restore();
  };
})(window);
