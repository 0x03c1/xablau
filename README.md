# 🎲 QUEM SERÁ?

> O destino da sala acaba de ser decidido.

Sorteio de sala de aula com cara de programa de auditório. O professor cadastra nomes, números, emojis, códigos ou combinações como “🚀 Grupo A”, aperta **SORTEAR** e a turma acompanha uma revelação com suspense, luzes e confete.

Aplicação 100% estática: sem backend, sem banco, sem login, sem API externa. Depois de carregada, funciona offline.

---

## Funcionalidades

**Sorteio**
- Dois tipos: **vencedor único** (um nome por vez) e **classificação** (a ordem inteira de uma vez, do 1º ao último colocado). Serve tanto para o pódio de um campeonato quanto para definir em que ordem as equipes pegam um trabalho.
- Escolha feita com `crypto.getRandomValues()` e rejeição de amostra, sem o viés do `Math.random() % n`.
- O resultado é definido **antes** da animação. A encenação apenas revela o que já foi decidido.
- Fases: preparação, embaralhamento, suspense com “quase vencedores”, silêncio, revelação.
- Quatro modos visuais: game show, hacker, foguete e caos.
- Duração ajustável (rápido, normal, épico).

**Turma**
- Cadastro individual ou colando a chamada inteira, uma linha por participante.
- Emoji inicial é separado do texto automaticamente.
- Linhas vazias e nomes repetidos são ignorados na importação.
- Embaralhar a lista (só reorganiza a exibição, não escolhe ninguém).

**Rodízio e histórico**
- “Não repetir vencedores” com contador `7 de 20 já participaram` e aviso quando todo mundo passou.
- Histórico dos últimos 12 sorteados, com horário e opção de limpar.
- Participantes, histórico, configurações e sorteados ficam no `localStorage`. Se o armazenamento estiver bloqueado (aba anônima, por exemplo), a aplicação continua funcionando, só não guarda nada.

**Sala de aula**
- Modo tela cheia pensado para projetor: nome gigante, contraste alto, painéis laterais somem.
- Som gerado pela Web Audio API, sem nenhum arquivo de áudio. Nada toca antes de uma interação do usuário.
- Quatro temas, incluindo um claro para projetor em sala iluminada.
- Navegação por teclado, foco visível, `aria-label`, região `aria-live` para o resultado e suporte a `prefers-reduced-motion`.

**Atalhos**

| Tecla | Ação |
| --- | --- |
| `Espaço` | Sortear |
| `F` | Tela cheia |
| `R` | Embaralhar |
| `S` | Liga e desliga o som |
| `M` | Troca o modo |
| `Esc` | Fecha janelas e cancela o sorteio |

Existem dois detalhes escondidos: o código do Konami (↑ ↑ ↓ ↓ ← → ← → B A) liga um modo arcade secreto, e certos marcos de quantidade de sorteios rendem mensagens especiais.

---

## Tecnologias

React 18, Vite 5, JavaScript, CSS moderno (variáveis, `color-mix`, grid), HTML semântico. Fontes Bungee, Space Grotesk e JetBrains Mono são servidas pelo próprio projeto via `@fontsource`, então nada depende de CDN. Confetes são desenhados em `<canvas>` puro e o som sai de osciladores da Web Audio API. Nenhuma biblioteca de animação foi necessária.

---

## Instalação e execução

```bash
npm install     # instala as dependências
npm run dev     # ambiente local em http://localhost:5173
npm run build   # gera a pasta dist/ pronta para publicar
npm run preview # serve o resultado do build para conferência
npm test        # verificação automatizada da aplicação em DOM simulado
```

### Versão de arquivo único

```bash
npm run build:single
```

Gera `dist-single/quem-sera.html` com JS, CSS e fontes embutidos. Um arquivo só, que abre com dois cliques e roda de pendrive em qualquer computador da instituição, sem instalar nada.

---

## Deploy no Netlify

O `netlify.toml` já está configurado com o comando de build, o diretório de publicação, o redirecionamento de rotas e o cache dos assets.

**Pelo Git (recomendado)**

1. Suba o projeto para um repositório no GitHub.
2. No Netlify: *Add new site → Import an existing project* e escolha o repositório.
3. Build command `npm run build`, publish directory `dist`. O Netlify lê isso do `netlify.toml`, então basta confirmar.
4. *Deploy*. A cada push na branch principal o site é reconstruído.

**Arrastando a pasta**

```bash
npm run build
```

Depois arraste a pasta `dist` para o painel do Netlify Drop (`app.netlify.com/drop`).

**Pela linha de comando**

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Não há servidor Node em produção: o Netlify serve apenas arquivos estáticos.

---

## Estrutura do projeto

