/* =========================================================
   G3 · Paper presentation — Question review (6 questions)
   Presenting: → / Space reveals the answer, → again moves on.
   A–D (or 1–4) picks an option, R reveals.
   ========================================================= */
(function () {
  'use strict';

  const L = (o) => (typeof o === 'string' ? o : `<span class="en">${o.en}</span><span class="vi">${o.vi}</span>`);
  const KIND = {
    calc: { en: 'Calculation', vi: 'Tính toán' },
    concept: { en: 'Concept', vi: 'Khái niệm' }
  };
  const LET = ['A', 'B', 'C', 'D'];

  const QUIZ = [
    {
      kind: 'calc', ch: '1.3', ans: 1,
      title: { en: 'Is there entropy left for a key?', vi: 'Còn entropy để sinh khoá không?' },
      q: {
        en: 'With <span class="data">ent = 250 bits</span> and <span class="data">err = 480 bits</span>, what is <b>FEQual</b>?',
        vi: 'Với <span class="data">ent = 250 bit</span> và <span class="data">err = 480 bit</span>, <b>FEQual</b> bằng bao nhiêu?'
      },
      opts: [{ en: '230 bits', vi: '230 bit' }, { en: '0 bits', vi: '0 bit' }, { en: '250 bits', vi: '250 bit' }, { en: '730 bits', vi: '730 bit' }],
      why: {
        en: 'FEQual = max{0, 250 − 480} = <b>0</b>: the entropy cannot pay for error correction. [P, §1.0.1]',
        vi: 'FEQual = max{0, 250 − 480} = <b>0</b>: entropy không đủ bù chi phí sửa lỗi. [P, §1.0.1]'
      }
    },
    {
      kind: 'concept', ch: '3.4c', ans: 2,
      title: { en: 'Why the weakest subset?', vi: 'Vì sao quan tâm tập con yếu nhất?' },
      q: {
        en: 'Why must the security analysis look at the subset with the <b>lowest</b> entropy?',
        vi: 'Vì sao phân tích bảo mật phải quan tâm đến tập con có entropy <b>thấp nhất</b>?'
      },
      opts: [
        { en: 'That subset always has the fewest bits', vi: 'Vì tập con đó luôn có ít bit nhất' },
        { en: 'The genuine user only uses that subset', vi: 'Vì người dùng thật chỉ dùng tập con đó' },
        { en: 'The attacker can focus on the easiest subset to guess', vi: 'Vì kẻ tấn công có thể tập trung đoán tập con dễ nhất' },
        { en: 'All subsets always have the same entropy', vi: 'Vì entropy của mọi tập con luôn bằng nhau' }
      ],
      why: {
        en: 'Many lockers protect the same key, so one weak subset becomes the target. It need not be shorter than the others. [P, §4.1, Lemma 1]',
        vi: 'Nhiều locker cùng bảo vệ một khoá; một tập con yếu trở thành mục tiêu. Tập đó không nhất thiết ngắn hơn. [P, §4.1, Lemma 1]'
      }
    },
    {
      kind: 'concept', ch: '3.4d', ans: 0,
      title: { en: 'ζ = 0 in ζ-sampling', vi: 'ζ = 0 trong ζ-sampling' },
      q: {
        en: 'In the bit-selection rule with weight <span class="data">p_same,i^ζ</span>, what does <b>ζ = 0</b> correspond to?',
        vi: 'Trong quy tắc chọn bit với trọng số <span class="data">p_same,i^ζ</span>, <b>ζ = 0</b> tương ứng với điều gì?'
      },
      opts: [
        { en: 'Uniform choice among eligible bits', vi: 'Chọn đều giữa các bit đủ điều kiện' },
        { en: 'Only the bit with the largest p_same', vi: 'Chỉ chọn bit có p_same lớn nhất' },
        { en: 'Drop every bit that has errors', vi: 'Loại bỏ toàn bộ bit có lỗi' },
        { en: 'Choose bits by the enrolee’s identity', vi: 'Chọn bit theo danh tính người đăng ký' }
      ],
      why: {
        en: 'Every weight becomes 1, so sampling is uniform; a large ζ concentrates on bits with high p_same. [P, §2.1.3]',
        vi: 'Mọi trọng số bằng 1 nên trở về chọn đều; ζ lớn dồn vào bit có p_same cao. [P, §2.1.3]'
      }
    },
    {
      kind: 'calc', ch: '4.1', ans: 1,
      title: { en: 'Opening one locker', vi: 'Mở một locker' },
      q: {
        en: 'With independent bit errors, <span class="data">μ = 0.10</span> and <span class="data">k = 2</span>, what is the probability that a whole subset is error-free?',
        vi: 'Với lỗi bit độc lập, <span class="data">μ = 0,10</span> và <span class="data">k = 2</span>, xác suất cả tập con không có lỗi là bao nhiêu?'
      },
      opts: ['0.18', '0.81', '0.90', '0.99'],
      why: {
        en: '(1 − μ)<sup>k</sup> = 0.9² = <b>0.81</b>. It drops as k grows; a lower μ allows a larger k. The model ignores correlated errors. [P, §2.1.2]',
        vi: '(1 − μ)<sup>k</sup> = 0,9² = <b>0,81</b>. k tăng thì giảm; μ thấp hơn cho phép k lớn hơn. Mô hình bỏ qua lỗi tương quan. [P, §2.1.2]'
      }
    },
    {
      kind: 'concept', ch: '5.4', ans: 2,
      title: { en: 'Where 92 % comes from', vi: 'TAR 92% đến từ đâu' },
      q: {
        en: 'ClearEyes-M reaches <b>TAR 92 %</b> in its final configuration. With how many readings?',
        vi: 'ClearEyes-M đạt <b>TAR 92%</b> ở cấu hình cuối. Với bao nhiêu ảnh?'
      },
      opts: [
        { en: '1 enrolment, 1 authentication', vi: '1 ảnh đăng ký, 1 ảnh xác thực' },
        { en: '1 enrolment, 4 authentication', vi: '1 ảnh đăng ký, 4 ảnh xác thực' },
        { en: '3 enrolment, 2 authentication', vi: '3 ảnh đăng ký, 2 ảnh xác thực' },
        { en: '5 enrolment, 5 authentication', vi: '5 ảnh đăng ký, 5 ảnh xác thực' }
      ],
      why: {
        en: 'More readings give more enrolment–authentication pairs that can match. 1–1 gives 64 % at the same 105 bits. [P, Table 5]',
        vi: 'Nhiều ảnh tạo thêm cặp đăng ký–xác thực có thể khớp. Cấu hình 1–1 chỉ đạt 64% ở cùng 105 bit. [P, Table 5]'
      }
    },
    {
      kind: 'concept', ch: '5.1', ans: 1,
      title: { en: 'The role of EntTest', vi: 'Vai trò của EntTest' },
      q: {
        en: 'What role does <b>EntTest</b> play in the 105-bit figure?',
        vi: '<b>EntTest</b> có vai trò gì trong con số 105 bit?'
      },
      opts: [
        { en: 'Encrypts the iris image before storage', vi: 'Mã hoá ảnh iris trước khi lưu' },
        { en: 'Estimates the min-entropy of the subsets', vi: 'Ước lượng min-entropy của các tập con' },
        { en: 'Measures the running time of HMAC', vi: 'Đo thời gian chạy HMAC' },
        { en: 'Proves the real FAR is 0 for every user', vi: 'Chứng minh FAR thực tế bằng 0 trên mọi người dùng' }
      ],
      why: {
        en: 'It supplies the entropy estimate used by the analysis; its accuracy is an assumption. FAR = 0 on the sample does not prove FAR = 0. [P, §5.2.1–5.2.2]',
        vi: 'EntTest cung cấp ước lượng entropy cho phân tích; độ chính xác là một giả định. FAR = 0 trên mẫu thử không chứng minh FAR = 0. [P, §5.2.1–5.2.2]'
      }
    }
  ];

  const ICON_OK = '<svg class="ic ok" viewBox="0 0 30 30" aria-hidden="true"><path d="M7 15.5l5.5 5.5L23.5 9"/></svg>';
  const ICON_NO = '<svg class="ic no" viewBox="0 0 30 30" aria-hidden="true"><path d="M9.5 9.5l11 11M20.5 9.5l-11 11"/></svg>';

  function render(q, i) {
    const s = document.createElement('section');
    const t = q.kind === 'calc' ? 30 : 20;
    s.className = 'slide quiz-q';
    s.id = 'q' + (i + 1);
    s.dataset.ch = 'q';
    s.dataset.ans = q.ans;
    s.dataset.t = t;
    s.dataset.tocEn = `Q${i + 1} · ${q.title.en}`;
    s.dataset.tocVi = `Câu ${i + 1} · ${q.title.vi}`;

    const rows = [`<div class="row" style="--i:0"><span class="chip good">✓ ${LET[q.ans]}</span><span><b>${L(q.opts[q.ans])}</b></span></div>`];
    let k = 1;
    if (q.why) rows.push(`<div class="row" style="--i:${k++}"><span class="chip">${L({ en: 'Why', vi: 'Vì sao' })}</span><span>${L(q.why)}</span></div>`);
    if (q.gain) rows.push(`<div class="row" style="--i:${k++}"><span class="chip good">${L({ en: 'Gain', vi: 'Được' })}</span><span>${L(q.gain)}</span></div>`);
    if (q.give) rows.push(`<div class="row" style="--i:${k++}"><span class="chip warn">${L({ en: 'Give up', vi: 'Đánh đổi' })}</span><span>${L(q.give)}</span></div>`);
    const fig = q.fig ? q.fig() : '';

    s.innerHTML = `
      <div class="q-head">
        <div>
          <div class="q-tags">
            <span class="q-no">${L({ en: 'Q', vi: 'Câu ' })}${i + 1}<span style="opacity:.65">/${QUIZ.length}</span></span>
            <span class="chip ${q.kind === 'calc' ? 'warn' : 'ch'}">${L(KIND[q.kind])}</span>
            <span class="chip">§&nbsp;${q.ch}</span>
          </div>
          <h2>${L(q.title)}</h2>
        </div>
        <div class="timer" aria-hidden="true">
          <svg viewBox="0 0 62 62"><circle class="track" cx="31" cy="31" r="26"/><circle class="bar" cx="31" cy="31" r="26"/></svg>
          <div class="tn">${t}</div>
        </div>
      </div>
      <div class="q-body">
        <p class="q-text">${L(q.q)}</p>
        <div class="opts" role="group">
          ${q.opts.map((o, j) => `<button type="button" class="opt" data-j="${j}" style="--d:${j * 70}ms"><span class="lt">${LET[j]}</span><span class="ot">${L(o)}</span>${ICON_OK}${ICON_NO}</button>`).join('')}
        </div>
        <div class="q-foot">
          <button type="button" class="reveal-btn">${L({ en: 'Reveal answer', vi: 'Hiện đáp án' })} <kbd>→</kbd></button>
          <div class="explain${fig ? ' has-fig' : ''}" aria-live="polite">
            <div class="stack-s">${rows.join('')}</div>
            ${fig ? `<div class="efig">${fig}</div>` : ''}
          </div>
        </div>
      </div>`;
    return s;
  }

  /* ---------- state ---------- */
  const results = {};
  let timer = null;

  function stopTimer() {
    if (!timer) return;
    clearInterval(timer.id);
    timer.el.classList.remove('run', 'late');
    timer = null;
  }
  function startTimer(s) {
    stopTimer();
    if (s.classList.contains('revealed') || document.documentElement.classList.contains('doc-mode')) return;
    const el = s.querySelector('.timer');
    const tn = el.querySelector('.tn');
    let left = +s.dataset.t;
    el.classList.remove('run', 'late');
    void el.offsetWidth; // restart the CSS animation
    el.style.setProperty('--t', left + 's');
    el.classList.add('run');
    tn.textContent = left;
    const id = setInterval(() => {
      left -= 1;
      tn.textContent = Math.max(0, left);
      if (left <= 0) { el.classList.add('late'); clearInterval(id); }
    }, 1000);
    timer = { id, el };
  }

  function pick(s, j) {
    if (!s || s.classList.contains('revealed')) return;
    const opts = s.querySelectorAll('.opt');
    const o = opts[j];
    if (!o) return;
    const was = o.classList.contains('picked');
    opts.forEach((x) => x.classList.remove('picked'));
    if (!was) o.classList.add('picked');
  }

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function burst(el) {
    if (!el || reduced()) return;
    const slide = el.closest('.slide');
    const sr = slide.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const scale = sr.width / slide.offsetWidth || 1;
    const cx = (er.left - sr.left + er.width / 2) / scale;
    const cy = (er.top - sr.top + er.height / 2) / scale;
    const cs = getComputedStyle(slide);
    const colors = ['--good', '--cq', '--accent', '--fig-1', '--fig-2', '--fig-4'].map((v) => cs.getPropertyValue(v).trim());
    for (let i = 0; i < 34; i++) {
      const p = document.createElement('i');
      p.className = 'spark';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = colors[i % colors.length];
      if (i % 3 === 0) p.style.borderRadius = '50%';
      if (i % 4 === 1) { p.style.width = '5px'; p.style.height = '12px'; }
      slide.appendChild(p);
      const a = Math.random() * Math.PI * 2;
      const d = 110 + Math.random() * 230;
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d * 0.62 - 50;
      const anim = p.animate([
        { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.8}px), calc(-50% + ${dy * 0.8}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 90}px)) scale(.4) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: 950 + Math.random() * 650, easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards' });
      anim.onfinish = () => p.remove();
    }
  }

  function reveal(s, opts = {}) {
    if (!s || s.classList.contains('revealed')) return;
    const ans = +s.dataset.ans;
    const list = s.querySelectorAll('.opt');
    list[ans].classList.add('correct');
    const picked = s.querySelector('.opt.picked');
    if (picked) {
      const ok = +picked.dataset.j === ans;
      if (!ok) picked.classList.add('wrong-pick');
      results[s.id] = ok;
    }
    s.classList.add('revealed');
    stopTimer();
    if (!opts.silent) setTimeout(() => burst(list[ans]), 380);
    updateScore();
  }

  function reset() {
    document.querySelectorAll('.quiz-q').forEach((s) => {
      s.classList.remove('revealed');
      s.querySelectorAll('.opt').forEach((o) => o.classList.remove('picked', 'correct', 'wrong-pick'));
    });
    Object.keys(results).forEach((k) => delete results[k]);
    updateScore();
  }

  function updateScore() {
    const box = document.getElementById('quiz-score');
    if (!box) return;
    const vals = Object.values(results);
    const n = vals.length;
    const ok = vals.filter(Boolean).length;
    box.classList.toggle('show', n > 0);
    box.innerHTML = `<span class="en">Your picks: <b>${ok} / ${n}</b> correct</span><span class="vi">Bạn chọn đúng: <b>${ok} / ${n}</b> câu</span>`;
  }

  /* ---------- mount ---------- */
  const intro = document.getElementById('quiz');
  if (intro) {
    let anchor = intro;
    QUIZ.forEach((q, i) => {
      const s = render(q, i);
      anchor.after(s);
      anchor = s;
    });
  }

  document.addEventListener('click', (e) => {
    const o = e.target.closest('.quiz-q .opt');
    if (o) { pick(o.closest('.slide'), +o.dataset.j); o.blur(); return; }
    const r = e.target.closest('.quiz-q .reveal-btn');
    if (r) { reveal(r.closest('.slide')); r.blur(); return; }
    if (e.target.closest('[data-quiz-reset]')) { reset(); e.target.closest('[data-quiz-reset]').blur(); }
  });

  document.addEventListener('slide:enter', (e) => {
    const s = e.detail.slide;
    if (s.classList.contains('quiz-q')) startTimer(s);
    else stopTimer();
  });

  const revealAll = () => document.querySelectorAll('.quiz-q').forEach((s) => reveal(s, { silent: true }));
  window.addEventListener('beforeprint', revealAll);
  if (new URLSearchParams(location.search).has('reveal')) revealAll();

  window.Quiz = { reveal, pick, reset, data: QUIZ };
})();

