// Ícones de traço em 16 × 16, no espírito do Segoe Fluent Icons que a barra usa no Windows.
(function () {
  const Z = (window.Z = window.Z || {});

  const P = {
    volume: '<path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.8a6 6 0 0 1 0 8.4"/>',
    mic: '<rect x="5.75" y="1.75" width="4.5" height="8" rx="2.25"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.25"/>',
    sun: '<circle cx="8" cy="8" r="2.75"/><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06"/>',
    spark: '<path d="M8 1.75v12.5M2.6 4.9l10.8 6.2M2.6 11.1l10.8-6.2"/>',
    codex: '<path d="M8 1.75l5.4 3.12v6.26L8 14.25l-5.4-3.12V4.87z"/><path d="M6.3 6.4L4.9 8l1.4 1.6M9.7 6.4L11.1 8 9.7 9.6"/>',
    code: '<path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5M9 2.75l-2 10.5"/>',
    cube: '<path d="M8 1.75l5.4 3.12v6.26L8 14.25l-5.4-3.12V4.87z"/><path d="M2.6 4.87L8 8l5.4-3.13M8 8v6.25"/>',
    braces: '<path d="M6 2.5C4.4 2.5 4.25 3.5 4.25 4.75v1.1c0 1-.6 2.15-1.75 2.15 1.15 0 1.75 1.15 1.75 2.15v1.1c0 1.25.15 2.25 1.75 2.25M10 2.5c1.6 0 1.75 1 1.75 2.25v1.1c0 1 .6 2.15 1.75 2.15-1.15 0-1.75 1.15-1.75 2.15v1.1c0 1.25-.15 2.25-1.75 2.25"/>',
    tray: '<path d="M3.5 10L8 5.5l4.5 4.5"/><path d="M4 13.25h.01M8 13.25h.01M12 13.25h.01" stroke-width="2"/>',
    grok: '<circle cx="8" cy="8" r="5.75"/><path d="M5 11l6-6"/>',
    usage: '<path d="M3 13V8.5M8 13V3M13 13V6"/>',
    terminal: '<rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2"/><path d="M4.5 6.25L6.5 8l-2 1.75M8 10h3.5"/>',
    chat: '<path d="M3.75 2.25h8.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H6.5l-3 2.5v-2.5a1.25 1.25 0 0 1-1.25-1.25v-6.25a1.5 1.5 0 0 1 1.5-1.5z"/>',
    bell: '<path d="M4 11.25V7a4 4 0 0 1 8 0v4.25l1.25 1.25H2.75z"/><path d="M6.5 13.75a1.6 1.6 0 0 0 3 0"/>',
    moon: '<path d="M12.75 10.25a5.5 5.5 0 0 1-7-7 5.5 5.5 0 1 0 7 7z"/>',
    power: '<path d="M8 1.75v6"/><path d="M4.6 4.1a5 5 0 1 0 6.8 0"/>',
    cloud: '<path d="M5.4 4.6a2.6 2.6 0 0 1 4.3-1"/><path d="M4.6 13h6.9a2.5 2.5 0 0 0 .3-5A3.5 3.5 0 0 0 5.1 7.4 2.8 2.8 0 0 0 4.6 13z"/>',
    cpu: '<rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M6 1.75V4M10 1.75V4M6 12v2.25M10 12v2.25M1.75 6H4M1.75 10H4M12 6h2.25M12 10h2.25"/>',
    play: '<path d="M5 3.2v9.6L12.5 8z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M5.25 3.5v9M10.75 3.5v9" stroke-width="2.3"/>',
    prev: '<path d="M12.5 3.5v9L6 8z" fill="currentColor" stroke="none"/><path d="M4 3.5v9" stroke-width="1.9"/>',
    next: '<path d="M3.5 3.5v9L10 8z" fill="currentColor" stroke="none"/><path d="M12 3.5v9" stroke-width="1.9"/>',
    check: '<path d="M3 8.5l3 3 7-7"/>',
    search: '<circle cx="7" cy="7" r="4.25"/><path d="M10.25 10.25L14 14"/>',
    lock: '<rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/>',
    signout: '<path d="M6.5 2.75H3.75v10.5H6.5M10 5l3 3-3 3M13 8H6"/>',
    restart: '<path d="M13 8a5 5 0 1 1-1.6-3.67"/><path d="M13 2.5v3h-3"/>',
    folder: '<path d="M1.75 4.25a1.5 1.5 0 0 1 1.5-1.5h3l1.5 1.5h5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5z"/>',
    headphones: '<path d="M2.5 10V8a5.5 5.5 0 0 1 11 0v2"/><rect x="2" y="9.5" width="3" height="4.5" rx="1"/><rect x="11" y="9.5" width="3" height="4.5" rx="1"/>',
    speaker: '<rect x="4" y="1.75" width="8" height="12.5" rx="1.5"/><circle cx="8" cy="9.5" r="2"/><path d="M8 4.5h.01"/>',
    monitor: '<rect x="1.75" y="2.5" width="12.5" height="8.5" rx="1.5"/><path d="M6 14h4M8 11v3"/>',
    palette: '<path d="M8 1.75a6.25 6.25 0 1 0 0 12.5c1 0 1.4-.8 1-1.6-.5-.9.1-1.9 1.1-1.9h1.6a2.55 2.55 0 0 0 2.55-2.55A6.4 6.4 0 0 0 8 1.75z"/><path d="M5 7h.01M7.5 4.6h.01M10.5 5.6h.01" stroke-width="1.8"/>',
    pencil: '<path d="M10.5 2.75l2.75 2.75-7.5 7.5H3v-2.75z"/>',
    gear: '<circle cx="8" cy="8" r="2.25"/><path d="M8 1.75v1.7M8 12.55v1.7M14.25 8h-1.7M3.45 8h-1.7M12.42 3.58l-1.2 1.2M4.78 11.22l-1.2 1.2M12.42 12.42l-1.2-1.2M4.78 4.78l-1.2-1.2"/>',
    lyrics: '<path d="M2.5 4h8M2.5 7.5h6M2.5 11h4"/><circle cx="12" cy="11" r="1.6"/><path d="M13.6 11V4.5l1-.5"/>',
    music: '<circle cx="5" cy="11.5" r="1.9"/><circle cx="11.5" cy="10" r="1.9"/><path d="M6.9 11.5V4l6.5-1.5V10"/>',
    grip: '<path d="M6 4h.01M10 4h.01M6 8h.01M10 8h.01M6 12h.01M10 12h.01" stroke-width="2"/>',
    send: '<path d="M2.5 8L13.5 2.5 10.5 13.5 8 9z"/><path d="M8 9l5.5-6.5"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    eye: '<path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8z"/><circle cx="8" cy="8" r="2"/>',
  };

  const LOGO = '<svg class="zi" viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M8 20C20 11 39 8 56 12C53 20 45 27 35 34L23 43C35 41 46 42 56 46C43 54 24 56 8 52C11 43 19 36 29 29L41 21C29 25 17 25 8 20Z"/></svg>';

  Z.icon = function (name) {
    if (name === 'logo') return LOGO;
    return `<svg class="zi" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
  };
})();
