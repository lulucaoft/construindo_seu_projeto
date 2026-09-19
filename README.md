# Construindo seu Projeto

Formulário de briefing visual, estático, sem backend.
Direção de arte editorial: Inter (Black/Light) + Fira Code, papel texturizado, vermelho/azul/amarelo como tinta gráfica.

## Arquivos

- `index.html` — estrutura e conteúdo (perguntas, opções, textos)
- `style.css` — visual, organizado em blocos comentados
- `script.js` — configuração, estado, navegação, persistência, WhatsApp e PDF
- `Caca.png` — logo do header e do colofão (precisa estar na mesma pasta, com esse nome exato)
- `Caca.ico` — ícone da aba do navegador (favicon), também precisa estar na mesma pasta

## Antes de publicar

O número do WhatsApp já está configurado (`5577981279726`) e os contatos do colofão também. Se algum dia mudar, os dois lugares são: `CONFIG.whatsappNumber` e a constante `CONTATO`, no começo do `script.js`, mais o rodapé do `index.html`.

Publique os quatro arquivos em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel). O `index.html` carrega a jsPDF por CDN, então o gerador de PDF só funciona com internet.

## Referências: como funciona agora

O upload de arquivos foi removido. O fluxo é:

- **Pinterest** → descobrir referências
- **Google Drive** → organizar e entregar (o cliente cola o link da pasta)
- **WhatsApp** → comunicação

A etapa 06 traz o tutorial de como criar e compartilhar a pasta do Drive, mais as boas práticas de envio.

## PDF do briefing

Na última etapa existe o botão **baixar briefing em PDF**. Ele monta o relatório na hora, no navegador, com a mesma linguagem do site: faixa de cor no topo, Cacá no quadro amarelo, numeração em monoespaçada, amostras reais das cores escolhidas e um bloco de fechamento com seus contatos. O arquivo sai como `briefing-nome-do-cliente.pdf`.

Se quiser mexer no layout do PDF, tudo está no bloco `PDF REPORT` do `script.js`: `PDF` (cores e margens), `pdfFrame()` (fundo, faixa e rodapé de cada página), `pdfSection()` (cada seção numerada) e `buildPDF()` (a sequência).

## Persistência

Tudo que o cliente responde é salvo em `localStorage`, na chave `construindoSeuProjetoForm`, incluindo a etapa atual. Abrir o Pinterest ou o Drive (sempre em nova aba) não perde nada.

O estado só é apagado quando:

- o briefing é enviado pelo WhatsApp, ou
- o cliente clica em **recomeçar** e confirma.

A função responsável é `clearFormState()`, em `script.js`.

## Sobre a paleta

O site é quase todo preto sobre papel — a cor entra só em detalhes pontuais (um traço embaixo do número da etapa, o "✳" do marquee, um quadrado na margem). Cada etapa tem uma cor de acento própria, definida inline no `index.html` (`style="--accent:var(--red)"`, por exemplo) — para trocar a cor de uma etapa, basta mudar essa variável para `--blue` ou `--yellow`.
A paleta das 10 cores que o cliente escolhe (etapa 03) continua colorida de verdade — isso é conteúdo do briefing, não decoração.

## Onde editar

- **Cores, fontes, espaçamentos**: bloco `01. DESIGN TOKENS`, no começo do `style.css`
- **Perguntas, opções, textos dos tutoriais**: `index.html`
- **Limites de seleção (cores/fontes), número do WhatsApp, chave do localStorage**: `CONFIG`, no começo do `script.js`
- **Texto da mensagem do WhatsApp**: função `buildMessage()`
- **Resumo final**: função `renderSummary()`

## Observação sobre as cores dos swatches

Os hex das 10 cores aparecem em dois lugares: no `style.css` inline de cada `.color-card` (atributo `style="--swatch:…"`, dentro do `index.html`) e no objeto `SWATCHES` do `script.js`, usado para desenhar a faixa de paleta. Se mudar uma cor, mude nos dois.
