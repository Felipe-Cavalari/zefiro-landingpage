# Monta a trilha do reels a partir das deixas (cues.json) que o roteiro grava:
# duas músicas lo-fi sintetizadas (a que toca na ilha e a que entra quando a mídia troca),
# os efeitos (cliques, volume, troca de faixa, passagens) e a narração em ../audio/vo/*.mp3.
# Só usa numpy e o ffmpeg. Uso: python mix.py cues.json duração_em_s saída.wav
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
HERE = Path(__file__).resolve().parent
VO_DIR = HERE.parent / 'audio' / 'vo'
rng = np.random.default_rng(7)


def secs(n):
    return np.arange(int(n * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def band(x, lo=0.0, hi=None, order=4):
    """Filtro passa-faixa suave no domínio da frequência (sinal inteiro)."""
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    h = np.ones_like(f)
    if hi:
        h /= 1 + (f / hi) ** order
    if lo:
        h *= 1 - 1 / (1 + (f / lo) ** order)
    return np.fft.irfft(np.fft.rfft(x) * h, n)


def add(buf, start_s, sig, gain=1.0, pan=0.0):
    """Soma um sinal mono (ou estéreo) no buffer estéreo, com pan de -1 a 1."""
    i = int(round(start_s * SR))
    if i >= buf.shape[0] or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: buf.shape[0] - i]
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        buf[i : i + len(sig), 0] += sig * gain * l * 1.414
        buf[i : i + len(sig), 1] += sig * gain * r * 1.414
    else:
        buf[i : i + len(sig)] += sig * gain


def reverb(x, size=1.4, decay=0.35, seed=3):
    """Reverb por convolução com ruído decaindo, um IR por canal."""
    r = np.random.default_rng(seed)
    t = secs(size)
    out = np.zeros((len(x) + len(t) - 1, 2))
    for c in range(2):
        ir = r.standard_normal(len(t)) * np.exp(-t / decay)
        ir = band(ir, 200, 6000)
        ir /= np.sqrt(np.sum(ir**2))
        n = len(x) + len(ir) - 1
        size_fft = 1 << (n - 1).bit_length()
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], size_fft) * np.fft.rfft(ir, size_fft), size_fft)[:n]
    return out[: len(x)]


# ---------- Instrumentos ----------
def rhodes(f, dur=2.6):
    t = secs(dur)
    env = (1 - np.exp(-t / 0.006)) * np.exp(-t / 1.6)
    s = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.35)
    s += 0.07 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.15)
    return s * env * (1 + 0.12 * np.sin(2 * np.pi * 4.6 * t))


def pluck(f, dur=0.6):
    t = secs(dur)
    env = (1 - np.exp(-t / 0.003)) * np.exp(-t / 0.22)
    return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.08) + 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.05)) * env


def pad(f, dur):
    t = secs(dur)
    env = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6)
    s = sum(np.sin(2 * np.pi * f * k * (1 + d) * t) / k for k in (1, 2, 3) for d in (-0.003, 0.003))
    return s * env


def bass(f, dur=0.5):
    t = secs(dur)
    env = (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.35)
    return (np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)) * env


def kick():
    t = secs(0.4)
    f = 45 + 80 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)


def snare():
    t = secs(0.25)
    n = band(rng.standard_normal(len(t)), 900, 6000)
    return (n / np.max(np.abs(n)) * 0.8 + 0.3 * np.sin(2 * np.pi * 190 * t)) * np.exp(-t / 0.06)


def hat():
    t = secs(0.05)
    n = band(rng.standard_normal(len(t)), 6000, 14000)
    return n / np.max(np.abs(n)) * np.exp(-t / 0.012)


