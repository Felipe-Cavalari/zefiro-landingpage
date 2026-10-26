# zefiro-landingpage

Landing page do [Zefiro](https://github.com/Felipe-Cavalari/zefiro), a barra de status nativa para Windows. Em português e em inglês.

A peça central é um clone da barra em HTML que roda sozinho como um vídeo, em cinco capítulos (ilha, painéis, formatos, temas e edição), e vira interativo quando você clica nele. As medidas, os temas e as molas vêm do código do Zefiro:

| O quê | De onde |
| --- | --- |
| Alturas e respiros de cada formato | `crates/ui/src/bar_layout.rs` (`metrics`) |
| Tamanhos da ilha (ociosa, mídia, espiada, aviso, expandida) | `crates/modules/island/src/view.rs` |
| Molas GROW, SHRINK, SETTLE e das abas | `crates/ui/src/spring.rs` e `crates/modules/island/src/tabs.rs` |
| Os 9 temas | `crates/resources/themes/*.toml` |
| Catálogo de itens | `crates/modules/bar/src/catalog.rs` |

As molas viram curvas `linear()` do CSS com a mesma resposta a um degrau do app (massa 1, rigidez e amortecimento em segundos).

## Rodar

Não tem build nem dependências. Qualquer servidor estático serve:

```powershell
python -m http.server 4173
```

E abra `http://127.0.0.1:4173`. Abrir o `index.html` direto também funciona.

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `index.html` | A página |
| `css/style.css` | Estilo da página e do clone da barra (classes `zx-*`) |
| `js/spring.js` | Molas do Zefiro em `linear()` |
| `js/icons.js` | Ícones de traço e o símbolo do Z |
| `js/i18n.js` | Textos em pt-BR e en, e o catálogo de itens |
| `js/scene.js` | O clone da barra: layout, formatos, temas, ilha, painéis, modo de edição, câmera e cursor |
| `js/panels.js` | Conteúdo dos painéis de cada chip |
| `js/demo.js` | O roteiro dos cinco capítulos, pausa e modo interativo |
| `js/main.js` | Liga tudo: idioma, lista de itens, prévia de formato e tema e o link do instalador |
| `reels/` | Reels vertical (1080 × 1920) com o mesmo clone da barra e o gravador de MP4; ver `reels/README.md` |

O botão de download aponta para a última release do GitHub; quando a API responde, ele troca o link pelo `Zefiro-x.y.z-setup.exe` e atualiza a versão no topo.

## Acessibilidade

- Com "reduzir movimento" ligado no sistema, a demonstração não roda sozinha e começa no modo interativo.
- A demonstração pausa fora da tela e com a aba em segundo plano.
- Claro e escuro seguem o sistema.

## Licença

MIT OR Apache-2.0, como o Zefiro.
