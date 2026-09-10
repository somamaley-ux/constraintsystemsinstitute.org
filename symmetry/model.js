(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.SymmetryModel=model;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const radians=degrees=>degrees*Math.PI/180;
  function transform(mode,degrees){
    const a=radians(degrees),start=Math.PI/6,physical=mode==='action'?start+a:start,basis=mode==='basis'?a:0;
    return {physical:[Math.cos(physical),Math.sin(physical)],coordinates:[Math.cos(physical-basis),Math.sin(physical-basis)],basis,degrees,norm:1};
  }

  function gauge(phases,flux){
    if(phases.length!==4||!phases.every(Number.isFinite)||!Number.isFinite(flux))throw new RangeError('Four finite frame phases and one finite flux are required.');
    const edges=phases.map((p,i)=>flux/4+p-phases[(i+1)%4]);
    return {edges,loop:edges.reduce((a,b)=>a+b,0),real:Math.cos(radians(flux)),imaginary:Math.sin(radians(flux))};
  }
  const multiplets=[
    {id:'q',label:'Q',representation:'(3, 2)',hypercharge:'1/6',local:[2,1,1,1,1],weak:3},
    {id:'u',label:'uᶜ',representation:'(3̄, 1)',hypercharge:'−2/3',local:[-1,-2,0,-32,-2],weak:0},
    {id:'d',label:'dᶜ',representation:'(3̄, 1)',hypercharge:'1/3',local:[-1,1,0,4,1],weak:0},
    {id:'l',label:'L',representation:'(1, 2)',hypercharge:'−1/2',local:[0,0,-1,-9,-1],weak:1},
    {id:'e',label:'eᶜ',representation:'(1, 1)',hypercharge:'1',local:[0,0,0,36,1],weak:0},
    {id:'n',label:'Extra doublet',representation:'(1, 2)',hypercharge:'0',local:[0,0,0,0,0],weak:1}
  ];
  const anomalyDenominators=[1,6,4,36,1];
  function anomaly(preset){
    if(!['full','omit','extra'].includes(preset))throw new RangeError('Unknown matter content.');
    const rows=multiplets.filter(row=>preset==='extra'||(row.id!=='n'&&(preset!=='omit'||row.id!=='e')));
    const coefficients=Array.from({length:5},(_,i)=>rows.reduce((sum,row)=>sum+row.local[i],0));
    const weak=rows.reduce((sum,row)=>sum+row.weak,0);
    return {rows,coefficients,weak,localClear:coefficients.every(n=>n===0),globalClear:weak%2===0};
  }
  const sectors=[{id:'d5',label:'Weinberg term',dimension:5,charge:[0,2]},{id:'d6',label:'Baryon-violating term',dimension:6,charge:[1,1]},{id:'d7',label:'Opposite B/L violation',dimension:7,charge:[1,-1]}];
  function surviving(ids){
    if(!Array.isArray(ids)||ids.some(id=>!sectors.some(s=>s.id===id)))throw new RangeError('Unknown operator sector.');
    const active=sectors.filter(s=>ids.includes(s.id));
    if(active.length===0)return {rank:0,dimension:2,label:'B and L phase plane',direction:null,active};
    const [b,l]=active[0].charge;
    if(active.some(s=>s.charge[0]*l-s.charge[1]*b!==0))return {rank:2,dimension:0,label:'No continuous B/L direction',direction:null,active};
    return {rank:1,dimension:1,label:active[0].id==='d5'?'B':active[0].id==='d6'?'B − L':'B + L',direction:[l,-b],active};
  }
  function fraction(n,d=1){if(n===0)return '0';const gcd=(a,b)=>b?gcd(b,a%b):a;const g=gcd(Math.abs(n),d);return (n<0?'−':'')+Math.abs(n/g)+(d/g===1?'':'/'+(d/g));}
  return {transform,gauge,anomaly,anomalyDenominators,sectors,surviving,fraction};
});
