const data = {
  "exampleName": "Algoritmo de Recomendación de TikTok",
  "description": "Predice si el próximo video atrapará al estudiante según su comportamiento.",
  "inputs": [
    {"id": 1, "name": "Dio Like al anterior", "category": "Interacción", "type": "binary"},
    {"id": 2, "name": "Compartió el anterior", "category": "Interacción", "type": "binary"},
    {"id": 3, "name": "Comentó el anterior", "category": "Interacción", "type": "binary"},
    {"id": 4, "name": "Vio completo el anterior", "category": "Interacción", "type": "binary"},
    {"id": 5, "name": "Entró al perfil del creador", "category": "Interacción", "type": "binary"},
    {"id": 6, "name": "Tiene música viral", "category": "Contenido", "type": "binary"},
    {"id": 7, "name": "Es de Humor / Memes", "category": "Contenido", "type": "binary"},
    {"id": 8, "name": "Es de Videojuegos", "category": "Contenido", "type": "binary"},
    {"id": 9, "name": "Es de Cocina / Recetas", "category": "Contenido", "type": "binary"},
    {"id": 10, "name": "Es un Baile / Trend", "category": "Contenido", "type": "binary"},
    {"id": 11, "name": "Es Informativo / Educativo", "category": "Contenido", "type": "binary"},
    {"id": 12, "name": "Es Chisme / Drama", "category": "Contenido", "type": "binary"},
    {"id": 13, "name": "Tiene subtítulos llamativos", "category": "Contenido", "type": "binary"},
    {"id": 14, "name": "Duración del video (Largo)", "category": "Contenido", "type": "continuous"},
    {"id": 15, "name": "Brillo/Luces del video", "category": "Contenido", "type": "continuous"},
    {"id": 16, "name": "Hora (Es de Madrugada)", "category": "Contexto", "type": "binary"},
    {"id": 17, "name": "Conexión Wi-Fi Rápida", "category": "Contexto", "type": "binary"},
    {"id": 18, "name": "Auriculares Puestos", "category": "Contexto", "type": "binary"},
    {"id": 19, "name": "Batería del Celular", "category": "Contexto", "type": "continuous"},
    {"id": 20, "name": "Velocidad de Scroll", "category": "Contexto", "type": "continuous"},
    {"id": 21, "name": "Minutos usando la app hoy", "category": "Historial", "type": "continuous"},
    {"id": 22, "name": "Vio +3 videos del mismo tema", "category": "Historial", "type": "binary"},
    {"id": 23, "name": "Edad del usuario", "category": "Historial", "type": "continuous"},
    {"id": 24, "name": "Idioma coincide con video", "category": "Historial", "type": "binary"},
    {"id": 25, "name": "Siguió a alguien hace poco", "category": "Historial", "type": "binary"}
  ],
  "outputs": [
    {"id": 1, "name": "Probabilidad de Retención (+5s)", "unit": "%"},
    {"id": 2, "name": "Probabilidad de Salto (Skip)", "unit": "%"},
    {"id": 3, "name": "Probabilidad de Interacción (Like/Share)", "unit": "%"}
  ]
};

const state = { inputs: Array(25).fill(0), hiddenCount: 8 };
const categories = ["Interacción", "Contenido", "Contexto", "Historial"];
const svg = document.getElementById("graphSvg");
const hiddenSlider = document.getElementById("hiddenSlider");
const hiddenCountEl = document.getElementById("hiddenCount");
const inputsList = document.getElementById("inputsList");
const connGroup = document.getElementById("connGroup");
const inGroup = document.getElementById("inGroup");
const hidGroup = document.getElementById("hidGroup");
const outGroup = document.getElementById("outGroup");

