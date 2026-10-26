(function(){
  const examples = [
    {x:[1,1,1], y:1},
    {x:[1,1,0], y:1},
    {x:[0,1,1], y:1},
    {x:[1,0,1], y:1},
    {x:[0,0,0], y:0},
    {x:[1,0,0], y:0},
    {x:[0,0,1], y:0},
    {x:[0,1,0], y:0}
  ];

  let w1 = (Math.random()-0.5)*0.4;
  let w2 = (Math.random()-0.5)*0.4;
  let w3 = (Math.random()-0.5)*0.4;
  let b  = (Math.random()-0.5)*0.4;
  const lr = 0.12;

  let step = 1;
  let epoch = 0;
  let idx = 0;
  let running = false;
  let timer = null;
  const lossHistory = [];

  function sigmoid(z){ return 1/(1+Math.exp(-z)); }

  function setStep(n){
    step = n;
    document.querySelectorAll('.step-pill').forEach(p => p.classList.remove('active'));
    const active = document.getElementById('pill-'+n);
    if(active) active.classList.add('active');
    document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('panel-'+n);
    if(panel) panel.classList.remove('hidden');
    document.getElementById('btnNext').classList.toggle('hidden', n === 6);
    document.getElementById('btnStartTrain').classList.toggle('hidden', n !== 3);

    if(n === 1){
      document.getElementById('narrTitle').textContent = 'El problema';
      document.getElementById('narrText').textContent = '¿Ir a la playa? Decidimos con 3 condiciones: sol, calor y fin de semana.';
      updateLinks();
    }else if(n === 2){
      document.getElementById('narrTitle').textContent = 'La mesa de perillas';
      document.getElementById('narrText').textContent = 'Cada entrada tiene un peso. La neurona combina según la importancia.';
      updateLinks();
    }else if(n === 3){
      document.getElementById('narrTitle').textContent = 'Aprendiendo';
      document.getElementById('narrText').textContent = 'Intentar → equivocarse → ajustar. Pequeños pasos que acumulan.';
      updateLinks();
    }else if(n === 4){
      document.getElementById('narrTitle').textContent = 'El resultado';
      document.getElementById('narrText').textContent = 'Tras ajustar las perillas, queda una regla clara.';
      updateLinks('ok');
    }else if(n === 5){
      document.getElementById('narrTitle').textContent = 'Probarlo';
      document.getElementById('narrText').textContent = 'Mové los interruptores y mirá el cálculo en vivo.';
      updateLinks('ok');
    }else if(n === 6){
      document.getElementById('narrTitle').textContent = 'La escala';
      document.getElementById('narrText').textContent = 'La diferencia es la cantidad de perillas, no el principio.';
      updateLinks('ok');
    }
  }

  function updateKnobs(){
    document.getElementById('kw1').textContent = w1.toFixed(4);
    document.getElementById('kw2').textContent = w2.toFixed(4);
    document.getElementById('kw3').textContent = w3.toFixed(4);
    document.getElementById('kb').textContent = b.toFixed(4);
    document.getElementById('bar1').style.width = Math.min(100, Math.max(6, (Math.abs(w1)/8)*100)) + '%';
    document.getElementById('bar2').style.width = Math.min(100, Math.max(6, (Math.abs(w2)/8)*100)) + '%';
    document.getElementById('bar3').style.width = Math.min(100, Math.max(6, (Math.abs(w3)/8)*100)) + '%';
    document.getElementById('barb').style.width = Math.min(100, Math.max(6, (Math.abs(b)/12)*100)) + '%';
  }

  function updateLinks(state){
    const links = document.querySelectorAll('.link');
    links.forEach(l => l.classList.remove('active','wrong','ok','flow'));
    if(state === 'flow'){
      links.forEach(l => l.classList.add('flow'));
      const neuron = document.getElementById('neuron');
      if(neuron){ neuron.classList.add('neuron-glow'); setTimeout(()=>neuron.classList.remove('neuron-glow'), 900); }
    }else if(state === 'ok'){
      links.forEach(l => l.classList.add('ok'));
    }else if(state === 'wrong'){
      links.forEach(l => l.classList.add('wrong'));
    }
  }

  function updateLoss(){
    const poly = document.getElementById('lossPoly');
    if(!poly || lossHistory.length === 0) return;
    const pts = lossHistory.slice(-40).map((v,i,a)=>{
      const x = (i/(Math.max(1,a.length-1)))*280 + 10;
      const y = 130 - Math.min(110, v*110);
      return x+','+y;
    }).join(' ');
    poly.setAttribute('points', pts);
  }

  function trainStep(){
    if(epoch >= 10 && idx === 0){
      finishTrain();
      return;
    }
    const ex = examples[idx];
    document.getElementById('exRow').textContent = '['+ex.x[0]+', '+ex.x[1]+', '+ex.x[2]+']';
    document.getElementById('exExpect').textContent = ex.y===1 ? 'SI' : 'NO';

    updateLinks('flow');
    setTimeout(()=>{
      const z = w1*ex.x[0] + w2*ex.x[1] + w3*ex.x[2] + b;
      const p = sigmoid(z);
      const pred = p>=0.5 ? 'SI' : 'NO';
      document.getElementById('predRow').textContent = p.toFixed(4) + ' (' + pred + ')';
      const err = Math.abs(p - ex.y);
      lossHistory.push(err);
      updateLoss();

      if((p>=0.5 && ex.y===1) || (p<0.5 && ex.y===0)){
        updateLinks('ok');
        document.getElementById('trainMsg').textContent = 'Acertó. Ajustando un poquito para seguir aprendiendo.';
      }else{
        updateLinks('wrong');
        document.getElementById('trainMsg').textContent = 'Se equivocó. Gira las perillas un poquito en la dirección correcta.';
      }

      const g = (p - ex.y);
      w1 -= lr * g * ex.x[0];
      w2 -= lr * g * ex.x[1];
      w3 -= lr * g * ex.x[2];
      b  -= lr * g;
      updateKnobs();

      idx++;
      if(idx >= examples.length){
        idx = 0;
        epoch++;
        document.getElementById('epochCount').textContent = epoch;
      }
    }, 650);
  }

  function finishTrain(){
    stop();
    w1 = 7.0982; w2 = 7.0982; w3 = 7.0982; b = -10.4991;
    updateKnobs();
    updateLinks('ok');
    document.getElementById('trainMsg').textContent = 'Quedaron iguales: las 3 valen lo mismo. Necesita al menos 2 de 3 para decir SÍ.';
    document.querySelectorAll('.reveal-pill').forEach((el,i)=>{
      setTimeout(()=> el.classList.add('highlight'), i*160);
    });
    setStep(4);
  }

  function start(){
    if(running) return;
    running = true;
    document.getElementById('btnStartTrain').textContent = 'Entrenando...';
    timer = setInterval(trainStep, 950);
    trainStep();
  }

  function stop(){
    running = false;
    if(timer) clearInterval(timer);
    timer = null;
    document.getElementById('btnStartTrain').textContent = 'Ver el aprendizaje';
  }

  function playUpdate(){
    const t1 = document.getElementById('t1').classList.contains('active')?1:0;
    const t2 = document.getElementById('t2').classList.contains('active')?1:0;
    const t3 = document.getElementById('t3').classList.contains('active')?1:0;
    document.getElementById('pt1').textContent = t1;
    document.getElementById('pt2').textContent = t2;
    document.getElementById('pt3').textContent = t3;
    const z = 7.0982*t1 + 7.0982*t2 + 7.0982*t3 + (-10.4991);
    const p = sigmoid(z);
    document.getElementById('pz').textContent = z.toFixed(4);
    document.getElementById('pp').textContent = p.toFixed(4);
    const res = document.getElementById('pres');
    if(p>=0.5){
      res.textContent = 'SI';
      res.style.color = 'var(--green)';
      document.getElementById('psub').textContent = 'Alcanza el umbral.';
    }else{
      res.textContent = 'NO';
      res.style.color = 'var(--red)';
      document.getElementById('psub').textContent = 'No alcanza el umbral.';
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    updateKnobs();
    updateLoss();
    document.getElementById('btnNext').addEventListener('click', ()=> setStep(Math.min(6, step+1)));
    document.getElementById('btnStartTrain').addEventListener('click', start);
    document.getElementById('btnRestart').addEventListener('click', ()=>{
      stop();
      w1=(Math.random()-0.5)*0.4; w2=(Math.random()-0.5)*0.4; w3=(Math.random()-0.5)*0.4; b=(Math.random()-0.5)*0.4;
      epoch=0; idx=0; lossHistory.length=0;
      document.getElementById('epochCount').textContent = '0';
      document.getElementById('exRow').textContent = '[?, ?, ?]';
      document.getElementById('exExpect').textContent = '?';
      document.getElementById('predRow').textContent = '-';
      document.getElementById('trainMsg').textContent = 'Presioná "Ver el aprendizaje" para ver el ciclo intentar → equivocarse → ajustar.';
      updateKnobs(); updateLoss(); updateLinks();
      document.querySelectorAll('.reveal-pill').forEach(el=>el.classList.remove('highlight'));
      setStep(3);
    });
    document.getElementById('t1').addEventListener('click', function(){ this.classList.toggle('active'); playUpdate(); });
    document.getElementById('t2').addEventListener('click', function(){ this.classList.toggle('active'); playUpdate(); });
    document.getElementById('t3').addEventListener('click', function(){ this.classList.toggle('active'); playUpdate(); });
    playUpdate();
    setStep(1);
  });
})();
