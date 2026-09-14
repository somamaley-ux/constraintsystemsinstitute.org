(function(){
 'use strict';
 const M=window.NeutrinoDetector;if(!M)return;
 const $=id=>document.getElementById(id);if(!$('detector-lab'))return;
 let stage='input';
 const layers={all:'Charged tracks, energy deposits and muon hits form a record of the decay products. The neutral heavy state is reconstructed from those products.',tracker:'The inner tracker records charged-particle trajectories and where they appear to originate. Reconstructing tracks away from the collision or among nearby activity can require additional methods.',calo:'Calorimeters measure deposited energy. The example’s two jets leave showers here; their measured energy and direction help reconstruct the heavy decay.',muon:'Muons can cross the calorimeters and reach the outer muon system. The associated muon can help tag production; the decay muon contributes a second part of the event.'};
 const stages={input:['The response begins inside the detector.','A heavy-state hypothesis connects an associated lepton with a set of decay products. Each detector layer records a different part of that visible response.'],trigger:['First, keep a record of the event.','In this example, a prompt lepton tag must pass the trigger threshold. Lowering that threshold records more events, including more background. A later analysis cannot restore an event that this stream never recorded.'],reconstruction:['Turn detector hits into usable objects.','Among recorded events, the reconstruction must recover the relevant tracks and energy deposits. Expand the methods for displaced or non-isolated leptons to recover more of this sample.'],analysis:['Keep the categories the test needs.','The analysis selects from reconstructed records. Include lepton + jets decays and the required flavor channels. Some stored events excluded here can be used by another analysis.']};
 function settings(){return {threshold:Number($('det-threshold').value),acceptDisplaced:$('det-displaced').checked,acceptCrowded:$('det-crowded').checked,includeSemileptonic:$('det-semileptonic').checked,flavors:[...document.querySelectorAll('[data-det-flavor]:checked')].map(e=>e.dataset.detFlavor)};}
 function update(){
  const result=M.evaluate(settings());
  $('det-threshold-value').textContent=result.options.threshold+' GeV';
  $('det-threshold').setAttribute('aria-valuetext',result.options.threshold+' GeV, illustrative lepton trigger threshold');
  for(const key of ['input','trigger','reconstruction','analysis'])$('det-count-'+key).textContent=result.counts[key].total;
  $('det-stored').textContent=result.counts.trigger.total+' / '+result.counts.input.total;
  $('det-candidates').textContent=result.counts.analysis.candidate+' / '+result.counts.input.candidate;
  $('det-background').textContent=result.counts.analysis.background;
  $('det-stage-title').textContent=stages[stage][0];$('det-stage-copy').textContent=stages[stage][1];
  for(const [key,label] of [['trigger','recorded'],['reconstruction','reconstructed'],['analysis','selected']])document.getElementById('det-live-'+key).textContent=result.counts[key].total+' '+label+' events';
  const count=result.counts[stage];
  $('det-stage-summary').textContent=count.total+' events at this stage: '+count.candidate+' hypothetical response and '+count.background+' other events.';
  $('det-retention-copy').textContent=result.triggerRejectedCandidates+' hypothetical response events fail this trigger; '+result.storedCandidatesExcludedOffline+' more are recorded but excluded during reconstruction or analysis. Expanding later selections can help with stored records. Trigger losses require a different recording route.';
  const levels={input:0,trigger:1,reconstruction:2,analysis:3};
  $('detector-event-board').innerHTML=result.events.map((e,i)=>{
   const keep=e.firstRejectedAt===null||levels[e.firstRejectedAt]>levels[stage];
   const cx=18+(i%12)*29,cy=20+Math.floor(i/12)*34;
   const color=e.kind==='candidate'?'#e3c196':'#759496';
   return '<circle cx="'+cx+'" cy="'+cy+'" r="7" fill="'+(keep?color:'none')+'" stroke="'+(keep?color:'#58696b')+'" opacity="'+(keep?'1':'.55')+'"/>';
  }).join('');
  $('detector-event-board').setAttribute('aria-label',count.total+' of '+result.counts.input.total+' illustrative events retained at '+stage+', including '+count.candidate+' hypothetical response events. The counts are not measured efficiencies.');
 }
 document.querySelectorAll('[data-det-layer]').forEach(button=>button.addEventListener('click',()=>{
  const layer=button.dataset.detLayer;document.querySelector('.detector-view').dataset.layer=layer;
  document.querySelectorAll('[data-det-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('detector-layer-copy').textContent=layers[layer];
 }));
 document.querySelectorAll('[data-det-stage]').forEach(button=>button.addEventListener('click',()=>{stage=button.dataset.detStage;document.querySelectorAll('[data-det-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();}));
 function showStage(key){stage=key;document.querySelectorAll('[data-det-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.detStage===stage)));update();}
 $('det-threshold').addEventListener('input',()=>showStage('trigger'));
 document.querySelectorAll('#det-displaced,#det-crowded,#det-semileptonic,[data-det-flavor]').forEach(e=>e.addEventListener('change',()=>showStage(e.id==='det-displaced'||e.id==='det-crowded'?'reconstruction':'analysis')));
 function preset(wide){$('det-threshold').value=wide?20:30;['det-displaced','det-crowded','det-semileptonic'].forEach(id=>$(id).checked=wide);document.querySelectorAll('[data-det-flavor]').forEach(e=>e.checked=true);stage=wide?'analysis':'input';document.querySelectorAll('[data-det-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.detStage===stage)));update();}
 $('det-inclusive').addEventListener('click',()=>preset(true));$('det-reset').addEventListener('click',()=>preset(false));
 update();document.documentElement.classList.add('detector-ready');
})();
