/* Pure teaching models for the Special Relativity from AASC tour.
 * SI units throughout; frame beta = v/c. A boost is a passive coordinate change.
 * Source: manuscript §§6–9 and Theorem 11.9. The physical hypotheses are stated
 * in the adjacent exhibit; these functions illustrate their numerical results.
 */
(function (root) {
  'use strict';
  const c = 299792458;
  function gamma(beta) {
    if (!Number.isFinite(beta) || Math.abs(beta) >= 1) throw new RangeError('Speed must be finite and below the speed of light.');
    return 1 / Math.sqrt(1 - beta * beta);
  }
  function positive(value, name) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + ' must be positive and finite.');
    return value;
  }
  function boost(event, beta) {
    const g = gamma(beta);
    if (!event || !Number.isFinite(event.t) || !Number.isFinite(event.x)) throw new TypeError('An event needs finite time and position.');
    return { id: event.id, t: g * (event.t - beta * event.x / c), x: g * (event.x - beta * c * event.t) };
  }
  function intervalSquared(a, b) {
    return (c * (b.t - a.t)) ** 2 - (b.x - a.x) ** 2;
  }
  function radar(departure = 0, reception = 2e-6, reflectionDelay = 0) {
    if (![departure, reception, reflectionDelay].every(Number.isFinite) || reflectionDelay < 0 || reception <= departure + reflectionDelay) throw new RangeError('Radar needs a positive travel interval and a nonnegative known reflection delay.');
    const travel = reception - departure - reflectionDelay;
    return { distance: c * travel / 2, reflection: (departure + reception - reflectionDelay) / 2, departure, reception, reflectionDelay };
  }
  function signalRecords(beta = 0) {
    const r = radar();
    const events = [
      { id: 'departure', t: r.departure, x: 0 },
      { id: 'reflection', t: r.reflection, x: r.distance },
      { id: 'return', t: r.reception, x: 0 }
    ];
    return { radar: r, events, observed: events.map(event => boost(event, beta)), gamma: gamma(beta) };
  }
  function clock(beta, properSeconds = 4) {
    positive(properSeconds, 'Clock duration');
    const g = gamma(beta);
    return { beta, gamma: g, properSeconds, coordinateSeconds: g * properSeconds, distance: beta * c * g * properSeconds };
  }
  function rod(beta, restLength = 10) {
    positive(restLength, 'Rest length');
    const g = gamma(beta);
    // In the rod's rest chart these are different endpoint events when beta != 0.
    // An inverse boost receives the rod as moving at +beta*c in the observer chart.
    const restEvents = [{ id: 'A0', t: 0, x: 0 }, { id: beta === 0 ? 'B0' : 'B(v)', t: -beta * restLength / c, x: restLength }];
    const observerEvents = restEvents.map(event => boost(event, -beta));
    return { beta, gamma: g, restLength, measuredLength: restLength / g, restTimeDifference: restEvents[1].t, restEvents, observerEvents };
  }
  function simultaneity(beta, separation = 300) {
    positive(separation, 'Event separation');
    const original = [{ id: 'C', t: 0, x: 0 }, { id: 'D', t: 0, x: separation }];
    const observed = original.map(event => boost(event, beta));
    return { original, observed, deltaSeconds: observed[1].t - observed[0].t, interval: intervalSquared(original[0], original[1]) };
  }
  function energy(beta, restEnergy = c * c, mode = 'observer') {
    positive(restEnergy, 'Rest energy');
    if (mode !== 'observer' && mode !== 'push') throw new RangeError('Choose an observer comparison or a physical push.');
    const g = gamma(beta), inertialMass = restEnergy / (c * c), momentum = g * inertialMass * beta * c;
    return { beta, gamma: g, mode, restEnergy, inertialMass, totalEnergy: g * restEnergy, kineticEnergy: (g - 1) * restEnergy, momentum, impulse: mode === 'push' ? momentum : null };
  }
  const model = Object.freeze({ c, gamma, boost, intervalSquared, radar, signalRecords, clock, rod, simultaneity, energy });
  root.PhysicsRecoverySR = model;
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
})(typeof globalThis !== 'undefined' ? globalThis : window);
