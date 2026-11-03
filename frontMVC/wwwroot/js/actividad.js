// actividad.js - Lógica interactiva y conexión a la API .NET
const API_BASE = "http://localhost:5050/api/red";

const EMOJIS = {
    "Playa": "🏖️",
    "Cine": "🎬",
    "Gym": "🏋️",
    "Casa": "🏠",
    "Salir": "🎉"
};

// ===============================================
// 1. MÓDULO DE PREDICCIÓN EN VIVO (Probar.cshtml)
// ===============================================
let debounceTimer = null;

function inicializarSimulador() {
    const inputs = document.querySelectorAll('.param-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Actualizar etiqueta del valor numérico
            const id = input.id;
            const badge = document.getElementById(id + '_val');
            if (badge) {
                if (input.type === 'checkbox') {
                    badge.textContent = input.checked ? "1 (SÍ)" : "0 (NO)";
                } else {
                    badge.textContent = Math.round(parseFloat(input.value) * 100) + "%";
                }
            }

            // Debounce para consultar a la API
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(ejecutarPrediccion, 80);
        });
    });

    // Primera predicción al cargar la página
    ejecutarPrediccion();
}

function leerEntradas() {
    return [
        // Clima (5)
        parseFloat(document.getElementById('temp').value),
        document.getElementById('lluvia').checked ? 1.0 : 0.0,
        document.getElementById('viento').checked ? 1.0 : 0.0,
        parseFloat(document.getElementById('humedad').value),
        parseFloat(document.getElementById('sol').value),

        // Estado personal (5)
        parseFloat(document.getElementById('energia').value),
        parseFloat(document.getElementById('animo').value),
        parseFloat(document.getElementById('estres').value),
        parseFloat(document.getElementById('sueno').value),
        document.getElementById('salud').checked ? 1.0 : 0.0,

        // Recursos (5)
        parseFloat(document.getElementById('dinero').value),
        document.getElementById('transporte').checked ? 1.0 : 0.0,
        parseFloat(document.getElementById('tiempolibre').value),
        document.getElementById('finde').checked ? 1.0 : 0.0,
        document.getElementById('feriado').checked ? 1.0 : 0.0,

        // Social (5)
        document.getElementById('amigos').checked ? 1.0 : 0.0,
        document.getElementById('pareja').checked ? 1.0 : 0.0,
        document.getElementById('familia').checked ? 1.0 : 0.0,
        parseFloat(document.getElementById('ganas_social').value),
        document.getElementById('compromisos').checked ? 1.0 : 0.0,

        // Preferencias (5)
        parseFloat(document.getElementById('ganas_fisica').value),
        parseFloat(document.getElementById('ganas_entretenimiento').value),
        parseFloat(document.getElementById('ganas_descansar').value),
        parseFloat(document.getElementById('ganas_airelibre').value),
        parseFloat(document.getElementById('ganas_aprender').value)
    ];
}