```
quem-sera/
├── index.html
├── netlify.toml
├── vite.config.js
├── public/
│   ├── favicon.svg
│   ├── og-image.svg          fonte da imagem de preview social
│   └── og-image.png          1200×630, usada por WhatsApp e redes sociais
├── scripts/
│   └── build-single.mjs      versão de arquivo único
├── test/
│   └── run.mjs               verificação automatizada em jsdom
└── src/
    ├── main.jsx
    ├── App.jsx               estado geral, atalhos, validações
    ├── components/
    │   ├── Header.jsx
    │   ├── Stage.jsx         palco e identidade de cada modo
    │   ├── ControlDeck.jsx   botão principal, modos, contador
    │   ├── ParticipantsPanel.jsx
    │   ├── HistoryPanel.jsx
    │   ├── SettingsModal.jsx
    │   ├── HelpModal.jsx
    │   ├── PasteModal.jsx
    │   ├── Modal.jsx         base acessível (Esc, foco preso)
    │   ├── Switch.jsx
    │   ├── Confetti.jsx
    │   └── Toast.jsx
    ├── hooks/
    │   ├── useDraw.js        máquina de fases do sorteio
    │   ├── useAudio.js       efeitos da Web Audio API
    │   ├── useFullscreen.js
    │   ├── usePersistentState.js
    │   └── useReducedMotion.js
    ├── utils/
    │   ├── random.js         getSecureRandomIndex e embaralhamento
    │   ├── participants.js   criação, importação, emoji, elegíveis
    │   └── storage.js        localStorage tolerante a falhas
    ├── data/
    │   ├── phrases.js        todas as frases
    │   ├── modes.js          modos de sorteio
    │   ├── themes.js         temas
    │   └── defaults.js       configurações padrão e durações
    └── styles/
        ├── base.css          tokens, tipografia, botões
        ├── layout.css        cabeçalho, colunas, painéis
        ├── stage.css         palco, roleta, revelação, modos
        ├── modals.css        janelas e formulários
        └── themes.css        variações de cor
```

---

## Preview em redes sociais

O `index.html` traz as tags Open Graph e Twitter Card, e `public/og-image.png` (1200×630) é a imagem que aparece ao colar o link no WhatsApp, Telegram, X, Discord etc.

O WhatsApp exige uma URL **absoluta** em `og:image`. A URL de produção (`https://xablau.netlify.app`) já está no `index.html`. Em deploy preview do Netlify o `vite.config.js` troca pelo endereço do preview (`DEPLOY_PRIME_URL`). Trocou de domínio? Ajuste o `index.html` e a constante `SITE_URL_IN_HTML` no `vite.config.js`; para builds fora do Netlify dá para forçar com `SITE_URL=https://meudominio.com npm run build`.

Para regenerar a imagem depois de editar `public/og-image.svg`:

```bash
rsvg-convert -w 1200 -h 630 public/og-image.svg -o public/og-image.png
```

---

## Como adicionar participantes

Digite no campo do painel lateral e clique em **+ Adicionar**, ou use **📋 Colar lista** e cole a chamada inteira, uma pessoa por linha:

```
Ana
Bruno
Carlos
👨‍💻 Lucas
🚀 Grupo A
42
```

Tudo é tratado como texto, então nome, número, emoji e código funcionam igualmente. Um emoji no início vira o marcador visual do card, e o resto vira o rótulo.

## Como criar um novo modo de sorteio

1. Adicione o modo em `src/data/modes.js`:

```js
{ id: 'circo', name: 'Circo', icon: '🎪', tagline: 'Picadeiro, tambores e revelação.' }
```

2. Escreva a identidade visual em `src/styles/stage.css`, usando o seletor do modo:

```css
.stage[data-mode='circo'] { background: #2a0a1e; }
.stage[data-mode='circo'] .reel__value { color: var(--gold); }
```

3. Se o modo precisar de elementos próprios (log, partículas, cenário), acrescente o bloco condicional em `src/components/Stage.jsx`, junto de onde ficam o terminal do modo hacker e o campo do modo caos.

O modo aparece sozinho no seletor da tela principal e nas configurações.

## Como alterar as frases

Tudo está em `src/data/phrases.js`, separado por momento: `beforeDraw`, `prepare`, `shuffling`, `suspense`, `afterDraw`, `emptyState`, além dos textos de cada modo e das mensagens de marco (`milestones`). Adicione ou remova linhas dos arrays: o sorteio das frases é aleatório.

## Como alterar os temas

1. Cadastre o tema em `src/data/themes.js` com um id e três cores de amostra.
2. Em `src/styles/themes.css`, crie o bloco com as variáveis:

```css
[data-theme='meu-tema'] {
  --bg: #101820;
  --bg-deep: #070c10;
  --panel: #16212b;
  --ink: #eaf4ff;
  --muted: #8ba0b4;
  --accent: #ff6b35;
  --accent-2: #00c2a8;
  --gold: #ffd166;
}
```

O tema escolhido é aplicado no elemento raiz e salvo no navegador.

---

## Verificação

`npm test` roda a aplicação em um DOM simulado e confere cadastro, importação com linhas vazias e repetidas, sorteio de vencedor único até a revelação, sorteio de classificação com a ordem completa e o histórico correspondente, gravação e releitura do `localStorage`, rodízio sem repetição até esgotar a turma, reinício, remoção e desmontagem sem vazamento. Precisa de Node 18 ou mais recente. O build (`npm run build`) roda sem erros nem warnings.

## Ideias para depois

- Sortear grupos ou duplas de uma vez, não só um nome.
- Associar cada colocação da classificação a um tema ou trabalho de uma lista.
- Peso por participante, para quem ainda não apresentou entrar com chance maior.
- Exportar e importar a turma em arquivo, para reaproveitar entre disciplinas.
- Link compartilhável com a lista codificada na URL, mantendo tudo estático.
- Contagem regressiva na tela antes do sorteio, útil para chamar a atenção da turma.
- Modo apresentação com placar acumulado por aluno ao longo do semestre.