def song(spec, length):
    """Sintetiza uma música em laço até `length` segundos."""
    beat = 60 / spec['bpm']
    bar = 4 * beat
    out = np.zeros((int((length + 3) * SR), 2))
    k, s, h = kick(), snare(), hat()
    n_bars = int(length / bar) + 1
    for b in range(n_bars):
        t0 = b * bar
        chord = spec['chords'][b % len(spec['chords'])]
        root = spec['roots'][b % len(spec['roots'])]
        for j, m in enumerate(chord):
            pan = -0.5 + j / max(1, len(chord) - 1)
            if spec['keys'] == 'rhodes':
                add(out, t0 + j * 0.018, rhodes(midi(m)), 0.16, pan)
                add(out, t0 + 2.5 * beat + j * 0.012, rhodes(midi(m), 1.6), 0.08, pan)
            else:
                add(out, t0, pad(midi(m), bar), 0.035, pan)
        if spec['keys'] == 'pluck':
            arp = chord[1:] + [chord[1] + 12]
            for i in range(8):
                add(out, t0 + i * beat / 2, pluck(midi(arp[i % len(arp)] + 12)), 0.13, 0.6 if i % 2 else -0.6)
        for at in spec['bass']:
            add(out, t0 + at * beat, bass(midi(root)), 0.42)
        for at in spec['kick']:
            add(out, t0 + at * beat, k, 0.55)
        for at in (1, 3):
            add(out, t0 + at * beat, s, 0.2, 0.1)
        for i in range(8):
            swing = spec['swing'] * beat if i % 2 else 0
            add(out, t0 + i * beat / 2 + swing, h, 0.06 if i % 2 else 0.09, 0.35)
    if spec.get('crackle'):
        cr = np.zeros(out.shape[0])
        idx = rng.integers(0, len(cr), int(length * 40))
        cr[idx] = rng.uniform(-1, 1, len(idx))
        cr = band(cr, 1500, 7000)
        out += np.stack([cr, cr], 1) * 0.5
    for c in range(2):
        out[:, c] = band(out[:, c], 35, spec['tone'], 2)
    return out[: int(length * SR)]


SONGS = [
    {  # Vento Oeste: Rhodes em Ré, 82 BPM, balanço lo-fi
        'bpm': 82, 'keys': 'rhodes', 'swing': 0.12, 'tone': 5200, 'crackle': True,
        'chords': [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [55, 59, 62, 66], [57, 62, 64, 67, 71]],
        'roots': [38, 35, 43, 45], 'bass': [0, 1.5, 2.5], 'kick': [0, 1.75, 2.5],
    },
    {  # Céu Aberto: pad e arpejo em Fá, 100 BPM, mais claro
        'bpm': 100, 'keys': 'pluck', 'swing': 0.04, 'tone': 7500,
        'chords': [[53, 57, 60, 64, 67], [57, 60, 64, 67], [50, 53, 57, 60, 64], [46, 53, 57, 60, 62]],
        'roots': [41, 45, 38, 46], 'bass': [0, 1.5, 2, 3.5], 'kick': [0, 2, 2.5],
    },
]


# ---------- Efeitos ----------
def fx_click():
    t = secs(0.03)
    n = np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t / 0.002)
    return 0.5 * n + np.sin(2 * np.pi * 3100 * t) * np.exp(-t / 0.006)


def fx_vol(v):
    t = secs(0.09)
    f = 520 * 2 ** ((v - 58) / 24)
    sweep = f * (1 + 0.15 * np.exp(-t / 0.01))
    ph = 2 * np.pi * np.cumsum(sweep) / SR
    env = (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.03)
    return (np.sin(ph) + 0.3 * np.sin(2 * ph)) * env


def fx_pop():
    t = secs(0.12)
    f = 380 + 600 * (1 - np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.035)


def fx_tick(i=0):
    t = secs(0.05)
    f = 1700 * 2 ** ((i % 5) / 24)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.7 * f * t)) * np.exp(-t / 0.012)


def fx_whoosh(dur=0.7, lo=250, hi=3500):
    t = secs(dur)
    n = band(rng.standard_normal(len(t)), lo, hi)
    n /= np.max(np.abs(n))
    peak = 0.55 * dur
    env = np.where(t < peak, (t / peak) ** 2, np.exp(-(t - peak) / (0.18 * dur)))
    return n * env


def fx_wind(dur=4.6):
    t = secs(dur)
    n = band(rng.standard_normal(len(t)), 120, 900)
    n /= np.max(np.abs(n))
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 1.2) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.45 * t))
    return n * env


def fx_chime():
    t = secs(2.2)
    out = np.zeros(len(t) + int(0.14 * SR))
    for d, f in ((0, 880), (0.14, 1318.5)):
        s = sum(a * np.sin(2 * np.pi * f * p * t) * np.exp(-t / (1.1 / p)) for p, a in ((1, 1), (2.0, 0.35), (2.76, 0.25), (5.4, 0.1)))
        i = int(d * SR)
        out[i : i + len(t)] += s * (1 - np.exp(-t / 0.002))
    return out


