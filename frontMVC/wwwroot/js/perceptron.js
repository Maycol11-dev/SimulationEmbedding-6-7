(function(){
    const weights = window.PERCEPTRON_WEIGHTS || {w1:7.0982,w2:7.0982,w3:7.0982,b:-10.4991};

    function sigmoid(z){
        return 1 / (1 + Math.exp(-z));
    }

    function update(){
        const chkSol = document.getElementById('chkSol');
        const chkCalor = document.getElementById('chkCalor');
        const chkFinde = document.getElementById('chkFinde');
        if(!chkSol) return;

        const x1 = chkSol.checked ? 1 : 0;
        const x2 = chkCalor.checked ? 1 : 0;
        const x3 = chkFinde.checked ? 1 : 0;

        const w1 = weights.w1, w2 = weights.w2, w3 = weights.w3, b = weights.b;

        document.getElementById('valSol').textContent = x1;
        document.getElementById('valCalor').textContent = x2;
        document.getElementById('valFinde').textContent = x3;
        document.getElementById('w1').textContent = w1.toFixed(4);
        document.getElementById('w2').textContent = w2.toFixed(4);
        document.getElementById('w3').textContent = w3.toFixed(4);
        document.getElementById('b').textContent = b.toFixed(4);

        const t1 = w1*x1, t2 = w2*x2, t3 = w3*x3;
        const z = t1+t2+t3+b;
        const p = sigmoid(z);

        document.getElementById('term1').textContent = w1.toFixed(4) + '*' + x1;
        document.getElementById('term2').textContent = w2.toFixed(4) + '*' + x2;
        document.getElementById('term3').textContent = w3.toFixed(4) + '*' + x3;
        document.getElementById('termB').textContent = b.toFixed(4);
        document.getElementById('zVal').textContent = z.toFixed(4);
        document.getElementById('pVal').textContent = p.toFixed(4);

        const fill = document.getElementById('probFill');
        if(fill){
            const pct = Math.min(100, Math.max(0, p*100));
            fill.style.transform = 'translateX(' + (100 - pct) + '%)';
        }

        const decIcon = document.getElementById('decIcon');
        const decText = document.getElementById('decText');
        const decSub = document.getElementById('decSub');
        if(p >= 0.5){
            if(decIcon) decIcon.textContent = '🌊';
            if(decText){ decText.textContent = 'SI'; decText.style.color = '#198754'; }
            if(decSub) decSub.textContent = 'Probabilidad alta. Alcanza el umbral (> 0.5)';
        }else{
            if(decIcon) decIcon.textContent = '🏠';
            if(decText){ decText.textContent = 'NO'; decText.style.color = '#dc3545'; }
            if(decSub) decSub.textContent = 'Muy poca confianza. No alcanza el umbral (< 0.5)';
        }
    }

    ['chkSol','chkCalor','chkFinde'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', update);
    });
    update();
})();
