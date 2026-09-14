(function(){
  'use strict';
  const M=window.NeutrinoModel;
  if(!M)return;
  const $=id=>document.getElementById(id);
  const number=id=>Number($(id).value);
  const percent=value=>(100*value).toFixed(3)+'%';
  const text=(id,value)=>{$(id).textContent=value;};
  const set=(id,name,value)=>$(id).setAttribute(name,String(value));
  const delta=.003;

  const carrierCopy={
    light:'Three distinct light sectors carry the oscillation response. Together they also connect to the endpoint and population records. They do not by themselves supply the complete heavy-response work.',
    heavy:'One heavy standing sector is an aggregate of three algebraic modes in the exact symmetric source. Its inclusive weight supplies the light-sector deficit. The heavy sector alone lacks the full light response.',
    all:'Each sector contributes part of the physical work. The complete carrier holds the light response, heavy response and their shared relations together.'
  };
  document.querySelectorAll('[data-carrier]').forEach(button=>button.addEventListener('click',()=>{
    const view=button.dataset.carrier;
    document.querySelector('.carrier-exhibit').dataset.view=view;
    document.querySelectorAll('[data-carrier]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    text('carrier-result',carrierCopy[view]);
    set('carrier-diagram','aria-label',carrierCopy[view]+' The curves show structural relations, not trajectories.');
  }));

  // A fixed, schematic two-scale response. It is not fitted to an experimental record.
  const curve=Array.from({length:241},(_,i)=>{
    const x=i/240*8;
    const response=1-.53*Math.sin(.9*x)**2-.21*Math.sin(3.35*x)**2;
    return (i?'L':'M')+(40+i/240*470).toFixed(2)+' '+(185-response*145).toFixed(2);
  }).join(' ');
  set('oscillation-reference','d',curve);
  set('oscillation-curve','d',curve);
  let sourceRecord='oscillation';
  function threshold(){
    const v=M.threshold(number('threshold'));
    const massChange=Math.round((v.M-1)*100),couplingChange=((v.Y-1)*100).toFixed(1);
    const same=v.M===1,offset=(v.M-1)*125,recordX=65+(v.M-1)*410;
    text('threshold-m',v.M.toFixed(2)+'×');text('threshold-y',v.Y.toFixed(2)+'×');
    text('threshold-k',v.effective.toFixed(2)+'×');text('threshold-value',v.M.toFixed(2)+'×');
    text('source-m-change',same?'Same as A':'+'+massChange+'%');
    text('source-y-change',same?'Same as A':'+'+couplingChange+'%');
    set('source-threshold-marker','transform','translate(0 '+(-offset).toFixed(2)+')');
    set('source-coupling-bridge','d','M350 '+(190-offset).toFixed(2)+'V235');
    set('source-coupling-bridge','stroke-width',(10*v.Y).toFixed(3));
    text('source-coupling-label',same?'Same coupling':'Coupling +'+couplingChange+'%');
    text('source-numerator',(v.Y*v.Y).toFixed(2));text('source-denominator',v.M.toFixed(2));
    set('source-scale-gap','width',recordX-65);set('source-record-dot','cx',recordX);
    set('source-record-scale','x',recordX>430?recordX-16:recordX+16);
    set('source-record-scale','text-anchor',recordX>430?'end':'start');
    text('source-record-scale',v.M.toFixed(2)+'×');
    text('source-heavy-title',same?'The scales match.':'The scales separate.');
    text('source-heavy-badge',same?'Same setting':massChange+'% higher');
    text('source-heavy-copy',same?'A and B now use the same source setting. Raise B’s scale to reveal the difference that oscillation alone cannot see.':'Keep the heavy-scale information and these sources become distinguishable. Oscillation alone had hidden this difference.');
    $('source-oscillation-record').hidden=sourceRecord!=='oscillation';
    $('source-heavy-record').hidden=sourceRecord!=='heavy';
    document.querySelectorAll('[data-source-scale]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.sourceScale)===v.M)));
    document.querySelectorAll('[data-source-record]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sourceRecord===sourceRecord)));
    const change=same?'Both sources now use the same heavy scale and coupling. Raise source B to compare different sources.':'Source B’s heavy scale is '+massChange+'% higher and its coupling is '+couplingChange+'% stronger. '+(sourceRecord==='heavy'?'Their heavy-scale information separates them; the oscillation response remains identical.':'Oscillation still cannot tell A and B apart.');
    text('source-result',change);
    set('source-comparison','aria-label',(same?'Sources A and B have the same heavy scale and coupling.':'Source A stays fixed. Source B has a '+massChange+' percent higher heavy scale and a '+couplingChange+' percent stronger coupling.')+' Height encodes relative heavy scale; bridge width encodes coupling amplitude.');
    set('source-heavy-chart','aria-label','A comparison retaining heavy-scale information: source A is at 1 times the original scale and source B is at '+v.M.toFixed(2)+' times. These are relative source thresholds, not detector peaks.');
    set('threshold','aria-valuetext',v.M.toFixed(2)+' times threshold; coupling '+v.Y.toFixed(2)+' times; effective coefficient unchanged');
  }
  $('threshold').addEventListener('input',threshold);
  document.querySelectorAll('[data-source-scale]').forEach(button=>button.addEventListener('click',()=>{
    $('threshold').value=button.dataset.sourceScale;threshold();
  }));
  document.querySelectorAll('[data-source-record]').forEach(button=>button.addEventListener('click',()=>{
    sourceRecord=button.dataset.sourceRecord;threshold();
  }));

  const patterns={matched:undefined,absent:[0,0,0],mismatch:[delta,delta*.5,delta*1.5]};
  const patternCopy={
    matched:'Each missing light weight is accounted for by the heavy sector. This is the diagonal part of the linked prediction; the full test also checks correlations, rank and heavy support.',
    absent:'The light deficit is left unaccounted for in this hypothetical pattern. With a qualified and sufficiently sensitive test, absent heavy support would challenge the linked prediction.',
    mismatch:'Heavy weight is present in every flavor, but it does not match the fixed light deficit. Having a heavy signal is not enough: the two sides must satisfy the same relation.'
  };
  function strength(pattern='matched'){
    const v=M.strength(delta,patterns[pattern]);
    M.flavors.forEach((f,i)=>{ $('heavy-bar-'+f).style.width=(v.heavyWeights[i]/.006*100)+'%';text('heavy-value-'+f,percent(v.heavyWeights[i]));});
    text('strength-verdict',v.closed?'The weights match.':'The complete relation fails.');
    $('strength-verdict').style.color=v.closed?'#b4dbbd':'#e2bb9e';
    text('strength-result',patternCopy[pattern]);
  }
  document.querySelectorAll('[data-pattern]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-pattern]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    strength(button.dataset.pattern);
  }));

  function symmetry(){
    const split=number('mass-split')/100,anisotropy=number('anisotropy')/100;
    const v=M.perturbation({delta,split,anisotropy});
    text('split-value',Math.round(split*100)+'%');text('anisotropy-value',Math.round(anisotropy*100)+'%');
    text('support-label',v.degenerate?'Three modes · one shared value':'Three modes · separated values');
    v.relativeSupport.forEach((mass,i)=>{
      const x=260+(mass-1)*925,y=60+i*30;
      set('support-'+i,'d','M'+x.toFixed(2)+' '+y+'V205');set('support-dot-'+i,'cx',x.toFixed(2));
    });
    M.flavors.forEach((f,i)=>text('perturb-'+f,percent(v.heavyWeights[i])));
    text('feature-degeneracy',v.degenerate?'Exact':'Split');set('feature-degeneracy','data-changed',!v.degenerate);
    text('feature-universality',v.universal?'Exact':'Unequal');set('feature-universality','data-changed',!v.universal);
    text('feature-rank',v.fullRank?'Three':'Changed');text('feature-closure',v.closed?'Preserved':'Changed');
    text('feature-carrier',split===0&&anisotropy===0?'One in the exact source':'Requires its own domain');
    const clauses=[];
    if(!v.degenerate)clauses.push('The heavy structural support separates.');
    if(!v.universal)clauses.push('The flavor weights become unequal.');
    if(clauses.length){
      clauses.push('Full rank and light–heavy closure remain in this constructed example. Internal changes alone do not establish a second complete carrier; carrier persistence requires the paper’s certified source-support domain.');
    }else clauses.push('In the symmetric example, all three heavy modes share a value and all flavor weights are equal. These two symmetries can be changed independently.');
    text('symmetry-result',clauses.join(' '));
    set('support-chart','aria-label',(v.degenerate?'Three heavy modes share one structural mass value.':'Three relative heavy support values: '+v.relativeSupport.map(x=>x.toFixed(3)).join(', ')+'.')+' This is structural support, not a detector peak or a physical unstable-state pole.');
  }
  $('mass-split').addEventListener('input',symmetry);$('anisotropy').addEventListener('input',symmetry);
  $('reset-symmetry').addEventListener('click',()=>{$('mass-split').value=0;$('anisotropy').value=0;symmetry();});

  function experiment(){
    const v=M.experiment({delta,exposure:number('exposure'),systematic:number('systematic'),flavors:[...document.querySelectorAll('[data-flavor]:checked')].map(x=>x.dataset.flavor),heavyCovered:$('heavy-covered').checked});
    text('exposure-value',v.exposure+'×');text('floor-value',percent(v.systematic));
    text('statistical-value',percent(v.statistical));text('systematic-value',percent(v.systematic));text('radius-value',percent(v.radius));
    set('systematic','aria-valuetext',percent(v.systematic)+' systematic floor');
    // A single common response coordinate: expected centers 0 and delta, with the same toy error radius.
    const padding=Math.max(.0008,v.radius*.13),min=-v.radius-padding,max=delta+v.radius+padding;
    const x=value=>42+(value-min)/(max-min)*472;
    [['reference',0],['carrier',delta]].forEach(([name,center])=>{
      set(name+'-band','x',x(center-v.radius));set(name+'-band','width',x(center+v.radius)-x(center-v.radius));
      set(name+'-center','cx',x(center));set(name+'-axis','x',x(center));
      set(name+'-guide','d','M'+x(center)+' '+(name==='reference'?84:180)+'V202');
    });
    $('design-verdict').dataset.status=v.status;
    let label,copy;
    if(v.status==='incomplete'){
      label='The comparison is incomplete';
      const missing=[];if(v.missingFlavors.length)missing.push('the '+v.missingFlavors.map(f=>({e:'electron',mu:'muon',tau:'tau'})[f]).join(' and ')+' channel'+(v.missingFlavors.length>1?'s':''));
      if(!v.heavyCovered)missing.push('coverage of heavy support');
      copy='Restore '+missing.join(' and ')+'. More exposure cannot replace a missing part of the linked measurement.';
    }else if(v.status==='capable'){
      label='This toy design separates the alternatives';
      copy='The illustrative error bands no longer overlap. The retained records now have enough precision to distinguish these two example responses.';
    }else if(v.floorLimited){
      label='The systematic floor is too high';
      copy='Even unlimited exposure cannot separate these illustrative bands at this floor. Lowering the systematic uncertainty is necessary in this example.';
    }else{
      label='More precision needed';
      copy='The design bands overlap. Increase exposure or lower the systematic floor to see whether this example becomes distinguishable.';
    }
    text('design-label',label);text('design-result',copy);
    set('experiment-chart','aria-label','Illustrative scalar response bands centered at zero and 0.3 percent, each with radius '+percent(v.radius)+'. '+label+'. No actual detector sensitivity is asserted.');
  }
  $('exposure').addEventListener('input',experiment);$('systematic').addEventListener('input',experiment);
  document.querySelectorAll('[data-flavor],#heavy-covered').forEach(input=>input.addEventListener('change',experiment));

  threshold();strength();symmetry();experiment();
  document.documentElement.classList.add('neutrino-ready');
  if(window.lucide)window.lucide.createIcons();
  const navLinks=[...document.querySelectorAll('.chapter-nav a')];
  const chapters=navLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let scheduled=false;
  function progress(){
    const max=document.documentElement.scrollHeight-window.innerHeight;
    $('reading-progress').style.width=(max>0?Math.max(0,Math.min(100,window.scrollY/max*100)):0)+'%';
    const current=chapters.filter(e=>e.getBoundingClientRect().top<=130).at(-1);
    navLinks.forEach(a=>{if(current&&a.hash==='#'+current.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    scheduled=false;
  }
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});
  window.addEventListener('resize',progress);progress();
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
    const target=document.getElementById(a.hash.slice(1));if(!target)return;
    if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
  }));
})();