function buildInputs(){
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
      if(item.type === "binary"){
        const sw = document.createElement("label");
        sw.className = "switch";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.id = item.id;
        input.addEventListener("change", e => {
          const idx = item.id - 1;
          state.inputs[idx] = e.target.checked ? 1 : 0;
          update();
        });
        const span = document.createElement("span");
        span.className = "switch-slider";
        sw.appendChild(input); sw.appendChild(span);
        row.appendChild(text); row.appendChild(sw);
      }else{
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

function draw(){
  connGroup.innerHTML = "";
  inGroup.innerHTML = "";
  hidGroup.innerHTML = "";
  outGroup.innerHTML = "";

  const inX = 140;
  const hidX = 420;
  const outX = 720;
  const h = 560;

  for(let i=0;i<25;i++){
    const y = 40 + (i * (h-80)/24);
    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("class","node-group");
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("class","node-circle");
    c.setAttribute("cx",inX); c.setAttribute("cy",y); c.setAttribute("r",9);
    if(state.inputs[i] > 0.5) c.classList.add("active");
    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("class","node-sub");
    t.setAttribute("x",inX); t.setAttribute("y",y+22);
    t.textContent = i+1;
    g.appendChild(c); g.appendChild(t);
    inGroup.appendChild(g);
  }

  const hc = state.hiddenCount;
  for(let i=0;i<hc;i++){
    const y = 80 + (i * (h-160)/Math.max(1,hc-1));
    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("class","node-group");
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("class","node-circle hidden-node");
    c.setAttribute("cx",hidX); c.setAttribute("cy",y); c.setAttribute("r",12);
    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("class","node-sub");
    t.setAttribute("x",hidX); t.setAttribute("y",y+26);
    t.textContent = "H"+(i+1);
    g.appendChild(c); g.appendChild(t);
    hidGroup.appendChild(g);

    for(let j=0;j<25;j++){
      const iy = 40 + (j * (h-80)/24);
      if(state.inputs[j] > 0.1){
        const line = document.createElementNS("http://www.w3.org/2000/svg","line");
        line.setAttribute("class","conn active");
        line.setAttribute("x1",inX+9); line.setAttribute("y1",iy);
        line.setAttribute("x2",hidX-12); line.setAttribute("y2",y);
        connGroup.appendChild(line);
      }else{
        const line = document.createElementNS("http://www.w3.org/2000/svg","line");
        line.setAttribute("class","conn");
        line.setAttribute("x1",inX+9); line.setAttribute("y1",iy);
        line.setAttribute("x2",hidX-12); line.setAttribute("y2",y);
        connGroup.appendChild(line);
      }
    }
  }

  const oy = [160, 280, 400];
  const outNames = ["Retención", "Skip", "Interacción"];
  for(let i=0;i<3;i++){
    const y = oy[i];
    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("class","node-group");
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("class","node-circle");
    c.setAttribute("cx",outX); c.setAttribute("cy",y); c.setAttribute("r",14);
    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("class","node-label");
    t.setAttribute("x",outX); t.setAttribute("y",y+4);
    t.textContent = outNames[i];
    g.appendChild(c); g.appendChild(t);
    outGroup.appendChild(g);

    for(let j=0;j<hc;j++){
      const hy = 80 + (j * (h-160)/Math.max(1,hc-1));
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("class","conn");
      line.setAttribute("x1",hidX+12); line.setAttribute("y1",hy);
      line.setAttribute("x2",outX-14); line.setAttribute("y2",y);
      connGroup.appendChild(line);
    }
  }
}

function update(){
  draw();
  const sum = state.inputs.reduce((a,b)=>a+b,0);
  const activeCount = state.inputs.filter(v => v >= 0.5).length;
  const continuous = state.inputs.filter((v,i) => {
    const item = data.inputs[i];
    return item && item.type === 'continuous' && v > 0;
  }).reduce((a,b)=>a+b,0);

  let retention = 18 + activeCount * 2.2 + continuous * 8;
  let interaction = 12 + activeCount * 1.8 + continuous * 6;
  let skip = 100 - retention - interaction;

  if(sum === 0){
    retention = 18;
    interaction = 14;
    skip = 68;
  }

  retention = Math.max(5, Math.min(92, retention));
  interaction = Math.max(5, Math.min(90, interaction));
  skip = Math.max(5, Math.min(90, skip));

  const total = retention + interaction + skip;
  if(total > 0){
    retention = (retention / total) * 100;
    interaction = (interaction / total) * 100;
    skip = (skip / total) * 100;
  }

  setOut(1, retention);
  setOut(2, skip);
  setOut(3, interaction);
}

function setOut(id, val){
  const bar = document.getElementById("bar-"+id);
  const txt = document.getElementById("val-"+id);
  if(bar) bar.style.width = val + "%";
  if(txt) txt.textContent = val.toFixed(0) + "%";
  if(bar){
    bar.classList.remove("warn","danger");
    if(id === 2 && val > 60) bar.classList.add("warn");
    if(id === 2 && val > 80) bar.classList.add("danger");
  }
}

hiddenSlider.addEventListener("input", e => {
  state.hiddenCount = Number(e.target.value);
  hiddenCountEl.textContent = state.hiddenCount;
  update();
});

buildInputs();
update();
