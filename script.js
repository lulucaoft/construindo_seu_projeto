/* =========================================================
   CONSTRUINDO SEU PROJETO — LUCAS LIMA / DESIGN GRÁFICO
   ========================================================= */

/* ---------- CONFIGURATION ---------- */
const CONFIG = {
  // COLOQUE AQUI o número que receberá os briefings.
  // Formato internacional, somente números. Ex.: 5577999999999
  whatsappNumber: "5577981279726",
  maxColors: 5,
  maxFonts: 2,
  storageKey: "construindoSeuProjetoForm"
};

// Contatos usados no PDF e no colofão
const CONTATO = {
  nome: "LUCAS LIMA",
  atuacao: "design gráfico",
  whatsapp: "(77) 98127-9726",
  email: "lucasst.lima09@gmail.com"
};

// Campos de texto do formulário (id -> rótulo usado no resumo/WhatsApp)
const TEXT_FIELDS = {
  projectDescription: "Descrição do projeto",
  intentionDescription: "Objetivo em detalhes",
  fontFavorite: "Fonte favorita",
  message: "Mensagem desejada",
  drive: "Google Drive",
  pinterest: "Pinterest",
  name: "Nome",
  email: "E-mail",
  clientWhatsapp: "WhatsApp do cliente",
  extra: "Observações finais"
};

const SWATCHES = {
  "Vermelho": "#C74634", "Laranja": "#D97832", "Amarelo": "#D8B84C",
  "Verde": "#718B68", "Azul": "#55728A", "Roxo": "#806D8C",
  "Rosa": "#C88791", "Marrom": "#86684F", "Preto": "#171717",
  "Off-white / creme": "#E9E2D4"
};

/* ---------- FORM STATE ---------- */
const screens = [...document.querySelectorAll(".screen")];
const nextBtn = document.querySelector("#next");
const backBtn = document.querySelector("#back");
const restartBtn = document.querySelector("#restart");
const progressBar = document.querySelector("#progressBar");
const stepLabel = document.querySelector("#stepLabel");
const railNum = document.querySelector("#railNum");
const totalSteps = screens.length - 1; // 7 etapas + abertura

let current = 0;

const data = {
  projectType: [],
  intention: "",
  colors: [],
  fonts: [],
  feelings: []
};

/* ---------- LOCAL STORAGE ---------- */
function collectState(){
  const texts = {};
  Object.keys(TEXT_FIELDS).forEach(id => { texts[id] = value("#" + id); });
  return { step: current, data, texts };
}

function saveState(){
  try{
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(collectState()));
  }catch(e){ /* navegação privada, cota cheia: o formulário segue funcionando */ }
}

function clearFormState(){
  try{ localStorage.removeItem(CONFIG.storageKey); }catch(e){}
}

function restoreState(){
  let saved = null;
  try{ saved = JSON.parse(localStorage.getItem(CONFIG.storageKey)); }catch(e){ saved = null; }
  if(!saved) return;

  // respostas de seleção
  if(saved.data){
    ["projectType","colors","fonts","feelings"].forEach(key=>{
      if(Array.isArray(saved.data[key])) data[key] = saved.data[key].slice();
    });
    if(typeof saved.data.intention === "string") data.intention = saved.data.intention;
  }

  // marcar visualmente as seleções
  document.querySelectorAll("[data-multi]").forEach(container=>{
    const key = container.dataset.multi;
    container.querySelectorAll("[data-value]").forEach(btn=>{
      btn.classList.toggle("selected", data[key].includes(btn.dataset.value));
    });
  });
  document.querySelectorAll("[data-single] .line-item").forEach(btn=>{
    btn.classList.toggle("selected", btn.dataset.value === data.intention);
  });

  // campos de texto
  if(saved.texts){
    Object.keys(TEXT_FIELDS).forEach(id=>{
      const el = document.querySelector("#" + id);
      if(el && typeof saved.texts[id] === "string") el.value = saved.texts[id];
    });
  }

  // etapa atual
  if(Number.isInteger(saved.step) && saved.step >= 0 && saved.step < screens.length){
    current = saved.step;
  }
}