def fx_skip():
    out = np.zeros(int(0.5 * SR))
    for d, f in ((0.0, 880), (0.07, 1320)):
        t = secs(0.08)
        s = np.sin(2 * np.pi * f * t) * (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.025)
        i = int(d * SR)
        out[i : i + len(s)] += s
    w = fx_whoosh(0.35, 800, 6000)
    out[: len(w)] += 0.5 * w
    return out


# ---------- Narração ----------
def load_vo(name):
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(VO_DIR / f'{name}.mp3'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def ramp(points, n):
    """Curva de ganho a partir de pontos (tempo_s, valor), com rampas de 40 ms."""
    g = np.ones(n)
    pts = sorted(points)
    for (ta, va), (tb, _) in zip(pts, pts[1:] + [(n / SR, None)]):
        g[int(ta * SR) : int(tb * SR)] = va
    k = int(0.04 * SR)
    c = np.cumsum(np.pad(g, (k, k), mode='edge'))
    return ((c[2 * k :] - c[: -2 * k]) / (2 * k))[:n]


def main():
    cues = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    length = float(sys.argv[2])
    out_path = sys.argv[3]
    n = int(length * SR)
    music = np.zeros((n, 2))
    fx = np.zeros((n, 2))
    vo = np.zeros((n, 2))

    at = lambda c: (c['t'] + c.get('at', 0)) / 1000
    end_t = next((at(c) for c in cues if c['type'] == 'end'), length - 0.6)

    # Músicas: cada faixa começa na sua deixa e para quando a próxima entra.
    starts = [(at(c), c['track']) for c in cues if c['type'] == 'music']
    for i, (t0, tr) in enumerate(starts):
        t1 = starts[i + 1][0] if i + 1 < len(starts) else length
        seg = song(SONGS[tr], t1 - t0 + 0.15)
        fade_in = np.minimum(1, secs(len(seg) / SR) / 0.06)[:, None]
        fade_out = np.clip((t1 + 0.15 - t0 - secs(len(seg) / SR)) / 0.15, 0, 1)[:, None]
        add(music, t0, seg * fade_in * fade_out)

    # Volume da ilha e do painel de som mexe na música (64 % é o nível normal).
    vol_pts = [(0.0, 1.0)] + [(at(c), (c['v'] / 64) ** 1.6) for c in cues if c['type'] == 'vol']
    gain = ramp(vol_pts, n)

    # Narração, com a música abaixando enquanto ela fala.
    duck_pts = [(0.0, 1.0)]
    for c in cues:
        if c['type'] != 'vo':
            continue
        clip = load_vo(c['id'])
        t0 = at(c)
        add(vo, t0, clip, 1.0)
        duck_pts += [(t0 - 0.08, 0.32), (t0 + len(clip) / SR, 1.0)]
    duck = ramp(duck_pts, n)
    music *= (gain * duck * 0.42)[:, None]
    tail = np.clip((end_t + 0.9 - secs(length)) / 0.9, 0, 1)[: n, None]
    music *= tail

    # Efeitos.
    for c in cues:
        t0, kind = at(c), c['type']
        if kind == 'click':
            add(fx, t0, fx_click(), 0.18, 0.2)
        elif kind == 'vol':
            add(fx, t0, fx_vol(c['v']), 0.22, 0.1)
        elif kind == 'pop':
            add(fx, t0, fx_pop(), 0.22, -0.2 + 0.2 * c.get('i', 0))
        elif kind == 'tick':
            add(fx, t0, fx_tick(c.get('i', 0)), 0.12, -0.3 + 0.08 * c.get('i', 0))
        elif kind == 'whoosh':
            soft = c.get('soft')
            add(fx, t0 - (0.25 if soft else 0.1), fx_whoosh(0.6 if soft else 0.9), 0.1 if soft else 0.16, -0.4)
        elif kind == 'wind':
            add(fx, t0, fx_wind(), 0.1)
        elif kind == 'skip':
            add(fx, t0, fx_skip(), 0.2, 0.25)
        elif kind == 'chime':
            add(fx, t0, fx_chime(), 0.14)

    wet = reverb(music + fx)
    mix = vo + music + fx + 0.16 * wet
    mix /= max(1e-9, np.max(np.abs(mix))) / 0.89
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'trilha: {length:.1f} s, {sum(c["type"] == "vo" for c in cues)} falas, {len(cues)} deixas')


if __name__ == '__main__':
    main()
