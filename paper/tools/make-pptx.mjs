/* Builds the PowerPoint copies of the deck:
     assets/pptx/G3-Fuzzy-Extractors-are-Practical-EN.pptx and -VI.pptx
   Headless Chrome renders every slide at 1920×1080 and the picture fills the PowerPoint slide,
   so the copy looks exactly like the web deck. The slide's text goes into the speaker notes,
   each review question becomes two slides (question, then answer), and the demo-clip slide
   carries the MP4 from assets/video, which plays in PowerPoint.

   Usage (from paper/tools):  npm install   then   node make-pptx.mjs [--pin 123456]
   Needs Node 22+ and Google Chrome (set CHROME=/path/to/chrome when it is not in the macOS default place). */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pptxgen from 'pptxgenjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DECK = path.resolve(HERE, '..');
const OUT = path.join(DECK, 'assets/pptx');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const argPin = process.argv.indexOf('--pin');
const PIN = argPin > 0 ? String(process.argv[argPin + 1] || '').replace(/\D/g, '') : '';
const LANGS = ['en', 'vi'];
const name = (lang) => `G3-Fuzzy-Extractors-are-Practical-${lang.toUpperCase()}.pptx`;

/* ---------- a minimal Chrome DevTools Protocol client ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(path.join(tmpdir(), 'make-pptx-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--window-size=1280,720', 'about:blank'], { stdio: 'ignore' });
let ws, seq = 0;
const pending = new Map();
const errors = [];
for (let i = 0; i < 60 && !ws; i++) {
  try {
    const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page');
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch (e) { /* Chrome not up yet */ }
  if (!ws) await sleep(250);
}
if (!ws) throw new Error(`Chrome did not start (${CHROME})`);
await new Promise((r) => ws.addEventListener('open', r));
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
async function js(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || expression);
  return r.result?.result?.value;
}
// JPEG keeps each file small enough to re-commit; at this quality the text stays sharp
const shot = async (format = 'jpeg') => (await send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 90 : undefined })).result.data;

/* ---------- in-page helpers ---------- */
// freeze entrance animations, hide controls that only work in the browser, and give the
// Kahoot card a print-friendly text when no PIN is set
const PREPARE = `(() => {
  const st = document.createElement('style');
  st.textContent = '.slide, .slide * { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; } .kh-edit, .quiz-hint, .reveal-btn, #quiz-score, .slide-title .cta button, .slide-title .cta .lang, .slide-title .hint { display: none !important; }';
  document.head.appendChild(st);
  const empty = document.querySelector('#kahoot.empty .kh-empty');
  if (empty) empty.innerHTML = '<span class="en">PIN shown<br>at game time</span><span class="vi">Mã PIN hiện<br>khi mở trò chơi</span>';
  const qa = document.querySelector('.qa-hint');
  if (qa) qa.innerHTML = '<span class="en">Prepared answers are in this slide’s notes.</span><span class="vi">Câu trả lời chuẩn bị sẵn nằm trong ghi chú (notes) của slide này.</span>';
  return document.querySelectorAll('.slide').length;
})()`;
const SHOW = (i) => `(async () => {
  location.hash = '#/${i + 1}';
  await new Promise((r) => setTimeout(r, 120));
  const s = document.querySelectorAll('.slide')[${i}];
  const lang = document.documentElement.lang;
  const clip = s.querySelector('.clip');
  // leave out of the notes: the running head, page number, artwork and the clip's terminal
  const skip = [...s.querySelectorAll('.s-top, .pg, .iris-art, .num-big, .clip, .timer, .reveal-btn')];
  skip.forEach((e) => { e.dataset.d = e.style.display; e.style.display = 'none'; });
  // collapsed answers (Q&A slide) stay collapsed on the slide but go into the notes
  const shut = [...s.querySelectorAll('details:not([open])')];
  shut.forEach((d) => { d.open = true; });
  const text = s.innerText;
  shut.forEach((d) => { d.open = false; });
  skip.forEach((e) => { e.style.display = e.dataset.d; delete e.dataset.d; });
  const h = s.querySelector('h1, h2');
  return {
    quiz: s.classList.contains('quiz-q'),
    clip: !!clip,
    title: h ? h.innerText.replace(/\\s+/g, ' ').trim() : '',
    section: s.classList.contains('quiz-q') ? '' : s.dataset['toc' + (lang === 'vi' ? 'Vi' : 'En')] || (s.id === 'refs' && h ? h.innerText.trim() : ''),
    text,
  };
})()`;
const notesOf = (text) => text.split('\n').map((l) => l.trim()).filter((l) => l && !/^— \d+ —$/.test(l)).join('\n');

