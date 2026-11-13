/* TM.plan: lays a sequence's lines out back to back on a cursor, so every subtitle gets a comfortable reading hold and the
   shots can hang off named marks instead of hand-typed seconds.
     const P = TM.plan(['L001', 1.2, { m: 'crash' }, 'L002', { id: 'L003', gap: 0.2 }, ...]);
     P.lines -> the sequence's lines; P.m.crash -> the cursor time at that mark; P.at.L002 -> when L002 starts; P.end.L002 -> when it ends; P.dur.
   A number is a pause (seconds). { m } marks the cursor. { id, gap, hold, pre } places a line with options; `pre` is a pause before it.
   { id, at } pins a line to an absolute time without moving the cursor (overlaps). */
(function (G) {
  'use strict';
  const TM = G.TM = {};
  TM.readHold = function (id) {
    const e = G.FILM.byId[id]; if (!e) { G.FILM.warn('plan: missing line ' + id); return 2; }
    const n = G.FILM.typeset(e.text).length;
    if (e.speaker === 'NARRATOR') return Math.max(1.7, 0.75 + 0.064 * n);
    if (e.speaker === 'CITYWATCH') return Math.max(1.6, 0.7 + 0.066 * n);
    return Math.max(1.25, 0.55 + 0.062 * n);
  };
  TM.plan = function (items, opts) {
    opts = Object.assign({ gap: 0.5, start: 0 }, opts || {});
    let cur = opts.start; const lines = [], m = {}, at = {}, end = {};
    for (const it of items) {
      if (typeof it === 'number') { cur += it; continue; }
      if (typeof it === 'string') { place({ id: it }); continue; }
      if (it.m) { m[it.m] = cur; continue; }
      if (it.id) place(it);
    }
    function place(o) {
      if (o.pre) cur += o.pre;
      const hold = o.hold != null ? o.hold : TM.readHold(o.id) * (o.slow || 1);
      const t = o.at != null ? o.at : cur;
      const L = Object.assign({}, o, { at: t, hold }); delete L.gap; delete L.pre; delete L.slow;
      lines.push(L); at[o.id] = t; end[o.id] = t + hold;
      if (o.at == null) cur = t + hold + (o.gap != null ? o.gap : opts.gap);
    }
    return { lines, m, at, end, dur: cur };
  };
})(window);
/* shared helpers for the sequences */
(function (G) {
  'use strict';
  const TM = G.TM;
  const cl = v => Math.max(0, Math.min(1, v));
  TM.lerp = (a, b, u) => a + (b - a) * u;
  TM.u = (st, a, b) => cl((st - a) / (b - a || 1e-6));
  TM.ss = u => u * u * (3 - 2 * u);
  // a slow push: zoom from z0 to z1 over the shot
  TM.push = (st, dur, z0, z1) => z0 + (z1 - z0) * TM.ss(cl(st / dur));
  // fade(shot): black in over `a` seconds at the head, out over `b` at the tail
  TM.fade = (a, b) => (st, dur) => Math.max(a ? 1 - st / a : 0, b ? 1 - (dur - st) / b : 0);
  TM.black = c => { c.reset(); c.g.fillStyle = '#000'; c.g.fillRect(0, 0, 1920, 1080); };
  // speaking rhythm for a line: 0..1 while the line is on screen (for heads that nod or tilt)
  TM.speaking = (P, id, lt) => lt >= P.at[id] && lt < P.end[id];
})(window);
