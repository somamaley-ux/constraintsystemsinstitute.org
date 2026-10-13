/* Exact finite reference and published event enclosures; no numerical ODE solve. */
((root) => {
  'use strict';
  function reference(progress) {
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError('Progress must be between zero and one.');
    const tau = progress * Math.log(2), d = .5 * Math.exp(-tau);
    const a = Math.exp(-tau + (.25 - d * d) / 2);
    const density = 3 * (1 - d * d) ** 2, initialDensity = 27 / 16;
    return {tau, d, a, volume: a ** 3, contrast: d / .5,
      speed: a * (1 - d * d) / .75, fractionalRate: (1 - d * d) / .75,
      density: density / initialDensity, energy: density / initialDensity * a ** 3,
      kinetic: 2 * d * d, potential: 3 * (1 - d * d) ** 2 - 2 * d * d,
      pressure: 4 * d * d - density, acceleration: (1 - d * d) ** 2 - 2 * d * d};
  }
  const labels = {
    meanEntry:'Overall braking begins', arealEntry:'Sphere braking begins',
    turn:'The scalar turns', arealExit:'Sphere braking ends', meanExit:'Overall braking ends'
  };
  const cases = Object.freeze({
    survival:{label:'Braking survives the turn', shear:'1/20',
      brackets:{meanEntry:[35,36],arealEntry:[42,43],turn:[210,212],arealExit:[230,232],meanExit:[245,247]}},
    competing:{label:'Braking ends before the turn', shear:'1/10',
      brackets:{meanEntry:[37,38],arealEntry:[51,54],turn:[195,197],arealExit:[159,163],meanExit:[182,184]}}
  });
  const orderedEvents = key => {
    if (!cases[key]) throw new RangeError('Unknown preparation.');
    return Object.entries(cases[key].brackets).sort((a,b)=>a[1][0]-b[1][0]).map(([id,range])=>({id,label:labels[id],range,lower:range[0]/256,upper:range[1]/256}));
  };
  const api = {reference,cases,orderedEvents};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BlackHoleMetric = api;
})(globalThis);
