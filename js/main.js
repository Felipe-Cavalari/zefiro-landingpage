// Liga a página: idioma, demonstração, lista de itens, prévia de formato e tema e o link de download.
(function () {
  const Z = window.Z;
  const REPO = 'Felipe-Cavalari/zefiro';

  function applyText() {
    document.documentElement.lang = Z.lang === 'pt' ? 'pt-BR' : 'en';
    document.title = Z.t('meta.title');
    document.querySelector('meta[name="description"]').setAttribute('content', Z.t('meta.desc'));
    document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = Z.t(el.dataset.i18n)));
    document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', Z.t(el.dataset.i18nLabel)));
    document.querySelectorAll('.lang-opt').forEach((el) => el.classList.toggle('is-on', el.dataset.lang === Z.lang));
    renderItems();
    renderPickers();
  }

  // ---------- Itens ----------
  function renderItems() {
    const groups = Z.items();
    const icons = {
      clock: null, audio: 'volume', mic: 'mic', brightness: 'sun', notifications: 'bell', dnd: 'moon', power: 'power',
      claude: 'spark', codex: 'codex', vscode: 'code', terminal: 'terminal', chat: 'chat',
      island: 'music', player: 'play', weather: 'cloud', hardware: 'cpu',
    };
    for (const key of ['system', 'dev', 'island']) {
      const ul = document.querySelector(`[data-items="${key}"]`);
      ul.innerHTML = groups[key]
        .map(([id, name, desc]) => {
          const glyph = id === 'clock' ? '<span class="item-clock">18:52</span>' : Z.icon(icons[id]);
          return `<li><span class="item-chip">${glyph}</span><span class="item-t"><b>${name}</b><span>${desc}</span></span></li>`;
        })
        .join('');
    }
  }

  // ---------- Prévia ----------
  let preview;
  function renderPickers() {
    const fmt = document.querySelector('[data-picker="format"]');
    const th = document.querySelector('[data-picker="theme"]');
    const state = preview ? preview.state : { format: 'ilhas', theme: 'cobalto' };
    fmt.innerHTML = Z.FORMATS.map(
      (f) => `<button type="button" role="radio" aria-checked="${f === state.format}" data-v="${f}">${Z.t('fmt.' + f)}</button>`
    ).join('');
    th.innerHTML = Object.entries(Z.THEMES)
      .map(
        ([id, v]) =>
          `<button type="button" role="radio" aria-checked="${id === state.theme}" data-v="${id}"><span class="swatch" style="--sw-bg:${v.bg};--sw-tx:${v.text};--sw-ac:${v.accent || '#FF8A5B'}"></span>${v.name}</button>`
      )
      .join('');
  }

  function initPreview() {
    const view = document.querySelector('.preview-view');
    preview = new Z.Scene(view, {
      width: 1440,
      height: 340,
      maxVisibleNarrow: 620,
      anchorTop: true,
      interactive: true,
      state: {
        format: 'ilhas',
        theme: 'cobalto',
        island: 'media',
        playing: true,
        panel: 'claude',
        sections: { start: ['zefiro', 'weather'], center: ['island'], end: ['claude', 'codex', 'vscode', 'audio', 'notifications', 'clock', 'power'] },
      },
    });
    focusPreview();
    window.addEventListener('resize', focusPreview);
    document.querySelectorAll('[data-picker]').forEach((group) =>
      group.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        preview.set({ [group.dataset.picker]: b.dataset.v });
        group.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      })
    );
  }

  // Em tela estreita, a prévia acompanha a direita da barra, onde está o painel aberto.
  function focusPreview() {
    if (!preview) return;
    const narrow = window.innerWidth < 720;
    preview.setFocus(narrow ? { x: 820, y: 0, w: 620, h: 340 } : null);
  }

  // ---------- Download ----------
  async function resolveDownload() {
    const links = document.querySelectorAll('[data-download]');
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) return;
      const rel = await res.json();
      const asset = (rel.assets || []).find((a) => /setup\.exe$/i.test(a.name));
      if (asset) links.forEach((a) => (a.href = asset.browser_download_url));
      if (rel.tag_name) document.querySelectorAll('[data-version]').forEach((el) => (el.textContent = rel.tag_name));
    } catch (e) {
      // Sem rede ou sem API: os links continuam na página de versões.
    }
  }

  document.querySelectorAll('.lang-opt').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.lang !== Z.lang) Z.setLang(b.dataset.lang);
    })
  );
  document.addEventListener('zefiro:lang', applyText);

  applyText();
  Z.demo = new Z.Demo(document.querySelector('.stage'));
  initPreview();
  resolveDownload();
})();
