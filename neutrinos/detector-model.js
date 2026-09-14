(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.NeutrinoDetector=model;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  // An invented, deterministic teaching sample. These are not simulated collisions,
  // predicted event populations, measured efficiencies, or a current trigger menu.
  const flavorNames=Object.freeze(['e','mu','tau']);
  const templates=[
    // kind, illustrative pT, topology, displaced, isolated, track quality
    ['candidate',20,'leptonic',false,true,true],
    ['candidate',26,'semileptonic',true,true,true],
    ['candidate',31,'leptonic',false,true,true],
    ['candidate',36,'semileptonic',false,true,true],
    ['candidate',43,'leptonic',true,true,true],
    ['candidate',48,'semileptonic',true,false,true],
    ['candidate',53,'leptonic',false,true,true],
    ['candidate',34,'leptonic',false,false,true],
    ['candidate',41,'semileptonic',false,true,false],
    ['candidate',29,'leptonic',true,false,false],
    ['background',17,'leptonic',false,true,true],
    ['background',24,'semileptonic',false,true,true],
    ['background',32,'leptonic',false,true,true],
    ['background',38,'semileptonic',false,true,true],
    ['background',45,'leptonic',false,false,true],
    ['background',51,'semileptonic',true,true,true],
    ['background',55,'leptonic',false,true,false],
    ['background',35,'semileptonic',true,false,false],
    ['background',28,'leptonic',true,true,true],
    ['background',42,'leptonic',false,true,true]
  ];
  const events=Object.freeze(templates.flatMap((template,i)=>flavorNames.map(flavor=>{
    const [kind,promptPt,topology,displaced,isolated,trackQuality]=template;
    return Object.freeze({id:(kind==='candidate'?'C':'B')+String(i%10+1).padStart(2,'0')+'-'+flavor,kind,flavor,topology,promptPt,displaced,isolated,trackQuality});
  })));

  function tally(records){
    const candidate=records.filter(event=>event.kind==='candidate').length;
    return {total:records.length,candidate,background:records.length-candidate};
  }

  function evaluate(input={}){
    if(input===null||typeof input!=='object'||Array.isArray(input))throw new TypeError('Selection options must be an object.');
    const {threshold=30,acceptDisplaced=false,acceptCrowded=false,includeSemileptonic=false,flavors=flavorNames}=input;
    if(!Number.isFinite(threshold)||threshold<15||threshold>55)throw new RangeError('The illustrative threshold must be between 15 and 55.');
    for(const [name,value] of Object.entries({acceptDisplaced,acceptCrowded,includeSemileptonic})){
      if(typeof value!=='boolean')throw new TypeError(name+' must be true or false.');
    }
    if(!Array.isArray(flavors)||Array.from(flavors).some(flavor=>!flavorNames.includes(flavor)))throw new RangeError('Flavor selection must contain only e, mu and tau.');
    const selectedFlavors=flavorNames.filter(flavor=>flavors.includes(flavor));
    const options={threshold,acceptDisplaced,acceptCrowded,includeSemileptonic,flavors:selectedFlavors};
    const results=events.map(event=>{
      const gates={
        trigger:event.promptPt>=threshold,
        reconstruction:event.trackQuality&&(!event.displaced||acceptDisplaced)&&(event.isolated||acceptCrowded),
        analysis:(event.topology==='leptonic'||includeSemileptonic)&&selectedFlavors.includes(event.flavor)
      };
      const passed={
        trigger:gates.trigger,
        reconstruction:gates.trigger&&gates.reconstruction,
        analysis:gates.trigger&&gates.reconstruction&&gates.analysis
      };
      const firstRejectedAt=!gates.trigger?'trigger':!gates.reconstruction?'reconstruction':!gates.analysis?'analysis':null;
      const reasons={
        trigger:gates.trigger?[]:['Below the illustrative trigger threshold'],
        reconstruction:[!event.trackQuality?'Insufficient track quality':null,event.displaced&&!acceptDisplaced?'Displaced track policy':null,!event.isolated&&!acceptCrowded?'Crowded track policy':null].filter(Boolean),
        analysis:[event.topology==='semileptonic'&&!includeSemileptonic?'Semileptonic category excluded':null,!selectedFlavors.includes(event.flavor)?'Flavor excluded':null].filter(Boolean)
      };
      return {...event,gates,passed,firstRejectedAt,reasons,stored:passed.trigger,selected:passed.analysis};
    });
    const atTrigger=results.filter(event=>event.passed.trigger);
    const atReconstruction=results.filter(event=>event.passed.reconstruction);
    const atAnalysis=results.filter(event=>event.passed.analysis);
    const candidates=results.filter(event=>event.kind==='candidate');
    return {
      options,events:results,
      counts:{input:tally(results),trigger:tally(atTrigger),reconstruction:tally(atReconstruction),analysis:tally(atAnalysis)},
      triggerRejectedCandidates:candidates.filter(event=>event.firstRejectedAt==='trigger').length,
      storedCandidatesExcludedOffline:candidates.filter(event=>event.stored&&!event.selected).length,
      reconstructionRejectedCandidates:candidates.filter(event=>event.firstRejectedAt==='reconstruction').length,
      analysisRejectedCandidates:candidates.filter(event=>event.firstRejectedAt==='analysis').length,
      scope:'Invented selection sample. Candidate/background labels are teaching truth, not observable classifications or predicted rates.'
    };
  }

  return {events,flavors:flavorNames,evaluate};
});
