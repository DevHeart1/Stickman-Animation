// Render ad-hoc frames of sets for look development: node tools/look.js out.png "<draw body using c, t>" [t]
const { open } = require('./film');
(async () => {
  const [out, body, t = '1'] = process.argv.slice(2);
  const { browser, page, errs } = await open('ZZZ');
  const url = await page.evaluate(({ body, t }) => {
    const fn = new Function('c', 't', 'st', body);
    FILM.seq({ id: 'ZZZ', title: 'look', dur: 60, shots: [{ at: 0, draw: (c, st) => fn(c, c.t, st) }] });
    FILM.renderAt(+t); return document.querySelector('canvas').toDataURL('image/jpeg', 0.9);
  }, { body, t });
  require('fs').writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log([...new Set(errs)].slice(0, 10).join('\n') || 'ok ' + out); await browser.close();
})();
