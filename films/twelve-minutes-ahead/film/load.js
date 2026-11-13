/* Loads the film in order: kit, script, engine, sound, rig, sets, the timing helper, then every sequence.
   Usage: FILM_LOAD(base, only).then(...). With `only` (e.g. ['Q05']) every sequence still loads so FILM.drawShot can reach
   any shot, but only the listed ones are put on the timeline. */
window.FILM_SEQUENCES = [
  'Q01_cold_open', 'Q02_behind_the_cameras', 'Q03_the_first_rescue', 'Q04_every_solution', 'Q05_midnight', 'Q06_the_lives',
  'Q07_the_truth', 'Q08_the_promise', 'Q09_the_one_thing', 'Q10_the_real_twelve', 'Q11_no_prediction',
];
window.FILM_SETS = ['common', 'control', 'feeds', 'inserts', 'exterior'];
window.FILM_LOAD = async function (base, only) {
  base = base || '';
  const add = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  for (const f of ['kit/otm.js', 'kit/look_c.js', 'film/script.js']) if (!(await add(base + f))) console.error('failed to load ' + f);
  for (const f of ['film/engine.js', 'film/sound.js', 'film/plan.js']) if (!(await add(base + f))) console.error('failed to load ' + f);
  window.SETS = window.SETS || {};
  for (const f of ['film/rig.js'].concat(window.FILM_SETS.map(n => 'film/sets/' + n + '.js'))) { const ok = await add(base + f); if (!ok) console.warn('[film] not built yet: ' + f); }
  await OTM.loadFonts(base + 'fonts/fonts.css');
  if (only) window.FILM_ONLY = only.map(s => s.slice(0, 3));
  for (const n of window.FILM_SEQUENCES) { const ok = await add(base + 'film/seq/' + n + '.js'); if (!ok && (!only || window.FILM_ONLY.includes(n.slice(0, 3)))) console.warn('[film] sequence not built yet: ' + n); }
  return window.FILM;
};