/* ---------- NAVIGATION ---------- */
function updateUI(){
  screens.forEach((s,i)=> s.classList.toggle("active", i === current));

  const shown = Math.max(current, 1);
  const pct = (current / totalSteps) * 100;
  progressBar.style.width = `${Math.max(pct, 4)}%`;
  stepLabel.textContent = `${String(shown).padStart(2,"0")} / ${String(totalSteps).padStart(2,"0")}`;
  if(railNum) railNum.textContent = String(shown).padStart(2,"0");

  backBtn.disabled = current === 0;
  nextBtn.style.display = current === totalSteps ? "none" : "inline-block";
  if(current === totalSteps) renderSummary();

  window.scrollTo({top:0, behavior:"smooth"});
}

function goTo(step){
  current = Math.min(Math.max(step,0), screens.length - 1);
  updateUI();
  saveState();
}

nextBtn.addEventListener("click", ()=> goTo(current + 1));
backBtn.addEventListener("click", ()=> goTo(current - 1));
document.querySelectorAll(".intro .next").forEach(b=> b.addEventListener("click", ()=> goTo(1)));

restartBtn.addEventListener("click", ()=>{
  if(!confirm("Apagar todas as respostas e começar de novo?")) return;
  clearFormState();
  location.reload();
});

/* ---------- SELECTIONS ---------- */
function bindMulti(container, max, key){
  container.querySelectorAll("[data-value]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const val = btn.dataset.value;
      if(btn.classList.contains("selected")){
        btn.classList.remove("selected");
        data[key] = data[key].filter(v => v !== val);
      }else{
        if(data[key].length >= max){
          const removed = data[key].shift();
          const el = container.querySelector(`[data-value="${CSS.escape(removed)}"]`);
          if(el) el.classList.remove("selected");
        }
        data[key].push(val);
        btn.classList.add("selected");
      }
      if(key === "colors") renderPalette();
      if(key === "fonts") renderFontCounter();
      saveState();
    });
  });
}

document.querySelectorAll("[data-multi]").forEach(container=>{
  const key = container.dataset.multi;
  const max = key === "colors" ? CONFIG.maxColors
            : key === "fonts"  ? CONFIG.maxFonts
            : Infinity;
  bindMulti(container, max, key);
});

document.querySelectorAll("[data-single]").forEach(container=>{
  container.querySelectorAll(".line-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      container.querySelectorAll(".selected").forEach(x=> x.classList.remove("selected"));
      btn.classList.add("selected");
      data.intention = btn.dataset.value;
      saveState();
    });
  });
});

// autosave dos campos de texto
Object.keys(TEXT_FIELDS).forEach(id=>{
  const el = document.querySelector("#" + id);
  if(el) el.addEventListener("input", saveState);
});

/* ---------- COLOR LOGIC ---------- */
function renderPalette(){
  const counter = document.querySelector("#colorCount");
  const strip = document.querySelector("#paletteStrip");
  if(counter) counter.textContent = String(data.colors.length).padStart(2,"0");
  if(!strip) return;

  if(!data.colors.length){
    strip.innerHTML = '<span class="palette-empty">nenhuma cor escolhida ainda</span>';
    return;
  }
  strip.innerHTML = data.colors
    .map(c => `<b style="background:${SWATCHES[c] || "#ccc"}" title="${c}"></b>`)
    .join("");
}

function renderFontCounter(){
  const el = document.querySelector("#fontCounter");
  if(el) el.textContent = `${String(data.fonts.length).padStart(2,"0")} / 0${CONFIG.maxFonts} SELECIONADAS`;
}

/* ---------- PINTEREST / DRIVE ---------- */
/* Os links usam target="_blank" + rel="noopener noreferrer" direto no HTML:
   abrem em nova aba e nunca abandonam o formulário. O estado já está salvo
   em localStorage, então voltar para esta aba mantém tudo como estava. */
document.querySelectorAll('a[target="_blank"]').forEach(a=>{
  a.addEventListener("click", saveState);
});

/* ---------- SUMMARY ---------- */
function value(sel){ const el = document.querySelector(sel); return el ? el.value.trim() : ""; }
function list(arr){ return arr.length ? arr.join(", ") : ""; }

