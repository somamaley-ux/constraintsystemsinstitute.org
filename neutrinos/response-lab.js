(function(){
  'use strict';
  const M=window.NeutrinoModel;
  if(!M||!document.querySelector('#strength.response-lab')||!document.querySelector('#symmetry.response-lab'))return;
  const $=id=>document.getElementById(id);
  const text=(id,value)=>{$(id).textContent=value;};
  const set=(id,name,value)=>$(id).setAttribute(name,String(value));
  const percent=value=>(value*100).toFixed(3)+'%';
  const delta=.003;
  const patterns={matched:undefined,absent:[0,0,0],mismatch:[delta,delta*.5,delta*1.5]};
  const patternCopy={
    matched:'All three missing amounts are supplied by the corresponding heavy response. This pattern passes the displayed matching check. A complete test also needs correlations, rank and heavy support.',
    absent:'Each light channel is missing 0.300%, but this example supplies no heavy weight. All three gaps remain. An experimental null challenges the prediction only when the relevant heavy support was covered with adequate sensitivity.',
    mismatch:'The combined heavy weight is unchanged, but its distribution is wrong: the muon channel is short by 0.150 percentage points and the tau channel has 0.150 too much. Matching the total is not enough.'
  };
  function strength(pattern){
    const v=M.strength(delta,patterns[pattern]);
    let matches=0;
    M.flavors.forEach((flavor,i)=>{
      const gap=v.residual[i],matched=Math.abs(gap)<1e-12;
      if(matched)matches++;
      $('heavy-bar-'+flavor).style.width=(v.heavyWeights[i]/.006*100)+'%';
      text('heavy-value-'+flavor,percent(v.heavyWeights[i]));
      text('residual-value-'+flavor,matched?'0.000 pp':(gap>0?'+':'−')+(Math.abs(gap)*100).toFixed(3)+' pp');
      text('residual-label-'+flavor,matched?'Fully accounted for':gap>0?'Still missing':'More than the deficit');
      $('response-card-'+flavor).dataset.state=matched?'matched':gap>0?'shortfall':'excess';
      set('response-plot-'+flavor,'aria-label',({e:'Electron',mu:'Muon',tau:'Tau'})[flavor]+': missing light strength 0.300 percent; heavy strength '+percent(v.heavyWeights[i])+'. '+(matched?'Matched.':gap>0?'Shortfall.':'Excess.'));
    });
    text('strength-verdict',v.closed?'The weights match in all three flavors.':'The relation fails in this example.');
    text('strength-score',matches+' of 3 flavors match');
    text('strength-quick-result',pattern==='matched'?'3 of 3 match · every missing amount is supplied':pattern==='absent'?'0 of 3 match · all three light deficits remain':'1 of 3 matches · muon shortfall, tau excess');
    $('strength-summary').dataset.state=v.closed?'matched':'mismatch';
    text('strength-result',patternCopy[pattern]);
    document.querySelectorAll('#strength [data-pattern]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pattern===pattern)));
  }
  document.querySelectorAll('#strength [data-pattern]').forEach(button=>button.addEventListener('click',()=>strength(button.dataset.pattern)));

  const presets={symmetric:[0,0],split:[80,0],unequal:[0,80],both:[80,80]};
  function symmetry(){
    const split=Number($('mass-split').value)/100,anisotropy=Number($('anisotropy').value)/100;
    const v=M.perturbation({delta,split,anisotropy});
    text('split-value',Math.round(split*100)+' / 100');text('anisotropy-value',Math.round(anisotropy*100)+' / 100');
    text('support-label',v.degenerate?'The three source values coincide.':'The three source values separate.');
    v.relativeSupport.forEach((mass,i)=>{
      const x=88+(mass-.8)/.4*288;
      set('support-dot-'+i,'cx',x.toFixed(2));
      set('support-'+i,'d','M232 '+(64+i*58)+'H'+x.toFixed(2));
      text('support-value-'+i,mass.toFixed(3)+'×');
    });
    M.flavors.forEach((flavor,i)=>{
      text('perturb-'+flavor,percent(v.heavyWeights[i]));
      $('perturb-light-'+flavor).style.width=(v.lightDeficits[i]/.006*100)+'%';
      $('perturb-heavy-'+flavor).style.width=(v.heavyWeights[i]/.006*100)+'%';
    });
    text('flavor-effect',v.universal?'Every flavor has the same weight.':'The flavors carry different weights.');
    text('feature-degeneracy',v.degenerate?'Exact':'Split');set('feature-degeneracy','data-changed',!v.degenerate);
    text('feature-universality',v.universal?'Exact':'Unequal');set('feature-universality','data-changed',!v.universal);
    text('feature-rank','Three');text('feature-closure','Preserved');
    text('feature-carrier',split===0&&anisotropy===0?'One in the exact source':'Requires its own domain');
    let result;
    if(v.degenerate&&v.universal)result='Start with both features equal. Try “Split the scales” or “Unbalance the flavors” and watch which side changes.';
    else if(!v.degenerate&&v.universal)result='Only the source scales changed. The flavor weights are still equal, and each heavy weight still accounts for its light deficit.';
    else if(v.degenerate&&!v.universal)result='Only the flavor weights changed. The source scales still coincide, and each heavy weight still accounts for its own light deficit.';
    else result='Both features changed independently. The source values are split and the flavors are unequal, while the paired light–heavy amounts still match in every channel.';
    text('symmetry-result',result);
    text('symmetry-quick-result',v.degenerate&&v.universal?'Both features equal · choose one to change':!v.degenerate&&v.universal?'Scales split · flavor weights still equal':v.degenerate&&!v.universal?'Flavors unequal · source scales still equal':'Scales split and flavors unequal · light–heavy accounting still matches');
    document.querySelectorAll('#symmetry [data-symmetry-example]').forEach(button=>{
      const p=presets[button.dataset.symmetryExample];button.setAttribute('aria-pressed',String(p[0]===split*100&&p[1]===anisotropy*100));
    });
    set('mass-split','aria-valuetext',Math.round(split*100)+' on the illustrative control; relative source values '+v.relativeSupport.map(value=>value.toFixed(3)).join(', '));
    set('anisotropy','aria-valuetext',Math.round(anisotropy*100)+' on the illustrative control; electron '+percent(v.heavyWeights[0])+', muon '+percent(v.heavyWeights[1])+', tau '+percent(v.heavyWeights[2]));
    set('support-chart','aria-label',(v.degenerate?'Three source modes share one structural scale.':'Three relative structural source values: '+v.relativeSupport.map(value=>value.toFixed(3)).join(', ')+'.')+' These are source values, not detector peaks or physical unstable-state poles.');
  }
  $('mass-split').addEventListener('input',symmetry);$('anisotropy').addEventListener('input',symmetry);
  document.querySelectorAll('#symmetry [data-symmetry-example]').forEach(button=>button.addEventListener('click',()=>{
    const choice=button.dataset.symmetryExample,preset=presets[choice];$('mass-split').value=preset[0];$('anisotropy').value=preset[1];symmetry();
    if(window.matchMedia('(max-width:800px)').matches&&choice!=='symmetric'){
      const lab=$(choice==='unequal'?'flavor-lab-title':'source-scale-lab-title');
      lab.focus({preventScroll:true});lab.scrollIntoView({block:'start',behavior:'instant'});
    }
  }));
  strength('matched');symmetry();
  document.documentElement.classList.add('response-ready');
})();