/* ---------- build ---------- */
async function build(lang) {
  const url = pathToFileURL(path.join(DECK, 'index.html')).href + `?capture&lang=${lang}&theme=light${PIN ? `&pin=${PIN}` : ''}`;
  await send('Page.navigate', { url });
  await sleep(1500);
  await js('document.fonts.ready.then(() => true)');
  const n = await js(PREPARE);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Fuzzy Extractors are Practical — Group 3';
  pres.subject = 'Shukla et al., ACM CCS 2025 — paper presentation (CO5157 Database Security)';
  pres.author = 'Ngô Nhất Toàn, Lê Công Tú, Lý Minh Trung';
  let section = null, count = 0;
  const add = (img, info, notes) => {
    count++;
    const slide = pres.addSlide(section ? { sectionTitle: section } : {});
    slide.background = { color: 'F6F7FB' };
    slide.addImage({ data: `image/jpeg;base64,${img}`, x: 0, y: 0, w: 10, h: 5.625, altText: info.title || 'Slide' });
    slide.addNotes(notes);
    return slide;
  };

  for (let i = 0; i < n; i++) {
    const info = await js(SHOW(i));
    if (info.section && info.section !== section) { section = info.section; pres.addSection({ title: section }); }
    const notes = notesOf(info.text);
    if (info.clip) {
      // notes: each chapter's caption and result, read off the clip itself
      const chapters = await js(`(() => {
        const host = document.querySelector('.clip');
        return DemoClip.chapters.map((t) => {
          DemoClip.seek(t + 0.05);
          const k = host.querySelector('.cc-k').innerText.replace(/\\s+/g, ' ').trim();
          return k + ' — ' + host.querySelector('.cc-t').innerText.trim() + ' → ' + host.querySelector('.cc-r').innerText.trim();
        });
      })()`);
      // the MP4 already shows the whole slide; its title card is the poster frame
      await js('DemoClip.seek(-2)');
      const poster = await shot('png');
      count++;
      const slide = pres.addSlide({ sectionTitle: section });
      slide.background = { color: 'F6F7FB' };
      slide.addMedia({ type: 'video', path: path.join(DECK, `assets/video/feap-demo-${lang}.mp4`), cover: `data:image/png;base64,${poster}`, x: 0, y: 0, w: 10, h: 5.625 });
      slide.addNotes([notes, (lang === 'vi' ? '(Bấm vào video để phát.)' : '(Click the video to play.)'), ...chapters].join('\n\n'));
    } else if (info.quiz) {
      add(await shot(), info, notes);
      await js(`Quiz.reveal(document.querySelectorAll('.slide')[${i}], { silent: true })`);
      await sleep(80);
      const answer = await js(`document.querySelectorAll('.slide')[${i}].innerText`);
      add(await shot(), info, notesOf(answer));
    } else {
      add(await shot(), info, notes);
    }
  }
  mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, name(lang));
  await pres.writeFile({ fileName: file });
  console.log(`${name(lang)}: ${count} slides, ${(statSync(file).size / 1e6).toFixed(1)} MB`);
}

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1.5, mobile: false });
  for (const lang of LANGS) await build(lang);
  if (errors.length) console.log('page errors:\n' + errors.join('\n'));
} finally {
  try { ws.close(); } catch (e) { /* already closed */ }
  chrome.kill('SIGKILL');
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
