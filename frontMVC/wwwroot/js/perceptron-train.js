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

    let w1 = (Math.random()-0.5)*0.5;
    let w2 = (Math.random()-0.5)*0.5;
    let w3 = (Math.random()-0.5)*0.5;
    let b  = (Math.random()-0.5)*0.5;
    const lr = 0.1;

    let epoch = 0;
    let idx = 0;
    let running = false;
    let timer = null;
    const lossPoints = [];

    function sigmoid(z){ return 1/(1+Math.exp(-z)); }

    function buildTable(){
        const body = document.getElementById('trainTableBody');
        if(!body) return;
        body.innerHTML = '';
        examples.forEach((ex,i)=>{
            const tr = document.createElement('tr');
            tr.id = 'tr'+i;
            tr.innerHTML = '<td>'+ex.x[0]+'</td><td>'+ex.x[1]+'</td><td>'+ex.x[2]+'</td><td>'+(ex.y==1?'SI':'NO')+'</td><td id="st'+i+'">-</td>';
            body.appendChild(tr);
        });
    }

    function updateKnobs(){
        const maxv = 9;
        document.getElementById('kw1').textContent = w1.toFixed(4);
        document.getElementById('kw2').textContent = w2.toFixed(4);
        document.getElementById('kw3').textContent = w3.toFixed(4);
        document.getElementById('kbias').textContent = b.toFixed(4);
        document.getElementById('k1').style.width = Math.min(100, Math.max(2, (Math.abs(w1)/maxv)*100)) + '%';
        document.getElementById('k2').style.width = Math.min(100, Math.max(2, (Math.abs(w2)/maxv)*100)) + '%';
        document.getElementById('k3').style.width = Math.min(100, Math.max(2, (Math.abs(w3)/maxv)*100)) + '%';
        document.getElementById('kb').style.width = Math.min(100, Math.max(2, (Math.abs(b)/maxv)*100)) + '%';
    }

    function updateLoss(){
        const line = document.getElementById('lossLine');
        if(!line || lossPoints.length == 0) return;
        const pts = lossPoints.slice(-30).map((v,i,a)=>{
            const x = (i/(a.length-1))*190 + 5;
            const y = 90 - Math.min(80, v*80);
            return x+','+y;
        }).join(' ');
        line.setAttribute('points', pts);
    }

    function step(){
        const ex = examples[idx];
        // highlight
        document.querySelectorAll('.train-table tr').forEach(tr=>tr.classList.remove('active'));
        const tr = document.getElementById('tr'+idx);
        if(tr) tr.classList.add('active');

        document.getElementById('cx1').textContent = ex.x[0];
        document.getElementById('cx2').textContent = ex.x[1];
        document.getElementById('cx3').textContent = ex.x[2];
        document.getElementById('cy').textContent = ex.y==1?'SI':'NO';
        document.getElementById('trueLabel').textContent = ex.y==1?'SI':'NO';

        const z = w1*ex.x[0] + w2*ex.x[1] + w3*ex.x[2] + b;
        const p = sigmoid(z);
        const predLabel = p>=0.5 ? 'SI' : 'NO';
        document.getElementById('predProb').textContent = p.toFixed(4);
        document.getElementById('predLabel').textContent = predLabel;

        const err = Math.abs(p - ex.y);
        document.getElementById('lossCur').textContent = err.toFixed(4);
        lossPoints.push(err);
        updateLoss();

        const st = document.getElementById('st'+idx);
        if(st){
            if((p>=0.5 && ex.y==1) || (p<0.5 && ex.y==0)){
                st.textContent = '✅';
            }else{
                st.textContent = '❌';
            }
        }

        document.getElementById('trainHint').textContent = '1) Intento: predijo ' + predLabel + '. 2) Error detectado. 3) Ajustando perillas un poquito (gradient descent).';

        // adjust (simple)
        const grad = (p - ex.y);
        w1 -= lr * grad * ex.x[0];
        w2 -= lr * grad * ex.x[1];
        w3 -= lr * grad * ex.x[2];
        b  -= lr * grad;
        updateKnobs();

        idx++;
        if(idx >= examples.length){
            idx = 0;
            epoch++;
            document.getElementById('epoch').textContent = epoch;
            if(epoch >= 10){
                document.getElementById('trainHint').textContent = 'Demo terminado. Con más vueltas se acerca a [7.0982, 7.0982, 7.0982], b [-10.4991] y acierta casi todo.';
                if(running) stop();
            }
        }
    }

    function start(){
        if(running) return;
        running = true;
        const spd = parseInt(document.getElementById('speed').value || '400');
        timer = setInterval(step, spd);
    }
    function stop(){
        running = false;
        if(timer) clearInterval(timer);
        timer = null;
    }
    function reset(){
        stop();
        w1=(Math.random()-0.5)*0.5; w2=(Math.random()-0.5)*0.5; w3=(Math.random()-0.5)*0.5; b=(Math.random()-0.5)*0.5;
        epoch=0; idx=0; lossPoints.length=0;
        document.getElementById('epoch').textContent = '0';
        document.getElementById('trainTableBody').querySelectorAll('td[id^=st]').forEach(td=>td.textContent='-');
        document.querySelectorAll('.train-table tr').forEach(tr=>tr.classList.remove('active'));
        document.getElementById('cx1').textContent='?'; document.getElementById('cx2').textContent='?'; document.getElementById('cx3').textContent='?';
        document.getElementById('cy').textContent='?'; document.getElementById('trueLabel').textContent='?';
        document.getElementById('predProb').textContent='0.5000'; document.getElementById('predLabel').textContent='?';
        document.getElementById('lossCur').textContent='-';
        document.getElementById('trainHint').textContent='Presioná "Paso a paso" o "Iniciar" para ver el ciclo.';
        updateKnobs(); updateLoss();
    }

    document.addEventListener('DOMContentLoaded', function(){
        buildTable();
        updateKnobs();
        updateLoss();
        const btnStart = document.getElementById('btnStart');
        const btnStep = document.getElementById('btnStep');
        const btnReset = document.getElementById('btnReset');
        if(btnStart) btnStart.addEventListener('click', start);
        if(btnStep) btnStep.addEventListener('click', step);
        if(btnReset) btnReset.addEventListener('click', reset);
    });
})();
