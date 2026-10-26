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

  let w1 = (Math.random()-0.5)*0.25;
  let w2 = (Math.random()-0.5)*0.25;
  let w3 = (Math.random()-0.5)*0.25;
  let b  = (Math.random()-0.5)*0.25;
  const lr = 0.14;

  let step = 1;
  let epoch = 0;
  let idx = 0;
  let running = false;
  let timer = null;
  const lossHistory = [];

  function sigmoid(z){ return 1/(1+Math.exp(-z)); }

  function setStep(n){
    step = n;
    document.querySelectorAll('.step-chip').forEach(p => p.classList.remove('active'));
    const a = document.getElementById('s-'+n); if(a) a.classList.add('active');
    document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('panel-'+n); if(panel) panel.classList.remove('hidden');
    document.getElementById('btnNext').classList.toggle('hidden', n === 6);
    document.getElementById('btnTrain').classList.toggle('hidden', n !== 3);

    if(n===1){ narr('El problema','Decidir ir a la playa con sol, calor y fin de semana.'); }
    if(n===2){ narr('La mesa de perillas','Cada entrada tiene un peso que define su importancia.'); updateLinks(); }
    if(n===3){ narr('Aprendiendo','Intentar, equivocarse y ajustar un poquito.'); updateLinks(); }
    if(n===4){ narr('Convergencia','Los pesos se igualan hacia el patrón descubierto.'); updateLinks('ok'); reveal(); }
    if(n===5){ narr('Validación','Probar todas las combinaciones con los pesos aprendidos.'); updateLinks('ok'); }
    if(n===6){ narr('Escala','Mismos principios, órdenes de magnitud distintos.'); updateLinks('ok'); }
  }

  function narr(t,s){
    const nt = document.getElementById('narrTitle'); if(nt) nt.textContent = t;
    const ns = document.getElementById('narrText'); if(ns) ns.textContent = s;
  }

  function updateKnobs(){
    document.getElementById('v1').textContent = w1.toFixed(4);
    document.getElementById('v2').textContent = w2.toFixed(4);
    document.getElementById('v3').textContent = w3.toFixed(4);
    document.getElementById('vb').textContent = b.toFixed(4);
    document.getElementById('m1').style.width = Math.min(100, Math.max(6, (Math.abs(w1)/8)*100))+'%';
    document.getElementById('m2').style.width = Math.min(100, Math.max(6, (Math.abs(w2)/8)*100))+'%';
    document.getElementById('m3').style.width = Math.min(100, Math.max(6, (Math.abs(w3)/8)*100))+'%';
    document.getElementById('mb').style.width = Math.min(100, Math.max(6, (Math.abs(b)/12)*100))+'%';
  }

  function updateLinks(state){
    document.querySelectorAll('.stage-link').forEach(l=>l.classList.remove('flow','ok','wrong'));
    if(state==='flow'){ document.querySelectorAll('.stage-link').forEach(l=>l.classList.add('flow')); }
    if(state==='ok'){ document.querySelectorAll('.stage-link').forEach(l=>l.classList.add('ok')); }
    if(state==='wrong'){ document.querySelectorAll('.stage-link').forEach(l=>l.classList.add('wrong')); }
  }

  function updateLoss(){
    const p = document.getElementById('lossPath');
    if(!p || lossHistory.length===0) return;
    const pts = lossHistory.slice(-40).map((v,i,a)=>{
      const x = (i/(Math.max(1,a.length-1)))*520 + 20;
      const y = 150 - Math.min(140, v*140);
      return x+','+y;
    }).join(' ');
    p.setAttribute('points', pts);
  }

  function reveal(){
    document.querySelectorAll('.reveal-tile').forEach((el,i)=>{ setTimeout(()=>el.classList.add('active'), i*140); });
  }

  function trainStep(){
    if(epoch>=10 && idx===0){ finish(); return; }
    const ex = examples[idx];
    document.querySelectorAll('.example-card').forEach(c=>c.classList.remove('active','ok','bad'));
    const card = document.getElementById('ec-'+idx); if(card) card.classList.add('active');
    updateLinks('flow');
    setTimeout(()=>{
      const z = w1*ex.x[0]+w2*ex.x[1]+w3*ex.x[2]+b;
      const pr = sigmoid(z);
      const pred = pr>=0.5?'SI':'NO';
      const exp = ex.y===1?'SI':'NO';
      document.getElementById('predNow').textContent = pr.toFixed(4);
      document.getElementById('predLab').textContent = pred;
      document.getElementById('expLab').textContent = exp;
      const err = Math.abs(pr-ex.y);
      lossHistory.push(err);
      updateLoss();
      if(card){
        if((pr>=0.5&&ex.y===1)||(pr<0.5&&ex.y===0)) card.classList.add('ok');
        else card.classList.add('bad');
      }
      if((pr>=0.5&&ex.y===1)||(pr<0.5&&ex.y===0)) updateLinks('ok');
      else updateLinks('wrong');
      const g = (pr-ex.y);
      w1 -= lr*g*ex.x[0]; w2 -= lr*g*ex.x[1]; w3 -= lr*g*ex.x[2]; b -= lr*g;
      updateKnobs();
      idx++; if(idx>=examples.length){ idx=0; epoch++; document.getElementById('ep').textContent = epoch; }
    }, 620);
  }

  function start(){
    if(running) return; running = true; document.getElementById('btnTrain').textContent = 'Entrenando...';
    timer = setInterval(trainStep, 900); trainStep();
  }

  function stop(){
    running=false; if(timer) clearInterval(timer); timer=null;
    document.getElementById('btnTrain').textContent = 'Iniciar aprendizaje';
  }

  function finish(){
    stop();
    w1=7.0982; w2=7.0982; w3=7.0982; b=-10.4991;
    updateKnobs();
    updateLinks('ok');
    setStep(4);
  }

  function play(){
    const t1=document.getElementById('t1').classList.contains('active')?1:0;
    const t2=document.getElementById('t2').classList.contains('active')?1:0;
    const t3=document.getElementById('t3').classList.contains('active')?1:0;
    document.getElementById('pt1').textContent=t1; document.getElementById('pt2').textContent=t2; document.getElementById('pt3').textContent=t3;
    const z=7.0982*t1+7.0982*t2+7.0982*t3+-10.4991;
    const p=sigmoid(z);
    document.getElementById('pz').textContent=z.toFixed(4);
    document.getElementById('pp').textContent=p.toFixed(4);
    const r=document.getElementById('pres');
    if(p>=0.5){ r.textContent='SI'; r.style.color='var(--green)'; }
    else { r.textContent='NO'; r.style.color='var(--red)'; }
  }

  document.addEventListener('DOMContentLoaded', function(){
    updateKnobs(); updateLoss(); play();
    document.getElementById('btnNext').addEventListener('click', ()=>setStep(Math.min(6, step+1)));
    document.getElementById('btnTrain').addEventListener('click', start);
    document.getElementById('btnReset').addEventListener('click', ()=>{
      stop(); w1=(Math.random()-0.5)*0.25; w2=(Math.random()-0.5)*0.25; w3=(Math.random()-0.5)*0.25; b=(Math.random()-0.5)*0.25;
      epoch=0; idx=0; lossHistory.length=0; document.getElementById('ep').textContent='0';
      document.getElementById('predNow').textContent='-'; document.getElementById('predLab').textContent='-'; document.getElementById('expLab').textContent='-';
      updateKnobs(); updateLoss(); updateLinks(); document.querySelectorAll('.example-card').forEach(c=>c.classList.remove('active','ok','bad'));
      document.querySelectorAll('.reveal-tile').forEach(c=>c.classList.remove('active'));
      setStep(3);
    });
    ['t1','t2','t3'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('click', function(){ this.classList.toggle('active'); play(); }); });
    setStep(1);
  });
})();
