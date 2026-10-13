const assert=require('node:assert/strict');
const {reference,orderedEvents}=require('../black-holes/metric-model.js');
const close=(a,b,tolerance=1e-9)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const end=reference(1);
close(end.d,.25);close(end.tau,Math.log(2));close(end.density,25/16);
close(end.kinetic,1/8);close(end.potential,643/256);close(end.pressure,-611/256);
close(end.a,Math.exp(-Math.log(2)+3/32));close(end.energy,25/16*end.a**3);
close(end.speed,1.25*end.a);
assert(end.fractionalRate>1&&end.speed<1&&end.density>1&&end.energy<1);
let previous=reference(0);
for(let i=1;i<=100;i++){
 const x=reference(i/100);
 assert(x.a<previous.a&&x.contrast<previous.contrast&&x.speed<previous.speed);
 assert(x.density>previous.density&&x.energy<previous.energy&&x.acceleration>0);
 const rho=x.density*27/16;
 close(x.kinetic+x.potential,rho);
 const eps=1e-5, p=i/100;
 if(p>eps&&p<1-eps){
  const before=reference(p-eps),after=reference(p+eps),dt=2*eps*Math.log(2);
  const rhoDot=(after.density-before.density)*27/16/dt;
  close(rhoDot-3*(1-x.d*x.d)*(rho+x.pressure),0,1e-8);
  const volumeDot=(after.volume-before.volume)/dt;
  const energyDot=(after.energy-before.energy)*27/16/dt;
  close(energyDot+x.pressure*volumeDot,0,1e-8);
 }
 previous=x;
}
assert.deepEqual(orderedEvents('survival').map(x=>x.id),['meanEntry','arealEntry','turn','arealExit','meanExit']);
assert.deepEqual(orderedEvents('competing').map(x=>x.id),['meanEntry','arealEntry','arealExit','meanExit','turn']);
for(const key of ['survival','competing']){const events=orderedEvents(key);for(let i=1;i<events.length;i++)assert(events[i-1].upper<events[i].lower);}
for(const bad of [-1,1.1,NaN,Infinity])assert.throws(()=>reference(bad),RangeError);
console.log('Exact reference values, 100 monotone comparisons, source conservation, pressure work, and both certified event orders passed.');
