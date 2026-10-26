// Grava o reels quadro a quadro com relógio virtual: temporizadores, rAF e animações CSS
// andam exatamente 1/30 s por quadro, então o vídeo sai sem travadas, por mais lenta que seja a captura.
// Uso, com um servidor estático na raiz da landing (porta 4188): node record.js [saída.mp4] [pasta dos quadros]
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1243/chrome-win64/chrome.exe');
const outDir = path.join(__dirname, '..', 'out');
const outMp4 = process.argv[2] || path.join(outDir, 'zefiro-reels.mp4');
const work = process.argv[3] || path.join(outDir, 'quadros');
const URL = process.env.REELS_URL || 'http://127.0.0.1:4188/reels/?rec';
const FPS = 30;
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });

const CLOCK = `(() => {
  const realTimeout = window.setTimeout.bind(window);
  const chan = new MessageChannel();
  const queue = [];
  chan.port1.onmessage = () => queue.shift()();
  const macrotask = () => new Promise((r) => { queue.push(r); chan.port2.postMessage(0); });

  let now = 0;
  const dateBase = Date.now();
  let seq = 0;
  const timers = new Map();
  let rafs = new Map();
  window.setTimeout = (fn, ms = 0, ...args) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, +ms || 0), fn, args }); return id; };
  window.setInterval = (fn, ms = 0, ...args) => { const every = Math.max(1, +ms || 0); const id = ++seq; timers.set(id, { at: now + every, fn, args, every }); return id; };
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);
  window.requestAnimationFrame = (fn) => { const id = ++seq; rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = (id) => rafs.delete(id);
  performance.now = () => now;
  Date.now = () => dateBase + now;

  const started = new WeakMap();
  function sync() {
    for (const a of document.getAnimations()) {
      if (!started.has(a)) started.set(a, now);
      const t = now - started.get(a);
      const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
      if (a.playState !== 'paused') a.pause();
      a.currentTime = Number.isFinite(end) ? Math.min(t, end) : t;
    }
  }

  window.__vt = {
    async advance(ms) {
      const target = now + ms;
      for (;;) {
        let next = null;
        for (const [id, t] of timers) if (t.at <= target && (!next || t.at < next[1].at)) next = [id, t];
        if (!next) break;
        const [id, t] = next;
        now = Math.max(now, t.at);
        if (t.every) t.at += t.every; else timers.delete(id);
        try { typeof t.fn === 'function' ? t.fn(...t.args) : (0, eval)(t.fn); } catch (e) { console.error(e); }
        await macrotask();
        sync();
      }
      now = target;
      const cbs = [...rafs.values()];
      rafs = new Map();
      for (const f of cbs) { try { f(now); } catch (e) { console.error(e); } }
      await macrotask();
      sync();
    },
    now: () => now,
  };
})();`;

(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(CLOCK);
  await page.goto(URL);
  await page.evaluate(async () => {
    let done = false;
    window.__reelReady.then(() => (done = true));
    while (!done) await window.__vt.advance(50);
  });
  await page.evaluate(() => {
    window.__reel.play();
  });

  const step = 1000 / FPS;
  let n = 0;
  const t0 = Date.now();
  for (;;) {
    await page.evaluate((ms) => window.__vt.advance(ms), step);
    await page.screenshot({ path: path.join(work, `f${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95, scale: 'css', animations: 'allow', caret: 'initial' });
    n++;
    if (n % 150 === 0) console.log(`${(n / FPS).toFixed(0)} s de vídeo em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    if (await page.evaluate(() => window.__reelLoops >= 1)) break;
    if (n > FPS * 120) throw new Error('o roteiro não terminou em 120 s');
  }
  await browser.close();
  console.log(`${n} quadros (${(n / FPS).toFixed(1)} s). Erros: ${errors.length ? errors.join(' | ') : 'nenhum'}`);

  execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(work, 'f%05d.jpg'),
    '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-movflags', '+faststart', outMp4,
  ], { stdio: 'inherit' });
  console.log('MP4:', outMp4);
})();
