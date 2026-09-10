/* Numerical illustrations of Quantum Measurement under AASC, sections 9 and 12,
   and Bell-Nonlocal Quantum Entanglement, section 10.2. No sampled histories. */
((root) => {
  'use strict';
  const N = 32, r = Math.exp(-1 / 8), tail = r ** 512;
  const gibbs = ell => ell > 0 ? (r ** ell - tail) / (1 - tail) : (1 - r ** (512 + ell)) / (1 - tail);
  const transitions = Array.from({length:33}, (_, k) => {
    const up = (32-k)/32 * gibbs(23-2*k), down = k/32 * gibbs(2*k-25);
    return {up, down, stay:1-up-down};
  });
  const cache = [Array.from({length:33}, (_, k) => k===16 ? 1 : 0)];
  function amplify(steps, seed=1) {
    if (!Number.isInteger(steps) || steps<0 || steps>1024 || ![-1,0,1].includes(seed)) throw new RangeError('Invalid amplifier setting');
    if (seed===0) return [...cache[0]];
    while(cache.length<=steps) {
      const previous=cache[cache.length-1], next=Array(33).fill(0);
      previous.forEach((value,k) => {
        const t=transitions[k]; next[k]+=value*t.stay;
        if(k<N) next[k+1]+=value*t.up;
        if(k>0) next[k-1]+=value*t.down;
      });
      cache.push(next);
    }
    const result=[...cache[steps]];
    return seed===-1 ? result.reverse() : result;
  }
  function bands(distribution) {
    return {lower:distribution.slice(0,9).reduce((a,b)=>a+b,0),ready:distribution.slice(9,24).reduce((a,b)=>a+b,0),upper:distribution.slice(24).reduce((a,b)=>a+b,0)};
  }
  function bell(a,b) { if(![0,1].includes(a)||![0,1].includes(b)) throw new RangeError('Invalid Bell setting'); return a===1&&b===1 ? [3,13,13,3] : [13,3,3,13]; }
  function calibration(epsilon) { if(!Number.isFinite(epsilon)||epsilon<0||epsilon>1) throw new RangeError('Invalid calibration'); const delta=Math.sqrt(epsilon*(1-epsilon)); return {plus:.5+delta,minus:.5-delta,bound:Math.sqrt(epsilon)}; }
  const api={amplify,bands,bell,calibration,transitions};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.MeasurementModel=api;
})(typeof window==='undefined'?globalThis:window);
