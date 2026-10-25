/* Title-page artwork: an iris, the bit string read from it (a sampled subset highlighted)
   and the 128-bit key it unlocks. Drawn once as SVG; colours come from CSS variables. */
(function () {
  'use strict';
  const host = document.getElementById('iris-art');
  if (!host) return;

  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const cx = 215, cy = 230, rPupil = 46, rIris = 150;
  const f = (n) => n.toFixed(1);

  let fibres = '';
  for (let i = 0; i < 220; i++) {
    const a = (i / 220) * Math.PI * 2 + rnd() * 0.02;
    const r0 = rPupil + 6 + rnd() * 10;
    const r1 = rIris - 6 - rnd() * 26;
    const bend = (rnd() - 0.5) * 0.25;
    const x0 = cx + r0 * Math.cos(a), y0 = cy + r0 * Math.sin(a);
    const xm = cx + ((r0 + r1) / 2) * Math.cos(a + bend), ym = cy + ((r0 + r1) / 2) * Math.sin(a + bend);
    const x1 = cx + r1 * Math.cos(a), y1 = cy + r1 * Math.sin(a);
    fibres += `<path class="${i % 3 ? 'fib' : 'fib2'}" fill="none" d="M${f(x0)},${f(y0)} Q${f(xm)},${f(ym)} ${f(x1)},${f(y1)}"/>`;
  }
  let crypts = '';
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, r = rPupil + 30 + rnd() * 60;
    crypts += `<ellipse cx="${f(cx + r * Math.cos(a))}" cy="${f(cy + r * Math.sin(a))}" rx="${f(3 + rnd() * 6)}" ry="${f(1.5 + rnd() * 3)}" transform="rotate(${f((a * 180) / Math.PI)} ${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))})" style="fill:var(--surface-3);opacity:.7"/>`;
  }

  // ring of bits w read from the iris; every ~6th bit belongs to the sampled subset I_i
  const N = 64, rBits = rIris + 26;
  let bits = '';
  const sel = new Set();
  for (let i = 0; i < N; i++) if (rnd() < 0.2) sel.add(i);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const x = cx + rBits * Math.cos(a), y = cy + rBits * Math.sin(a) + 4;
    bits += `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" class="${sel.has(i) ? 'sel' : ''}">${rnd() < 0.5 ? 0 : 1}</text>`;
  }
  const keyHex = '7f3a·c91e·04b8·…·e25d';

  host.innerHTML = `
  <svg viewBox="0 0 430 600" aria-hidden="true">
    <defs>
      <radialGradient id="irisFill" cx="50%" cy="50%" r="50%">
        <stop offset="0.3" style="stop-color:var(--c3);stop-opacity:.10"/>
        <stop offset="1" style="stop-color:var(--c4);stop-opacity:.16"/>
      </radialGradient>
      <linearGradient id="scanG" x1="0" x2="1">
        <stop offset="0" style="stop-color:var(--accent);stop-opacity:0"/>
        <stop offset="1" style="stop-color:var(--accent);stop-opacity:.5"/>
      </linearGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${rIris}" fill="url(#irisFill)"/>
    ${crypts}${fibres}
    <circle class="ring" cx="${cx}" cy="${cy}" r="${rIris}"/>
    <circle class="ring" cx="${cx}" cy="${cy}" r="${rPupil + 8}" style="opacity:.25"/>
    <circle class="pupil" cx="${cx}" cy="${cy}" r="${rPupil}"/>
    <circle cx="${cx - 16}" cy="${cy - 18}" r="9" style="fill:var(--bg);opacity:.8"/>
    <g class="scan"><path d="M${cx},${cy} L${cx + rIris},${cy} A${rIris},${rIris} 0 0 1 ${f(cx + rIris * Math.cos(0.5))},${f(cy + rIris * Math.sin(0.5))} Z" fill="url(#scanG)" style="opacity:.55"/></g>
    <g class="bits spin">${bits}</g>
    <path d="M${cx},${cy + rBits + 22} v40" style="stroke:var(--ink-2);stroke-width:1.4;stroke-dasharray:4 4"/>
    <path d="M${cx - 6},${cy + rBits + 56} l6,8 l6,-8" style="fill:none;stroke:var(--ink-2);stroke-width:1.4"/>
    <text x="${cx + 12}" y="${cy + rBits + 46}" style="font:600 11.5px var(--mono);fill:var(--muted)">Rep(w′, P)</text>
    <g class="key">
      <rect x="${cx - 118}" y="${cy + rBits + 72}" width="236" height="42" rx="21"/>
      <circle cx="${cx - 96}" cy="${cy + rBits + 93}" r="9" style="fill:none;stroke:var(--accent);stroke-width:2.2"/>
      <path d="M${cx - 87},${cy + rBits + 93} h20 m-6,0 v6 m-6,-6 v5" style="fill:none;stroke:var(--accent);stroke-width:2.2;stroke-linecap:round"/>
      <text x="${cx - 58}" y="${cy + rBits + 97}">${keyHex}</text>
    </g>
    <text x="${cx}" y="${cy + rBits + 132}" text-anchor="middle" style="font:600 11px var(--mono);fill:var(--muted);letter-spacing:.06em">128-BIT KEY · 105-BIT SECURITY</text>
  </svg>`;
})();
