# Reels do Zefiro

Vídeo vertical para Reels, Shorts e TikTok (1080 × 1920, 30 q/s, ~46 s), feito com o mesmo clone da barra da landing page. Ele usa os scripts e o estilo da raiz (`js/`, `css/style.css`, `assets/logo.svg`); esta pasta só tem o roteiro e o visual do reels.

| Arquivo | O que faz |
| --- | --- |
| `index.html` | A tela de 1080 × 1920, encaixada na janela |
| `reel.css` | Fundo, títulos, cartão com a barra, números e chamada final |
| `reel.js` | O roteiro: abertura, ilha, painéis, formatos, temas, números e chamada final |
| `gravar/record.js` | Grava o MP4 quadro a quadro |

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

O vídeo sai em `reels/out/zefiro-reels.mp4` (pasta ignorada pelo git). O gravador troca o relógio da página por um virtual: temporizadores, `requestAnimationFrame` e animações CSS andam 1/30 s por quadro. Assim o vídeo sai sem travadas, mesmo que a captura seja lenta. `?rec` tira os controles e espera o gravador dar a largada.