async function ejecutarPrediccion() {
    const vector = leerEntradas();

    try {
        const resp = await fetch(`${API_BASE}/predecir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entradas: vector })
        });

        if (resp.ok) {
            const data = await resp.json();
            actualizarUIResultados(data);
            actualizarEstadoAPI(true, data.sesionUsada);
        } else {
            console.warn("API respondió con error, usando fallback pedagógico local.");
            ejecutarFallbackLocal(vector);
            actualizarEstadoAPI(false);
        }
    } catch (err) {
        console.warn("API no disponible en http://localhost:5050. Usando motor didáctico local:", err);
        ejecutarFallbackLocal(vector);
        actualizarEstadoAPI(false);
    }
}

function actualizarUIResultados(data) {
    const winner = data.prediccion;
    const probs = data.probabilidades;

    // Ganador
    document.getElementById('winner_emoji').textContent = EMOJIS[winner] || "💡";
    document.getElementById('winner_name').textContent = winner;
    const winnerPercent = Math.round((probs[winner] || 0) * 100);
    document.getElementById('winner_confidence').textContent = `${winnerPercent}% de certeza`;

    // Barras
    const list = document.getElementById('prob_list');
    if (list) {
        list.innerHTML = '';
        const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);

        sorted.forEach(([act, p]) => {
            const pct = Math.round(p * 100);
            const isLead = act === winner;
            const item = document.createElement('div');
            item.className = 'prob-item';
            item.innerHTML = `
                <div class="prob-info">
                    <span>${EMOJIS[act] || ''} ${act}</span>
                    <span class="font-mono ${isLead ? 'text-cyan' : ''}">${pct}%</span>
                </div>
                <div class="prob-bar-track">
                    <div class="prob-bar-fill ${isLead ? 'lead' : ''}" style="width: ${pct}%"></div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    // Explicación didáctica
    generarExplicacionDidactica(winner, probs);
}

function generarExplicacionDidactica(winner, probs) {
    const textEl = document.getElementById('didactic_text');
    if (!textEl) return;

    let razon = "";
    if (winner === "Playa") {
        razon = "La red activó con fuerza los pesos asociados a <strong>alta temperatura, horas de sol y tiempo libre</strong>, mientras que la ausencia de lluvia permitió pasar el umbral de decisión.";
    } else if (winner === "Cine") {
        razon = "El frío o lluvia exterior, combinado con <strong>recursos económicos disponibles y deseos de entretenimiento bajo techo</strong>, maximizó la salida de esta neurona.";
    } else if (winner === "Gym") {
        razon = "La combinación de <strong>alta energía corporal, salud plena y ganas de actividad física</strong> disparó la activación de esta categoría, sin importar el clima.";
    } else if (winner === "Casa") {
        razon = "Los factores de <strong>cansancio acumulado, estrés o bajo presupuesto</strong> ponderaron negativamente las opciones exteriores, resultando en máxima probabilidad para descansar.";
    } else if (winner === "Salir") {
        razon = "La presencia de <strong>amigos disponibles, fin de semana, buen ánimo y ganas de socializar</strong> combinaron sus pesos para impulsar esta recomendación.";
    }

    textEl.innerHTML = `
        <div class="mb-2"><strong>¿Por qué eligió ${winner}?</strong></div>
        <p class="mb-0">${razon}</p>
        <div class="mt-2 text-muted" style="font-size: 0.82rem;">
            Cada una de las 25 entradas multiplicó su valor por los pesos aprendidos de la sesión activa guardada en SQLite, pasando por la capa oculta ReLU y finalmente por la función Softmax que normaliza las 5 probabilidades al 100%.
        </div>
    `;
}

function actualizarEstadoAPI(activa, sesionId) {
    const dot = document.getElementById('api_dot');
    const text = document.getElementById('api_text');
    if (!dot || !text) return;

    if (activa) {
        dot.style.background = 'var(--accent-green)';
        dot.style.boxShadow = '0 0 8px var(--accent-green)';
        text.textContent = `API SQLite Conectada (Sesión #${sesionId || 1})`;
    } else {
        dot.style.background = 'var(--accent-amber)';
        dot.style.boxShadow = '0 0 8px var(--accent-amber)';
        text.textContent = `Modo Autónomo Local (Inicie API en :5050)`;
    }
}

// Fallback didáctico local si la API aún no está corriendo en background
function ejecutarFallbackLocal(vec) {
    // Cálculo heurístico proporcional mientras arranca la API
    const [temp, lluvia, viento, hum, sol, energia, animo, estres, sueno, salud, dinero, transp, libre, finde, feriado, amigos, pareja, fam, ganas_soc, comp, ganas_fis, ganas_ent, ganas_desc, ganas_aire, ganas_apr] = vec;

    let sPlaya = (temp * 0.4 + sol * 0.4 + ganas_aire * 0.3 + libre * 0.2 + transp * 0.1) - (lluvia * 1.5 + viento * 0.4);
    let sCine = (lluvia * 0.5 + (1 - temp) * 0.3 + dinero * 0.3 + ganas_ent * 0.4 + (pareja + amigos) * 0.2);
    let sGym = (energia * 0.5 + salud * 0.5 + ganas_fis * 0.6 + (1 - estres * 0.2));
    let sCasa = (ganas_desc * 0.6 + (1 - energia) * 0.5 + lluvia * 0.3 + (1 - dinero) * 0.3 + ganas_apr * 0.4);
    let sSalir = (finde * 0.4 + feriado * 0.3 + ganas_soc * 0.5 + amigos * 0.4 + animo * 0.3 + dinero * 0.3);

    const scores = [Math.max(0.01, sPlaya), Math.max(0.01, sCine), Math.max(0.01, sGym), Math.max(0.01, sCasa), Math.max(0.01, sSalir)];
    const sum = scores.reduce((a, b) => a + b, 0);
    const probs = {
        "Playa": Math.round((scores[0] / sum) * 100) / 100,
        "Cine": Math.round((scores[1] / sum) * 100) / 100,
        "Gym": Math.round((scores[2] / sum) * 100) / 100,
        "Casa": Math.round((scores[3] / sum) * 100) / 100,
        "Salir": Math.round((scores[4] / sum) * 100) / 100
    };

    let best = "Playa";
    let maxP = -1;
    for (const [k, v] of Object.entries(probs)) {
        if (v > maxP) { maxP = v; best = k; }
    }

    actualizarUIResultados({ prediccion: best, probabilidades: probs, sesionUsada: 0 });
}


// ===============================================
// 2. MÓDULO DE ENTRENAMIENTO (Entrenar.cshtml)
// ===============================================
let lossChart = null;

async function inicializarEntrenador() {
    await cargarSesiones();

    const btn = document.getElementById('btn_entrenar');
    if (btn) {
        btn.addEventListener('click', iniciarEntrenamiento);
    }
}

async function cargarSesiones() {
    try {
        const res = await fetch(`${API_BASE}/sesiones`);
        if (res.ok) {
            const sesiones = await res.json();
            renderizarTablaSesiones(sesiones);
        }
    } catch (e) {
        console.warn("No se pudieron cargar sesiones de SQLite:", e);
    }
}

function renderizarTablaSesiones(sesiones) {
    const tbody = document.getElementById('sesiones_tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (sesiones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Aún no hay sesiones guardadas en SQLite. ¡Presiona "Entrenar Red"!</td></tr>`;
        return;
    }

    sesiones.forEach(s => {
        const fecha = new Date(s.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${s.id}</strong></td>
            <td>${fecha}</td>
            <td><span class="font-mono text-cyan">${s.arquitectura}</span></td>
            <td>${s.epocas}</td>
            <td class="font-mono">${s.lossFinal.toFixed(4)}</td>
            <td class="font-mono text-green">${(s.accuracyFinal * 100).toFixed(1)}%</td>
            <td>
                ${s.esActiva ? 
                    `<span class="badge-active">✓ ACTIVA</span>` : 
                    `<button class="btn btn-sm btn-outline-info py-0 px-2" onclick="activarSesion(${s.id})">Activar</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function activarSesion(id) {
    try {
        const res = await fetch(`${API_BASE}/sesiones/${id}/activar`, { method: 'PUT' });
        if (res.ok) {
            await cargarSesiones();
        }
    } catch (e) {
        console.error("Error activando sesión:", e);
    }
}

async function iniciarEntrenamiento() {
    const btn = document.getElementById('btn_entrenar');
    const statusText = document.getElementById('train_status');
    const epocas = parseInt(document.getElementById('input_epocas').value) || 2000;
    const lr = parseFloat(document.getElementById('input_lr').value) || 0.05;
    const hidden = parseInt(document.getElementById('input_hidden').value) || 8;

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Entrenando en .NET...`;
    statusText.textContent = `Calculando backpropagation para ${epocas} épocas...`;

    try {
        const res = await fetch(`${API_BASE}/entrenar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ epocas, learningRate: lr, neuronasOcultas: hidden })
        });

        if (res.ok) {
            const data = await res.json();
            statusText.textContent = `¡Entrenamiento completado! Pérdida final: ${data.lossFinal.toFixed(4)} | Precisión: ${(data.accuracyFinal * 100).toFixed(1)}%`;
            dibujarGraficoLoss(data.historialLoss);
            await cargarSesiones();
        } else {
            statusText.textContent = "Error al entrenar en el servidor.";
        }
    } catch (e) {
        console.error(e);
        statusText.textContent = "No se pudo conectar a la API en :5050.";
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>⚡</span> Iniciar Entrenamiento`;
    }
}

function dibujarGraficoLoss(historial) {
    const canvas = document.getElementById('lossCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth;
    const h = canvas.height = 240;

    ctx.clearRect(0, 0, w, h);

    if (!historial || historial.length === 0) return;

    // Margen
    const pad = 40;
    const maxLoss = Math.max(...historial, 1.0);
    const minLoss = Math.min(...historial, 0.0);

    // Ejes
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    // Curva de Loss
    ctx.strokeStyle = "#00d2ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    historial.forEach((val, i) => {
        const x = pad + (i / (historial.length - 1)) * (w - 2 * pad);
        const y = (h - pad) - ((val - minLoss) / (maxLoss - minLoss + 1e-6)) * (h - 2 * pad);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Relleno degradado bajo la curva
    ctx.lineTo(w - pad, h - pad);
    ctx.lineTo(pad, h - pad);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
    grad.addColorStop(0, "rgba(0, 210, 255, 0.25)");
    grad.addColorStop(1, "rgba(0, 210, 255, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Etiquetas
    ctx.fillStyle = "#8b9bb4";
    ctx.font = "12px JetBrains Mono";
    ctx.fillText(`Loss Inicial: ${historial[0].toFixed(3)}`, pad, pad - 10);
    ctx.fillText(`Loss Final: ${historial[historial.length - 1].toFixed(3)}`, w - pad - 140, pad - 10);
    ctx.fillText("Épocas de aprendizaje →", w / 2 - 70, h - 12);
}


// ===============================================
// 3. MÓDULO VISUALIZADOR DE LA RED (Red.cshtml)
// ===============================================
async function inicializarVisualizadorRed() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    // Cargar datos reales con forward paso
    const dummyInput = new Array(25).fill(0.5);
    try {
        const res = await fetch(`${API_BASE}/forward-paso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entradas: dummyInput })
        });
        if (res.ok) {
            const data = await res.json();
            dibujarRedCompleta(canvas, data);
            return;
        }
    } catch (e) {
        console.warn("Usando visualizador esquemático local:", e);
    }

    dibujarRedEsquematica(canvas);
}

function dibujarRedCompleta(canvas, data) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth;
    const h = canvas.height = 700;

    ctx.clearRect(0, 0, w, h);

    const numIn = 25;
    const numHid = data.hiddenPostActivacion.length;
    const numOut = 5;

    const xIn = 120;
    const xHid = w / 2;
    const xOut = w - 160;

    // Calcular posiciones Y
    const posIn = [];
    for (let i = 0; i < numIn; i++) {
        posIn.push({ x: xIn, y: 35 + i * ((h - 70) / (numIn - 1)) });
    }

    const posHid = [];
    for (let j = 0; j < numHid; j++) {
        posHid.push({ x: xHid, y: 80 + j * ((h - 160) / (numHid - 1)) });
    }

    const posOut = [];
    for (let k = 0; k < numOut; k++) {
        posOut.push({ x: xOut, y: 120 + k * ((h - 240) / (numOut - 1)) });
    }

    // Dibujar conexiones Capa 0 (Entrada -> Oculta)
    const capa0 = data.capas[0];
    for (let i = 0; i < numIn; i++) {
        for (let j = 0; j < numHid; j++) {
            const peso = (capa0 && capa0.pesos[i]) ? capa0.pesos[i][j] : 0;
            ctx.beginPath();
            ctx.moveTo(posIn[i].x, posIn[i].y);
            ctx.lineTo(posHid[j].x, posHid[j].y);
            if (peso > 0) {
                ctx.strokeStyle = `rgba(0, 245, 212, ${Math.min(0.8, Math.abs(peso) * 0.4 + 0.05)})`;
            } else {
                ctx.strokeStyle = `rgba(255, 0, 84, ${Math.min(0.8, Math.abs(peso) * 0.4 + 0.05)})`;
            }
            ctx.lineWidth = Math.min(3, Math.abs(peso) * 1.5 + 0.4);
            ctx.stroke();
        }
    }

    // Dibujar conexiones Capa 1 (Oculta -> Salida)
    const capa1 = data.capas[1];
    for (let j = 0; j < numHid; j++) {
        for (let k = 0; k < numOut; k++) {
            const peso = (capa1 && capa1.pesos[j]) ? capa1.pesos[j][k] : 0;
            ctx.beginPath();
            ctx.moveTo(posHid[j].x, posHid[j].y);
            ctx.lineTo(posOut[k].x, posOut[k].y);
            if (peso > 0) {
                ctx.strokeStyle = `rgba(0, 210, 255, ${Math.min(0.9, Math.abs(peso) * 0.4 + 0.1)})`;
            } else {
                ctx.strokeStyle = `rgba(255, 0, 84, ${Math.min(0.9, Math.abs(peso) * 0.4 + 0.1)})`;
            }
            ctx.lineWidth = Math.min(4, Math.abs(peso) * 1.8 + 0.6);
            ctx.stroke();
        }
    }

    // Dibujar Nodos Entrada
    posIn.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.strokeStyle = "#00d2ff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#8b9bb4";
        ctx.font = "10px Inter";
        ctx.textAlign = "right";
        ctx.fillText(`x[${i}]`, p.x - 14, p.y + 3);
    });

    // Dibujar Nodos Ocultos
    posHid.forEach((p, j) => {
        const val = data.hiddenPostActivacion[j] || 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = val > 0 ? "rgba(157, 78, 221, 0.6)" : "#1e293b";
        ctx.fill();
        ctx.strokeStyle = "#9d4edd";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "11px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.fillText(`h${j}`, p.x, p.y + 4);
    });

    // Dibujar Nodos Salida
    const acts = ["Playa", "Cine", "Gym", "Casa", "Salir"];
    posOut.forEach((p, k) => {
        const act = acts[k];
        const prob = data.probabilidades[act] || 0;
        const isWinner = (data.prediccion === act);

        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = isWinner ? "rgba(0, 245, 212, 0.4)" : "#1e293b";
        ctx.fill();
        ctx.strokeStyle = isWinner ? "#00f5d4" : "#3a7bd5";
        ctx.lineWidth = isWinner ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Inter";
        ctx.textAlign = "left";
        ctx.fillText(`${EMOJIS[act] || ''} ${act} (${Math.round(prob * 100)}%)`, p.x + 24, p.y + 5);
    });
}

function dibujarRedEsquematica(canvas) {
    const dummyData = {
        hiddenPostActivacion: [0.5, 0.8, 0.1, 0.4, 0.9, 0.3, 0.7, 0.2],
        probabilidades: { "Playa": 0.45, "Cine": 0.15, "Gym": 0.20, "Casa": 0.10, "Salir": 0.10 },
        prediccion: "Playa",
        capas: [
            { pesos: Array.from({ length: 25 }, () => Array.from({ length: 8 }, () => (Math.random() - 0.5) * 2)) },
            { pesos: Array.from({ length: 8 }, () => Array.from({ length: 5 }, () => (Math.random() - 0.5) * 2)) }
        ]
    };
    dibujarRedCompleta(canvas, dummyData);
}
