(() => {
  'use strict';
  const model=window.MeasurementModel;
  if(!model) return;
  document.body.classList.add('js-ready');
  document.querySelectorAll('.chain-step').forEach(button=>button.disabled=false);
  window.lucide?.createIcons();
  const el=id=>document.getElementById(id);
  function choose(selector,key,update) { const buttons=[...document.querySelectorAll(selector)]; buttons.forEach(button=>button.addEventListener('click',()=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update(button.dataset[key]);})); }
  const standingLayouts={near:'Two nearby views in the drawing. The same joint class fixes their compatibility.',far:'The local views are farther apart in the drawing. Their joint standing and local probabilities remain unchanged; no signal route has been added.',reversed:'The local views have exchanged positions in the drawing. Their identities and their common joint standing are preserved.'};
  choose('[data-standing-layout]','standingLayout',value=>{el('co-standing-diagram').dataset.separation=value;el('standing-layout-result').textContent=standingLayouts[value];});
  const stages={
    source:['01','Begin with something that can physically interact.','The new paper constructs receivers on an interacting quantum source and develops a separate, explicit six-mode circuit for detector calculations. The source has its own dynamics; it is not merely a label attached to a possible answer.'],
    receiver:['02','Let the apparatus acquire information.','A specified interaction couples the source to a receiver. Its response depends on the preparation. Finite pulses and their errors are part of the calculation, while the source continues to evolve.'],
    flag:['03','Keep a physical trace, as well as a display.','Conversion leads to distinguishable material channels. The electronic display and the material flag are tracked separately: a missed count can leave a flag, and a false display need not have a matching flag.'],
    amplifier:['04','Turn a small seed into a readable band.','The material flag is transferred to a spin seed. A finite, controlled amplifier acts on 32 spins. At a scheduled reading, the memory can be in a lower band, an upper band, or an unreadable middle.'],
    memory:['05','Preserve the record for later use.','The controlled thermal interactions stop before a quiet storage interval. A separate retention argument bounds how likely the readable band is to survive throughout that interval, under stated residual-noise conditions.']
  };
  choose('[data-stage]','stage',key=>{const data=stages[key];el('stage-number').textContent=data[0];el('stage-title').textContent=data[1];el('stage-copy').textContent=data[2];});
  let seed=1;
  const ns='http://www.w3.org/2000/svg';
  el('spin-bars').replaceChildren();
  const bars=Array.from({length:33},(_,k)=>{const bar=document.createElementNS(ns,'rect');bar.setAttribute('x',String(k*16+1));bar.setAttribute('width','13');bar.setAttribute('fill',k<=8?'#d6aabb':k>=24?'#b7d6c4':'#887d89');el('spin-bars').appendChild(bar);return bar;});
  function percent(value){return (value*100).toFixed(value>0&&value<.001?4:2)+'%';}
  function updateAmplifier(){
    const steps=Number(el('collision-count').value), distribution=model.amplify(steps,seed), bands=model.bands(distribution), scale=Math.max(...distribution);
    el('collision-value').textContent=steps.toLocaleString('en');
    bars.forEach((bar,k)=>{const height=distribution[k]/scale*148;bar.setAttribute('y',String(160-height));bar.setAttribute('height',String(height));});
    for(const key of ['lower','ready','upper'])el(key+'-prob').textContent=percent(bands[key]);
    el('amplifier-chart').setAttribute('aria-label',`${steps} steps. Lower band ${percent(bands.lower)}, unreadable ${percent(bands.ready)}, upper band ${percent(bands.upper)}. Vertical scale follows the largest probability.`);
    el('amplifier-result').textContent=seed===0?'Without a seed, this nominal amplifier is unarmed. The prepared memory remains in the unreadable middle.':steps===0?'The prepared memory starts balanced: 16 up spins, with no readable result yet.':steps===1024?`At the paper's scheduled endpoint, the ${seed===1?'upper':'lower'} seed has about 99.99235% correct-band probability. Wrong and unreadable results are still retained.`:`The ${seed===1?'upper':'lower'} seed drives the memory toward the ${seed===1?'upper':'lower'} band. At this reading time, all three band probabilities are retained.`;
  }
  choose('[data-seed]','seed',value=>{seed=Number(value);updateAmplifier();});
  el('collision-count').addEventListener('input',updateAmplifier);updateAmplifier();
  const ledgers={match:['0','0','Upper','An illustrative matched record: flag 0 seeds the upper band in this apparatus. These examples assign no frequencies.'],missed:['Blank','0','Upper','The display missed the count, but a material flag and amplified record can still be present. The blank display remains part of the run.'],dark:['0','None','Ready','A false electronic display need not have a matching material flag. With no seed, the nominal amplifier stays ready.'],unreadable:['0','0','Unreadable','A display and flag need not guarantee a readable amplifier endpoint. This failed reading remains in the full probability account.']};
  choose('[data-ledger]','ledger',key=>{const d=ledgers[key];['display','flag','band','note'].forEach((name,i)=>el('ledger-'+name).textContent=d[i]);});
  el('calibration-error').addEventListener('input',()=>{const value=Number(el('calibration-error').value),c=model.calibration(value/100);el('calibration-value').textContent=value.toFixed(1).replace(/\.0$/,'')+'%';for(const key of ['plus','minus']){el('coherence-'+key).textContent=(100*c[key]).toFixed(3)+'%';el('coherence-'+key+'-bar').style.width=100*c[key]+'%';}el('calibration-result').textContent=value===0?'With exact calibration, the ambiguity disappears: all three responses give 50% for this coherent input.':`These responses share ${value.toFixed(1).replace(/\.0$/,'')}% definite-input error. The general uniform bound is ${(100*c.bound).toFixed(2)} percentage points; the coherent responses above can still differ.`;});
  let a=0,b=0;
  function updateBell(){const p=model.bell(a,b),names=['pp','pm','mp','mm'];names.forEach((name,i)=>{el('bell-'+name).textContent=p[i]+'/32';el('bell-'+name+'-bar').style.width=p[i]/16*100+'%';});el('bell-context').textContent=`A${a} with B${b}`;el('bell-result').textContent=`For A${a} with B${b}, ${a===1&&b===1?'opposite':'matching'} signs have total probability 26/32. Neither station's 50/50 local total changes.`;}
  choose('[data-setting-a]','settingA',value=>{a=Number(value);updateBell();});choose('[data-setting-b]','settingB',value=>{b=Number(value);updateBell();});
  const links=[...document.querySelectorAll('.chapter-nav a')],chapters=links.map(link=>document.querySelector(link.getAttribute('href')));let scheduled=false;
  function progress(){scheduled=false;const height=document.querySelector('.chapter-nav').getBoundingClientRect().height;let active=0;chapters.forEach((chapter,i)=>{if(chapter.getBoundingClientRect().top<=height+100)active=i;});links.forEach((link,i)=>i===active?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));const start=chapters[0].offsetTop,end=el('papers').offsetTop;el('reading-progress').style.width=Math.max(0,Math.min(100,(scrollY-start)/(end-start)*100))+'%';}
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress);progress();
  function revealHash(){if(!location.hash)return;let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}if(!target)return;let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}}
  addEventListener('hashchange',revealHash);revealHash();
})();
