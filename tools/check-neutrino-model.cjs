const assert=require('node:assert/strict');
const m=require('../neutrinos/model.js');
let checks=0;
function check(actual,expected){assert.deepEqual(actual,expected);checks++;}
function near(actual,expected,tolerance=1e-12){assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);checks++;}
function throws(fn){assert.throws(fn);checks++;}
function gram(block){return block.map(row=>block.map(other=>row.reduce((sum,value,k)=>sum+value*other[k],0)));}

// Physically different thresholds keep the same low-energy coefficient, including the visual endpoints.
for(let step=0;step<=100;step++){
  const t=m.threshold(1+step/100);
  near(t.Y*t.Y/t.M,1);check(t.invariant,true);
  near(t.M,1+step/100);
}
check(m.threshold(1).interior,false);check(m.threshold(1.5).interior,true);check(m.threshold(2).interior,false);
assert.notEqual(m.threshold(1.1).M,m.threshold(1.9).M);checks++;

// A mismatched heavy record must not be silently compensated or presented as closure.
for(const delta of [0,1e-8,.0005,m.defaultDelta,m.sourceRowBound]){
  const s=m.strength(delta);
  check(s.closed,true);check(s.rank,delta===0?0:3);near(s.residualNorm,0);
  check(s.universal,delta>0);
  s.lightWeights.forEach((value,i)=>near(value+s.heavyWeights[i],1));
}
const mismatch=m.strength(.003,[.003,.002,0]);
check(mismatch.closed,false);check(mismatch.rank,2);check(mismatch.universal,false);
near(mismatch.residualNorm,Math.hypot(.001,.003));
const supplied=[.001,.002,.003],snapshot=m.strength(.003,supplied);
supplied[0]=0;near(snapshot.heavyWeights[0],.001);

// Independent variations: mass splitting does not imply flavor anisotropy, or conversely.
for(const delta of [1e-8,.0005,m.defaultDelta,m.sourceRowBound]){
  for(let split=0;split<=1;split+=.125){
    for(let anisotropy=0;anisotropy<=1;anisotropy+=.125){
      const p=m.perturbation({delta,split,anisotropy}),ng=gram(p.N),vg=gram(p.V);
      check(p.degenerate,split===0);check(p.universal,anisotropy===0);
      check(p.fullRank,true);check(p.closed,true);check(p.rank,3);
      assert.ok(p.etaV<Math.sqrt(delta));checks++;
      assert.ok(p.minimumWeight>=p.rankLowerBound-1e-14);checks++;
      assert.ok(p.relativeSupport.every(value=>value>0));checks++;
      for(let i=0;i<3;i++)for(let j=0;j<3;j++){
        near(ng[i][j]+vg[i][j],i===j?1:0);
        near(vg[i][j],p.Omega[i][j]);
        near(p.Delta[i][j],p.Omega[i][j]);
      }
      check(p.carrierStatus,'conditional');
    }
  }
}
const splitOnly=m.perturbation({split:1}),anisotropyOnly=m.perturbation({anisotropy:1});
check(splitOnly.universal,true);check(splitOnly.degenerate,false);
check(anisotropyOnly.universal,false);check(anisotropyOnly.degenerate,true);
check(m.perturbation({split:1,anisotropy:1}).carrierStatus,'conditional');

// The toy test needs the complete channel cover; exposure reduces only the statistical term.
const low=m.experiment(),high=m.experiment({exposure:10000});
check(low.status,'inconclusive');check(high.status,'capable');
near(low.systematic,high.systematic);assert.ok(high.statistical<low.statistical);checks++;
near(low.separator,m.defaultDelta);
check(low.carrierRecord,[m.defaultDelta]);check(low.referenceRecord,[0]);
check(m.experiment({exposure:1000}).status,'capable');
check(m.experiment({exposure:1e9,flavors:['e','mu']}).status,'incomplete');
check(m.experiment({exposure:1e9,heavyCovered:false}).status,'incomplete');
check(m.experiment({exposure:1e9,flavors:['e','e','mu']}).missingFlavors,['tau']);
for(const exposure of [1,100,1e6,1e20]){
  const floor=m.experiment({systematic:.002,exposure});
  check(floor.status,'inconclusive');check(floor.floorLimited,true);check(floor.exposureThreshold,null);
}
const edge=m.experiment({systematic:m.defaultDelta/2,noise:0});
check(edge.status,'inconclusive');
check(m.experiment({delta:0,systematic:0,noise:0}).status,'inconclusive');
const target=m.experiment({systematic:.0005});
check(m.experiment({systematic:.0005,exposure:target.exposureThreshold*1.01}).status,'capable');
check(m.experiment({systematic:.0005,exposure:target.exposureThreshold*.99}).status,'inconclusive');

for(const invalid of [NaN,Infinity,-1,2.1])throws(()=>m.threshold(invalid));
for(const invalid of [NaN,-.1,.01])throws(()=>m.strength(invalid));
throws(()=>m.strength(.003,Array(3)));throws(()=>m.strength(.003,[.003,.003]));throws(()=>m.strength(.003,[-.001,.003,.003]));
throws(()=>m.perturbation({delta:Number.MIN_VALUE,anisotropy:1}));throws(()=>m.perturbation({delta:0}));throws(()=>m.perturbation({anisotropy:1.01}));throws(()=>m.perturbation({split:-.1}));
throws(()=>m.experiment({exposure:0}));throws(()=>m.experiment({systematic:-.1}));
throws(()=>m.experiment({flavors:Array(3)}));throws(()=>m.experiment({flavors:['electron']}));throws(()=>m.experiment({heavyCovered:'yes'}));

console.log(JSON.stringify({mathematical_checks:checks,models:['compensated threshold','light-heavy Gram accounting','independent structural and coupling perturbations','toy common-record separation with systematic floor']}));
