// Conteúdo dos painéis que nascem dos chips (crates/modules/bar/src/*.rs), em versão de vitrine.
(function () {
  const Z = (window.Z = window.Z || {});
  const t = (k) => Z.t(k);
  const icon = (n) => Z.icon(n);

  const slider = (v) => `<span class="zx-slider"><span class="zx-slider-fill" style="width:${v}%"></span><span class="zx-knob" style="left:${v}%"></span></span>`;
  const head = (title, extra = '') => `<div class="zx-p-head"><b>${title}</b>${extra}</div>`;
  const row = (ic, label, right = '', cls = '') => `<div class="zx-row ${cls}">${ic ? icon(ic) : ''}<span class="zx-row-l">${label}</span>${right}</div>`;
  const meter = (label, v, note) =>
    `<div class="zx-use"><div class="zx-use-top"><span>${label}</span><b>${v}%</b></div><span class="zx-meter"><i style="width:${v}%"></i></span><small>${note}</small></div>`;

  function calendar() {
    const now = new Date();
    const loc = Z.lang === 'pt' ? 'pt-BR' : 'en-US';
    const month = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(now);
    const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const names = Z.lang === 'pt' ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    let cells = names.map((n) => `<span class="zx-cal-n">${n}</span>`).join('');
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) cells += `<span class="${d === now.getDate() ? 'is-today' : ''}">${d}</span>`;
    const weeks = Math.ceil((first + days) / 7);
    const full = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
    return { w: 300, h: 110 + weeks * 30, html: `${head(month.charAt(0).toUpperCase() + month.slice(1))}<p class="zx-sub">${full}</p><div class="zx-cal">${cells}</div>` };
  }

  Z.panels = {
    audio: (sc) => ({
      w: 320,
      h: 246,
      html:
        head(t('d.sound'), `<span class="zx-p-v">${sc.state.volume}%</span>`) +
        `<div class="zx-row">${icon('volume')}${slider(sc.state.volume)}</div>` +
        `<p class="zx-label">${t('d.output')}</p>` +
        row('headphones', t('d.headphones'), icon('check'), 'is-sel') +
        row('speaker', t('d.speakers')) +
        `<p class="zx-label">${t('d.apps')}</p>` +
        `<div class="zx-row"><span class="zx-app" style="background:#1DB954"></span><span class="zx-row-l">Spotify</span>${slider(80)}</div>`,
    }),
    mic: () => ({
      w: 300,
      h: 136,
      html: head(t('d.mic'), '<span class="zx-p-v">72%</span>') + `<div class="zx-row">${icon('mic')}${slider(72)}</div>` + row('headphones', t('d.micDevice'), icon('check'), 'is-sel'),
    }),
    brightness: () => ({
      w: 300,
      h: 150,
      html:
        head(t('d.brightness')) +
        `<p class="zx-label">${t('d.monitorA')}</p><div class="zx-row">${icon('sun')}${slider(70)}<span class="zx-p-v">70</span></div>` +
        `<p class="zx-label">${t('d.monitorB')}</p><div class="zx-row">${icon('sun')}${slider(55)}<span class="zx-p-v">55</span></div>`,
    }),
    claude: (sc) => ({
      w: 340,
      h: 196,
      html:
        head('Claude <span class="zx-dim">Max</span>', `<span class="zx-iconbtn">${icon('restart')}</span>`) +
        `<p class="zx-sub">Windows</p>` +
        meter(t('d.session'), sc.state.claude, `${t('d.renews')} 2 h 10 min`) +
        meter(t('d.week'), 18, `${t('d.renewsDay')} ${Z.lang === 'pt' ? 'qua., 9h' : 'Wed, 9 AM'}`),
    }),
    codex: (sc) => ({
      w: 340,
      h: 196,
      html:
        head('Codex <span class="zx-dim">Plus</span>', `<span class="zx-iconbtn">${icon('restart')}</span>`) +
        `<p class="zx-sub">WSL (Ubuntu-24.04)</p>` +
        meter(t('d.codexPrimary'), sc.state.codex, `${t('d.renews')} 3 h 40 min`) +
        meter(t('d.codexWeekly'), 9, `${t('d.renewsDay')} ${Z.lang === 'pt' ? 'seg., 14h' : 'Mon, 2 PM'}`),
    }),
    clock: calendar,
    vscode: () => ({
      w: 320,
      h: 252,
      html:
        head(t('d.recent')) +
        `<div class="zx-search">${icon('search')}<span>${t('d.searchProjects')}</span></div>` +
        ['zefiro', 'zefiro-landingpage', 'dotfiles', 'api-pagamentos', 'blog'].map((p, i) => row('folder', p, `<small class="zx-dim">${['~/Projects', '~/Projects', '~', 'WSL', '~/Projects'][i]}</small>`)).join(''),
    }),
    terminal: () => ({
      w: 300,
      h: 214,
      html:
        head(t('d.profiles'), `<span class="zx-iconbtn">${icon('pencil')}</span>`) +
        ['PowerShell', 'Ubuntu-24.04', 'Git Bash', 'Developer PowerShell for VS 2022'].map((p) => row('terminal', p)).join(''),
    }),
    chat: () => ({
      w: 360,
      h: 250,
      html:
        head('Claude', `<span class="zx-dim">Sonnet</span>`) +
        `<div class="zx-chat"><p class="zx-bubble is-me">${t('d.chatQ')}</p><p class="zx-bubble">${t('d.chatA')}</p></div>` +
        `<div class="zx-search zx-input"><span>${t('d.chatAsk')}</span>${icon('send')}</div>`,
    }),
    notifications: (sc) => ({
      w: 320,
      h: 196,
      html:
        head(`${t('d.notifications')} <span class="zx-dim">${sc.state.notif}</span>`, `<span class="zx-link">${t('d.clear')}</span>`) +
        `<div class="zx-note"><span class="zx-app" style="background:#24292F"></span><span><b>${t('d.n1t')}</b><small>${t('d.n1b')}</small></span></div>` +
        `<div class="zx-note"><span class="zx-app" style="background:#0F6CBD"></span><span><b>${t('d.n2t')}</b><small>${t('d.n2b')}</small></span></div>`,
    }),
    power: () => ({
      w: 220,
      h: 222,
      html:
        row('lock', t('d.lock')) +
        row('moon', t('d.sleep')) +
        row('signout', t('d.signout')) +
        row('restart', t('d.restart')) +
        row('power', t('d.shutdown')),
    }),
    zefiro: () => ({
      w: 240,
      h: 188,
      html:
        `<div class="zx-p-head zx-brand">${icon('logo')}<b>Zefiro</b><span class="zx-dim">1.3.2</span></div>` +
        row('palette', t('d.themes')) +
        row('pencil', t('d.editBar'), '', 'zx-edit-item') +
        row('gear', t('d.settings')) +
        row('signout', t('d.quit')),
    }),
    weather: () => ({
      w: 300,
      h: 150,
      html:
        `<div class="zx-w-now">${icon('sun')}<b>23°</b><span><span>${t('d.city')}</span><span>${t('d.sunny')}</span></span></div>` +
        `<div class="zx-w-days">${t('d.days')
          .map((d, i) => `<span><small>${d}</small>${icon(i === 2 || i === 3 ? 'cloud' : 'sun')}<b>${[25, 27, 22, 19, 24][i]}°</b></span>`)
          .join('')}</div>`,
    }),
    hardware: () => ({
      w: 300,
      h: 160,
      html:
        head(Z.lang === 'pt' ? 'Monitor do PC' : 'PC monitor') +
        [['CPU', 12], ['GPU', 8], ['RAM', 41], [t('d.disk'), 3]].map(([n, v]) => `<div class="zx-hw-row"><span>${n}</span><span class="zx-meter"><i style="width:${v}%"></i></span><b>${v}%</b></div>`).join(''),
    }),
  };
})();
