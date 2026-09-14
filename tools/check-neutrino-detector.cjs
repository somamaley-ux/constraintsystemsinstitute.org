const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const model=require('../neutrinos/detector-model.js');
let checks=0;
function check(actual,expected){assert.deepEqual(actual,expected);checks++;}
function ok(value){assert.ok(value);checks++;}
function throws(fn){assert.throws(fn);checks++;}
function ids(result,stage){return result.events.filter(event=>event.passed[stage]).map(event=>event.id);}
function containsAll(superset,subset){const set=new Set(superset);ok(subset.every(id=>set.has(id)));}
function event(result,id){return result.events.find(item=>item.id===id);}

const initial=model.evaluate();
check(model.events.length,60);check(new Set(model.events.map(item=>item.id)).size,60);
check(initial.counts,{input:{total:60,candidate:30,background:30},trigger:{total:42,candidate:21,background:21},reconstruction:{total:18,candidate:9,background:9},analysis:{total:12,candidate:6,background:6}});
check(initial.triggerRejectedCandidates,9);check(initial.storedCandidatesExcludedOffline,15);
check(initial.reconstructionRejectedCandidates,12);check(initial.analysisRejectedCandidates,3);
check(event(initial,'C07-e').selected,true);check(event(initial,'B10-tau').selected,true);
check(event(initial,'C02-mu').firstRejectedAt,'trigger');
check(event(initial,'C05-e').firstRejectedAt,'reconstruction');
check(event(initial,'C04-tau').firstRejectedAt,'analysis');
check(event(initial,'C04-tau').stored,true);

const allOptions={acceptDisplaced:true,acceptCrowded:true,includeSemileptonic:true};
const inclusive=model.evaluate(allOptions);
check(inclusive.counts,{input:{total:60,candidate:30,background:30},trigger:{total:42,candidate:21,background:21},reconstruction:{total:33,candidate:18,background:15},analysis:{total:33,candidate:18,background:15}});
check(inclusive.triggerRejectedCandidates,9);check(inclusive.storedCandidatesExcludedOffline,3);
const widest=model.evaluate({...allOptions,threshold:15});
check(widest.counts.analysis,{total:48,candidate:24,background:24});
check(widest.counts.trigger,{total:60,candidate:30,background:30});
check(model.evaluate({...allOptions,threshold:55}).counts.analysis.total,0);
check(model.evaluate({...allOptions,threshold:55}).counts.trigger.total,3);

// Every stage is cumulative, but individual predicates remain independently inspectable.
for(const threshold of [15,20,25,30,35,40,45,50,55]){
  for(let mask=0;mask<8;mask++){
    const options={threshold,acceptDisplaced:!!(mask&1),acceptCrowded:!!(mask&2),includeSemileptonic:!!(mask&4)};
    for(const flavors of [[],['e'],['mu','tau'],['e','mu','tau']]){
      const result=model.evaluate({...options,flavors});
      for(const item of result.events){
        check(item.gates.trigger,item.promptPt>=threshold);
        check(item.gates.reconstruction,item.trackQuality&&(!item.displaced||options.acceptDisplaced)&&(item.isolated||options.acceptCrowded));
        check(item.gates.analysis,(item.topology==='leptonic'||options.includeSemileptonic)&&flavors.includes(item.flavor));
        check(item.stored,item.gates.trigger);
        check(item.selected,item.gates.trigger&&item.gates.reconstruction&&item.gates.analysis);
        check(item.firstRejectedAt,!item.gates.trigger?'trigger':!item.gates.reconstruction?'reconstruction':!item.gates.analysis?'analysis':null);
        if(!item.trackQuality)check(item.passed.reconstruction,false);
      }
      ok(result.counts.analysis.total<=result.counts.reconstruction.total);
      ok(result.counts.reconstruction.total<=result.counts.trigger.total);
      ok(result.counts.trigger.total<=result.counts.input.total);
      check(result.storedCandidatesExcludedOffline,result.reconstructionRejectedCandidates+result.analysisRejectedCandidates);
      check(result.counts.input.candidate,result.triggerRejectedCandidates+result.storedCandidatesExcludedOffline+result.counts.analysis.candidate);
      for(const toggle of ['acceptDisplaced','acceptCrowded','includeSemileptonic']){
        const broader=model.evaluate({...options,flavors,[toggle]:true});
        containsAll(ids(broader,'analysis'),ids(result,'analysis'));
        check(ids(broader,'trigger'),ids(result,'trigger'));
      }
      const broadenedFlavor=model.evaluate({...options,flavors:['e','mu','tau']});
      containsAll(ids(broadenedFlavor,'analysis'),ids(result,'analysis'));
      check(ids(broadenedFlavor,'trigger'),ids(result,'trigger'));
      check(ids(broadenedFlavor,'reconstruction'),ids(result,'reconstruction'));
    }
  }
}

// Offline changes can recover stored candidates, but never a trigger-rejected record.
check(event(initial,'C04-e').selected,false);check(event(inclusive,'C04-e').selected,true);
check(event(initial,'C04-e').stored,true);check(event(inclusive,'C04-e').stored,true);
check(event(inclusive,'C02-e').gates.analysis,true);check(event(inclusive,'C02-e').selected,false);
check(event(inclusive,'C02-e').firstRejectedAt,'trigger');
check(event(widest,'C09-e').firstRejectedAt,'reconstruction');
check(event(widest,'C09-e').reasons.reconstruction,['Insufficient track quality']);
for(let threshold=16;threshold<=55;threshold++){
  const stricter=model.evaluate({...allOptions,threshold}),looser=model.evaluate({...allOptions,threshold:threshold-1});
  containsAll(ids(looser,'trigger'),ids(stricter,'trigger'));
  containsAll(ids(looser,'analysis'),ids(stricter,'analysis'));
}
check(model.evaluate({flavors:[]}).counts.analysis.total,0);
check(model.evaluate({flavors:['tau','e','e']}).options.flavors,['e','tau']);

// Fixture data and later evaluations are not changed by UI mutations of returned data.
initial.events[0].promptPt=999;
check(model.events[0].promptPt,20);check(model.evaluate().events[0].promptPt,20);
ok(Object.isFrozen(model.events));ok(model.events.every(Object.isFrozen));
for(const threshold of [NaN,Infinity,14.9,55.1,'30'])throws(()=>model.evaluate({threshold}));
for(const key of ['acceptDisplaced','acceptCrowded','includeSemileptonic'])throws(()=>model.evaluate({[key]:1}));
throws(()=>model.evaluate({flavors:['electron']}));throws(()=>model.evaluate({flavors:Array(3)}));
throws(()=>model.evaluate({flavors:'e'}));throws(()=>model.evaluate(null));throws(()=>model.evaluate([]));

const browser={};vm.createContext(browser);vm.runInContext(fs.readFileSync(require.resolve('../neutrinos/detector-model.js'),'utf8'),browser);
check(typeof browser.NeutrinoDetector.evaluate,'function');check(browser.NeutrinoDetector.events.length,60);
console.log(JSON.stringify({detector_checks:checks,events:model.events.length,default:initial.counts,allInclusive:inclusive.counts}));
