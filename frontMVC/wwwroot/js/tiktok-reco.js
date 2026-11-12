const data = {
  exampleName: "Algoritmo de Recomendación de TikTok",
  description: "Predice si el próximo video atrapará al estudiante según su comportamiento.",
  inputs: [
    { id: 1, name: "Vio el video en bucle (Loop/Replay)", category: "Interacción Inmediata", type: "binary" },
    { id: 2, name: "Gancho inicial efectivo (Primeros 3s)", category: "Interacción Inmediata", type: "binary" },
    { id: 3, name: "Porcentaje visto alto (+80% del video)", category: "Interacción Inmediata", type: "binary" },
    { id: 4, name: "Salto instantáneo (Skip en <2s)", category: "Interacción Inmediata", type: "binary" },
    { id: 5, name: "Guardó en Favoritos / Colección", category: "Interacción Inmediata", type: "binary" },
    { id: 6, name: "Compartió el video (WhatsApp/DM)", category: "Interacción Inmediata", type: "binary" },

    { id: 7, name: "Ya sigue a este creador", category: "Afinidad con Creador", type: "binary" },
    { id: 8, name: "Entró al perfil a ver más videos", category: "Afinidad con Creador", type: "binary" },
    { id: 9, name: "Interactuó con este creador antes", category: "Afinidad con Creador", type: "binary" },
    { id: 10, name: "Creador del mismo país / región", category: "Afinidad con Creador", type: "binary" },
    { id: 11, name: "Creador verificado / alta reputación", category: "Afinidad con Creador", type: "binary" },

    { id: 12, name: "Audio / Música viral en tendencia", category: "Atributos del Video", type: "binary" },
    { id: 13, name: "Tiene subtítulos dinámicos", category: "Atributos del Video", type: "binary" },
    { id: 14, name: "Duración corta (<15 segundos)", category: "Atributos del Video", type: "binary" },
    { id: 15, name: "Tema afín al usuario (Humor/Gaming)", category: "Atributos del Video", type: "binary" },
    { id: 16, name: "Alta tasa de debate en comentarios", category: "Atributos del Video", type: "binary" },
    { id: 17, name: "Video recién publicado (<24h)", category: "Atributos del Video", type: "binary" },
    { id: 18, name: "Tiene hashtags de tendencia", category: "Atributos del Video", type: "binary" },

    { id: 19, name: "Buscó recientemente este tema", category: "Contexto de Sesión", type: "binary" },
    { id: 20, name: "Fatiga de sesión (Saltó 3 seguidos)", category: "Contexto de Sesión", type: "binary" },
    { id: 21, name: "Tiempo continuo en app (+45 min)", category: "Contexto de Sesión", type: "binary" },
    { id: 22, name: "Horario nocturno / Madrugada", category: "Contexto de Sesión", type: "binary" },
    { id: 23, name: "Velocidad de scroll rápida (Ansioso)", category: "Contexto de Sesión", type: "binary" },
    { id: 24, name: "Audio del celular con volumen > 0", category: "Contexto de Sesión", type: "binary" },
    { id: 25, name: "Vio 3+ videos de este tema hoy", category: "Contexto de Sesión", type: "binary" }
  ],
  outputs: [
    { id: 1, name: "Probabilidad de Retención (+5s)", unit: "%" },
    { id: 2, name: "Probabilidad de Salto (Skip)", unit: "%" },
    { id: 3, name: "Probabilidad de Interacción (Like/Share)", unit: "%" }
  ]
};

const state = { inputs: Array(25).fill(0), hiddenCount: 8 };
const categories = ["Interacción Inmediata", "Afinidad con Creador", "Atributos del Video", "Contexto de Sesión"];

const svg = document.getElementById("graphSvg");
const hiddenSlider = document.getElementById("hiddenSlider");
const hiddenCountEl = document.getElementById("hiddenCount");
const inputsList = document.getElementById("inputsList");
const connGroup = document.getElementById("connGroup");
const inGroup = document.getElementById("inGroup");
const hidGroup = document.getElementById("hidGroup");
const outGroup = document.getElementById("outGroup");

const btnAutoScroll = document.getElementById("btnAutoScroll");
const scrollIcon = document.getElementById("scrollIcon");
const scrollText = document.getElementById("scrollText");
const scrollPill = document.getElementById("scrollPill");
const scrollVideoName = document.getElementById("scrollVideoName");

let autoScrollTimer = null;
let autoIndex = 0;

const demoVideos = [
  { title: "Trend de Baile Viral", active: [2, 12, 13, 24] },
  { title: "Tutorial Largo Aburrido", active: [4, 20, 23] },
  { title: "Chisme / Polémica de Medianoche", active: [16, 19, 22] }
];

function clearInputsUI() {
  state.inputs.fill(0);
  document.querySelectorAll('.input-item input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  document.querySelectorAll('.input-item input[type="range"]').forEach(r => {
    r.value = "0";
    const valEl = r.closest('.slider-control')?.querySelector('.data-mono');
    if (valEl) valEl.textContent = "0";
  });
}

