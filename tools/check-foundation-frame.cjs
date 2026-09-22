const assert=require('node:assert/strict');
const model=require('../foundations/frame-model.js');
function close(actual,expected,label) {assert(Math.abs(actual-expected)<=2e-11*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);}
function same(actual,expected,label) {close(actual.ct,expected.ct,label+' ct');close(actual.x,expected.x,label+' x');}
const vectors=[{ct:4,x:0},{ct:0,x:3},{ct:2,x:2},{ct:7,x:-2},{ct:-3,x:1.5}];
const initialIntervals=[16,-9,0,45,6.75];
for(let i=-70;i<=70;i++) {
 const beta=i/100;
 vectors.forEach((event,index)=>{
  const transformed=model.boost(event,beta);
  close(model.interval(transformed),initialIntervals[index],'Lorentz interval');
  same(model.boost(transformed,-beta),event,'Reciprocal boost');
 });
 const watch=model.watch(beta);
 close(watch.interval,16,'Watch interval');close(watch.properTime,4,'Watch elapsed time');
 same(watch.a,{ct:0,x:0},'Shared origin');
 assert(watch.b.ct>0,'Time order of these timelike events stays fixed');
 const offsetA={ct:3,x:2},offsetB={ct:7,x:2};
 same(model.difference(model.boost(offsetA,beta),model.boost(offsetB,beta)),watch.delta,'Offset-independent separation');
}
same(model.watch(.6).b,{ct:5,x:-3},'Known 3–4–5 case, right-moving frame');
same(model.watch(-.6).b,{ct:5,x:3},'Known 3–4–5 case, left-moving frame');
vectors.forEach(event=>same(model.boost(event,0),event,'Rest-frame identity'));
for(const first of [-.6,-.2,.2,.6]) for(const second of [-.6,-.2,.2,.6]) {
 const combined=(first+second)/(1+first*second);
 vectors.forEach(event=>same(model.boost(model.boost(event,first),second),model.boost(event,combined),'Relativistic boost composition'));
}
assert.equal(model.properTime({ct:0,x:1}),null,'No timelike proper time assigned to spacelike separation');
for(const invalid of [-1,1,Infinity,NaN]) assert.throws(()=>model.watch(invalid),RangeError);
assert.throws(()=>model.boost({ct:NaN,x:0},0),TypeError);
console.log('Lorentz model checks passed: interval and reciprocal boosts at 141 speeds, timelike/spacelike/null examples, translated events, exact 3–4–5 values, boost composition, and invalid inputs.');