/* ---------- Kahoot join card on the question-review intro slide ----------
   PIN priority: ?pin=… in the URL › PIN typed with the ✎ button (saved in this browser) › data-pin in index.html.
   With no PIN the card asks the presenter to enter one. */
(function () {
  'use strict';
  const box = document.getElementById('kahoot');
  if (!box) return;
  const KEY = 'g3fe:kahoot-pin';
  const clean = (v) => String(v || '').replace(/\D/g, '');
  const valid = (pin) => /^\d{6,8}$/.test(pin);
  const DEFAULT = valid(clean(box.dataset.pin)) ? clean(box.dataset.pin) : '';
  const qrBox = box.querySelector('.kh-qr');
  const joinUrl = (pin) => `https://kahoot.it/?pin=${pin}&refer_method=link`;
  const pretty = (pin) => pin.replace(/^(\d{3})(\d{3,4})$/, '$1 $2');
  const load = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (pin) => { try { pin === DEFAULT ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, pin); } catch (e) { /* storage unavailable */ } };

  function render(pin) {
    const pinEl = box.querySelector('.kh-pin');
    box.classList.toggle('empty', !pin);
    if (!pin) {
      pinEl.innerHTML = '<span class="en">— — —</span><span class="vi">— — —</span>';
      box.querySelector('.kh-url').href = 'https://kahoot.it/';
      qrBox.innerHTML = '<div class="kh-empty"><span class="en">Press ✎ to enter<br>the game PIN</span><span class="vi">Bấm ✎ để nhập<br>mã PIN trò chơi</span></div>';
      return;
    }
    pinEl.textContent = pretty(pin);
    pinEl.classList.toggle('long', pin.length > 6);
    box.querySelector('.kh-url').href = joinUrl(pin);
    if (typeof window.qrcode !== 'function') { qrBox.textContent = joinUrl(pin); return; }
    const qr = window.qrcode(0, 'M');
    qr.addData(joinUrl(pin));
    qr.make();
    qrBox.innerHTML = qr.createSvgTag({ cellSize: 1, margin: 2, scalable: true });
  }

  const fromUrl = clean(new URLSearchParams(location.search).get('pin'));
  let pin = valid(fromUrl) ? fromUrl : (valid(clean(load())) ? clean(load()) : DEFAULT);
  render(pin);

  box.querySelector('.kh-edit').addEventListener('click', (e) => {
    e.preventDefault();
    const lang = document.documentElement.lang;
    const v = window.prompt(lang === 'vi' ? 'Nhập mã PIN Kahoot (để trống để xoá):' : 'Kahoot game PIN (leave empty to clear):', pin);
    if (v === null) return;
    const next = clean(v) || DEFAULT;
    if (next && !valid(next)) return;
    pin = next;
    save(pin);
    render(pin);
    e.currentTarget.blur();
  });
})();