function applyVideo(video) {
  clearInputsUI();
  video.active.forEach(id => {
    const idx = id - 1;
    state.inputs[idx] = 1;
    const cb = document.querySelector(`.input-item input[type="checkbox"][data-id="${id}"]`);
    if (cb) cb.checked = true;
  });
  if (scrollVideoName) scrollVideoName.textContent = video.title;
  update();
}

function stopAutoScroll(manual = false) {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
  if (scrollPill) scrollPill.style.display = "none";
  if (scrollIcon) scrollIcon.textContent = "▶";
  if (scrollText) scrollText.textContent = "Simular Scroll en Vivo";
  if (!manual && btnAutoScroll) btnAutoScroll.classList.remove("active");
}

function startAutoScroll() {
  if (autoScrollTimer) return;
  if (scrollPill) scrollPill.style.display = "inline-flex";
  if (scrollIcon) scrollIcon.textContent = "❚❚";
  if (scrollText) scrollText.textContent = "Pausar Scroll";
  if (btnAutoScroll) btnAutoScroll.classList.add("active");
  applyVideo(demoVideos[autoIndex]);
  autoScrollTimer = setInterval(() => {
    autoIndex = (autoIndex + 1) % demoVideos.length;
    applyVideo(demoVideos[autoIndex]);
  }, 3500);
}

function onManualInteraction() {
  if (autoScrollTimer) stopAutoScroll(true);
}

function buildInputs() {
  inputsList.innerHTML = "";
  categories.forEach(cat => {
    const block = document.createElement("div");
    block.className = "category-block";
    const head = document.createElement("div");
    head.className = "category-head";
    const title = document.createElement("span");
    title.className = "category-title";
    title.textContent = cat;
    const count = document.createElement("span");
    count.className = "category-count";
    const items = data.inputs.filter(i => i.category === cat);
    count.textContent = items.length + " entradas";
    head.appendChild(title);
    head.appendChild(count);
    block.appendChild(head);
    items.forEach(item => {
      const row = document.createElement("div");
      row.className = "input-item";
      const text = document.createElement("div");
      text.className = "input-text";
      const name = document.createElement("span");
      name.className = "input-name";
      name.textContent = item.name;
      const meta = document.createElement("span");
      meta.className = "input-meta";
      meta.textContent = item.type === "binary" ? "Binario" : "Continuo (0 - 100)";
      text.appendChild(name); text.appendChild(meta);
      if (item.type === "binary") {
        const sw = document.createElement("label");
        sw.className = "switch";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.id = item.id;
        input.addEventListener("change", e => {
          onManualInteraction();
          const idx = item.id - 1;
          state.inputs[idx] = e.target.checked ? 1 : 0;
          update();
        });
        const span = document.createElement("span");
        span.className = "switch-slider";
        sw.appendChild(input); sw.appendChild(span);
        row.appendChild(text); row.appendChild(sw);
      } else {
        const ctrl = document.createElement("div");
        ctrl.className = "slider-control";
        const srow = document.createElement("div");
        srow.className = "slider-row";
        const lbl = document.createElement("span");
        lbl.textContent = "Valor";
        const val = document.createElement("span");
        val.className = "data-mono";
        val.textContent = "0";
        srow.appendChild(lbl); srow.appendChild(val);
        const range = document.createElement("input");
        range.type = "range";
        range.min = "0";
        range.max = "100";
        range.value = "0";
        range.className = "slider-input";
        range.dataset.id = item.id;
        range.addEventListener("input", e => {
          onManualInteraction();
          const idx = item.id - 1;
          const v = Number(e.target.value);
          val.textContent = v;
          state.inputs[idx] = v / 100;
          update();
        });
        ctrl.appendChild(srow);
        ctrl.appendChild(range);
        row.appendChild(text);
        row.appendChild(ctrl);
      }
      block.appendChild(row);
    });
    inputsList.appendChild(block);
  });
}

