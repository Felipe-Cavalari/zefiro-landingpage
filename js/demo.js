// Roteiro da demonstração: cinco capítulos que se repetem, como um vídeo, com pausa e modo interativo.
(function () {
  const Z = (window.Z = window.Z || {});
  const CANCEL = { cancelled: true };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const ISLAND_FOCUS = { x: 400, y: 0, w: 640, h: 360 };

  class Demo {
    constructor(root) {
      this.root = root;
      this.view = root.querySelector('.stage-view');
      this.caption = root.querySelector('.stage-caption');
      this.chaptersEl = root.querySelector('.stage-chapters');
      this.toggleBtn = root.querySelector('.stage-toggle');
      this.resumeBtn = root.querySelector('.stage-resume');
      this.scene = new Z.Scene(this.view, {
        state: Object.assign({}, BASE, { sections: clone(MAIN_SECTIONS), island: 'idle', playing: false }),
        onUserInput: () => this.enterInteractive(),
      });
      this.token = 0;
      this.paused = false;
      this.visible = true;
      this.interactive = false;
      this.chapters = [
        { key: 'island', ms: 15500, run: (r) => this.chIsland(r) },
        { key: 'panels', ms: 14500, run: (r) => this.chPanels(r) },
        { key: 'formats', ms: 11500, run: (r) => this.chFormats(r) },
        { key: 'themes', ms: 11000, run: (r) => this.chThemes(r) },
        { key: 'edit', ms: 12000, run: (r) => this.chEdit(r) },
      ];
      this.buildChapters();
      this.toggleBtn.addEventListener('click', () => this.togglePause());
      this.resumeBtn.addEventListener('click', () => this.play(this.current || 0));
      document.addEventListener('visibilitychange', () => (this.visible = !document.hidden && this.onScreen !== false));
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es) => {
          this.onScreen = es[0].isIntersecting;
          this.visible = this.onScreen && !document.hidden;
        }).observe(this.view);
      }
      document.addEventListener('zefiro:lang', () => {
        this.labelChapters();
        if (this.captionKey) this.say(this.captionKey, true);
        this.syncToggle();
      });
      if (Z.reduced) this.enterInteractive(true);
      else this.play(0);
    }

    buildChapters() {
      this.chaptersEl.innerHTML = this.chapters
        .map((c, i) => `<li><button type="button" data-i="${i}"><span class="ch-n">${i + 1}</span><span class="ch-l" data-t="ch.${c.key}"></span><span class="ch-bar"><i></i></span></button></li>`)
        .join('');
      this.chaptersEl.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (b) this.play(+b.dataset.i);
      });
      this.labelChapters();
    }

    labelChapters() {
      this.chaptersEl.querySelectorAll('[data-t]').forEach((el) => (el.textContent = Z.t(el.dataset.t)));
    }

    // ---------- Reprodução ----------
    async play(index) {
      const tok = ++this.token;
      this.interactive = false;
      this.scene.interactive = false;
      this.root.classList.remove('is-interactive');
      this.paused = false;
      this.syncToggle();
      let i = index;
      try {
        for (;;) {
          this.current = i;
          this.markChapter(i);
          this.elapsed = 0;
          const r = { tok, wait: (ms) => this.wait(ms, tok) };
          await this.chapters[i].run(r);
          await r.wait(400);
          i = (i + 1) % this.chapters.length;
        }
      } catch (e) {
        if (e !== CANCEL) throw e;
      }
    }

    async wait(ms, tok) {
      let left = ms;
      while (left > 0) {
        if (tok !== this.token) throw CANCEL;
        const step = Math.min(left, 50);
        await sleep(step);
        if (!this.paused && this.visible) {
          left -= step;
          this.elapsed += step;
          this.progress();
        }
      }
      if (tok !== this.token) throw CANCEL;
    }

    progress() {
      const c = this.chapters[this.current];
      const bar = this.chaptersEl.querySelectorAll('.ch-bar i')[this.current];
      if (bar) bar.style.transform = `scaleX(${Math.min(1, this.elapsed / c.ms)})`;
    }

    markChapter(i) {
      this.chaptersEl.querySelectorAll('button').forEach((b, j) => {
        b.classList.toggle('is-on', j === i);
        b.setAttribute('aria-current', j === i ? 'step' : 'false');
        b.querySelector('.ch-bar i').style.transform = `scaleX(${j < i ? 1 : 0})`;
      });
    }

    togglePause() {
      if (this.interactive) return this.play(this.current || 0);
      this.paused = !this.paused;
      this.syncToggle();
    }

    syncToggle() {
      const playing = !this.paused && !this.interactive;
      this.toggleBtn.setAttribute('aria-label', Z.t(playing ? 'stage.pause' : 'stage.play'));
      this.toggleBtn.classList.toggle('is-paused', !playing);
    }

    enterInteractive(initial) {
      if (this.interactive) return;
      this.token++;
      this.interactive = true;
      this.scene.interactive = true;
      this.root.classList.add('is-interactive');
      this.scene.showCursor(false);
      this.scene.setFocus(null);
      this.say('stage.hint');
      this.syncToggle();
      if (initial) this.scene.set(Object.assign({}, BASE, { sections: clone(MAIN_SECTIONS) }));
      else this.scene.set({ edit: false, drag: null });
    }

    say(key, instant) {
      this.captionKey = key;
      const el = this.caption;
      if (instant) {
        el.textContent = Z.t(key);
        return;
      }
      el.classList.add('is-out');
      clearTimeout(this.sayT);
      this.sayT = setTimeout(() => {
        el.textContent = Z.t(key);
        el.classList.remove('is-out');
      }, 220);
    }

    reset(patch = {}) {
      const sc = this.scene;
      sc.set(Object.assign({}, BASE, { sections: clone(MAIN_SECTIONS) }, patch));
      sc.setFocus(null);
    }

    async to(r, x, y, ms = 700) {
      this.scene.showCursor(true);
      this.scene.moveCursor(x, y, ms);
      await r.wait(ms);
    }

    async toChip(r, id, ms) {
      const c = this.scene.chipCenter(id);
      await this.to(r, c.x + 4, c.y + 4, ms);
      this.scene.set({ hover: id });
    }

    async clickChip(r, id) {
      await this.toChip(r, id);
      await r.wait(160);
      this.scene.click();
      this.scene.set({ panel: id });
      this.focusPanel();
    }

    focusPanel() {
      const sc = this.scene;
      const p = sc.panelRect;
      if (!p) return;
      const pad = 80;
      const x = Math.max(0, p.x - pad);
      const w = Math.max(640, p.w + pad * 2);
      sc.setFocus({ x: Math.min(x, sc.W - w), y: 0, w, h: Math.max(360, p.y + p.h + pad) });
    }

    // ---------- Capítulos ----------
    async chIsland(r) {
      const sc = this.scene;
      this.reset({ island: 'idle', playing: false });
      sc.showCursor(false);
      this.say('cap.island1');
      await r.wait(900);
      sc.setFocus(ISLAND_FOCUS);
      await r.wait(1100);
      this.say('cap.island2');
      sc.set({ island: 'media', playing: true });
      await r.wait(1500);
      sc.set({ island: 'peek' });
      await r.wait(2200);
      sc.set({ island: 'media' });
      await r.wait(700);
      this.say('cap.island3');
      sc.set({ island: 'osd', osd: 64 });
      for (let v = 64; v <= 82; v += 3) {
        sc.set({ osd: v, volume: v });
        await r.wait(120);
      }
      await r.wait(900);
      sc.set({ island: 'notify', notif: 3 });
      await r.wait(1700);
      sc.set({ island: 'media' });
      await r.wait(500);
      this.say('cap.island4');
      await this.to(r, sc.W / 2 + 10, 22, 800);
      sc.click();
      sc.set({ island: 'expanded', tab: 'media', progress: 0.34 });
      for (let i = 0; i < 6; i++) {
        sc.set({ progress: 0.34 + i * 0.006 });
        await r.wait(200);
      }
      await this.to(r, sc.W / 2 + 120, 30, 450);
      sc.click();
      sc.set({ tab: 'lyrics', lyric: 1 });
      await r.wait(900);
      sc.set({ lyric: 2 });
      await r.wait(1000);
      await this.to(r, sc.W / 2 - 78, 30, 450);
      sc.click();
      sc.set({ tab: 'weather' });
      await r.wait(1200);
      await this.to(r, sc.W / 2 + 280, 420, 700);
      sc.click();
      sc.set({ island: 'media', tab: 'media' });
      sc.setFocus(null);
      await r.wait(500);
    }

    async chPanels(r) {
      const sc = this.scene;
      this.reset();
      this.say('cap.panels1');
      sc.showCursor(true);
      await this.clickChip(r, 'audio');
      await r.wait(700);
      for (let v = 64; v >= 40; v -= 4) {
        sc.set({ volume: v });
        await r.wait(90);
      }
      await r.wait(800);
      this.say('cap.panels2');
      await this.clickChip(r, 'claude');
      await r.wait(1800);
      await this.clickChip(r, 'codex');
      await r.wait(1700);
      this.say('cap.panels3');
      await this.clickChip(r, 'clock');
      await r.wait(1800);
      await this.clickChip(r, 'vscode');
      await r.wait(1600);
      await this.clickChip(r, 'notifications');
      await r.wait(1500);
      await this.to(r, sc.W * 0.45, sc.H * 0.6, 700);
      sc.click();
      sc.set({ panel: null, hover: null });
      sc.setFocus(null);
      await r.wait(600);
    }

    async chFormats(r) {
      const sc = this.scene;
      this.reset();
      sc.showCursor(false);
      sc.setFocus({ x: 560, y: 0, w: 880, h: 260 });
      for (const f of Z.FORMATS) {
        sc.set({ format: f });
        this.captionKey = 'cap.formats';
        this.caption.innerHTML = `${Z.t('cap.formats')} <b>${Z.t('fmt.' + f)}</b>`;
        await r.wait(2200);
      }
    }

    async chThemes(r) {
      const sc = this.scene;
      this.reset({ format: 'vidro' });
      this.say('cap.themes');
      sc.showCursor(true);
      await this.clickChip(r, 'clock');
      for (const th of ['cobalto', 'porcelain', 'plum', 'evergreen', 'nord']) {
        await r.wait(1700);
        sc.set({ theme: th });
      }
      await r.wait(1500);
      sc.set({ panel: null, hover: null, theme: 'obsidian', format: 'faixa' });
      sc.setFocus(null);
      await r.wait(500);
    }

    async chEdit(r) {
      const sc = this.scene;
      this.reset();
      this.say('cap.edit1');
      await this.clickChip(r, 'zefiro');
      await r.wait(900);
      const item = sc.panelRect;
      await this.to(r, item.x + 70, item.y + 92, 500);
      sc.click();
      sc.set({ panel: null, hover: null, edit: true });
      sc.setFocus({ x: 140, y: 0, w: 1160, h: 300 });
      await r.wait(1100);
      // Arrasta o Terminal da direita para a esquerda.
      const from = sc.chipCenter('terminal');
      await this.to(r, from.x + 4, from.y + 4, 800);
      const sections = clone(sc.state.sections);
      sections.end = sections.end.filter((x) => x !== 'terminal');
      sc.set({ sections, drag: { id: 'terminal', x: from.x, y: from.y, zone: 'end' } });
      await r.wait(250);
      const startEnd = sc.chipCenter('hardware');
      const steps = 14;
      for (let i = 1; i <= steps; i++) {
        const x = from.x + ((startEnd.x + 70 - from.x) * i) / steps;
        const y = from.y + Math.sin((i / steps) * Math.PI) * 26;
        sc.moveCursor(x + 4, y + 4, 60);
        sc.set({ drag: { id: 'terminal', x, y, zone: x < sc.W / 2 - 140 ? 'start' : x > sc.W / 2 + 140 ? 'end' : 'center' } });
        await r.wait(60);
      }
      const done = clone(sections);
      done.start.push('terminal');
      sc.set({ sections: done, drag: null });
      this.say('cap.edit2');
      await r.wait(1400);
      const btn = sc.toolbarEl.querySelector('.zx-done');
      const bx = parseFloat(sc.toolbarEl.style.left) + btn.offsetLeft + btn.offsetWidth / 2;
      const by = parseFloat(sc.toolbarEl.style.top) + btn.offsetTop + btn.offsetHeight / 2;
      await this.to(r, bx, by, 800);
      sc.click();
      sc.set({ edit: false });
      await r.wait(900);
      sc.showCursor(false);
      sc.setFocus(null);
      await r.wait(800);
    }
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  Z.Demo = Demo;
  Z.MAIN_SECTIONS = MAIN_SECTIONS;
})();
