// Molas do Zefiro (crates/ui/src/spring.rs), convertidas em curvas `linear()` do CSS.
// A resposta a um degrau é a mesma do app: massa 1, rigidez k e amortecimento c, em segundos.
(function () {
  const Z = (window.Z = window.Z || {});

  const PARAMS = {
    grow: { k: 380, c: 26 },
    shrink: { k: 200, c: 28 },
    settle: { k: 280, c: 24 },
    tab: { k: 250, c: 31 },
  };

  function step(p, t) {
    const w = Math.sqrt(p.k);
    const z = p.c / (2 * w);
    if (Math.abs(z - 1) < 1e-3) return 1 - (1 + w * t) * Math.exp(-w * t);
    if (z < 1) {
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t));
    }
    const s = Math.sqrt(z * z - 1);
    const r1 = -w * (z - s);
    const r2 = -w * (z + s);
    return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasLinear = !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)'));
  const cache = {};

  // Duração até a mola ficar a menos de 0,5 % do fim, como `SpringParams::sampled`.
  function spring(name) {
    if (cache[name]) return cache[name];
    const p = PARAMS[name];
    let d = 0.001;
    for (let t = 0; t < 3; t += 0.001) if (Math.abs(1 - step(p, t)) >= 0.005) d = t + 0.001;
    const n = 48;
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(+step(p, (d * i) / n).toFixed(4));
    pts[0] = 0;
    pts[n] = 1;
    const easing = hasLinear ? `linear(${pts.join(', ')})` : 'cubic-bezier(.2, 1.15, .3, 1)';
    return (cache[name] = { ms: reduced ? 0 : Math.round(d * 1000), easing });
  }

  Z.reduced = reduced;
  Z.spring = spring;
  Z.transition = (name, props) => {
    const s = spring(name);
    return props.map((p) => `${p} ${s.ms}ms ${s.easing}`).join(', ');
  };
})();
