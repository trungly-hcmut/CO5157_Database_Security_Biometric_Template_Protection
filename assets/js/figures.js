/* =========================================================
   G3 · BTP — figures drawn as SVG at load time.
   Every figure is theme-aware (CSS variables) and bilingual
   (paired <text class="en"> / <text class="vi">).
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // text helper: txt is a string or {en, vi}
  function T(x, y, txt, cls = '', extra = '') {
    if (typeof txt === 'string') return `<text x="${x}" y="${y}" class="${cls}" ${extra}>${txt}</text>`;
    return `<text x="${x}" y="${y}" class="en ${cls}" ${extra}>${txt.en}</text>` +
           `<text x="${x}" y="${y}" class="vi ${cls}" ${extra}>${txt.vi}</text>`;
  }
  // number in both locales (VI uses a decimal comma)
  function N(v, d) {
    const s = v.toFixed(d);
    return { en: s, vi: s.replace('.', ',') };
  }
  const NS = (v, d) => { const n = N(v, d); return `<span class="en">${n.en}</span><span class="vi">${n.vi}</span>`; };
  const f2 = (v) => v.toFixed(2);

  /* ---------------- title art: fingerprint ridges + scan line ---------------- */
  function titleArt() {
    const el = $('#title-art');
    if (!el) return;
    const r = rng(11);
    const cx = 300, cy = 300;
    let s = `<svg viewBox="0 0 600 680" aria-hidden="true"><defs>
      <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--accent);stop-opacity:0"/>
        <stop offset=".8" style="stop-color:var(--accent);stop-opacity:.16"/>
        <stop offset="1" style="stop-color:var(--accent);stop-opacity:.75"/>
      </linearGradient>
      <radialGradient id="fpFade" cx=".5" cy=".45" r=".6">
        <stop offset=".55" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <mask id="fpMask"><rect width="600" height="680" fill="url(#fpFade)"/></mask>
    </defs><g mask="url(#fpMask)">`;
    const minu = [];
    for (let i = 0; i < 25; i++) {
      const rx = 12 + i * 11;
      const ry = rx * 1.16;
      const legL = 30 + i * 10 + r() * 30;
      const legR = 30 + i * 10 + r() * 30;
      const d = `M${cx - rx},${cy + legL} L${cx - rx},${cy} A${rx},${ry} 0 0 1 ${cx + rx},${cy} L${cx + rx},${cy + legR}`;
      const len = Math.PI * rx * 1.1 + legL + legR;
      const dash = [];
      let acc = 0;
      while (acc < len) {
        const seg = 50 + r() * 190;
        const gap = 6 + r() * 10;
        dash.push(seg.toFixed(1), gap.toFixed(1));
        acc += seg + gap;
      }
      s += `<path class="ridge" d="${d}" stroke-width="${(3.1 - i * 0.045).toFixed(2)}" stroke-dasharray="${dash.join(' ')}" style="opacity:${(0.62 - i * 0.017).toFixed(2)}"/>`;
      if (i > 3 && i % 3 === 1) {
        const th = Math.PI * (0.18 + r() * 0.64);
        minu.push([cx + rx * Math.cos(th), cy - ry * Math.sin(th)]);
      }
    }
    minu.forEach((p, k) => {
      s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="6" style="fill:var(--bg);stroke:var(--fig-2);stroke-width:2.2">
        <animate attributeName="r" values="5;8;5" dur="2.6s" begin="${(k * 0.4).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
    });
    s += `</g><rect class="scan" x="40" y="0" width="520" height="46" rx="4"/></svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 1.3 intra-user variability ---------------- */
  function minutiae() {
    const el = $('#fig-minu');
    if (!el) return;
    const r = rng(4);
    const cx = 160, cy = 118, rx = 128, ry = 104;
    const pts = [];
    function inside() {
      for (let k = 0; k < 500; k++) {
        const x = cx + (r() * 2 - 1) * rx;
        const y = cy + (r() * 2 - 1) * ry;
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 0.8) continue;
        if (pts.every((p) => (p[0] - x) ** 2 + (p[1] - y) ** 2 > 15 * 15)) { pts.push([x, y]); return [x, y]; }
      }
      return [cx, cy];
    }
    const circ = (p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.6" class="f1"/>`;
    const tri = (p) => { const [x, y] = p; return `<path d="M${(x).toFixed(1)},${(y - 5.5).toFixed(1)} l5,9 h-10z" class="f2"/>`; };
    let s = `<svg viewBox="0 0 320 272"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="box-soft"/>`;
    for (let i = 1; i < 9; i++) s += `<ellipse cx="${cx}" cy="${cy + 20}" rx="${i * 14}" ry="${i * 12}" class="grid" style="opacity:.6"/>`;
    let links = '', marks = '';
    for (let i = 0; i < 16; i++) {
      const p = inside();
      const q = [p[0] + (r() - 0.5) * 9, p[1] + (r() - 0.5) * 9];
      links += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="10" style="fill:none;stroke:var(--good);stroke-width:1.4;opacity:.8"/>`;
      marks += circ(p) + tri(q);
    }
    for (let i = 0; i < 17; i++) marks += circ(inside());
    for (let i = 0; i < 10; i++) marks += tri(inside());
    s += links + marks;
    s += `<circle cx="18" cy="252" r="4.6" class="f1"/>` + T(28, 257, { en: 'scan 1: 33', vi: 'lần 1: 33' }, 't-ink2', 'font-size="12.5"');
    s += `<path d="M112,246 l5,9 h-10z" class="f2"/>` + T(122, 257, { en: 'scan 2: 26', vi: 'lần 2: 26' }, 't-ink2', 'font-size="12.5"');
    s += `<circle cx="212" cy="252" r="7" style="fill:none;stroke:var(--good);stroke-width:1.4"/>` + T(224, 257, { en: '16 matched', vi: '16 điểm trùng' }, 't-good', 'font-size="12.5" font-weight="700"');
    s += `</svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 1.3 hash avalanche demo ---------------- */
  function hashDemo() {
    const el = $('#fig-hash');
    if (!el) return;
    const base = '101100101110'.split('').map(Number);
    const cur = base.slice();
    cur[5] ^= 1;
    const bitsEl = $('#hash-bits', el);
    const h0 = $('#hash-h0', el), h1 = $('#hash-h1', el), stat = $('#hash-stat', el);
    const hasCrypto = !!(window.crypto && crypto.subtle && crypto.subtle.digest);

    async function sha(bits) {
      const data = new TextEncoder().encode(bits.join(''));
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    function popcount(hexA, hexB) {
      let c = 0;
      for (let i = 0; i < hexA.length; i++) {
        let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
        while (x) { c += x & 1; x >>= 1; }
      }
      return c;
    }
    function renderBits() {
      bitsEl.innerHTML = cur.map((b, i) =>
        `<button type="button" data-i="${i}" class="${b !== base[i] ? 'flip' : ''}" aria-label="bit ${i + 1}">${b}</button>` +
        (i % 4 === 3 && i < base.length - 1 ? '<i class="gap"></i>' : '')).join('');
    }
    async function update() {
      renderBits();
      const diffIn = cur.reduce((a, b, i) => a + (b !== base[i] ? 1 : 0), 0);
      if (!hasCrypto) {
        h0.textContent = h1.textContent = '(open over HTTPS to compute SHA-256)';
        return;
      }
      const [a, b] = await Promise.all([sha(base), sha(cur)]);
      const show = 32;
      h0.innerHTML = a.slice(0, show) + '…';
      h1.innerHTML = b.slice(0, show).split('').map((ch, i) => (ch !== a[i] ? `<em>${ch}</em>` : ch)).join('') + '…';
      const d = popcount(a, b);
      stat.innerHTML =
        `<span class="en">Inputs differ in <b>${diffIn}</b> bit${diffIn === 1 ? '' : 's'} → digests differ in <b>${d}</b> of 256 bits. “Close” inputs do not give “close” hashes.</span>` +
        `<span class="vi">Đầu vào lệch <b>${diffIn}</b> bit → mã băm lệch <b>${d}</b>/256 bit. Đầu vào “gần nhau” không cho mã băm “gần nhau”.</span>`;
    }
    bitsEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      cur[+b.dataset.i] ^= 1;
      b.blur();
      update();
    });
    update();
  }

  /* ---------------- 2.1 FAR/FRR vs threshold ---------------- */
  function farfrr() {
    const el = $('#fig-farfrr');
    if (!el) return;
    const s0 = 0.0527;
    const FAR = (t) => 100 / (1 + Math.exp((t - 0.3) / s0));
    const FRR = (t) => 100 / (1 + Math.exp(-(t - 0.7) / s0));
    const X = (t) => 56 + t * 480;
    const Y = (v) => 262 - v * 2.35;
    let pa = '', pb = '';
    for (let i = 0; i <= 160; i++) {
      const t = i / 160;
      pa += (i ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(FAR(t)).toFixed(1);
      pb += (i ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(FRR(t)).toFixed(1);
    }
    let s = `<svg viewBox="0 0 560 312">`;
    for (let v = 0; v <= 100; v += 20) {
      s += `<line x1="56" x2="536" y1="${Y(v)}" y2="${Y(v)}" class="grid"/>` + T(46, Y(v) + 4, String(v), 't-muted', 'font-size="12" text-anchor="end"');
    }
    for (let t = 0; t <= 1.001; t += 0.2) s += T(X(t), 282, t.toFixed(1), 't-muted', 'font-size="12" text-anchor="middle"');
    s += `<line x1="56" x2="536" y1="${Y(0)}" y2="${Y(0)}" class="ax"/>`;
    s += T(296, 304, { en: 'Threshold τ', vi: 'Ngưỡng τ' }, 't-ink2', 'font-size="13" text-anchor="middle"');
    s += T(14, 150, { en: 'Error rate (%)', vi: 'Tỉ lệ lỗi (%)' }, 't-ink2', 'font-size="13" text-anchor="middle" transform="rotate(-90 14 150)"');
    s += `<path d="${pa}" class="s2"/><path d="${pb}" class="s1"/>`;
    s += T(60, 14, { en: 'FAR (false accept)', vi: 'FAR (chấp nhận nhầm)' }, 't-f2', 'font-size="14" font-weight="700" style="paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round"');
    s += T(536, 14, { en: 'FRR (false reject)', vi: 'FRR (từ chối nhầm)' }, 't-f1', 'font-size="14" font-weight="700" text-anchor="end" style="paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round"');
    s += `<circle cx="${X(0.5)}" cy="${Y(FAR(0.5))}" r="6" class="fill-bad" style="stroke:var(--surface);stroke-width:2"/>`;
    s += `<line x1="${X(0.5) + 8}" y1="${Y(FAR(0.5)) - 4}" x2="${X(0.71)}" y2="${Y(10)}" class="ln-muted"/>`;
    s += T(X(0.72), Y(10.5), { en: 'EER ≈ 2.2% at τ = 0.50', vi: 'EER ≈ 2,2% tại τ = 0,50' }, '', 'font-size="13.5" font-weight="700" style="paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round"');
    s += `<g id="ff-tau" style="transition:transform .25s ease"><line x1="0" x2="0" y1="${Y(100) - 6}" y2="${Y(0)}" class="ln-ch" style="stroke-dasharray:5 4"/></g>`;
    s += `</svg>`;
    $('.plot', el).innerHTML = s;
    const tau = $('#ff-tau', el);
    const rngEl = $('input', el);
    const out = $('.ff-out', el);
    function set(t) {
      tau.style.transform = `translateX(${X(t)}px)`;
      out.innerHTML =
        `<span>τ = <b>${NS(t, 2)}</b></span>` +
        `<span class="t-f2">FAR <b>${NS(FAR(t), 1)}%</b></span>` +
        `<span class="t-f1">FRR <b>${NS(FRR(t), 1)}%</b></span>`;
    }
    rngEl.addEventListener('input', () => set(+rngEl.value));
    set(+rngEl.value);
  }

  /* ---------------- 2.1 worked example ---------------- */
  function worked() {
    const el = $('#fig-worked');
    if (!el) return;
    const G = [0.92, 0.85, 0.78, 0.64, 0.55];
    const I = [0.10, 0.25, 0.38, 0.52, 0.70];
    const X = (v) => 40 + v * 920;
    let s = `<svg viewBox="0 0 1000 176">`;
    s += `<rect id="wz-rej" x="${X(0)}" y="14" width="0" height="146" rx="6" style="fill:var(--bad-soft);opacity:.55;transition:width .5s cubic-bezier(.2,.8,.2,1)"/>`;
    s += `<rect id="wz-acc" x="0" y="14" width="0" height="146" rx="6" style="fill:var(--good-soft);opacity:.7;transition:all .5s cubic-bezier(.2,.8,.2,1)"/>`;
    s += `<line x1="${X(0)}" x2="${X(1)}" y1="88" y2="88" class="ax"/>`;
    for (let i = 0; i <= 10; i++) {
      const v = i / 10;
      s += `<line x1="${X(v)}" x2="${X(v)}" y1="84" y2="92" class="ax"/>` + T(X(v), 106, { en: v.toFixed(1), vi: v.toFixed(1).replace('.', ',') }, 't-muted', 'font-size="12" text-anchor="middle"');
    }
    s += T(X(0) + 8, 30, { en: 'reject  (S < τ)', vi: 'từ chối (S < τ)' }, 't-bad', 'font-size="13" font-weight="700"');
    s += T(X(1) - 8, 30, { en: 'accept  (S ≥ τ)', vi: 'chấp nhận (S ≥ τ)' }, 't-good', 'font-size="13" font-weight="700" text-anchor="end"');
    G.forEach((v, i) => {
      s += `<circle class="w-ring" data-g="${i}" cx="${X(v)}" cy="58" r="15" style="fill:none;stroke:var(--bad);stroke-width:2.4;opacity:0;transition:opacity .3s"/>`;
      s += `<circle cx="${X(v)}" cy="58" r="9" class="f1"/>` + T(X(v), 43, { en: v.toFixed(2), vi: v.toFixed(2).replace('.', ',') }, 't-f1 t-mono', 'font-size="12" text-anchor="middle" font-weight="600"');
    });
    I.forEach((v, i) => {
      s += `<circle class="w-ring" data-i="${i}" cx="${X(v)}" cy="126" r="15" style="fill:none;stroke:var(--bad);stroke-width:2.4;opacity:0;transition:opacity .3s"/>`;
      s += `<rect x="${X(v) - 7}" y="119" width="14" height="14" transform="rotate(45 ${X(v)} 126)" class="f2"/>` + T(X(v), 155, { en: v.toFixed(2), vi: v.toFixed(2).replace('.', ',') }, 't-f2 t-mono', 'font-size="12" text-anchor="middle" font-weight="600"');
    });
    s += `<g id="w-tau" style="transition:transform .5s cubic-bezier(.2,.8,.2,1)"><line x1="0" x2="0" y1="10" y2="166" style="stroke:var(--ch);stroke-width:3"/>
          <rect x="-34" y="-6" width="68" height="20" rx="6" class="fill-ch"/><text id="w-tau-t" x="0" y="8.5" text-anchor="middle" font-size="12.5" font-weight="700" class="t-onacc">τ</text></g>`;
    s += `</svg>`;
    $('.plot', el).innerHTML = s;
    const out = $('.w-out', el);
    const rows = $$('#tbl-worked tbody tr');
    function set(t) {
      const x = X(t);
      $('#w-tau', el).style.transform = `translateX(${x}px)`;
      $('#w-tau-t', el).textContent = 'τ = ' + (document.documentElement.lang === 'vi' ? t.toFixed(1).replace('.', ',') : t.toFixed(1));
      $('#wz-rej', el).setAttribute('width', x - X(0));
      $('#wz-acc', el).setAttribute('x', x);
      $('#wz-acc', el).setAttribute('width', X(1) - x);
      let fa = 0, fr = 0;
      I.forEach((v, i) => { const e = v >= t; fa += e; $(`.w-ring[data-i="${i}"]`, el).style.opacity = e ? 1 : 0; });
      G.forEach((v, i) => { const e = v < t; fr += e; $(`.w-ring[data-g="${i}"]`, el).style.opacity = e ? 1 : 0; });
      out.innerHTML =
        `<span class="t-f2">FAR = ${fa}/5 = <b>${fa * 20}%</b></span>` +
        `<span class="t-f1">FRR = ${fr}/5 = <b>${fr * 20}%</b></span>` +
        `<span>GAR = <b>${100 - fr * 20}%</b></span>`;
      rows.forEach((r) => r.classList.toggle('hl', +r.dataset.t === t));
      $$('.seg button', el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.t === t)));
      el.dataset.t = t;
    }
    $('.seg', el).addEventListener('click', (e) => {
      const b = e.target.closest('button[data-t]');
      if (!b) return;
      set(+b.dataset.t);
      b.blur();
    });
    document.addEventListener('lang:change', () => set(+el.dataset.t || 0.6));
    set(0.6);
  }

  /* ---------------- 2.1(e) GAR at FAR = 0.1% (dot plot) ---------------- */
  function garPlot() {
    const el = $('#fig-gar');
    if (!el) return;
    const rows = [
      { n: { en: 'Original (unprotected)', vi: 'Gốc (không bảo vệ)' }, v: 96, c: 'var(--ink-2)' },
      { n: { en: 'Gaussian transform', vi: 'Biến đổi Gaussian' }, v: 90, c: 'var(--fig-1)' },
      { n: { en: 'Polar transform', vi: 'Biến đổi Polar' }, v: 86, c: 'var(--fig-2)' }
    ];
    const X = (v) => 200 + (v - 80) * 15.5;
    let s = `<svg viewBox="0 0 540 250">`;
    for (let v = 80; v <= 100; v += 5) {
      s += `<line x1="${X(v)}" x2="${X(v)}" y1="18" y2="200" class="grid"/>` + T(X(v), 218, v + '%', 't-muted', 'font-size="12" text-anchor="middle"');
    }
    s += `<line x1="${X(96)}" x2="${X(96)}" y1="18" y2="200" class="ln-muted dash"/>`;
    rows.forEach((r, i) => {
      const y = 50 + i * 62;
      s += T(186, y + 5, r.n, '', 'font-size="14" font-weight="600" text-anchor="end"');
      if (i) {
        s += `<line x1="${X(r.v)}" x2="${X(96)}" y1="${y}" y2="${y}" style="stroke:var(--bad);stroke-width:5;stroke-linecap:round;opacity:.35"/>`;
        s += T((X(r.v) + X(96)) / 2, y - 13, `−${96 - r.v} pp`, 't-bad', 'font-size="13" font-weight="700" text-anchor="middle"');
      }
      s += `<circle cx="${X(r.v)}" cy="${y}" r="9" style="fill:${r.c}"/>`;
      s += T(X(r.v) + (i ? -16 : 16), y + 5, `≈${r.v}%`, 't-mono', `font-size="13" font-weight="700" text-anchor="${i ? 'end' : 'start'}"`);
    });
    s += T(X(90), 242, { en: 'GAR at FAR = 0.1%', vi: 'GAR tại FAR = 0,1%' }, 't-ink2', 'font-size="13" text-anchor="middle"');
    s += `</svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 2.2 unlinkability histograms ---------------- */
  function unlink() {
    const el = $('#fig-unlink');
    if (!el) return;
    const pdf = (x, m, sd) => Math.exp(-((x - m) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
    function panel(ox, title, cls, note, mMated, mNon) {
      const X = (v) => ox + 20 + (v - 0.1) * 300;
      const Y = (d) => 190 - d * 20;
      let s = T(ox + 155, 18, title, cls, 'font-size="14.5" font-weight="700" text-anchor="middle"');
      s += `<line x1="${X(0.1)}" x2="${X(1.0)}" y1="190" y2="190" class="ax"/>`;
      for (let v = 0.2; v <= 1.001; v += 0.2) s += T(X(v), 206, { en: v.toFixed(1), vi: v.toFixed(1).replace('.', ',') }, 't-muted', 'font-size="11.5" text-anchor="middle"');
      const bw = 0.02;
      for (let b = 0.1; b < 1.0; b += bw) {
        const c = b + bw / 2;
        const h1 = pdf(c, mNon, 0.07), h2 = pdf(c, mMated, mMated > 0.6 ? 0.06 : 0.07);
        if (h1 > 0.05) s += `<rect x="${X(b).toFixed(1)}" y="${Y(h1).toFixed(1)}" width="${(bw * 300 - 0.6).toFixed(1)}" height="${(190 - Y(h1)).toFixed(1)}" class="f2" style="opacity:.55"/>`;
        if (h2 > 0.05) s += `<rect x="${X(b).toFixed(1)}" y="${Y(h2).toFixed(1)}" width="${(bw * 300 - 0.6).toFixed(1)}" height="${(190 - Y(h2)).toFixed(1)}" class="f3" style="opacity:.55"/>`;
      }
      s += T(ox + 26, 44, note[0], 't-ink2', 'font-size="12"') + T(ox + 26, 60, note[1], 't-ink2', 'font-size="12"');
      return s;
    }
    let s = `<svg viewBox="0 0 690 250">`;
    s += panel(0, { en: 'Good case: NOT linkable', vi: 'Trường hợp tốt: KHÔNG liên kết' }, 't-good',
      [{ en: 'distributions overlap →', vi: 'hai phân bố chồng nhau →' }, { en: 'score reveals nothing', vi: 'điểm không tiết lộ gì' }], 0.505, 0.495);
    s += panel(355, { en: 'Bad case: LINKABLE', vi: 'Trường hợp xấu: LIÊN KẾT ĐƯỢC' }, 't-bad',
      [{ en: 'distributions separate →', vi: 'hai phân bố tách rời →' }, { en: 'attacker guesses “same person”', vi: 'đoán được “cùng người”' }], 0.73, 0.48);
    s += `<rect x="150" y="226" width="14" height="12" class="f3" style="opacity:.7"/>` + T(170, 236, { en: 'Mated (same person, different keys)', vi: 'Mated (cùng người, khác khoá)' }, 't-ink2', 'font-size="12.5"');
    s += `<rect x="420" y="226" width="14" height="12" class="f2" style="opacity:.7"/>` + T(440, 236, { en: 'Non-mated (different people)', vi: 'Non-mated (khác người)' }, 't-ink2', 'font-size="12.5"');
    s += `</svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 3.1 Cartesian transform ---------------- */
  function cartesian() {
    const el = $('#fig-cart');
    if (!el) return;
    const cs = 44;
    const A = (i) => [Math.floor((i - 1) / 5), (i - 1) % 5];
    const mapB = [
      [[22], [5], [20], [4], [15]],
      [[8, 16], [18], [1, 19], [23], [11]],
      [[2], [14, 6], [], [13], []],
      [[12], [], [7, 24], [3], [21]],
      [[25], [10], [17], [], [9]]
    ];
    const colA = { 6: 'var(--fig-2)', 14: 'var(--fig-2)', 7: 'var(--fig-1)', 24: 'var(--fig-1)' };
    let s = `<svg viewBox="0 0 760 262"><defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--line-2);stroke-width:2"/></pattern></defs>`;
    // minutiae table
    s += T(8, 22, { en: 'Minutiae', vi: 'Minutiae' }, 't-ink2', 'font-size="13" font-weight="700"');
    const rowsM = [['X', 'Y', 'θ', 'T'], ['106', '26', '320', 'R'], ['153', '50', '335', 'R'], ['255', '81', '215', 'B'], ['…', '…', '…', '…']];
    rowsM.forEach((r, i) => {
      r.forEach((c, j) => { s += T(12 + j * 34, 48 + i * 24, c, i ? 't-mono' : 't-muted', `font-size="${i ? 12.5 : 12}" font-weight="${i ? 500 : 700}"`); });
    });
    s += `<line x1="8" x2="146" y1="54" y2="54" class="grid"/>`;
    s += T(8, 200, { en: 'R = ridge ending', vi: 'R = điểm kết thúc' }, 't-muted', 'font-size="11.5"');
    s += T(8, 216, { en: 'B = bifurcation', vi: 'B = điểm rẽ nhánh' }, 't-muted', 'font-size="11.5"');
    function grid(ox, cells, label) {
      let g = T(ox + cs * 2.5, 16, label, 't-ink2', 'font-size="13" font-weight="700" text-anchor="middle"');
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const x = ox + c * cs, y = 26 + r * cs;
        const nums = cells(r, c);
        let fill = 'var(--surface)';
        if (nums.length === 0) fill = 'url(#hatch)';
        else if (nums.length === 1 && colA[nums[0]] && label.en === 'Grid (key K)') fill = `color-mix(in srgb, ${colA[nums[0]]} 22%, var(--surface))`;
        else if (nums.length > 1) {
          const c0 = colA[nums[0]];
          fill = c0 ? `color-mix(in srgb, ${c0} 26%, var(--surface))` : 'var(--surface-3)';
        }
        g += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" style="fill:${fill};stroke:var(--line-2);stroke-width:1.2"/>`;
        if (nums.length) g += T(x + cs / 2, y + cs / 2 + 5, nums.join(','), 't-mono', `font-size="${nums.length > 1 ? 12.5 : 14}" font-weight="${nums.length > 1 ? 800 : 600}" text-anchor="middle"`);
      }
      return g;
    }
    s += grid(190, (r, c) => [r * 5 + c + 1], { en: 'Grid (key K)', vi: 'Lưới (khoá K)' });
    s += `<path d="M430,136 h42" class="ln"/><path d="M468,130 l8,6 -8,6" class="ln"/>`;
    s += grid(500, (r, c) => mapB[r][c], { en: 'After moving cells', vi: 'Sau khi dời ô' });
    s += T(500 + cs * 2.5, 258, { en: 'hatched = empty · colour = cells merged', vi: 'gạch chéo = ô trống · màu = ô bị gộp' }, 't-muted', 'font-size="12" text-anchor="middle"');
    s += `</svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 3.1 Polar transform ---------------- */
  function polar() {
    const el = $('#fig-polar');
    if (!el) return;
    const R = [22, 66, 118];
    const ang = { TL: 135, TR: 45, BL: 225, BR: 315 };
    function sector(cx, cy, r0, r1, a0, a1, style) {
      const p = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
      const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1), [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0);
      return `<path d="M${x0},${y0} A${r1},${r1} 0 0 0 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 1 ${x3},${y3}Z" style="${style}"/>`;
    }
    function disk(cx, cy, labels, marks) {
      let g = '';
      Object.keys(marks).forEach((k) => {
        const [ring, q] = k.split(':');
        const r0 = ring === 'o' ? R[1] : R[0], r1 = ring === 'o' ? R[2] : R[1];
        const a = ang[q];
        g += sector(cx, cy, r0, r1, a - 45, a + 45, marks[k]);
      });
      R.forEach((r) => { g += `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:none;stroke:var(--ink-2);stroke-width:1.5"/>`; });
      g += `<circle cx="${cx}" cy="${cy}" r="8" style="fill:none;stroke:var(--ink-2);stroke-width:1.2"/>`;
      g += `<line x1="${cx - R[2]}" x2="${cx + R[2]}" y1="${cy}" y2="${cy}" style="stroke:var(--ink-2);stroke-width:1.5"/>`;
      g += `<line x1="${cx}" x2="${cx}" y1="${cy - R[2]}" y2="${cy + R[2]}" style="stroke:var(--ink-2);stroke-width:1.5"/>`;
      labels.forEach(([ring, q, txt]) => {
        const r = ring === 'o' ? (R[1] + R[2]) / 2 : (R[0] + R[1]) / 2;
        const a = ang[q] * Math.PI / 180;
        g += T((cx + r * Math.cos(a)).toFixed(1), (cy - r * Math.sin(a) + 5).toFixed(1), txt, 't-mono', `font-size="${txt.length > 1 ? 14 : 16}" font-weight="700" text-anchor="middle"`);
      });
      return g;
    }
    const hatch = 'fill:url(#hatchP);stroke:none';
    const m1 = 'fill:color-mix(in srgb,var(--fig-1) 26%,transparent);stroke:none';
    const m2 = 'fill:color-mix(in srgb,var(--fig-2) 26%,transparent);stroke:none';
    let s = `<svg viewBox="0 0 640 262"><defs><pattern id="hatchP" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--line-2);stroke-width:2"/></pattern></defs>`;
    s += disk(135, 130, [['o', 'TL', '1'], ['o', 'TR', '2'], ['o', 'BL', '4'], ['o', 'BR', '3'], ['m', 'TL', '6'], ['m', 'TR', '7'], ['m', 'BL', '5'], ['m', 'BR', '8']],
      { 'o:TR': m1, 'm:TR': m1, 'm:TL': m2, 'm:BR': m2 });
    s += `<path d="M280,130 h66" class="ln"/><path d="M340,123 l9,7 -9,7" class="ln"/>`;
    s += T(313, 118, { en: 'key K', vi: 'khoá K' }, 't-warn', 'font-size="12.5" font-weight="700" text-anchor="middle"');
    s += disk(495, 130, [['o', 'TR', '1'], ['o', 'BL', '7 2'], ['o', 'BR', '4'], ['m', 'TL', '5'], ['m', 'BL', '3'], ['m', 'BR', '8 6']],
      { 'o:TL': hatch, 'm:TR': hatch, 'o:BL': m1, 'm:BR': m2 });
    s += `</svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 3.1 Functional transform (smooth displacement field) ---------------- */
  function functional() {
    const el = $('#fig-func');
    if (!el) return;
    const bumps = [
      { x: 0.52, y: 0.46, s: 0.13, ax: 0.30, ay: -0.12 },
      { x: 0.2, y: 0.78, s: 0.12, ax: -0.10, ay: 0.14 },
      { x: 0.82, y: 0.24, s: 0.12, ax: 0.10, ay: 0.18 },
      { x: 0.9, y: 0.66, s: 0.08, ax: -0.15, ay: 0.06 },
      { x: 0.28, y: 0.2, s: 0.11, ax: 0.12, ay: 0.10 },
      { x: 0.62, y: 0.88, s: 0.1, ax: 0.08, ay: -0.13 }
    ];
    const D = (x, y) => {
      let dx = 0, dy = 0;
      bumps.forEach((b) => {
        const w = Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.s * b.s));
        dx += b.ax * w; dy += b.ay * w;
      });
      return [x + dx, y + dy];
    };
    const S = 228;
    const P = (ox, p) => `${(ox + p[0] * S).toFixed(1)},${(18 + p[1] * S).toFixed(1)}`;
    const n = 12;
    let left = '', right = '';
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      let a = '', b = '', c = '', d = '';
      for (let k = 0; k <= 60; k++) {
        const v = k / 60;
        a += (k ? 'L' : 'M') + P(16, [u, v]);
        b += (k ? 'L' : 'M') + P(16, [v, u]);
        c += (k ? 'L' : 'M') + P(420, D(u, v));
        d += (k ? 'L' : 'M') + P(420, D(v, u));
      }
      left += `<path d="${a}" class="grid"/><path d="${b}" class="grid"/>`;
      right += `<path d="${c}" style="fill:none;stroke:var(--line-2);stroke-width:1.1"/><path d="${d}" style="fill:none;stroke:var(--line-2);stroke-width:1.1"/>`;
    }
    const r = rng(21);
    let ml = '', mr = '';
    for (let i = 0; i < 20; i++) {
      const p = [0.08 + r() * 0.84, 0.08 + r() * 0.84];
      const th = r() * Math.PI * 2;
      const q = D(p[0], p[1]);
      const m = (ox, pp, cls) => {
        const [x, y] = P(ox, pp).split(',').map(Number);
        return `<circle cx="${x}" cy="${y}" r="4.2" class="${cls}"/><line x1="${x}" y1="${y}" x2="${(x + 11 * Math.cos(th)).toFixed(1)}" y2="${(y + 11 * Math.sin(th)).toFixed(1)}" style="stroke:var(--${cls === 'f1' ? 'fig-1' : 'fig-2'});stroke-width:1.8"/>`;
      };
      ml += m(16, p, 'f1');
      mr += m(420, q, 'f2');
    }
    let s = `<svg viewBox="0 0 700 272">${left}${ml}${right}${mr}`;
    s += `<path d="M280,132 h96" class="ln"/><path d="M370,125 l9,7 -9,7" class="ln"/>`;
    s += T(328, 120, { en: 'key → field', vi: 'khoá → trường' }, 't-warn', 'font-size="12.5" font-weight="700" text-anchor="middle"');
    s += T(130, 268, { en: 'original minutiae', vi: 'minutiae gốc' }, 't-muted', 'font-size="12" text-anchor="middle"');
    s += T(534, 268, { en: 'after smooth displacement (note the folds)', vi: 'sau dịch chuyển trơn (chú ý chỗ gấp)' }, 't-muted', 'font-size="12" text-anchor="middle"');
    s += `</svg>`;
    el.innerHTML = s;
  }

  /* ---------------- 3.2 Fuzzy vault (degree-1 example) ---------------- */
  function vault() {
    const el = $('#fig-vault');
    if (!el) return;
    const Gp = [[1, 5], [4, 11], [6, 15]];
    const Cp = [[2, 9], [3, 4], [5, 7], [7, 12]];
    const X = (x) => 46 + x * 58;
    const Y = (y) => 282 - y * 14.5;
    const line = (a, b, cls, style = '') => {
      const x0 = 0.2, x1 = 7.8;
      return `<line x1="${X(x0)}" y1="${Y(a * x0 + b)}" x2="${X(x1)}" y2="${Y(a * x1 + b)}" class="${cls}" style="${style}"/>`;
    };
    function draw(mode) {
      let s = `<svg viewBox="0 0 520 318"><defs><clipPath id="vclip"><rect x="46" y="10" width="464" height="272"/></clipPath></defs>`;
      for (let y = 0; y <= 18; y += 3) s += `<line x1="46" x2="510" y1="${Y(y)}" y2="${Y(y)}" class="grid"/>` + T(38, Y(y) + 4, String(y), 't-muted', 'font-size="11.5" text-anchor="end"');
      for (let x = 1; x <= 8; x++) s += T(X(x), 300, String(x), 't-muted', 'font-size="11.5" text-anchor="middle"');
      s += `<line x1="46" x2="510" y1="${Y(0)}" y2="${Y(0)}" class="ax"/><line x1="46" x2="46" y1="10" y2="${Y(0)}" class="ax"/>`;
      s += T(512, 314, 'x', 't-muted', 'font-size="12" text-anchor="end"');
      s += `<g clip-path="url(#vclip)">`;
      if (mode === 'truth') s += line(2, 3, 'ln-ch dash', 'stroke-width:2.2');
      if (mode === 'genuine') s += line(2, 3, 'ln-good', 'stroke-width:3');
      if (mode === 'impostor') {
        s += line(-5, 19, 'ln-bad dash') + line(0.6, 7.8, 'ln-bad dash') + line(2, -2, 'ln-bad dash');
      }
      s += `</g>`;
      const sel = mode === 'genuine' ? [1, 4, 5] : mode === 'impostor' ? [2, 3, 7] : [];
      const all = Gp.map((p) => [...p, 'g']).concat(Cp.map((p) => [...p, 'c'])).sort((a, b) => a[0] - b[0]);
      all.forEach(([x, y, kind]) => {
        const picked = sel.includes(x);
        const neutral = mode === 'attacker';
        const fill = neutral ? 'var(--ink-2)' : kind === 'g' ? 'var(--fig-3)' : 'var(--fig-2)';
        if (picked) s += `<circle cx="${X(x)}" cy="${Y(y)}" r="15" style="fill:none;stroke:${mode === 'genuine' && kind === 'c' ? 'var(--warn)' : mode === 'genuine' ? 'var(--good)' : 'var(--bad)'};stroke-width:2.6"/>`;
        if (kind === 'g' || neutral) s += `<circle cx="${X(x)}" cy="${Y(y)}" r="8" style="fill:${fill}"/>`;
        else s += `<rect x="${X(x) - 7}" y="${Y(y) - 7}" width="14" height="14" transform="rotate(45 ${X(x)} ${Y(y)})" style="fill:${fill}"/>`;
        s += T(X(x) + 13, Y(y) + 17, `(${x}, ${y})`, 't-mono t-ink2', 'font-size="11.5"');
      });
      if (mode === 'truth') s += T(X(2.2), Y(16.2), 'p(x) = 2x + 3', 't-ch t-mono', 'font-size="15" font-weight="700"');
      if (mode === 'genuine') s += T(X(1.2), Y(16.2), { en: 'line through (1,5),(4,11) → key (2, 3) ✓', vi: 'đường qua (1,5),(4,11) → khoá (2, 3) ✓' }, 't-good', 'font-size="14" font-weight="700"');
      if (mode === 'impostor') s += T(X(0.4), Y(17), { en: 'every pair → wrong key, hash ✗', vi: 'mọi cặp → sai khoá, hash ✗' }, 't-bad', 'font-size="14" font-weight="700"');
      if (mode === 'attacker') s += T(X(0.4), Y(17), { en: '7 identical-looking points — which lie on p?', vi: '7 điểm trông như nhau — điểm nào nằm trên p?' }, 't-ink2', 'font-size="14" font-weight="700"');
      s += `</svg>`;
      $('.plot', el).innerHTML = s;
      $$('.seg button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
      $$('.v-note', el).forEach((n) => { n.hidden = n.dataset.m !== mode; });
    }
    $('.seg', el).addEventListener('click', (e) => {
      const b = e.target.closest('button[data-m]');
      if (!b) return;
      draw(b.dataset.m);
      b.blur();
    });
    draw('truth');
  }

  /* ---------------- generic horizontal bars ---------------- */
  function hbars(el, rows, opt) {
    const W = opt.w || 560, lw = opt.lw || 210, bw = W - lw - 90, rh = opt.rh || 44;
    const H = rows.length * rh + 40;
    const X = (v) => lw + (v / opt.max) * bw;
    let s = `<svg viewBox="0 0 ${W} ${H}">`;
    (opt.ticks || []).forEach((t) => {
      s += `<line x1="${X(t)}" x2="${X(t)}" y1="8" y2="${H - 30}" class="grid"/>` + T(X(t), H - 14, opt.tickFmt ? opt.tickFmt(t) : String(t), 't-muted', 'font-size="11.5" text-anchor="middle"');
    });
    rows.forEach((r, i) => {
      const y = 14 + i * rh;
      s += T(lw - 12, y + rh / 2 - 2, r.n, '', 'font-size="13.5" font-weight="600" text-anchor="end"');
      if (r.sub) s += T(lw - 12, y + rh / 2 + 13, r.sub, 't-muted', 'font-size="11.5" text-anchor="end"');
      const w = Math.max(2.5, X(r.v) - lw);
      s += `<rect x="${lw}" y="${y + 6}" width="${w.toFixed(1)}" height="${rh - 18}" rx="5" style="fill:${r.c}"/>`;
      s += T(lw + w + 8, y + rh / 2 + 3, r.label, 't-mono', 'font-size="13" font-weight="700"');
    });
    if (opt.line) {
      const x = X(opt.line.v);
      s += `<line x1="${x}" x2="${x}" y1="4" y2="${H - 30}" style="stroke:var(--ink);stroke-width:1.6;stroke-dasharray:5 4"/>`;
      s += T(x + 5, 12, opt.line.label, 't-ink2', 'font-size="11.5" font-weight="700"');
    }
    s += `</svg>`;
    el.innerHTML = s;
  }

  function results() {
    const eer = $('#fig-eer');
    if (eer) {
      hbars(eer, [
        { n: { en: 'Unprotected', vi: 'Không bảo vệ' }, sub: { en: 'cosine · τ = 0.49', vi: 'cosine · τ = 0,49' }, v: 0.70, c: 'var(--ink-2)', label: { en: '0.70%', vi: '0,70%' } },
        { n: { en: 'BioHashing · secret key', vi: 'BioHashing · khoá bí mật' }, sub: { en: 'bit agreement · τ = 0.59', vi: 'tỉ lệ bit trùng · τ = 0,59' }, v: 0.11, c: 'var(--good)', label: { en: '0.11%', vi: '0,11%' } },
        { n: { en: 'BioHashing · stolen key', vi: 'BioHashing · lộ khoá' }, sub: { en: 'bit agreement · τ = 0.64', vi: 'tỉ lệ bit trùng · τ = 0,64' }, v: 0.97, c: 'var(--bad)', label: { en: '0.97%', vi: '0,97%' } }
      ], { max: 1.0, ticks: [0, 0.25, 0.5, 0.75, 1.0], tickFmt: (t) => ({ en: t.toFixed(2) + '%', vi: t.toFixed(2).replace('.', ',') + '%' }), lw: 220, w: 560, rh: 50 });
    }
    const rev = $('#fig-revoke');
    if (rev) {
      hbars(rev, [
        { n: { en: 'Owner, new key vs new template', vi: 'Chủ nhân, khoá mới vs template mới' }, v: 0.72, c: 'var(--good)', label: { en: '0.72 ✓ accept', vi: '0,72 ✓ chấp nhận' } },
        { n: { en: 'Old (leaked) template vs new', vi: 'Template cũ (bị lộ) vs mới' }, v: 0.54, c: 'var(--bad)', label: { en: '0.54 ✗ reject', vi: '0,54 ✗ từ chối' } },
        { n: { en: 'Attacker, old key vs new', vi: 'Kẻ tấn công, khoá cũ vs mới' }, v: 0.51, c: 'var(--bad)', label: { en: '0.51 ✗ reject', vi: '0,51 ✗ từ chối' } }
      ], { max: 1.0, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1.0], tickFmt: (t) => ({ en: t.toFixed(1), vi: t.toFixed(1).replace('.', ',') }), lw: 232, w: 600, rh: 44, line: { v: 0.59, label: { en: 'threshold 0.59', vi: 'ngưỡng 0,59' } } });
    }
    const cost = $('#fig-cost');
    if (cost) {
      let s = `<svg viewBox="0 0 560 214">`;
      const groups = [
        { t: { en: 'Matching time (1 pair)', vi: 'Thời gian so khớp (1 cặp)' }, a: 0.113, b: 16.3, la: { en: '0.113 ms', vi: '0,113 ms' }, lb: { en: '16.3 ms', vi: '16,3 ms' }, r: '≈ ×144' },
        { t: { en: 'Template size', vi: 'Kích thước template' }, a: 2.0, b: 324, la: { en: '2.0 KB', vi: '2,0 KB' }, lb: '324 KB', r: '≈ ×160' }
      ];
      groups.forEach((g, i) => {
        const y = 12 + i * 104;
        const full = 330;
        s += T(0, y + 12, g.t, '', 'font-size="14" font-weight="700"');
        s += T(560, y + 12, g.r, 't-bad t-mono', 'font-size="15" font-weight="800" text-anchor="end"');
        s += T(0, y + 42, { en: 'plaintext', vi: 'dữ liệu rõ' }, 't-muted', 'font-size="12.5"');
        s += `<rect x="110" y="${y + 28}" width="${Math.max(3, (g.a / g.b) * full).toFixed(1)}" height="20" rx="4" style="fill:var(--ink-2)"/>`;
        s += T(122, y + 43, g.la, 't-mono', 'font-size="12.5" font-weight="700"');
        s += T(0, y + 76, 'CKKS', 't-muted', 'font-size="12.5"');
        s += `<rect x="110" y="${y + 62}" width="${full}" height="20" rx="4" style="fill:var(--fig-4)"/>`;
        s += T(110 + full + 8, y + 77, g.lb, 't-mono', 'font-size="12.5" font-weight="700"');
      });
      s += `</svg>`;
      cost.innerHTML = s;
    }
  }

  /* ---------------- quiz Q9 mini plot ---------------- */
  window.G3Fig = {
    vaultMini() {
      const pts = [[1, 4], [2, 9], [3, 10], [4, 13], [5, 16], [6, 2], [7, 5]];
      const sel = [1, 5, 6];
      const X = (x) => 22 + x * 30;
      const Y = (y) => 158 - y * 8.4;
      let s = `<svg viewBox="0 0 264 176"><line x1="22" x2="256" y1="158" y2="158" class="ax"/><line x1="22" x2="22" y1="10" y2="158" class="ax"/>`;
      for (let x = 1; x <= 7; x++) s += T(X(x), 172, String(x), 't-muted', 'font-size="10" text-anchor="middle"');
      s += `<line x1="${X(0.2)}" y1="${Y(3 * 0.2 + 1)}" x2="${X(5.3)}" y2="${Y(3 * 5.3 + 1)}" class="ln-good" style="stroke-width:2.4"/>`;
      pts.forEach(([x, y]) => {
        const on = y === 3 * x + 1;
        const picked = sel.includes(x);
        if (picked) s += `<circle cx="${X(x)}" cy="${Y(y)}" r="9" style="fill:none;stroke:${on ? 'var(--good)' : 'var(--bad)'};stroke-width:2"/>`;
        s += `<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" style="fill:${on ? 'var(--fig-3)' : 'var(--fig-2)'}"/>`;
        if (picked) s += T(X(x) + 12, Y(y) + 4, `(${x}, ${y})`, 't-mono t-ink2', 'font-size="10.5" font-weight="600"');
      });
      s += T(X(0.4), 26, '3x + 1 ✓', 't-good t-mono', 'font-size="12" font-weight="700"');
      s += `</svg>`;
      return s;
    }
  };

  function init() {
    titleArt();
    minutiae();
    hashDemo();
    farfrr();
    worked();
    garPlot();
    unlink();
    cartesian();
    polar();
    functional();
    vault();
    results();
  }
  init();
})();