function renderSummary(){
  const box = document.querySelector("#summary");
  if(!box) return;

  const rows = [
    ["PROJETO", list(data.projectType)],
    ["DESCRIÇÃO", value("#projectDescription")],
    ["INTENÇÃO", data.intention],
    ["CORES", list(data.colors)],
    ["TIPOGRAFIA", list(data.fonts)],
    ["SENSAÇÃO", list(data.feelings)],
    ["MENSAGEM", value("#message")],
    ["REFERÊNCIAS — GOOGLE DRIVE", value("#drive") || "Nenhuma pasta adicionada."],
    ["REFERÊNCIAS — PINTEREST", value("#pinterest")]
  ];

  box.innerHTML = rows.map(([label, val])=>{
    const empty = !val;
    return `<div><dt>${label}</dt><dd class="${empty ? "empty" : ""}">${empty ? "não informado" : escapeHTML(val)}</dd></div>`;
  }).join("");
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

/* ---------- WHATSAPP ---------- */
function or(v){ return v || "Não informado"; }

function buildMessage(){
  const drive = value("#drive");
  const pinterest = value("#pinterest");

  return `*NOVO BRIEFING — CONSTRUINDO SEU PROJETO*

*01 · PROJETO*
Tipo: ${or(list(data.projectType))}
Descrição: ${or(value("#projectDescription"))}

*02 · INTENÇÃO*
O que o projeto deve fazer: ${or(data.intention)}
Objetivo em mais detalhes: ${or(value("#intentionDescription"))}

*03 · CORES*
Cores escolhidas: ${or(list(data.colors))}

*04 · TIPOGRAFIA*
Famílias escolhidas: ${or(list(data.fonts))}
Fonte favorita: ${or(value("#fontFavorite"))}

*05 · SENSAÇÃO*
Palavras escolhidas: ${or(list(data.feelings))}
Mensagem desejada: ${or(value("#message"))}

*06 · REFERÊNCIAS*
Google Drive: ${drive || "Nenhuma pasta adicionada."}
Pinterest: ${pinterest || "Não informado"}
Observação: as referências são organizadas e enviadas pelo cliente através do Google Drive.

*07 · CONTATO*
Nome: ${or(value("#name"))}
E-mail: ${or(value("#email"))}
WhatsApp do cliente: ${or(value("#clientWhatsapp"))}
Observações finais: ${or(value("#extra"))}

— enviado pelo formulário Construindo seu Projeto`;
}

/* ---------- VALIDATION ---------- */
function looksLikeURL(str){
  return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(str);
}

function validateFinal(){
  const nameField = document.querySelector("#name");
  const error = document.querySelector("#errorMessage");
  const drive = value("#drive");

  if(!nameField.value.trim()){
    error.textContent = "Falta preencher seu nome para enviar.";
    nameField.focus();
    return false;
  }
  if(drive && !looksLikeURL(drive)){
    error.textContent = "O link da pasta de referências (etapa 06) não parece completo — ele começa com https://";
    return false;
  }
  if(!CONFIG.whatsappNumber || CONFIG.whatsappNumber.includes("000000")){
    error.textContent = "Configure o número do WhatsApp no início do script.js antes de publicar.";
    return false;
  }
  error.textContent = "";
  return true;
}

document.querySelector("#sendWhatsApp").addEventListener("click", ()=>{
  if(!validateFinal()) return;
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildMessage())}`;
  window.open(url, "_blank", "noopener,noreferrer");
  clearFormState();
});

/* ---------- PDF REPORT ---------- */
const PDF = {
  paper:[243,240,232], ink:[17,17,15], body:[36,34,30], muted:[86,82,72],
  red:[228,71,53], blue:[49,89,217], yellow:[244,207,40],
  margin:18, right:192, bottom:262
};

function hexToRgb(hex){
  const h = hex.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function pdfFrame(doc, page){
  doc.setFillColor(...PDF.paper);
  doc.rect(0,0,210,297,"F");

  // faixa de cor no topo
  doc.setFillColor(...PDF.red);    doc.rect(0,0,70,5,"F");
  doc.setFillColor(...PDF.blue);   doc.rect(70,0,70,5,"F");
  doc.setFillColor(...PDF.yellow); doc.rect(140,0,70,5,"F");

  // rodapé com contatos
  doc.setDrawColor(...PDF.ink); doc.setLineWidth(.5);
  doc.line(PDF.margin,275,PDF.right,275);
  doc.setFont("courier","normal"); doc.setFontSize(8);
  doc.setTextColor(...PDF.muted);
  doc.text(`${CONTATO.nome} · ${CONTATO.atuacao}`, PDF.margin, 281);
  doc.text(`${CONTATO.whatsapp} · ${CONTATO.email}`, PDF.margin, 285.5);
  doc.setTextColor(...PDF.ink);
  doc.text(String(page).padStart(2,"0"), PDF.right, 281, {align:"right"});
}

function pdfSection(doc, state, number, label, lines, color){
  let y = state.y;
  const blockHeight = 14 + lines.length * 5.6;
  if(y + blockHeight > PDF.bottom){
    state.page++; doc.addPage(); pdfFrame(doc, state.page); y = 26;
  }

  doc.setFillColor(...color);
  doc.rect(PDF.margin, y - 4.4, 11, 6.4, "F");
  doc.setFont("courier","bold"); doc.setFontSize(8.5);
  doc.setTextColor(...(color === PDF.yellow ? PDF.ink : PDF.paper));
  doc.text(number, PDF.margin + 5.5, y, {align:"center"});

  doc.setTextColor(...PDF.muted);
  doc.text(label.toUpperCase(), PDF.margin + 15, y);

  doc.setFont("helvetica","normal"); doc.setFontSize(11.5);
  doc.setTextColor(...PDF.body);
  y += 7.5;
  lines.forEach(line=>{ doc.text(line, PDF.margin, y); y += 5.6; });

  y += 3.5;
  doc.setDrawColor(...PDF.ink); doc.setLineWidth(.3);
  doc.line(PDF.margin, y, PDF.right, y);
  state.y = y + 6.5;
}

function pdfWrap(doc, text){
  doc.setFont("helvetica","normal"); doc.setFontSize(11.5);
  return doc.splitTextToSize(text || "não informado", PDF.right - PDF.margin);
}

function buildPDF(){
  if(!window.jspdf || !window.jspdf.jsPDF){
    document.querySelector("#errorMessage").textContent =
      "Não consegui carregar o gerador de PDF. Verifique a conexão e tente de novo.";
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"mm", format:"a4"});
  const state = { page:1, y:0 };
  pdfFrame(doc, state.page);

  // --- cabeçalho ---
  doc.setFillColor(...PDF.yellow);
  doc.rect(PDF.margin, 16, 20, 20, "F");
  doc.setDrawColor(...PDF.ink); doc.setLineWidth(.6);
  doc.rect(PDF.margin, 16, 20, 20);
  const logo = document.querySelector(".logo-area img");
  if(logo){
    try{
      const cv = document.createElement("canvas");
      cv.width = 260; cv.height = 260;
      const cx = cv.getContext("2d");
      cx.fillStyle = "#F4CF28"; cx.fillRect(0,0,260,260);
      const r = Math.min(220 / logo.naturalWidth, 220 / logo.naturalHeight);
      const w = logo.naturalWidth * r, h = logo.naturalHeight * r;
      cx.drawImage(logo, (260 - w) / 2, (260 - h) / 2, w, h);
      doc.addImage(cv.toDataURL("image/jpeg", 0.88), "JPEG", PDF.margin, 16, 20, 20, undefined, "FAST");
      doc.setDrawColor(...PDF.ink); doc.setLineWidth(.6);
      doc.rect(PDF.margin, 16, 20, 20);
    }catch(e){}
  }
  doc.setFont("helvetica","bold"); doc.setFontSize(11);
  doc.setTextColor(...PDF.ink);
  doc.text(CONTATO.nome, PDF.margin + 25, 24);
  doc.setFont("courier","normal"); doc.setFontSize(8.5);
  doc.setTextColor(...PDF.muted);
  doc.text(`${CONTATO.atuacao} · construindo seu projeto`, PDF.margin + 25, 29);

  const hoje = new Date().toLocaleDateString("pt-BR");
  doc.text(hoje, PDF.right, 24, {align:"right"});

  // --- título ---
  doc.setFont("helvetica","bold"); doc.setFontSize(34);
  doc.setTextColor(...PDF.ink);
  doc.text("BRIEFING", PDF.margin, 58);
  doc.text("DE PROJETO", PDF.margin, 71);

  const cliente = value("#name") || "Cliente";
  doc.setFillColor(...PDF.blue);
  doc.rect(PDF.margin, 77, 3, 9, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(15);
  doc.text(cliente, PDF.margin + 6, 84);

  const contatoCliente = [value("#email"), value("#clientWhatsapp")].filter(Boolean).join("  ·  ");
  if(contatoCliente){
    doc.setFont("courier","normal"); doc.setFontSize(9);
    doc.setTextColor(...PDF.muted);
    doc.text(contatoCliente, PDF.margin + 6, 89.5);
  }

  doc.setDrawColor(...PDF.ink); doc.setLineWidth(1.2);
  doc.line(PDF.margin, 96, PDF.right, 96);

  state.y = 104;

  // --- seções ---
  const cores = PDF;
  pdfSection(doc, state, "01", "o projeto",
    pdfWrap(doc, [list(data.projectType), value("#projectDescription")].filter(Boolean).join(" — ")), cores.red);

  pdfSection(doc, state, "02", "intenção",
    pdfWrap(doc, [data.intention, value("#intentionDescription")].filter(Boolean).join(" — ")), cores.blue);

  // cores com amostras
  if(state.y + 34 > PDF.bottom){ state.page++; doc.addPage(); pdfFrame(doc, state.page); state.y = 26; }
  let y = state.y;
  doc.setFillColor(...cores.yellow);
  doc.rect(PDF.margin, y - 4.4, 11, 6.4, "F");
  doc.setFont("courier","bold"); doc.setFontSize(8.5);
  doc.setTextColor(...PDF.ink);
  doc.text("03", PDF.margin + 5.5, y, {align:"center"});
  doc.setTextColor(...PDF.muted);
  doc.text("PALETA", PDF.margin + 15, y);
  y += 7;

  if(data.colors.length){
    data.colors.forEach((nome, i)=>{
      const rgb = hexToRgb(SWATCHES[nome] || "#cccccc");
      const x = PDF.margin + i * 34;
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(x, y, 30, 16, "F");
      doc.setDrawColor(...PDF.ink); doc.setLineWidth(.4);
      doc.rect(x, y, 30, 16);
      doc.setFont("courier","normal"); doc.setFontSize(7.5);
      doc.setTextColor(...PDF.body);
      doc.text(nome.toLowerCase(), x, y + 20);
    });
    y += 26;
  }else{
    doc.setFont("helvetica","normal"); doc.setFontSize(11.5);
    doc.setTextColor(...PDF.body);
    doc.text("não informado", PDF.margin, y + 3); y += 10;
  }
  doc.setDrawColor(...PDF.ink); doc.setLineWidth(.3);
  doc.line(PDF.margin, y, PDF.right, y);
  state.y = y + 6.5;

  pdfSection(doc, state, "04", "tipografia",
    pdfWrap(doc, [list(data.fonts), value("#fontFavorite")].filter(Boolean).join(" — ")), cores.red);

  pdfSection(doc, state, "05", "sensação",
    pdfWrap(doc, [list(data.feelings), value("#message")].filter(Boolean).join(" — ")), cores.blue);

  pdfSection(doc, state, "06", "referências",
    pdfWrap(doc, [
      "Google Drive: " + (value("#drive") || "nenhuma pasta enviada"),
      "Pinterest: " + (value("#pinterest") || "não informado")
    ].join("\n")), cores.yellow);

  if(value("#extra")){
    pdfSection(doc, state, "07", "observações", pdfWrap(doc, value("#extra")), cores.red);
  }

  // --- fechamento ---
  if(state.y + 40 > PDF.bottom){ state.page++; doc.addPage(); pdfFrame(doc, state.page); state.y = 30; }
  const fy = state.y + 4;
  doc.setFillColor(...PDF.ink);
  doc.rect(PDF.margin, fy, PDF.right - PDF.margin, 34, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(15);
  doc.setTextColor(...PDF.paper);
  doc.text("vamos começar?", PDF.margin + 8, fy + 13);
  doc.setFont("courier","normal"); doc.setFontSize(9);
  doc.setTextColor(...PDF.yellow);
  doc.text(`${CONTATO.whatsapp}   ${CONTATO.email}`, PDF.margin + 8, fy + 23);

  const slug = cliente.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "cliente";
  doc.save(`briefing-${slug}.pdf`);
}

document.querySelector("#downloadPdf").addEventListener("click", ()=>{
  document.querySelector("#errorMessage").textContent = "";
  buildPDF();
});

/* ---------- INITIALIZATION ---------- */
restoreState();
renderPalette();
renderFontCounter();
updateUI();
