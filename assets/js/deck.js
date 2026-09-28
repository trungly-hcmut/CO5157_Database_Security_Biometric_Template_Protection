/* =========================================================
   G3 · Biometric Template Protection — deck engine
   Navigation, language (EN/VI), theme, TOC, scroll view.
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const params = new URLSearchParams(location.search);

  const store = {
    get(k) { try { return localStorage.getItem('g3btp:' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('g3btp:' + k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- section labels shown at the top of each slide ---------- */
  const SECTIONS = {
    '1.1': { en: 'Biometric systems & templates', vi: 'Hệ sinh trắc & mẫu sinh trắc' },
    '1.2': { en: 'When a template leaks', vi: 'Khi template bị lộ' },
    '1.3': { en: 'Why hashing & encryption fall short', vi: 'Vì sao băm & mã hoá thường không đủ' },
    '1.4': { en: 'Why it matters', vi: 'Tại sao vấn đề quan trọng' },
    '2.1': { en: 'Evaluating biometric systems', vi: 'Đánh giá hệ thống sinh trắc' },
    '2.2': { en: 'Four requirements · ISO/IEC 24745', vi: 'Bốn yêu cầu · ISO/IEC 24745' },
    '2.3': { en: 'Threat model', vi: 'Mô hình mối đe doạ' },
    '3.0': { en: 'Overview of approaches', vi: 'Tổng quan các hướng tiếp cận' },
    '3.1': { en: 'Feature transformation', vi: 'Biến đổi đặc trưng' },
    '3.2': { en: 'Biometric cryptosystems', vi: 'Hệ mật sinh trắc' },
    '3.3': { en: 'Homomorphic encryption', vi: 'Mã hoá đồng hình' },
    '3.4': { en: 'Comparison & choice', vi: 'So sánh & lựa chọn' },
    '3.5': { en: 'Other directions', vi: 'Các hướng khác' },
    '4.1': { en: 'Experimental setup', vi: 'Thiết lập thực nghiệm' },
    '4.2': { en: 'Accuracy results', vi: 'Kết quả độ chính xác' },
    '4.3': { en: 'Revocability & unlinkability', vi: 'Thu hồi & không liên kết' },
    '4.4': { en: 'Matching on ciphertexts', vi: 'So khớp trên bản mã' },
    '4.5': { en: 'Discussion & limitations', vi: 'Thảo luận & giới hạn' },
    '4.6': { en: 'Conclusion', vi: 'Kết luận' },
    '4.7': { en: 'Review questions', vi: 'Câu hỏi ôn tập' },
    'ref': { en: 'References', vi: 'Tài liệu tham khảo' },
    'agenda': { en: 'Agenda', vi: 'Nội dung' }
  };

  const CHAPTERS = {
    '0': { en: 'Introduction', vi: 'Mở đầu' },
    '1': { en: '1 · Problem statement', vi: '1 · Đặt vấn đề' },
    '2': { en: '2 · Theory & technology base', vi: '2 · Nền tảng lý thuyết' },
    '3': { en: '3 · How to solve it', vi: '3 · Các giải pháp' },
    '4': { en: '4 · Experiment & conclusion', vi: '4 · Thực nghiệm & tổng kết' },
    'e': { en: 'Wrap-up', vi: 'Kết thúc' },
    'q': { en: 'Quiz', vi: 'Quiz' }
  };
  const CH_COLOR = { '1': '--c1', '2': '--c2', '3': '--c3', '4': '--c4', 'q': '--cq' };

  const L = (o) => (typeof o === 'string' ? o : `<span class="en">${o.en}</span><span class="vi">${o.vi}</span>`);

  let slides = [];
  let idx = 0;
  let docMode = false;
  const stage = $('#stage');
  const viewport = $('#viewport');

  /* ---------- language ---------- */
  function setLang(l) {
    if (l !== 'en' && l !== 'vi') l = 'en';
    root.lang = l;
    store.set('lang', l);
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    document.title = l === 'vi'
      ? 'Bảo vệ mẫu sinh trắc học · Nhóm 3'
      : 'Biometric Template Protection · Group 3';
    document.dispatchEvent(new CustomEvent('lang:change', { detail: l }));
  }
  const toggleLang = () => setLang(root.lang === 'en' ? 'vi' : 'en');

  /* ---------- theme ---------- */
  function currentTheme() {
    return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function setTheme(t) {
    root.dataset.theme = t;
    store.set('theme', t);
  }
  const toggleTheme = () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark');

  /* ---------- slide headers ---------- */
  function buildHeaders() {
    slides.forEach((s) => {
      const key = s.dataset.sec;
      if (!key || !SECTIONS[key] || s.querySelector('.s-top')) return;
      const sec = SECTIONS[key];
      const num = /^\d/.test(key) ? `<b>${key}</b>` : '';
      const head = document.createElement('div');
      head.className = 's-top';
      head.innerHTML = `<div class="sec">${num}${L(sec)}</div>`;
      s.insertBefore(head, s.firstChild);
    });
  }

  /* ---------- TOC ---------- */
  function slideTitle(s) {
    if (s.dataset.tocEn) return L({ en: s.dataset.tocEn, vi: s.dataset.tocVi || s.dataset.tocEn });
    const h = s.querySelector('h2, h1');
    return h ? h.innerHTML.replace(/<br\s*\/?>/gi, ' ') : '—';
  }
  function buildToc() {
    const nav = $('#toc nav');
    let html = '';
    let last = null;
    slides.forEach((s, i) => {
      const ch = s.dataset.ch || '0';
      if (ch !== last) { html += `<h4>${L(CHAPTERS[ch] || CHAPTERS['0'])}</h4>`; last = ch; }
      html += `<a href="#/${i + 1}" data-i="${i}"><span class="i">${i + 1}</span><span>${slideTitle(s)}</span></a>`;
    });
    nav.innerHTML = html;
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-i]');
      if (!a) return;
      e.preventDefault();
      toggleToc(false);
      go(+a.dataset.i);
    });
  }
  function toggleToc(force) {
    const t = $('#toc');
    const open = typeof force === 'boolean' ? force : !t.classList.contains('open');
    t.classList.toggle('open', open);
    $('#scrim').classList.toggle('show', open);
    if (open) {
      const cur = t.querySelector('a.cur');
      if (cur) cur.scrollIntoView({ block: 'center' });
    }
  }

  /* ---------- navigation ---------- */
  function updateChrome() {
    $('#counter').textContent = `${idx + 1} / ${slides.length}`;
    const s = slides[idx];
    const bar = $('#progress i');
    bar.style.width = `${((idx + 1) / slides.length) * 100}%`;
    const c = CH_COLOR[s.dataset.ch];
    bar.style.setProperty('--prog', c ? `var(${c})` : 'var(--accent)');
    $$('#toc a').forEach((a) => a.classList.toggle('cur', +a.dataset.i === idx));
  }

  function go(n, opts = {}) {
    n = Math.max(0, Math.min(slides.length - 1, n | 0));
    if (docMode) {
      idx = n;
      updateChrome();
      if (!opts.silent) slides[n].scrollIntoView({ behavior: opts.instant ? 'auto' : 'smooth', block: 'start' });
      if (!opts.fromHash) history.replaceState(null, '', '#/' + (n + 1));
      return;
    }
    const prevIdx = idx;
    slides.forEach((s, i) => {
      const on = i === n;
      s.classList.toggle('active', on);
      s.classList.toggle('past', i < n);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.inert = !on;
    });
    idx = n;
    updateChrome();
    if (!opts.fromHash) history.replaceState(null, '', '#/' + (n + 1));
    if (prevIdx !== n || opts.force) {
      document.dispatchEvent(new CustomEvent('slide:enter', { detail: { slide: slides[n], index: n } }));
    }
  }

  function next() {
    const s = slides[idx];
    if (window.Quiz && s.classList.contains('quiz-q') && !s.classList.contains('revealed')) {
      window.Quiz.reveal(s);
      return;
    }
    go(idx + 1);
  }
  const prev = () => go(idx - 1);

  function fromHash() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (!h) return 0;
    if (/^\d+$/.test(h)) return Math.max(0, +h - 1);
    const el = document.getElementById(h);
    const i = el ? slides.indexOf(el.closest('.slide')) : -1;
    return i >= 0 ? i : 0;
  }

  /* ---------- scaling & modes ---------- */
  function fit() {
    if (docMode) return;
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.setProperty('--scale', s.toFixed(4));
  }

  const mq = matchMedia('screen and (max-width: 860px)');
  function applyMode(keep) {
    const pref = store.get('mode');
    const wantDoc = pref ? pref === 'doc' : mq.matches;
    if (wantDoc === docMode && !keep) return;
    const cur = idx;
    docMode = wantDoc;
    root.classList.toggle('doc-mode', docMode);
    slides.forEach((s) => { s.inert = false; s.setAttribute('aria-hidden', 'false'); });
    $$('.tb-mode').forEach((b) => b.setAttribute('aria-pressed', String(docMode)));
    if (docMode) {
      requestAnimationFrame(() => go(cur, { instant: true }));
    } else {
      fit();
      go(cur, { force: true });
    }
  }
  function toggleMode() {
    store.set('mode', docMode ? 'slides' : 'doc');
    applyMode();
  }

  // in scroll view, keep the counter in sync with the slide on screen
  let scrollTick = null;
  window.addEventListener('scroll', () => {
    if (!docMode || scrollTick) return;
    scrollTick = requestAnimationFrame(() => {
      scrollTick = null;
      const mid = window.innerHeight * 0.35;
      let best = 0;
      slides.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) best = i; });
      if (best !== idx) {
        idx = best;
        updateChrome();
        document.dispatchEvent(new CustomEvent('slide:enter', { detail: { slide: slides[idx], index: idx } }));
      }
    });
  }, { passive: true });

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  }

  /* ---------- input ---------- */
  function onKey(e) {
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const lk = k.length === 1 ? k.toLowerCase() : k;
    if (lk === 'l') { toggleLang(); return; }
    if (lk === 't') { toggleTheme(); return; }
    if (lk === 'm' || lk === 'o') { toggleToc(); return; }
    if (k === 'Escape') { toggleToc(false); return; }
    if (docMode) return;
    const s = slides[idx];
    if (window.Quiz && s.classList.contains('quiz-q')) {
      const map = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (lk in map) { window.Quiz.pick(s, map[lk]); return; }
      if (lk === 'r') { window.Quiz.reveal(s); return; }
    }
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'n': case 'N':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': case 'p': case 'P':
        e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(slides.length - 1); break;
      case 'f': case 'F': fullscreen(); break;
      default: break;
    }
  }

  function onClick(e) {
    const g = e.target.closest('[data-go]');
    if (g) {
      e.preventDefault();
      const v = g.dataset.go;
      if (v === 'next') next();
      else if (v === 'prev') prev();
      else if (v.startsWith('#')) {
        const el = document.getElementById(v.slice(1));
        if (el) go(slides.indexOf(el.closest('.slide')));
      } else go(+v - 1);
      g.blur();
      return;
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'lang') setLang(a.dataset.lang);
    else if (act === 'theme') toggleTheme();
    else if (act === 'toc') toggleToc();
    else if (act === 'full') fullscreen();
    else if (act === 'mode') toggleMode();
    else if (act === 'print') window.print();
    a.blur();
  }

  let tx = null;
  let ty = null;
  function onTouchStart(e) {
    if (docMode) return;
    const t = e.changedTouches[0];
    tx = t.clientX; ty = t.clientY;
  }
  function onTouchEnd(e) {
    if (docMode || tx === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx;
    const dy = t.clientY - ty;
    tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  }

  let idleTimer = null;
  function wake() {
    const tb = $('#toolbar');
    tb.classList.remove('idle');
    clearTimeout(idleTimer);
    if (!docMode) idleTimer = setTimeout(() => tb.classList.add('idle'), 2800);
  }

  /* ---------- overflow checker: add ?check to the URL ---------- */
  function checkOverflow() {
    const report = [];
    // decorative elements are allowed to bleed off the slide
    $$('.divider .big, .title-art').forEach((d) => { d.style.display = 'none'; });
    root.classList.add('no-anim');
    slides.forEach((s, i) => {
      const body = s.querySelector('.s-body, .q-body');
      const inner = body ? body.scrollHeight - body.clientHeight : 0;
      const over = Math.max(s.scrollHeight - s.clientHeight, inner);
      const overW = s.scrollWidth - s.clientWidth;
      if (over > 2 || overW > 2) {
        report.push(`#${i + 1} ${s.id || ''} +${over}px h (body +${inner}), +${overW}px w`);
        const f = document.createElement('div');
        f.className = 'overflow-flag';
        f.textContent = `OVERFLOW +${over}px`;
        s.appendChild(f);
      }
    });
    $$('.divider .big, .title-art').forEach((d) => { d.style.display = ''; });
    root.classList.remove('no-anim');
    const pre = document.createElement('pre');
    pre.id = 'check-report';
    pre.hidden = true;
    pre.textContent = report.length ? report.join('\n') : 'OK – no overflow';
    document.body.appendChild(pre);
    if (report.length) console.warn('[deck] overflowing slides:\n' + report.join('\n'));
  }

  /* ---------- init ---------- */
  function init() {
    slides = $$('.slide', stage);
    slides.forEach((s, i) => { if (!s.id) s.id = 's' + (i + 1); });
    // every table gets a horizontal-scroll wrapper for narrow screens
    $$('table.tbl', stage).forEach((t) => {
      if (t.closest('.tbl-wrap')) return;
      const w = document.createElement('div');
      w.className = 'tbl-wrap';
      t.replaceWith(w);
      w.appendChild(t);
    });

    const urlLang = params.get('lang');
    setLang(urlLang || store.get('lang') || 'en');
    const urlTheme = params.get('theme');
    const savedTheme = urlTheme || store.get('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;

    buildHeaders();
    buildToc();

    idx = fromHash();
    applyMode(true);
    fit();
    go(idx, { fromHash: true, force: true });

    window.addEventListener('resize', fit);
    mq.addEventListener('change', () => applyMode());
    window.addEventListener('hashchange', () => go(fromHash(), { fromHash: true }));
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('mousemove', wake, { passive: true });
    $('#scrim').addEventListener('click', () => toggleToc(false));
    wake();

    if (params.has('check')) {
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(checkOverflow, 300));
    }
    document.dispatchEvent(new CustomEvent('deck:ready'));
  }

  window.Deck = { go, next, prev, setLang, get index() { return idx; }, get slides() { return slides; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
