# Reels do Zefiro

Vídeo vertical para Reels, Shorts e TikTok (1080 × 1920, 30 q/s, ~48 s, com narração, música e efeitos), feito com o mesmo clone da barra da landing page. Ele usa os scripts e o estilo da raiz (`js/`, `css/style.css`, `assets/logo.svg`); esta pasta só tem o roteiro e o visual do reels.

| Arquivo | O que faz |
| --- | --- |
| `index.html` | A tela de 1080 × 1920, encaixada na janela |
| `reel.css` | Fundo, títulos, cartão com a barra, números e chamada final |
| `reel.js` | O roteiro: abertura, ilha (com a troca de faixa), painéis, formatos, temas, números e chamada final; marca as deixas de som |
| `audio/narracao.json` | O texto e a voz de cada fala da narração |
| `audio/vo/*.mp3` | As falas já geradas, para regravar sem gastar créditos |
| `gravar/record.js` | Grava o MP4 quadro a quadro e junta a trilha |
| `gravar/mix.py` | Monta a trilha: duas músicas sintetizadas, efeitos e narração, nos tempos das deixas |
| `gravar/narracao.py` | Gera as falas na ElevenLabs |

## Ver no navegador

Na raiz da landing:

```powershell
python -m http.server 4188 --bind 127.0.0.1
```

E abra `http://127.0.0.1:4188/reels/`. O reels roda em laço, com Pausar, Recomeçar e Margens seguras (as faixas que o Instagram cobre em cima e embaixo). `?guides` liga as margens logo de cara.

## Gravar o MP4

Precisa do Chromium do Playwright em `%LOCALAPPDATA%\ms-playwright\chromium-1243` e do ffmpeg no PATH. Com o servidor acima rodando:

```powershell
cd reels/gravar
npm install
npm run gravar
```

O vídeo sai em `reels/out/zefiro-reels.mp4` (pasta ignorada pelo git). Precisa também do Python com numpy, para a trilha. O gravador troca o relógio da página por um virtual: temporizadores, `requestAnimationFrame` e animações CSS andam 1/30 s por quadro. Assim o vídeo sai sem travadas, mesmo que a captura seja lenta. `?rec` tira os controles e espera o gravador dar a largada.

## Som

- **Deixas:** o roteiro registra em `window.__cues` cada momento com som (fala, clique, volume, troca de faixa, passagem, tique de formato e tema, número, sino final), no tempo virtual da gravação. O `record.js` passa essa lista para o `mix.py`.
- **Músicas:** "Vento Oeste" (Rhodes em Ré, 82 BPM) toca quando a ilha mostra a mídia; "Céu Aberto" (arpejo em Fá, 100 BPM) entra na troca de faixa. As duas são sintetizadas no `mix.py`, sem direitos autorais. O volume delas segue a ilha e o painel de som, e abaixa enquanto a narração fala.
- **Efeitos:** também sintetizados. O tique de volume sobe de tom quando o volume aumenta e desce quando diminui.
- **Narração:** voz Lucas (pt-BR) da ElevenLabs. Para trocar uma fala, edite `audio/narracao.json` e rode, com a chave só na variável de ambiente:

```powershell
$env:ELEVENLABS_API_KEY = '<sua chave>'
python reels/gravar/narracao.py fim
```

Se a fala nova ficar mais longa, confira as esperas da cena em `reel.js`. A trilha final sai em -14 LUFS, o nível do Instagram.
