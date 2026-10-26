// Roteiro do reels: abertura, ilha, painéis, formatos, temas, números e chamada final, em ~37 s e em laço.
// A barra é o mesmo clone da landing page (Z.Scene); este arquivo só move a câmera, o cursor e os textos.
(function () {
  const Z = window.Z;
  Z.lang = 'pt';

  const params = new URLSearchParams(location.search);
  const REC = params.has('rec');
  if (REC) document.documentElement.classList.add('is-rec');

  const CANCEL = { cancelled: true };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const reel = document.querySelector('.reel');
  const hl = reel.querySelector('.r-hl');
  const eyebrow = reel.querySelector('.r-eyebrow');
  const ticker = reel.querySelector('.r-ticker');
  const word = reel.querySelector('.r-intro-word');

  const MAIN_SECTIONS = {
    start: ['zefiro', 'weather', 'hardware'],
    center: ['island'],
    end: ['claude', 'codex', 'vscode', 'terminal', 'audio', 'brightness', 'notifications', 'clock', 'power'],
  };
  const BASE = {
    theme: 'obsidian',
    format: 'faixa',
    island: 'media',
    tab: 'media',
    playing: true,
    panel: null,
    hover: null,
    edit: false,
    drag: null,
    notif: 2,
    claude: 42,
    codex: 27,
    volume: 64,
    osd: 64,
    lyric: 1,
  };

  // ---------- Encaixe na janela ----------
  function fit() {
    const s = REC
      ? Math.min(innerWidth / 1080, innerHeight / 1920)
      : Math.min((innerWidth - 32) / 1080, (innerHeight - 72) / 1920);
    reel.style.setProperty('--fit', Math.max(0.1, s).toFixed(4));
  }
  fit();
  addEventListener('resize', fit);

  word.innerHTML = [...word.textContent].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');

  // maxVisibleNarrow alto: o reels tem largura fixa e não precisa do zoom de celular da landing.
  const scene = new Z.Scene(reel.querySelector('.r-view'), {
    width: 1440,
    height: 810,
    maxVisibleNarrow: 100000,
    state: Object.assign({}, BASE, { sections: clone(MAIN_SECTIONS), island: 'idle', playing: false }),
  });

  // ---------- Reprodução ----------
  let token = 0;
  let paused = false;

  async function wait(ms, tok) {
    let left = ms;
    while (left > 0) {
      if (tok !== token) throw CANCEL;
      const step = Math.min(left, 40);
      await sleep(step);
      if (!paused) left -= step;
    }
    if (tok !== token) throw CANCEL;
  }

  const SCENE_CLASSES = ['s-intro', 's-intro-out', 'show-bug', 'show-card', 'card-out', 's-stats', 's-stats-out', 's-cta', 's-cta-out'];
  function mode(...on) {
    SCENE_CLASSES.forEach((c) => reel.classList.toggle(c, on.includes(c)));
  }

  // ---------- Textos ----------
  // *palavra* sai na cor de destaque.
  function words(text) {
    return text
      .split(' ')
      .map((w, i) => {
        const accent = /^\*.*\*[.,]?$/.test(w);
        const clean = w.replace(/\*/g, '');
        return `<span class="w" style="--i:${i}">${accent ? `<em>${clean}</em>` : clean}</span>`;
      })
      .join(' ');
  }

  function say(text, eb) {
    const had = hl.textContent.trim() !== '';
    hl.classList.add('is-out');
    if (eb !== undefined) eyebrow.classList.add('is-out');
    setTimeout(
      () => {
        hl.classList.remove('is-out');
        hl.innerHTML = text ? words(text) : '';
        if (eb !== undefined) {
          eyebrow.innerHTML = eb ? `${eb.icon ? Z.icon(eb.icon) : ''}<span>${eb.label}</span>` : '';
          eyebrow.classList.remove('is-out');
        }
      },
      had ? 340 : 0
    );
  }

  function setTicker(labels) {
    if (!labels) {
      ticker.classList.add('is-out');
      return;
    }
    ticker.classList.remove('is-out');
    ticker.innerHTML = labels.map((l, i) => `<li style="--i:${i}">${l}</li>`).join('');
  }

  function tick(i) {
    ticker.querySelectorAll('li').forEach((li, j) => li.classList.toggle('is-on', j === i));
  }

  // ---------- Câmera e cursor ----------
  function reset(patch = {}) {
    scene.set(Object.assign({}, BASE, { sections: clone(MAIN_SECTIONS) }, patch));
  }

  function cut(rect) {
    scene.focus = rect;
    scene.fit(true);
  }

  async function to(tok, x, y, ms = 650) {
    scene.showCursor(true);
    scene.moveCursor(x, y, ms);
    await wait(ms, tok);
  }

  async function clickChip(tok, id) {
    const c = scene.chipCenter(id);
    await to(tok, c.x + 4, c.y + 4);
    scene.set({ hover: id });
    await wait(150, tok);
    scene.click();
    scene.set({ panel: id });
    focusPanel();
  }

  function focusPanel() {
    const p = scene.panelRect;
    if (!p) return;
    const pad = 60;
    const w = Math.max(480, p.w + pad * 2);
    const x = Math.min(Math.max(0, p.x + p.w / 2 - w / 2), scene.W - w);
    scene.setFocus({ x, y: 0, w, h: p.y + p.h + pad });
  }

  // Centro de um elemento da cena, nas coordenadas da tela de 1440 × 810.
  function centerOf(el) {
    const sr = scene.screen.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const k = sr.width / scene.W;
    return { x: (er.left + er.width / 2 - sr.left) / k, y: (er.top + er.height / 2 - sr.top) / k };
  }

  async function clickTab(tok, tab) {
    const el = scene.screen.querySelector(`[data-tab="${tab}"]`);
    if (el) {
      const c = centerOf(el);
      await to(tok, c.x + 4, c.y + 4, 450);
      scene.click();
    }
    scene.set({ tab });
  }

  function focusIsland(pad = 70) {
    const r = scene.islandRect();
    const w = Math.max(400, r.w + pad * 2);
    scene.setFocus({ x: r.x + r.w / 2 - w / 2, y: 0, w, h: r.y + r.h + pad });
  }

  // ---------- Cenas ----------
  async function intro(tok) {
    scene.showCursor(false);
    setTicker(null);
    say('', null);
    mode();
    await wait(60, tok);
    mode('s-intro');
    await wait(3000, tok);
    mode('s-intro', 's-intro-out');
    await wait(450, tok);
  }

  async function island(tok) {
    reset({ island: 'idle', playing: false });
    cut({ x: 520, y: 0, w: 400, h: 260 });
    mode('show-bug', 'show-card');
    say('Uma *ilha* de mídia no centro da barra.', { icon: 'music', label: 'Ilha' });
    await wait(1000, tok);
    scene.set({ island: 'media', playing: true });
    await wait(1100, tok);
    scene.set({ island: 'peek' });
    await wait(1400, tok);
    scene.set({ island: 'osd', osd: 58 });
    for (let v = 58; v <= 82; v += 4) {
      scene.set({ osd: v, volume: v });
      await wait(110, tok);
    }
    await wait(500, tok);
    scene.set({ island: 'media' });
    say('Um clique abre *letras*, clima e hardware.');
    await wait(500, tok);
    await to(tok, scene.W / 2 + 10, 22, 700);
    scene.click();
    scene.set({ island: 'expanded', tab: 'media', progress: 0.34 });
    focusIsland();
    await wait(900, tok);
    await clickTab(tok, 'lyrics');
    scene.set({ lyric: 1 });
    await wait(700, tok);
    scene.set({ lyric: 2 });
    await wait(700, tok);
    await clickTab(tok, 'weather');
    await wait(900, tok);
    await clickTab(tok, 'hardware');
    await wait(1000, tok);
  }

  async function panels(tok) {
    reset();
    scene.setFocus(null);
    say('Painéis que *nascem* dos ícones.', { icon: 'volume', label: 'Painéis' });
    await wait(500, tok);
    await clickChip(tok, 'audio');
    await wait(700, tok);
    for (let v = 82; v >= 46; v -= 4) {
      scene.set({ volume: v });
      await wait(80, tok);
    }
    await wait(700, tok);
    say('O uso do *Claude* e do *Codex* sempre à vista.', { icon: 'spark', label: 'Para quem programa' });
    await clickChip(tok, 'claude');
    await wait(1800, tok);
    await clickChip(tok, 'codex');
    await wait(1700, tok);
    scene.set({ panel: null, hover: null });
    scene.showCursor(false);
  }

  async function formats(tok) {
    // O painel do Claude fica aberto para mostrar que ele também muda com o formato.
    reset({ panel: 'claude' });
    const p = scene.panelRect;
    const r = scene.islandRect();
    const x0 = Math.min(p.x, r.x) - 40;
    const x1 = Math.max(p.x + p.w, r.x + r.w) + 40;
    scene.setFocus({ x: x0, y: 0, w: x1 - x0, h: p.y + p.h + 50 });
    say('O mesmo conteúdo em *cinco* formatos.', { icon: null, label: 'Formatos' });
    setTicker(Z.FORMATS.map((f) => Z.t('fmt.' + f)));
    await wait(500, tok);
    for (let i = 0; i < Z.FORMATS.length; i++) {
      scene.set({ format: Z.FORMATS[i] });
      tick(i);
      await wait(1000, tok);
    }
  }

  async function themes(tok) {
    const ids = ['obsidian', 'cobalto', 'porcelain', 'plum', 'evergreen', 'nord', 'graphite', 'slate', 'espresso'];
    reset({ format: 'ilhas' });
    say('Nove temas, com *acrílico* no Cobalto.', { icon: null, label: 'Temas' });
    setTicker(ids.map((id) => Z.THEMES[id].name));
    tick(0);
    await clickChip(tok, 'clock');
    scene.showCursor(false);
    await wait(500, tok);
    for (let i = 1; i < ids.length; i++) {
      scene.set({ theme: ids[i] });
      tick(i);
      await wait(i === 1 ? 1200 : 600, tok);
    }
    await wait(400, tok);
  }

  function countUp(el, delay) {
    const to = parseFloat(el.dataset.to);
    const dec = +(el.dataset.dec || 0);
    const suffix = el.dataset.suffix || '';
    const fmt = (v) => v.toFixed(dec).replace('.', ',') + suffix;
    el.textContent = fmt(0);
    const start = performance.now() + delay;
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / 900));
      el.textContent = fmt(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  async function stats(tok) {
    scene.set({ panel: null });
    setTicker(null);
    say('', null);
    mode('show-bug', 'show-card', 'card-out');
    await wait(500, tok);
    reset({ island: 'idle', playing: false });
    reel.querySelectorAll('.r-stat b').forEach((b, i) => countUp(b, 150 + i * 350));
    mode('show-bug', 's-stats');
    await wait(4000, tok);
    mode('show-bug', 's-stats', 's-stats-out');
    await wait(500, tok);
  }

  async function cta(tok) {
    mode('s-cta');
    await wait(4600, tok);
    mode('s-cta', 's-cta-out');
    await wait(600, tok);
  }

  const SCENES = [intro, island, panels, formats, themes, stats, cta];

  async function play() {
    const tok = ++token;
    paused = false;
    syncToggle();
    try {
      do {
        for (const s of SCENES) await s(tok);
        window.__reelLoops = (window.__reelLoops || 0) + 1;
      } while (!REC);
    } catch (e) {
      if (e !== CANCEL) throw e;
    }
  }

  // ---------- Controles ----------
  const toggleBtn = document.getElementById('r-toggle');
  function syncToggle() {
    toggleBtn.textContent = paused ? 'Continuar' : 'Pausar';
    reel.style.setProperty('--play', paused ? 'paused' : 'running');
    reel.classList.toggle('is-paused', paused);
  }
  toggleBtn.addEventListener('click', () => {
    paused = !paused;
    syncToggle();
  });
  document.getElementById('r-restart').addEventListener('click', play);
  document.getElementById('r-guides').addEventListener('click', () => reel.classList.toggle('guides'));
  if (params.has('guides')) reel.classList.add('guides');

  // Pinta uma vez, atrás do fundo, todos os textos grandes do roteiro: os glifos ficam prontos
  // e a troca de título não engasga na gravação.
  function warmGlyphs() {
    const texts = [...reel.querySelectorAll('.r-hl, .r-intro, .r-stats, .r-cta')].map((el) => el.textContent);
    const src = SCENES.map(String).join(' ');
    const said = [...src.matchAll(/say\('([^']+)'/g)].map((m) => m[1].replace(/\*/g, ''));
    const warm = document.createElement('div');
    warm.className = 'r-warm';
    warm.innerHTML = [104, 140, 200, 220].map((px) => `<p style="font-size:${px}px">${said.concat(texts).join(' ')} 0123456789,%</p>`).join('');
    reel.prepend(warm);
    return new Promise((r) => setTimeout(() => (warm.remove(), r(true)), 600));
  }

  window.__reel = { play };
  if (REC) {
    // A gravação espera as fontes e os glifos e dá a largada.
    window.__reelReady = (document.fonts ? document.fonts.ready : Promise.resolve()).then(warmGlyphs);
  } else {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(play);
  }
})();
