(()=>{'use strict';
  const model=window.SymmetryModel;if(!model)return;
  const el=id=>document.getElementById(id),svgNS='http://www.w3.org/2000/svg';
  document.documentElement.classList.add('symmetry-ready');window.lucide?.createIcons();
  function choose(selector,key,update){const buttons=[...document.querySelectorAll(selector)];buttons.forEach(button=>button.addEventListener('click',()=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update(button.dataset[key]);}));}
  const format=n=>Math.abs(n)<.0005?'0.000':n.toFixed(3);
  let mode='basis';
  function updateBench(){
    const degrees=Number(el('turn-angle').value),state=model.transform(mode,degrees);
    el('turn-value').textContent=degrees+'°';
    el('moving-frame').setAttribute('transform',`rotate(${-state.basis*180/Math.PI} 250 180)`);
    const x=250+125*state.physical[0],y=180-125*state.physical[1];
    el('state-point').setAttribute('cx',x);el('state-point').setAttribute('cy',y);
    el('state-vector').setAttribute('x2',x);el('state-vector').setAttribute('y2',y);
    el('point-label').setAttribute('x',x+12);el('point-label').setAttribute('y',y-12);
    el('fixed-coordinates').textContent=state.physical.map(format).join(', ');
    el('frame-coordinates').textContent=state.coordinates.map(format).join(', ');
    el('frame-label').textContent=mode==='basis'?'Coordinates in the turned frame':'Coordinates in the fixed frame';
    el('bench-result').textContent=mode==='basis'?'The axes turn. The point stays put. Its coordinates change because its description changes.':degrees%360===0?'A full turn returns the state to its starting point. Throughout the rotation, its distance from the origin stays fixed.':'The axes stay put. The state moves to another position on the same circle. This action preserves the radius while changing the state.';
    el('transformation-bench').setAttribute('aria-label',`${mode==='basis'?'Coordinate frame':'State'} turned ${degrees} degrees. Fixed-frame point (${state.physical.map(format).join(', ')}). Radius 1.`);
  }
  choose('[data-transformation]','transformation',value=>{mode=value;updateBench();});
  el('turn-angle').addEventListener('input',updateBench);updateBench();

  const frameCenters=[[94,72],[406,72],[406,262],[94,262]];
  function updateGauge(){
    const phases=Array.from({length:4},(_,i)=>Number(el('phase-'+i).value)),flux=Number(el('physical-flux').value),g=model.gauge(phases,flux);
    phases.forEach((p,i)=>{el('phase-value-'+i).textContent=p+'°';el('dial-'+i).setAttribute('transform',`rotate(${-p} ${frameCenters[i].join(' ')})`);el('edge-'+i).textContent=g.edges[i].toFixed(1).replace(/\.0$/,'')+'°';});
    el('physical-flux-value').textContent=flux+'°';el('flux-readout').textContent='Loop phase: '+Math.round(g.loop)+'°';
    el('wilson-value').textContent=format(g.real)+(g.imaginary<-.0005?' − ':' + ')+format(Math.abs(g.imaginary))+'i';
    el('wilson-pointer').setAttribute('x2',250+42*g.real);el('wilson-pointer').setAttribute('y2',170-42*g.imaginary);
    el('gauge-result').textContent=`The local edge phases add to ${Math.round(g.loop)}°. Turning local frames keeps this loop value fixed. Changing the loop phase changes the invariant, modulo a full turn.`;
    el('gauge-loop').setAttribute('aria-label',`Four directed edge phases: ${g.edges.map(n=>n.toFixed(1)).join(', ')} degrees. Total loop phase ${Math.round(g.loop)} degrees.`);
  }
  document.querySelectorAll('[data-phase],#physical-flux').forEach(input=>input.addEventListener('input',updateGauge));
  el('reset-gauge').addEventListener('click',()=>{for(let i=0;i<4;i++)el('phase-'+i).value='0';el('physical-flux').value='90';updateGauge();});updateGauge();
  const anomalyLabels=['SU(3)³','SU(3)² U(1)','SU(2)² U(1)','U(1)³','Gravity² U(1)'];
  function updateAnomalies(preset){
    const a=model.anomaly(preset);el('anomaly-rows').replaceChildren();
    a.rows.forEach(row=>{const line=document.createElement('div');line.className='anomaly-row';const label=document.createElement('span');label.className='multiplet';const strong=document.createElement('strong');strong.textContent=row.label;const small=document.createElement('small');small.textContent=row.representation+' · Y = '+row.hypercharge;label.append(strong,small);const track=document.createElement('span');track.className='anomaly-track';track.setAttribute('aria-hidden','true');const bar=document.createElement('span');bar.className='anomaly-bar';bar.dataset.sign=row.local[3]<0?'negative':'positive';bar.style.width=Math.abs(row.local[3])/36*48+'%';track.append(bar);const value=document.createElement('strong');value.className='contribution';value.textContent=model.fraction(row.local[3],36);line.append(label,track,value);el('anomaly-rows').append(line);});
    el('local-checks').replaceChildren();a.coefficients.forEach((n,i)=>{const row=document.createElement('div');const label=document.createElement('span');label.textContent=anomalyLabels[i];const result=document.createElement('strong');result.textContent=model.fraction(n,model.anomalyDenominators[i]);result.dataset.clear=String(n===0);row.append(label,result);el('local-checks').append(row);});
    el('weak-parity').textContent=a.weak+' · '+(a.globalClear?'even':'odd');el('weak-parity').dataset.clear=String(a.globalClear);el('weak-result').textContent=a.globalClear?'The SU(2) global parity check passes.':'An odd count gives a global SU(2) obstruction.';
    el('anomaly-result').textContent=preset==='full'?'Every displayed local anomaly coefficient is zero, and the four weak doublets give even parity. This matter content clears both sets of checks.':preset==='omit'?'Without eᶜ, the cubic hypercharge and mixed gravitational coefficients are both −1. The local anomaly cancellation fails.':'The extra Y = 0 weak doublet adds no local anomaly, so every local coefficient remains zero. But five weak doublets give odd parity: the global check fails.';
  }
  choose('[data-matter]','matter',updateAnomalies);updateAnomalies('full');
  function updateOperators(){
    const ids=[...document.querySelectorAll('[data-operator]:checked')].map(input=>input.value),result=model.surviving(ids);
    el('charge-area').setAttribute('visibility',result.dimension===2?'visible':'hidden');el('charge-line').setAttribute('visibility',result.dimension===1?'visible':'hidden');el('charge-origin').setAttribute('r',result.dimension===0?'8':'4');
    if(result.direction){const [b,l]=result.direction,scale=135/Math.max(Math.abs(b),Math.abs(l));el('charge-line').setAttribute('x1',220-scale*b);el('charge-line').setAttribute('y1',165+scale*l);el('charge-line').setAttribute('x2',220+scale*b);el('charge-line').setAttribute('y2',165-scale*l);}
    el('surviving-label').textContent=result.label;el('surviving-dimension').textContent='Dimension '+result.dimension;el('charge-plane-label').textContent=result.dimension===2?'Both independent directions':result.dimension===1?'One surviving direction':'Only the zero direction';
    el('operator-result').textContent=result.dimension===2?'No extra terms selected. The local grammar preserves both independent total-B and total-L phase directions.':result.dimension===1?`This selected term leaves the continuous ${result.label} direction. A one-dimensional line survives its charge constraint.`:'These independent charge constraints intersect only at the origin. No nontrivial continuous total-B/L direction survives; finite discrete remnants are a separate question.';
    el('charge-plane').setAttribute('aria-label',`${result.active.length} additional operator sectors selected. ${result.label}. Surviving continuous dimension ${result.dimension}.`);
  }
  document.querySelectorAll('[data-operator]').forEach(input=>input.addEventListener('change',updateOperators));updateOperators();

  const links=[...document.querySelectorAll('.chapter-nav a')];
  if(links.length){const chapters=links.map(a=>document.querySelector(a.getAttribute('href')));let scheduled=false;function progress(){scheduled=false;let active=0;chapters.forEach((section,i)=>{if(section.getBoundingClientRect().top<=150)active=i;});links.forEach((a,i)=>i===active?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));const extent=document.documentElement.scrollHeight-innerHeight;el('reading-progress').style.width=(extent>0?Math.min(100,100*scrollY/extent):100)+'%';}addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});progress();}
})();
