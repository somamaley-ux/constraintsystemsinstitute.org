const assert=require('node:assert/strict');
const m=require('../symmetry/model.js');
let checks=0;
function check(actual,expected){assert.deepEqual(actual,expected);checks++;}
function near(actual,expected){assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);checks++;}
for(let angle=0;angle<=360;angle+=5){
  for(const kind of ['basis','action']){
    const t=m.transform(kind,angle),[x,y]=t.physical,[u,v]=t.coordinates;
    near(x*x+y*y,1);near(u*u+v*v,1);
    near(u*Math.cos(t.basis)-v*Math.sin(t.basis),x);near(u*Math.sin(t.basis)+v*Math.cos(t.basis),y);
    if(kind==='basis'){near(x,Math.sqrt(3)/2);near(y,.5);}else near(t.basis,0);
  }
}
for(const phases of [[0,0,0,0],[360,0,0,0],[15,180,270,45],[360,360,360,360],[0,360,0,360]]){
  for(let flux=0;flux<=360;flux+=15){const g=m.gauge(phases,flux);near(g.loop,flux);near(g.real*g.real+g.imaginary*g.imaginary,1);const shifted=m.gauge(phases.map(p=>p+75),flux);check(g.edges,shifted.edges);}
}
near(m.gauge([0,0,0,0],0).real,m.gauge([0,0,0,0],360).real);
const full=m.anomaly('full'),omit=m.anomaly('omit'),extra=m.anomaly('extra');
check(full.coefficients,[0,0,0,0,0]);check(full.weak,4);check(full.localClear&&full.globalClear,true);
check(omit.coefficients,[0,0,0,-36,-1]);check(omit.weak,4);check(omit.localClear,false);
check(extra.coefficients,[0,0,0,0,0]);check(extra.weak,5);check(extra.localClear,true);check(extra.globalClear,false);
check(full.rows.map(r=>m.fraction(r.local[3],36)),['1/36','−8/9','1/9','−1/4','1']);
check(omit.coefficients.map((n,i)=>m.fraction(n,m.anomalyDenominators[i])),['0','0','0','−1','−1']);
for(let mask=0;mask<8;mask++){
  const selected=m.sectors.filter((_,i)=>mask&(1<<i));const s=m.surviving(selected.map(row=>row.id));
  const rank=selected.length===0?0:selected.length===1?1:2;
  check(s.rank,rank);check(s.dimension,2-rank);
  if(s.direction)selected.forEach(row=>near(row.charge[0]*s.direction[0]+row.charge[1]*s.direction[1],0));
}
check(m.surviving(['d5']).label,'B');check(m.surviving(['d6']).label,'B − L');check(m.surviving(['d7']).label,'B + L');
assert.throws(()=>m.anomaly('unknown'));assert.throws(()=>m.gauge([0,0],90));assert.throws(()=>m.surviving(['unknown']));checks+=3;
console.log(JSON.stringify({mathematical_checks:checks,models:['passive and active rotation','Abelian gauge loop','local and global anomaly ledger','continuous B/L operator constraints']}));