function draw() {
  connGroup.innerHTML = "";
  inGroup.innerHTML = "";
  hidGroup.innerHTML = "";
  outGroup.innerHTML = "";

  const inX = 140;
  const hidX = 420;
  const outX = 720;
  const h = 560;

  for (let i = 0; i < 25; i++) {
    const y = 40 + (i * (h - 80) / 24);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node-group");
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "node-circle");
    c.setAttribute("cx", inX); c.setAttribute("cy", y); c.setAttribute("r", 9);
    if (state.inputs[i] > 0.5) c.classList.add("active");
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("class", "node-sub");
    t.setAttribute("x", inX); t.setAttribute("y", y + 22);
    t.textContent = i + 1;
    g.appendChild(c); g.appendChild(t);
    inGroup.appendChild(g);
  }

  const hc = state.hiddenCount;
  for (let i = 0; i < hc; i++) {
    const y = 80 + (i * (h - 160) / Math.max(1, hc - 1));
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node-group");
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "node-circle hidden-node");
    c.setAttribute("cx", hidX); c.setAttribute("cy", y); c.setAttribute("r", 12);
    if (state.inputs.some(v => v > 0.1)) c.classList.add("lit");
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("class", "node-sub");
    t.setAttribute("x", hidX); t.setAttribute("y", y + 26);
    t.textContent = "H" + (i + 1);
    g.appendChild(c); g.appendChild(t);
    hidGroup.appendChild(g);

    for (let j = 0; j < 25; j++) {
      const iy = 40 + (j * (h - 80) / 24);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const active = state.inputs[j] > 0.1;
      line.setAttribute("class", "conn" + (active ? " active pulse" : ""));
      line.setAttribute("x1", inX + 9); line.setAttribute("y1", iy);
      line.setAttribute("x2", hidX - 12); line.setAttribute("y2", y);
      connGroup.appendChild(line);
    }
  }

  const oy = [160, 280, 400];
  const outNames = ["Retención", "Skip", "Interacción"];
  const anyActive = state.inputs.some(v => v > 0.1);
  for (let i = 0; i < 3; i++) {
    const y = oy[i];
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node-group");
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "node-circle");
    c.setAttribute("cx", outX); c.setAttribute("cy", y); c.setAttribute("r", 14);
    if (anyActive) c.classList.add("active");
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("class", "node-label");
    t.setAttribute("x", outX); t.setAttribute("y", y + 4);
    t.textContent = outNames[i];
    g.appendChild(c); g.appendChild(t);
    outGroup.appendChild(g);

    for (let j = 0; j < hc; j++) {
      const hy = 80 + (j * (h - 160) / Math.max(1, hc - 1));
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "conn" + (anyActive ? " active pulse" : ""));
      line.setAttribute("x1", hidX + 12); line.setAttribute("y1", hy);
      line.setAttribute("x2", outX - 14); line.setAttribute("y2", y);
      connGroup.appendChild(line);
    }
  }
}

function update() {
  draw();
  const sum = state.inputs.reduce((a, b) => a + b, 0);

  let retention = 18;
  let skip = 68;
  let interaction = 14;

  if (sum > 0) {
    const active = state.inputs;
    retention = 18
      + (active[0] ? 12 : 0) + (active[1] ? 14 : 0) + (active[2] ? 12 : 0)
      + (active[4] ? 8 : 0) + (active[6] ? 8 : 0) + (active[7] ? 6 : 0) + (active[8] ? 6 : 0)
      + (active[11] ? 8 : 0) + (active[12] ? 6 : 0) + (active[13] ? 6 : 0) + (active[14] ? 6 : 0)
      + (active[17] ? 4 : 0) + (active[23] ? 4 : 0)
      - (active[3] ? 22 : 0) - (active[19] ? 14 : 0) - (active[22] ? 10 : 0) - (active[20] ? 6 : 0);

    interaction = 14
      + (active[5] ? 18 : 0) + (active[4] ? 10 : 0) + (active[7] ? 8 : 0) + (active[8] ? 8 : 0)
      + (active[15] ? 12 : 0) + (active[18] ? 12 : 0) + (active[21] ? 8 : 0) + (active[24] ? 6 : 0)
      + (active[6] ? 4 : 0)
      - (active[3] ? 12 : 0) - (active[19] ? 8 : 0) - (active[22] ? 6 : 0);

    skip = 100 - retention - interaction;

    if (active[3]) skip += 20;
    if (active[19]) skip += 10;
    if (active[22]) skip += 8;
    if (active[1] || active[11] || active[12]) skip -= 10;
  }

  retention = Math.max(5, Math.min(95, retention));
  interaction = Math.max(5, Math.min(95, interaction));
  skip = Math.max(5, Math.min(95, skip));

  const total = retention + interaction + skip;
  retention = (retention / total) * 100;
  interaction = (interaction / total) * 100;
  skip = (skip / total) * 100;

  setOut(1, retention);
  setOut(2, skip);
  setOut(3, interaction);
}

function setOut(id, val) {
  const bar = document.getElementById("bar-" + id);
  const txt = document.getElementById("val-" + id);
  if (bar) bar.style.width = val + "%";
  if (txt) txt.textContent = val.toFixed(0) + "%";
  if (bar) {
    bar.classList.remove("warn", "danger");
    if (id === 2 && val > 60) bar.classList.add("warn");
    if (id === 2 && val > 80) bar.classList.add("danger");
  }
}

if (hiddenSlider) {
  hiddenSlider.addEventListener("input", e => {
    state.hiddenCount = Number(e.target.value);
    if (hiddenCountEl) hiddenCountEl.textContent = state.hiddenCount;
    update();
  });
}

if (btnAutoScroll) {
  btnAutoScroll.addEventListener("click", () => {
    if (autoScrollTimer) {
      stopAutoScroll(true);
    } else {
      startAutoScroll();
    }
  });
}

buildInputs();
update();
