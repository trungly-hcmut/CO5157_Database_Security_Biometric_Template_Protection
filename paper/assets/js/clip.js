/* Demo clip: replays the recorded feap run (window.DEMO_CAST, written by
   feap-demo/scripts/record_demo.py) as a terminal "video" with chapters and EN/VI captions.
   Every frame is a pure function of the clip time t, so playing, seeking, printing
   (last frame) and frame-by-frame MP4 capture all go through the same render(t). */
(function () {
  'use strict';
  const CAST = window.DEMO_CAST;
  const host = document.querySelector('.clip');
  if (!CAST || !host) return;

  /* ---------- timing (seconds of clip time) ---------- */
  const CPS = 64;                 // typing speed
  const ENTER = 0.35;             // after typing, before the command starts
  const KEEP = 1.0, SQUEEZE = 4;  // silent waits longer than KEEP play SQUEEZE× faster (badge shown)
  const STEP_GAP = 0.55;          // between two commands of one chapter
  const LEAD = 1.4;               // caption alone before a chapter's first command
  const OUTRO = 8;
  const INTRO = 3.5;              // title card, only in capture mode (t < 0)

  const q = new URLSearchParams(location.search);
  const capture = q.has('capture');
  if (capture) document.documentElement.classList.add('capture');

  /* ---------- values read from the recording ---------- */
  const steps = CAST.steps.map((s) => Object.assign({}, s));
  const text = (scene) => steps.filter((s) => s.scene === scene).flatMap((s) => s.out.map((e) => e[2])).join('\n');
  const stepOf = (scene, i = 0) => steps.filter((s) => s.scene === scene)[i];
  const num = (re, s) => { const m = s.match(re); return m ? +m[1] : NaN; };
  const V = {
    eyes: num(/^\s*(\d+)/, text('data')),
    helper: num(/^\s*(\d{6,})\s*$/m, text('gen')) / 1e6,
    tGen: stepOf('gen').dur,
    keyGen: (text('gen').match(/^([0-9a-f]{64})$/m) || [])[1],
    keyRep: (text('same').match(/Reproduced Key: ([0-9a-f]+)/) || [])[1],
    tSame: stepOf('same').dur,
    tOther: stepOf('other').dur,
    sameIn: (text('multi').match(/\[Rep\] same eye.*Key =/g) || []).length,
    sameAll: (text('multi').match(/\[Rep\] same eye/g) || []).length,
    multiOk: /Key matches/.test(text('multi')),
    ent1k: num(/Minimum Entropy: ([\d.]+)/, stepOf('ent', 0).out.map((e) => e[2]).join('\n')),
    ent200k: num(/Minimum Entropy: ([\d.]+)/, stepOf('ent', 1).out.map((e) => e[2]).join('\n')),
    tar: (text('tar').match(/TAR\): ([\d.]+)/) || [])[1] || '?',
    tarOk: num(/Successful Classes: (\d+)/, text('tar')),
    tarAll: num(/Total Classes: (\d+)/, text('tar')),
  };
  V.sameKey = !!V.keyGen && V.keyGen === V.keyRep;

  // numbers: EN "6.4", VI "6,4"
  const f = (x, d) => ({ en: x.toFixed(d), vi: x.toFixed(d).replace('.', ',') });
  const bi = (en, vi) => `<span class="en">${en}</span><span class="vi">${vi}</span>`;
  const secs = (d) => f(d, d < 1 ? 3 : 2);
  const fmtDur = (d) => (d < 1 ? d.toFixed(3) : d.toFixed(2)) + ' s';

  /* ---------- chapters ---------- */
  const SCENES = [
    { id: 'data', t: bi('The data', 'Dữ liệu'),
      cap: bi(`The authors' synthetic test set: ${V.eyes} eyes × 5 readings. Each reading <i>w</i> is a 512-bit iris code — what Block A outputs.`,
              `Tập test tổng hợp của tác giả: ${V.eyes} mắt × 5 ảnh. Mỗi ảnh <i>w</i> là một mã iris 512 bit — đúng dạng đầu ra của Block A.`),
      res: bi(`<i>w</i> ∈ {0,1}<sup>512</sup> · ${V.eyes} × 5`, `<i>w</i> ∈ {0,1}<sup>512</sup> · ${V.eyes} × 5`), hold: 2.6 },
    { id: 'gen', t: bi('Gen — enrol', 'Gen — đăng ký'),
      cap: bi('Enrol reading 1 of eye 70001: each of the paper\'s 200,000 published subsets (<i>k</i> = 115 bits) locks the key with HMAC-SHA256. The lockers are the helper data.',
              'Đăng ký ảnh 1 của mắt 70001: mỗi tập con trong 200.000 tập con công bố của paper (<i>k</i> = 115 bit) khoá key bằng HMAC-SHA256. Các locker chính là helper data.'),
      res: bi(`Helper data ${f(V.helper, 1).en} MB · ${secs(V.tGen).en} s`, `Helper data ${f(V.helper, 1).vi} MB · ${secs(V.tGen).vi} s`), hold: 2.8 },
    { id: 'same', t: bi('Rep — same eye', 'Rep — cùng mắt'),
      cap: bi('Reading 3 of the same eye (3.3 % of bits differ): the second locker already opens and gives back exactly the enrolled key.',
              'Ảnh 3 của cùng mắt (lệch 3,3% số bit): ngay locker thứ hai đã mở và trả về đúng key đã đăng ký.'),
      res: V.sameKey ? bi(`✓ Same key · ${secs(V.tSame).en} s`, `✓ Đúng key · ${secs(V.tSame).vi} s`) : bi('✗ Key differs', '✗ Key khác'),
      ok: V.sameKey, hold: 3.6 },
    { id: 'other', t: bi('Rep — another eye', 'Rep — mắt khác'),
      cap: bi('Eye 70002 differs in about half of the bits: all 200,000 lockers are tried and none opens → ⊥ (reject).',
              'Mắt 70002 lệch khoảng một nửa số bit: thử hết 200.000 locker, không cái nào mở → ⊥ (từ chối).'),
      res: bi(`⊥ Rejected · ${secs(V.tOther).en} s`, `⊥ Từ chối · ${secs(V.tOther).vi} s`), bad: true, hold: 3.2 },
    { id: 'multi', t: bi('Noisy readings → several readings', 'Ảnh nhiễu → dùng nhiều ảnh'),
      cap: bi('Our Python version of Fig. 1: readings 2, 4, 5 of the same eye (11–16 % off) open no locker — false rejects, which is why 1-reading TAR is only ≈ 0.7. Enrolling 3 readings, like ClearEyes-M, lets reading 4 in.',
              'Bản Python đúng Fig. 1 của nhóm: ảnh 2, 4, 5 của cùng mắt (lệch 11–16%) không mở được locker nào — từ chối nhầm, nên TAR 1 ảnh chỉ ≈ 0,7. Đăng ký 3 ảnh như ClearEyes-M thì ảnh 4 được nhận.'),
      res: bi(`1 reading: ${V.sameIn} of ${V.sameAll} in → 3 readings: ${V.multiOk ? '✓' : '⊥'}`, `1 ảnh: ${V.sameIn}/${V.sameAll} được nhận → 3 ảnh: ${V.multiOk ? '✓' : '⊥'}`), hold: 5.5 },
    { id: 'ent', t: bi('Attacker side — EntTest', 'Phía kẻ tấn công — EntTest'),
      cap: bi('How hard is it to guess the bits of a locker? Min-entropy of the published subsets, measured on other eyes: the first 1,000 subsets live, all 200,000 run beforehand (≈ 4 min).',
              'Đoán đúng các bit của một locker khó cỡ nào? Min-entropy của các tập con công bố, đo trên mắt khác: 1.000 tập con đầu chạy trực tiếp, đủ 200.000 tập con chạy trước (≈ 4 phút).'),
      res: bi(`Min-entropy ${f(V.ent200k, 1).en} bit · paper 105`, `Min-entropy ${f(V.ent200k, 1).vi} bit · paper 105`), hold: 4.2 },
    { id: 'tar', t: bi('Honest side — TAR', 'Phía người dùng thật — TAR'),
      cap: bi(`And do real users get in? ClearEyes-M setting — 3 readings to enrol, 2 tries to log in — over all ${V.tarAll} eyes.`,
              `Còn người dùng thật có vào được không? Cấu hình ClearEyes-M — 3 ảnh đăng ký, 2 lần thử đăng nhập — trên cả ${V.tarAll} mắt.`),
      res: bi(`TAR ${V.tar} · ${V.tarOk} / ${V.tarAll} eyes`, `TAR ${V.tar.replace('.', ',')} · ${V.tarOk} / ${V.tarAll} mắt`), ok: true, hold: 4.2 },
  ];

  /* ---------- timeline ---------- */
  let t = 0;
  SCENES.forEach((sc) => {
    sc.t0 = t;
    t += LEAD;
    const own = steps.filter((s) => s.scene === sc.id);
    own.forEach((st, j) => {
      st.tType = t;
      t += st.cmd.length / CPS;
      st.tRun = t + ENTER;
      // map real output times to clip times; squeezed spans are kept for the ⏩ badge
      st.segs = [];
      let real = 0, clip = st.tRun;
      const advance = (to) => {
        const gap = to - real;
        if (gap <= KEEP) { st.segs.push([clip, real, 1]); clip += gap; }
        else {
          st.segs.push([clip, real, 1]); clip += KEEP;
          st.segs.push([clip, real + KEEP, SQUEEZE]); clip += (gap - KEEP) / SQUEEZE;
        }
        real = to;
      };
      st.ev = st.out.map(([rt, op, s]) => { advance(rt); return [clip, op, s]; });
      advance(st.dur);
      st.tEnd = clip;
      t = clip + (j < own.length - 1 ? STEP_GAP : 0);
    });
    sc.tRes = t + 0.25;
    t += sc.hold;
    sc.t1 = t;
  });
  const T_OUT = t;
  const TOTAL = t + OUTRO;

  /* ---------- terminal text ---------- */
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function paint(s) {
    let h = esc(s);
    h = h.replace(/\b([0-9a-f]{32}|[0-9a-f]{64})\b/g, (m) => `<span class="t-key${V.keyGen && m === V.keyGen ? ' t-same' : ''}">${m}</span>`);
    h = h.replace(/(OK \(Match found at locker \d+\)|Key matches|\(matches\))/g, '<span class="t-ok">$1</span>');
    h = h.replace(/(Verification failed - no match found|⊥ \(no locker opened[^)]*\))/g, '<span class="t-no">$1</span>');
    h = h.replace(/(Minimum Entropy: [\d.]+|True Accept Rate \(TAR\): [\d.]+)/g, '<span class="t-hi">$1</span>');
    return h;
  }
  function paintCmd(s) {
    const i = s.indexOf('#');
    const code = i < 0 ? s : s.slice(0, i), cm = i < 0 ? '' : s.slice(i);
    return esc(code).replace(/^(\s*)([\w.-]+)/, '$1<span class="t-cmd">$2</span>') + (cm ? `<span class="t-cm">${esc(cm)}</span>` : '');
  }
  const PROMPT = '<span class="t-ps">feap-demo</span> <span class="t-pp">%</span> ';
  const realAt = (st, tt) => {
    let r = 0, rate = 1;
    for (const [c0, r0, k] of st.segs) { if (tt >= c0) { r = r0 + (tt - c0) * k; rate = k; } }
    return { r: Math.min(r, st.dur), rate };
  };

  function termLines(tt) {
    const lines = [];
    let open = false, status = null;
    for (const st of steps) {
      if (tt < st.tType) break;
      const n = Math.min(st.cmd.length, Math.floor((tt - st.tType) * CPS));
      const typed = st.cmd.slice(0, n).split('\n');
      typed.forEach((ln, i) => {
        let h = (i === 0 ? PROMPT : '') + paintCmd(ln);
        if (i === 0 && tt >= st.tEnd) h += `<span class="t-dur">${fmtDur(st.dur)}</span>`;
        lines.push(h);
      });
      if (tt < st.tRun) { lines[lines.length - 1] += '<span class="t-cur"></span>'; return { lines, status }; }
      open = false;
      for (const [ct, op, s] of st.ev) {
        if (ct > tt) break;
        if (op === 'n' || !open) lines.push(paint(s));
        else if (op === 'r') lines[lines.length - 1] = paint(s);
        else lines[lines.length - 1] += paint(s);
        open = true;
      }
      if (tt < st.tEnd) {
        const { r, rate } = realAt(st, tt);
        status = { r, fast: rate > 1 };
        return { lines, status };
      }
    }
    lines.push(PROMPT + '<span class="t-cur"></span>');
    return { lines, status };
  }

  /* ---------- DOM ---------- */
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  host.innerHTML = `
    <div class="clip-term term">
      <div class="term-bar"><i></i><i></i><i></i><span>zsh — feap-demo — ${bi('recorded', 'ghi lại')} ${CAST.recorded.slice(0, 10)} · ${esc(CAST.machine)}</span>
        <em class="clip-run"></em></div>
      <div class="clip-screen"><div class="clip-lines"></div></div>
      <div class="clip-intro"><div>
        <div class="ci-k">${bi('Demo · re-run of the authors\' code', 'Demo · chạy lại code của tác giả')}</div>
        <div class="ci-h">Fuzzy Extractors are Practical</div>
        <div class="ci-s">${bi('Shukla et al., ACM CCS ’25 · feap on synthetic iris codes', 'Shukla et al., ACM CCS ’25 · feap trên mã iris tổng hợp')}</div>
        <div class="ci-f">${bi('Real output and real timings, recorded', 'Output và thời gian chạy thật, ghi lại ngày')} ${CAST.recorded.slice(0, 10)}</div>
      </div></div>
      <div class="clip-outro"><div>
        <div class="ci-k">${bi('What the run showed', 'Kết quả của lần chạy')}</div>
        <ul>
          <li class="o-ok">${bi(`Same eye → <b>same key</b> (Rep ${secs(V.tSame).en} s)`, `Cùng mắt → <b>đúng key</b> (Rep ${secs(V.tSame).vi} s)`)}</li>
          <li class="o-no">${bi(`Another eye → <b>⊥</b> after all 200,000 lockers (${secs(V.tOther).en} s)`, `Mắt khác → <b>⊥</b> sau khi thử hết 200.000 locker (${secs(V.tOther).vi} s)`)}</li>
          <li class="o-hi">${bi(`Min-entropy <b>${f(V.ent200k, 1).en} bit</b> on other eyes — paper: 105`, `Min-entropy <b>${f(V.ent200k, 1).vi} bit</b> trên mắt khác — paper: 105`)}</li>
          <li class="o-ok">${bi(`TAR <b>${V.tar}</b> with 3 + 2 readings — paper: 0.92 on IITD (synthetic data is cleaner)`, `TAR <b>${V.tar.replace('.', ',')}</b> với 3 + 2 ảnh — paper: 0,92 trên IITD (dữ liệu tổng hợp sạch hơn)`)}</li>
        </ul>
      </div></div>
      <button class="clip-big" type="button" aria-label="Play">
        <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>
        <span>${bi('Play the recorded run', 'Phát lại lần chạy')} · ${mmss(TOTAL)}</span>
      </button>
    </div>
    <div class="clip-cap">
      <div class="cc-l"><div class="cc-k"></div><div class="cc-t"></div></div>
      <div class="cc-r"></div>
    </div>
    <div class="clip-ctl">
      <button type="button" class="cb cb-play" aria-label="Play / pause (K)" title="Play / pause (K)"><svg viewBox="0 0 24 24"><path class="i-play" d="M8 5.5v13l11-6.5z"/><path class="i-pause" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg></button>
      <button type="button" class="cb cb-again" aria-label="Restart" title="Restart"><svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4v4h4"/></svg></button>
      <div class="cb-bar">${SCENES.map((sc, i) => `<button type="button" class="seg" data-i="${i}" style="flex-grow:${(sc.t1 - sc.t0).toFixed(2)}" title="${i + 1}"><i></i><b>${i + 1}</b></button>`).join('')}</div>
      <span class="cb-time">0:00 / ${mmss(TOTAL)}</span>
      <button type="button" class="cb cb-speed" title="Speed">1×</button>
    </div>`;

  const $ = (s) => host.querySelector(s);
  const elLines = $('.clip-lines'), elRun = $('.clip-run'), elK = $('.cc-k'), elT = $('.cc-t'), elR = $('.cc-r');
  const elTime = $('.cb-time'), segs = [...host.querySelectorAll('.seg')];

  let last = { lines: '', run: '', sc: -2, res: null, outro: null };
  function render(tt) {
    host.classList.toggle('is-intro', tt < 0);
    const outro = tt >= T_OUT;
    if (outro !== last.outro) { host.classList.toggle('is-outro', outro); last.outro = outro; }
    const { lines, status } = termLines(Math.max(0, tt));
    const html = lines.slice(-60).map((l) => `<div>${l || ' '}</div>`).join('');
    if (html !== last.lines) { elLines.innerHTML = html; last.lines = html; }
    const run = status ? `<span class="spin"></span>${bi('running', 'đang chạy')} ${status.r.toFixed(1)} s${status.fast ? ` <b>⏩ ×${SQUEEZE}</b>` : ''}` : '';
    if (run !== last.run) { elRun.innerHTML = run; last.run = run; }

    let si = -1;
    SCENES.forEach((sc, i) => { if (tt >= sc.t0) si = i; });
    if (outro) si = SCENES.length;
    if (si !== last.sc) {
      last.sc = si;
      if (si < 0) { elK.innerHTML = ''; elT.innerHTML = ''; }
      else if (si === SCENES.length) {
        elK.innerHTML = bi('Summary', 'Tóm tắt');
        elT.innerHTML = bi(`Real output of the authors' code (feap) and our Fig. 1 script, recorded ${CAST.recorded.slice(0, 10)} on ${esc(CAST.machine)}. Waits longer than 1 s are shown ${SQUEEZE}× faster (⏩); the timer shows real seconds.`,
                           `Output thật của code tác giả (feap) và script Fig. 1 của nhóm, ghi ngày ${CAST.recorded.slice(0, 10)} trên ${esc(CAST.machine)}. Đoạn chờ dài hơn 1 s được tua nhanh ×${SQUEEZE} (⏩); bộ đếm vẫn hiện số giây thật.`);
      } else {
        const sc = SCENES[si];
        elK.innerHTML = `<b>${si + 1}/${SCENES.length}</b> ${sc.t}`;
        elT.innerHTML = sc.cap;
      }
    }
    const res = si >= 0 && si < SCENES.length && tt >= SCENES[si].tRes ? si : -1;
    if (res !== last.res) {
      last.res = res;
      elR.className = 'cc-r' + (res >= 0 ? ' on' + (SCENES[res].bad ? ' bad' : SCENES[res].ok ? ' ok' : '') : '');
      if (res >= 0) elR.innerHTML = SCENES[res].res;
    }
    segs.forEach((s, i) => {
      const sc = SCENES[i];
      const p = Math.max(0, Math.min(1, (tt - sc.t0) / (sc.t1 - sc.t0)));
      s.firstChild.style.width = (p * 100).toFixed(1) + '%';
      s.classList.toggle('cur', i === si);
    });
    elTime.textContent = `${mmss(Math.max(0, Math.min(tt, TOTAL)))} / ${mmss(TOTAL)}`;
  }

  /* ---------- playback ---------- */
  const SPEEDS = [1, 1.5, 2];
  let cur = 0, playing = false, speed = 1, raf = 0, prevTs = 0;
  function frame(ts) {
    if (!playing) return;
    cur += ((ts - prevTs) / 1000) * speed;
    prevTs = ts;
    if (cur >= TOTAL) { cur = TOTAL; pause(); }
    render(cur);
    if (playing) raf = requestAnimationFrame(frame);
  }
  function play() {
    if (playing) return;
    if (cur >= TOTAL) cur = 0;
    playing = true; host.classList.add('playing', 'started');
    prevTs = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pause() { playing = false; cancelAnimationFrame(raf); host.classList.remove('playing'); }
  const toggle = () => (playing ? pause() : play());
  function seek(tt) { cur = Math.max(capture ? -INTRO : 0, Math.min(TOTAL, tt)); host.classList.add('started'); render(cur); }

  $('.clip-big').addEventListener('click', play);
  $('.cb-play').addEventListener('click', toggle);
  $('.cb-again').addEventListener('click', () => { seek(0); play(); });
  $('.clip-screen').addEventListener('click', toggle);
  $('.cb-speed').addEventListener('click', (e) => {
    speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    e.currentTarget.textContent = speed + '×';
  });
  segs.forEach((s, i) => s.addEventListener('click', (e) => {
    const sc = SCENES[i], box = s.getBoundingClientRect();
    seek(sc.t0 + ((e.clientX - box.left) / box.width) * (sc.t1 - sc.t0));
  }));
  document.addEventListener('slide:enter', (e) => { if (!e.detail.slide.contains(host)) pause(); });

  // PDF export (?reveal) and print show the last frame
  if (q.has('reveal')) { host.classList.add('started'); cur = TOTAL; }
  window.addEventListener('beforeprint', () => { pause(); host.classList.add('started'); render(TOTAL); });
  render(cur);

  window.DemoClip = { toggle, play, pause, seek, total: TOTAL, intro: INTRO, owns: (slide) => slide.contains(host) };
})();
