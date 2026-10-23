// Clone em HTML da barra do Zefiro: layout, formatos, temas, ilha, painéis e modo de edição.
// As medidas vêm de crates/ui/src/bar_layout.rs e crates/modules/island/src/view.rs.
(function () {
  const Z = (window.Z = window.Z || {});
  const t = (k) => Z.t(k);
  const icon = (n) => Z.icon(n);

  // Temas embutidos (crates/resources/themes/*.toml). `accent: null` é "auto": segue a capa.
  const THEMES = {
    obsidian: { name: 'Obsidian', bg: '#08080A', text: '#FFFFFF', text2: '#9B9BA5', border: '#1E1E22', accent: null },
    graphite: { name: 'Graphite', bg: '#1C1C1E', text: '#FFFFFF', text2: '#A8A8AE', border: '#323236', accent: null },
    slate: { name: 'Slate', bg: '#111721', text: '#E9EEF6', text2: '#92A2B8', border: '#232C3A', accent: null },
    nord: { name: 'Nord', bg: '#2E3440', text: '#ECEFF4', text2: '#A7B0C0', border: '#3B4252', accent: null },
    cobalto: { name: 'Cobalto', bg: '#0F1A2E', text: '#E8EEF9', text2: '#93A4C3', border: '#1E2B45', accent: '#3B82F6', acrylic: 0.55 },
    plum: { name: 'Plum', bg: '#16111C', text: '#F1EAF6', text2: '#AC9BB9', border: '#281F33', accent: null },
    evergreen: { name: 'Evergreen', bg: '#0C1512', text: '#E4F1EA', text2: '#8CAE9D', border: '#1A2A23', accent: null },
    espresso: { name: 'Espresso', bg: '#1A1512', text: '#F6EEE7', text2: '#B7A395', border: '#2E2420', accent: null },
    porcelain: { name: 'Porcelain', bg: '#F5F6F8', text: '#14161A', text2: '#5B6270', border: '#D8DBE1', accent: null },
  };
  const COVER_ACCENT = '#FF8A5B';

  // Altura completa de cada formato: faixa (band), topo e altura úteis, chip, pílula, ilha e respiro.
  const M = {
    faixa: { top: 0, h: 36, chip: 28, isl: 30, pad: 0, gap: 0 },
    pilulas: { top: 0, h: 36, chip: 26, pill: 30, isl: 30, pad: 2, gap: 0 },
    ilhas: { top: 0, h: 36, chip: 28, pill: 36, isl: 28, pad: 12, gap: 0 },
    fluent: { top: 0, h: 36, chip: 28, isl: 30, pad: 0, gap: 4 },
    vidro: { top: 6, h: 36, chip: 28, isl: 30, pad: 0, gap: 4 },
  };

  // Estados recolhidos da ilha, em px de projeto (escalam pela altura da barra: isl / 44).
  const DESIGN = {
    idle: { w: 118, h: 36 },
    media: { w: 150, h: 44 },
    peek: { w: 320, h: 44 },
    notify: { w: 320, h: 44 },
    osd: { w: 300, h: 54 },
  };
  const EXPANDED = { w: 380, h: 184 };
  const RESERVE_W = 380; // PEEK + 60

  const ctx = document.createElement('canvas').getContext('2d');
  const FONT = '"Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif';
  function textW(s, size = 13, weight = 500) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    return Math.ceil(ctx.measureText(s).width);
  }

  function clock() {
    const now = new Date();
    const loc = Z.lang === 'pt' ? 'pt-BR' : 'en-US';
    return {
      date: new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' }).format(now),
      time: new Intl.DateTimeFormat(loc, { hour: 'numeric', minute: '2-digit', hour12: Z.lang !== 'pt' }).format(now),
    };
  }

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  const WALLPAPER = `<svg viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="zx-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#14303D"/><stop offset=".42" stop-color="#2C6872"/>
        <stop offset=".74" stop-color="#D99B7A"/><stop offset="1" stop-color="#F0C39C"/>
      </linearGradient>
      <radialGradient id="zx-glow" cx=".72" cy=".64" r=".38">
        <stop offset="0" stop-color="#FFE1B8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE1B8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1440" height="810" fill="url(#zx-sky)"/>
    <rect width="1440" height="810" fill="url(#zx-glow)"/>
    <circle cx="1040" cy="530" r="52" fill="#FFE8CA" opacity=".92"/>
    <g class="zx-wind" fill="none" stroke="#fff" stroke-linecap="round">
      <path d="M90 300C300 250 520 340 780 286S1150 250 1330 300" stroke-opacity=".16" stroke-width="2"/>
      <path d="M220 380C420 340 600 410 860 372S1180 350 1400 392" stroke-opacity=".1" stroke-width="1.5"/>
      <path d="M40 220C240 196 420 240 620 214" stroke-opacity=".1" stroke-width="1.5"/>
    </g>
    <path d="M0 566C200 506 380 546 560 526C760 504 900 566 1080 546C1240 528 1360 506 1440 516V810H0Z" fill="#3D7C80"/>
    <path d="M0 626C180 596 340 646 540 626C760 604 920 656 1120 634C1270 618 1380 606 1440 612V810H0Z" fill="#235960"/>
    <path d="M0 706C240 676 420 726 660 706C900 686 1080 736 1300 714C1370 706 1420 702 1440 704V810H0Z" fill="#12363C"/>
  </svg>`;

  class Scene {
    constructor(view, opts = {}) {
      this.view = view;
      this.W = opts.width || 1440;
      this.H = opts.height || 810;
      this.maxVisibleNarrow = opts.maxVisibleNarrow || 460;
      this.anchorTop = !!opts.anchorTop;
      this.interactive = !!opts.interactive;
      this.onUserInput = opts.onUserInput || null;
      this.focus = null;
      this.state = Object.assign(
        {
          theme: 'obsidian',
          format: 'faixa',
          sections: { start: ['zefiro'], center: ['island'], end: ['clock'] },
          island: 'idle',
          tab: 'media',
          playing: false,
          progress: 0.34,
          osd: 64,
          lyric: 1,
          panel: null,
          hover: null,
          edit: false,
          drag: null,
          notif: 2,
          dnd: false,
          claude: 42,
          codex: 27,
          cpu: 12,
          volume: 64,
        },
        opts.state || {}
      );
      this.chips = {};
      this.groups = {};
      this.build();
      this.applyTheme();
      this.render();
      this.fit(true);
      if ('ResizeObserver' in window) new ResizeObserver(() => this.fit(true)).observe(view);
      document.addEventListener('zefiro:lang', () => this.relabel());
      setInterval(() => this.render(), 30000);
    }

    // ---------- Estrutura ----------
    build() {
      const screen = (this.screen = document.createElement('div'));
      screen.className = 'zx-screen';
      screen.style.width = this.W + 'px';
      screen.style.height = this.H + 'px';
      screen.innerHTML = `
        <div class="zx-wall">${WALLPAPER}</div>
        <div class="zx-band"></div>
        <div class="zx-groups"></div>
        <div class="zx-zones"></div>
        <div class="zx-chips"></div>
        <div class="zx-island"><div class="zx-island-in"></div></div>
        <div class="zx-panel"><div class="zx-panel-in"></div></div>
        <div class="zx-toolbar"></div>
        <div class="zx-cursor">${this.cursorSvg()}<span class="zx-ripple"></span></div>`;
      this.view.appendChild(screen);
      this.band = screen.querySelector('.zx-band');
      this.groupsEl = screen.querySelector('.zx-groups');
      this.zonesEl = screen.querySelector('.zx-zones');
      this.chipsEl = screen.querySelector('.zx-chips');
      this.islandEl = screen.querySelector('.zx-island');
      this.islandIn = screen.querySelector('.zx-island-in');
      this.panelEl = screen.querySelector('.zx-panel');
      this.panelIn = screen.querySelector('.zx-panel-in');
      this.toolbarEl = screen.querySelector('.zx-toolbar');
      this.cursorEl = screen.querySelector('.zx-cursor');
      this.cursor = { x: this.W * 0.62, y: this.H * 0.55 };
      this.cursorEl.style.transform = `translate(${this.cursor.x}px, ${this.cursor.y}px)`;
      this.buildIsland();
      this.buildToolbar();

      screen.addEventListener('click', (e) => {
        if (!this.interactive) return;
        const chip = e.target.closest('.zx-chip');
        const island = e.target.closest('.zx-island');
        const panel = e.target.closest('.zx-panel');
        const tab = e.target.closest('[data-tab]');
        if (tab) {
          this.set({ tab: tab.dataset.tab });
          return;
        }
        if (e.target.closest('.zx-done')) {
          this.set({ edit: false });
          return;
        }
        if (e.target.closest('.zx-edit-item')) {
          this.set({ panel: null, edit: true });
          return;
        }
        if (panel || e.target.closest('.zx-toolbar')) return;
        if (island) {
          this.set({ island: this.state.island === 'expanded' ? (this.state.playing ? 'media' : 'idle') : 'expanded', panel: null });
          return;
        }
        if (chip) {
          const id = chip.dataset.id;
          if (id === 'island') return;
          if (id === 'dnd') {
            this.set({ dnd: !this.state.dnd });
            return;
          }
          this.set({ panel: this.state.panel === id ? null : id, island: this.state.island === 'expanded' ? 'media' : this.state.island });
          return;
        }
        this.set({ panel: null, island: this.state.island === 'expanded' ? 'media' : this.state.island });
      });
      screen.addEventListener('pointerover', (e) => {
        if (!this.interactive) return;
        const chip = e.target.closest('.zx-chip');
        const id = chip ? chip.dataset.id : null;
        if (id !== this.state.hover) this.set({ hover: id });
      });
      screen.addEventListener('pointerleave', () => this.interactive && this.set({ hover: null }));
      screen.addEventListener('pointerdown', () => this.onUserInput && this.onUserInput());
    }

    cursorSvg() {
      return '<svg viewBox="0 0 20 24" width="20" height="24" aria-hidden="true"><path d="M2 1.5v18.2l4.6-4.3 3 6.9 3.1-1.4-3-6.8h6.4z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    }

    // ---------- Câmera ----------
    setFocus(rect) {
      this.focus = rect;
      this.fit(false);
    }

    fit(instant) {
      const W = this.view.clientWidth;
      const H = this.view.clientHeight;
      if (!W || !H) return;
      const f = this.focus || { x: 0, y: 0, w: this.W, h: this.H };
      let s = Math.min(W / f.w, H / f.h);
      s = Math.max(s, W / this.W, H / this.H);
      if (window.innerWidth < 720) s = Math.max(s, W / this.maxVisibleNarrow);
      const cx = f.x + f.w / 2;
      const cy = f.y + f.h / 2;
      const tx = Math.min(0, Math.max(W - this.W * s, W / 2 - cx * s));
      const ty = this.anchorTop ? 0 : Math.min(0, Math.max(H - this.H * s, H / 2 - cy * s));
      this.screen.style.transition = instant || Z.reduced ? 'none' : 'transform 1100ms cubic-bezier(.65, 0, .25, 1)';
      this.screen.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    }

    // ---------- Tema ----------
    applyTheme() {
      const th = THEMES[this.state.theme];
      const st = this.screen.style;
      const accent = th.accent || COVER_ACCENT;
      st.setProperty('--z-bg', th.bg);
      st.setProperty('--z-bg-rgb', hexToRgb(th.bg));
      st.setProperty('--z-alpha', th.acrylic ? th.acrylic : 0.96);
      st.setProperty('--z-text', th.text);
      st.setProperty('--z-text-rgb', hexToRgb(th.text));
      st.setProperty('--z-text2', th.text2);
      st.setProperty('--z-border', th.border);
      st.setProperty('--z-accent', accent);
      st.setProperty('--z-accent-rgb', hexToRgb(accent));
      this.screen.classList.toggle('is-acrylic', !!th.acrylic);
      this.screen.classList.toggle('is-light', this.state.theme === 'porcelain');
    }

    // ---------- Estado ----------
    set(patch) {
      const prev = this.state;
      this.state = Object.assign({}, prev, patch);
      if (patch.theme && patch.theme !== prev.theme) this.applyTheme();
      this.render(prev);
    }

    k() {
      return M[this.state.format].isl / 44;
    }

    chipInfo(id) {
      const s = this.state;
      switch (id) {
        case 'zefiro':
          return { icon: 'logo', text: 'Zefiro' };
        case 'clock': {
          const c = clock();
          return { clock: c };
        }
        case 'claude':
          return { icon: 'spark', text: `${s.claude}%`, reserve: '100%' };
        case 'codex':
          return { icon: 'codex', text: `${s.codex}%`, reserve: '100%' };
        case 'hardware':
          return { icon: 'cpu', text: `${s.cpu}%`, reserve: '100%' };
        case 'weather':
          return { icon: 'cloud', text: '23°' };
        case 'notifications':
          return { icon: 'bell', text: String(s.notif) };
        case 'island':
          return { island: true };
        default:
          return {
            icon: { audio: 'volume', mic: 'mic', brightness: 'sun', vscode: 'code', terminal: 'terminal', chat: 'chat', power: 'power', dnd: 'moon', player: 'music' }[id],
          };
      }
    }

    chipWidth(id) {
      const i = this.chipInfo(id);
      if (i.island) return Math.round(RESERVE_W * this.k());
      if (i.clock) return 10 + textW(i.clock.date) + 8 + textW(i.clock.time, 13, 600) + 10;
      if (!i.text) return 34;
      return 10 + (i.icon ? 22 : 0) + textW(i.reserve || i.text) + 10;
    }

    chipHtml(id) {
      const i = this.chipInfo(id);
      if (i.island) return '';
      if (i.clock) return `<span>${i.clock.date}</span><span class="zx-time">${i.clock.time}</span>`;
      return `${i.icon ? icon(i.icon) : ''}${i.text ? `<span>${i.text}</span>` : ''}`;
    }

    layout() {
      const s = this.state;
      const f = s.format;
      const m = M[f];
      const W = this.W;
      const chipY = m.top + (m.h - m.chip) / 2;
      const inset = f === 'vidro' ? 16 : 8;
      const rects = {};
      const groups = {};
      const total = (ids) => ids.reduce((a, id) => a + this.chipWidth(id), 0) + m.gap * Math.max(0, ids.length - 1);
      const place = (ids, x0) => {
        let x = x0;
        for (const id of ids) {
          const w = this.chipWidth(id);
          rects[id] = { x, y: chipY, w, h: m.chip };
          x += w + m.gap;
        }
      };
      const sec = s.sections;
      place(sec.start, inset + m.pad);
      place(sec.end, W - inset - m.pad - total(sec.end));
      place(sec.center, Math.round((W - total(sec.center)) / 2));
      for (const key of ['start', 'center', 'end']) {
        const ids = sec[key];
        if (!ids.length) continue;
        const a = rects[ids[0]];
        const b = rects[ids[ids.length - 1]];
        groups[key] = { x: a.x - m.pad, w: b.x + b.w - a.x + 2 * m.pad, islandOnly: ids.length === 1 && ids[0] === 'island' };
      }
      return { m, f, rects, groups, chipY, inset, barBottom: m.top + m.h };
    }

    // ---------- Desenho ----------
    render(prev) {
      const s = this.state;
      const L = (this.L = this.layout());
      const { m, f } = L;
      const W = this.W;
      this.screen.dataset.format = f;
      this.screen.classList.toggle('is-edit', s.edit);

      // Faixa (no Ilhas vira o trilho; no Vidro, a barra flutuante).
      const band = {
        faixa: [0, 0, W, 36, 0, 1],
        fluent: [0, 0, W, 36, 0, 1],
        pilulas: [0, 0, W, 36, 0, 0],
        ilhas: [0, 0, W, 4, 0, 1],
        vidro: [8, 6, W - 16, 36, 14, 1],
      }[f];
      this.place(this.band, { x: band[0], y: band[1], w: band[2], h: band[3], r: band[4] }, 'settle');
      this.band.style.opacity = band[5];

      // Grupos por seção (pílulas e ilhas).
      for (const key of ['start', 'center', 'end']) {
        let g = this.groups[key];
        if (!g) {
          g = this.groups[key] = document.createElement('div');
          g.className = 'zx-group';
          this.groupsEl.appendChild(g);
        }
        const gr = L.groups[key];
        if (!gr) {
          g.style.opacity = 0;
          continue;
        }
        let y = m.top;
        let h = m.h;
        let r = 0;
        let op = 0;
        if (f === 'pilulas') {
          h = m.pill;
          y = m.top + (m.h - h) / 2;
          r = h / 2;
          op = gr.islandOnly ? 0 : 1;
        } else if (f === 'ilhas') {
          y = -16;
          h = 36 + 16;
          r = 16;
          op = gr.islandOnly ? 0 : 1;
        }
        this.place(g, { x: gr.x, y, w: gr.w, h, r }, 'settle');
        g.style.opacity = op;
      }

      // Chips.
      const seen = new Set();
      for (const id of Object.keys(L.rects)) {
        seen.add(id);
        let el = this.chips[id];
        const fresh = !el;
        if (fresh) {
          el = this.chips[id] = document.createElement('div');
          el.className = 'zx-chip';
          el.dataset.id = id;
          el.innerHTML = '<span class="zx-chip-bg"></span><span class="zx-chip-c"></span>';
          this.chipsEl.appendChild(el);
        }
        el.querySelector('.zx-chip-c').innerHTML = this.chipHtml(id);
        el.classList.toggle('is-island', id === 'island');
        el.classList.toggle('is-hover', s.hover === id || s.panel === id);
        el.classList.toggle('is-on', id === 'dnd' && s.dnd);
        const r = L.rects[id];
        this.place(el, { x: r.x, y: r.y, w: r.w, h: r.h, r: f === 'fluent' ? 6 : f === 'vidro' ? 10 : r.h / 2 }, 'settle', fresh);
        el.style.opacity = 1;
      }
      for (const id of Object.keys(this.chips)) {
        const el = this.chips[id];
        el.classList.toggle('is-dragging', !!(s.drag && s.drag.id === id));
        if (s.drag && s.drag.id === id) {
          el.style.transition = 'none';
          el.style.left = s.drag.x - el.offsetWidth / 2 + 'px';
          el.style.top = s.drag.y - el.offsetHeight / 2 + 'px';
          el.style.opacity = 1;
        } else if (!seen.has(id)) {
          el.style.opacity = 0;
        }
      }

      this.renderIsland(prev);
      this.renderPanel(prev);
      this.renderEdit();
    }

    place(el, r, spring, instant) {
      el.style.transition = instant
        ? 'none'
        : Z.transition(spring, ['left', 'top', 'width', 'height', 'border-radius', 'opacity']) + ', background-color 450ms ease, border-color 450ms ease, color 450ms ease';
      el.style.left = r.x + 'px';
      el.style.top = r.y + 'px';
      el.style.width = r.w + 'px';
      el.style.height = r.h + 'px';
      el.style.borderRadius = r.r + 'px';
    }

    // ---------- Ilha ----------
    buildIsland() {
      const eq = '<span class="zx-eq"><i></i><i></i><i></i><i></i><i></i></span>';
      const cover = '<span class="zx-cover"></span>';
      const tabs = ['media', 'weather', 'hardware', 'lyrics']
        .map((k, i) => `<button type="button" class="zx-tab" data-tab="${k}">${icon(['music', 'cloud', 'cpu', 'lyrics'][i])}<span data-d="tab-${k}"></span></button>`)
        .join('');
      this.islandIn.innerHTML = `
        <div class="zx-l zx-l-idle" style="width:${DESIGN.idle.w}px;height:${DESIGN.idle.h}px">${icon('cloud')}<span>23°</span></div>
        <div class="zx-l zx-l-media" style="width:${DESIGN.media.w}px;height:${DESIGN.media.h}px">${cover}${eq}</div>
        <div class="zx-l zx-l-peek" style="width:${DESIGN.peek.w}px;height:${DESIGN.peek.h}px">${cover}<span class="zx-peek-t"><b data-d="song"></b><span data-d="artist"></span></span>${eq}</div>
        <div class="zx-l zx-l-notify" style="width:${DESIGN.notify.w}px;height:${DESIGN.notify.h}px"><span class="zx-badge">${icon('bell')}</span><span class="zx-peek-t"><b data-d="reminder"></b><span data-d="reminderText"></span></span></div>
        <div class="zx-l zx-l-osd" style="width:${DESIGN.osd.w}px;height:${DESIGN.osd.h}px">${icon('volume')}<span class="zx-osd-track"><span class="zx-osd-fill"></span></span><span class="zx-osd-v"></span></div>
        <div class="zx-l zx-l-expanded" style="width:${EXPANDED.w}px;height:${EXPANDED.h}px">
          <div class="zx-tabs">${tabs}</div>
          <div class="zx-pages">
            <div class="zx-page" data-page="media">
              <span class="zx-cover zx-cover-lg"></span>
              <div class="zx-media-info"><b data-d="song"></b><span data-d="artist"></span>
                <div class="zx-progress"><span class="zx-progress-fill"></span></div>
                <div class="zx-times"><span class="zx-t-now">1:12</span><span>3:28</span></div>
              </div>
              <div class="zx-controls">${icon('prev')}<span class="zx-play"></span>${icon('next')}</div>
            </div>
            <div class="zx-page" data-page="weather">
              <div class="zx-w-now">${icon('sun')}<b>23°</b><span><span data-d="city"></span><span data-d="sunny"></span></span></div>
              <div class="zx-w-days"></div>
            </div>
            <div class="zx-page" data-page="hardware"><div class="zx-hw"></div></div>
            <div class="zx-page" data-page="lyrics"><div class="zx-lyrics"></div></div>
          </div>
        </div>`;
      this.relabelIsland();
    }

    relabelIsland() {
      this.islandIn.querySelectorAll('[data-d]').forEach((el) => {
        const key = el.dataset.d;
        el.textContent = key.startsWith('tab-') ? t('d.tab' + key[4].toUpperCase() + key.slice(5)) : t('d.' + key);
      });
      const days = t('d.days');
      const temps = [[25, 16], [27, 17], [22, 15], [19, 13], [24, 15]];
      const ico = ['sun', 'sun', 'cloud', 'cloud', 'sun'];
      this.islandIn.querySelector('.zx-w-days').innerHTML = days
        .map((d, i) => `<span><small>${d}</small>${icon(ico[i])}<b>${temps[i][0]}°</b><small>${temps[i][1]}°</small></span>`)
        .join('');
      const hw = [['CPU', 12], ['GPU', 8], ['RAM', 41], [t('d.disk'), 3]];
      this.islandIn.querySelector('.zx-hw').innerHTML = hw
        .map(([n, v]) => `<div class="zx-hw-row"><span>${n}</span><span class="zx-meter"><i style="width:${v}%"></i></span><b>${v}%</b></div>`)
        .join('');
      this.islandIn.querySelector('.zx-lyrics').innerHTML = t('d.lyrics').map((l) => `<p>${l}</p>`).join('');
    }

    islandRect() {
      const L = this.L;
      const c = L.rects.island;
      if (!c) return null;
      const s = this.state;
      const cx = c.x + c.w / 2;
      const top = L.m.top + (L.m.h - L.m.isl) / 2;
      if (s.island === 'expanded') return { x: cx - EXPANDED.w / 2, y: top, w: EXPANDED.w, h: EXPANDED.h, r: 28 };
      const k = this.k();
      const d = DESIGN[s.island];
      const w = d.w * k;
      const h = d.h * k;
      const y = s.island === 'idle' ? top + (L.m.isl - h) / 2 : top;
      return { x: cx - w / 2, y, w, h, r: h / 2 };
    }

    renderIsland(prev) {
      const s = this.state;
      const r = this.islandRect();
      const el = this.islandEl;
      if (!r) {
        el.style.opacity = 0;
        return;
      }
      el.style.opacity = 1;
      const was = this.islandArea || 0;
      const area = r.w * r.h;
      this.place(el, r, area > was ? 'grow' : area < was ? 'shrink' : 'settle', !prev);
      this.islandArea = area;
      el.dataset.mode = s.island;
      el.classList.toggle('is-playing', s.playing);
      const k = s.island === 'expanded' ? 1 : this.k();
      this.islandIn.style.setProperty('--k', k);
      this.islandIn.querySelectorAll('.zx-l').forEach((l) => l.classList.toggle('is-on', l.classList.contains('zx-l-' + s.island)));
      this.islandIn.querySelector('.zx-osd-fill').style.width = s.osd + '%';
      this.islandIn.querySelector('.zx-osd-v').textContent = s.osd;
      this.islandIn.querySelector('.zx-progress-fill').style.width = s.progress * 100 + '%';
      const secs = Math.round(s.progress * 208);
      this.islandIn.querySelector('.zx-t-now').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
      this.islandIn.querySelector('.zx-play').innerHTML = icon(s.playing ? 'pause' : 'play');
      this.islandIn.querySelectorAll('.zx-tab').forEach((b) => b.classList.toggle('is-on', b.dataset.tab === s.tab));
      const order = ['media', 'weather', 'hardware', 'lyrics'];
      const ti = order.indexOf(s.tab);
      const tabSpring = Z.transition('tab', ['transform', 'opacity']);
      this.islandIn.querySelectorAll('.zx-page').forEach((p) => {
        const d = order.indexOf(p.dataset.page) - ti;
        p.style.transition = tabSpring;
        p.style.opacity = d === 0 ? 1 : 0;
        p.style.transform = d === 0 ? 'none' : `translateX(${Math.sign(d) * 34}px) scale(.965)`;
        p.style.pointerEvents = d === 0 ? 'auto' : 'none';
      });
      const lines = this.islandIn.querySelectorAll('.zx-lyrics p');
      lines.forEach((p, i) => p.classList.toggle('is-on', i === s.lyric));
      this.islandIn.querySelector('.zx-lyrics').style.transform = `translateY(${-s.lyric * 26 + 40}px)`;
    }

    // ---------- Painéis ----------
    panelTarget(id, spec) {
      const L = this.L;
      const c = L.rects[id];
      const x = Math.min(this.W - 8 - spec.w, Math.max(8, c.x + c.w / 2 - spec.w / 2));
      return { x, y: L.barBottom + 6, w: spec.w, h: spec.h, r: 24 };
    }

    renderPanel(prev) {
      const s = this.state;
      const el = this.panelEl;
      const id = s.panel;
      const L = this.L;
      const openId = this.panelOpen;
      const changed = !prev || prev.panel !== id || prev.theme !== s.theme || prev.format !== s.format || prev.volume !== s.volume || prev.notif !== s.notif || this.relabeled;
      if (!id || !L.rects[id]) {
        if (openId && L.rects[openId]) {
          const c = L.rects[openId];
          this.place(el, { x: c.x, y: c.y, w: c.w, h: c.h, r: c.h / 2 }, 'shrink');
          this.panelIn.style.transition = 'opacity 90ms ease';
          this.panelIn.style.opacity = 0;
          el.style.opacity = 0;
          el.style.transition += ', opacity 160ms ease ' + Math.max(0, Z.spring('shrink').ms - 200) + 'ms';
        } else {
          el.style.opacity = 0;
        }
        this.panelOpen = null;
        return;
      }
      if (!changed && openId === id) return;
      const spec = Z.panels[id](this);
      const target = this.panelTarget(id, spec);
      if (!openId) {
        const c = L.rects[id];
        this.place(el, { x: c.x, y: c.y, w: c.w, h: c.h, r: c.h / 2 }, 'grow', true);
        el.style.opacity = 1;
        void el.offsetWidth;
      }
      if (openId !== id || !openId) {
        this.panelIn.style.transition = 'none';
        this.panelIn.style.opacity = 0;
        void this.panelIn.offsetWidth;
      }
      this.panelIn.style.width = spec.w + 'px';
      this.panelIn.innerHTML = spec.html;
      this.place(el, target, 'grow');
      el.style.opacity = 1;
      const g = Z.spring('grow').ms;
      this.panelIn.style.transition = `opacity 180ms ease ${Math.round(g * 0.45)}ms`;
      this.panelIn.style.opacity = 1;
      this.panelOpen = id;
      this.panelRect = target;
    }

    // ---------- Modo de edição ----------
    buildToolbar() {
      this.toolbarEl.innerHTML = `${icon('pencil')}<span data-t="d.editHint"></span><button type="button" class="zx-done" data-t="d.done"></button>`;
      this.relabelToolbar();
    }

    relabelToolbar() {
      this.toolbarEl.querySelectorAll('[data-t]').forEach((el) => (el.textContent = t(el.dataset.t)));
    }

    renderEdit() {
      const s = this.state;
      const L = this.L;
      const m = L.m;
      if (!this.zones) {
        this.zones = ['start', 'center', 'end'].map((k) => {
          const z = document.createElement('div');
          z.className = 'zx-zone';
          z.dataset.zone = k;
          this.zonesEl.appendChild(z);
          return z;
        });
      }
      const reserve = Math.round(RESERVE_W * this.k());
      const cx = this.W / 2;
      const spans = [
        [L.inset, cx - reserve / 2 - 10],
        [cx - reserve / 2, cx + reserve / 2],
        [cx + reserve / 2 + 10, this.W - L.inset],
      ];
      this.zones.forEach((z, i) => {
        z.style.left = spans[i][0] + 'px';
        z.style.width = spans[i][1] - spans[i][0] + 'px';
        z.style.top = m.top + 2 + 'px';
        z.style.height = m.h - 4 + 'px';
        z.classList.toggle('is-target', !!(s.drag && s.drag.zone === z.dataset.zone));
      });
      const tw = 300;
      this.toolbarEl.style.left = this.W / 2 - tw / 2 + 'px';
      this.toolbarEl.style.top = L.barBottom + 12 + 'px';
      this.toolbarEl.style.width = tw + 'px';
    }

    // ---------- Cursor ----------
    moveCursor(x, y, ms = 700) {
      this.cursor = { x, y };
      this.cursorEl.style.transition = Z.reduced ? 'none' : `transform ${ms}ms cubic-bezier(.45, 0, .2, 1), opacity 300ms ease`;
      this.cursorEl.style.transform = `translate(${x}px, ${y}px)`;
    }

    showCursor(on) {
      this.cursorEl.style.opacity = on ? 1 : 0;
    }

    click() {
      this.cursorEl.classList.remove('is-click');
      void this.cursorEl.offsetWidth;
      this.cursorEl.classList.add('is-click');
    }

    chipCenter(id) {
      const r = this.L.rects[id];
      return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : { x: this.W / 2, y: 18 };
    }

    // ---------- Idioma ----------
    relabel() {
      this.relabelIsland();
      this.relabelToolbar();
      this.relabeled = true;
      this.render(this.state);
      this.relabeled = false;
    }
  }

  Z.Scene = Scene;
  Z.THEMES = THEMES;
  Z.FORMATS = ['faixa', 'pilulas', 'ilhas', 'fluent', 'vidro'];
})();
