'use strict';
const assert = require('node:assert/strict');
const model = require('../physics-from-below/sr-model.js');
function close(actual, expected, label, scale = 1) {
  assert(Math.abs(actual - expected) <= 2e-11 * Math.max(scale, Math.abs(expected)), `${label}: ${actual} != ${expected}`);
}
close(model.gamma(.6), 1.25, 'Known 3–4–5 boost');
close(model.clock(.6).coordinateSeconds, 5, 'Four clock seconds become five network seconds');
close(model.rod(.6).measuredLength, 8, 'Ten-metre rod measured at eight metres');
const r = model.radar();
close(r.distance, 299.792458, 'Radar distance in SI');
close(r.reflection, 1e-6, 'Radar midpoint', 1e-6);
const delayed = model.radar(8e-6, 11e-6, 1e-6);
close(delayed.distance, r.distance, 'Known delay excluded from flight time');
close(delayed.reflection, 9e-6, 'Arrival at delayed reflector', 1e-6);
for (let i = -90; i <= 90; i++) {
  const beta = i / 100;
  const signals = model.signalRecords(beta);
  signals.observed.forEach((event, index) => {
    assert.equal(event.id, signals.events[index].id, 'Frame comparison preserves event identity');
    const inverse = model.boost(event, -beta);
    close(inverse.t, signals.events[index].t, 'Inverse boost time', 1e-6);
    close(inverse.x, signals.events[index].x, 'Inverse boost position', 1000);
  });
  close(model.intervalSquared(signals.observed[0], signals.observed[1]), 0, 'Outgoing signal remains null', 1e6);
  close(model.intervalSquared(signals.observed[1], signals.observed[2]), 0, 'Return signal remains null', 1e6);
  assert(signals.observed[0].t < signals.observed[1].t && signals.observed[1].t < signals.observed[2].t, 'Signal order never reverses');
  const rod = model.rod(beta);
  close(rod.observerEvents[1].t - rod.observerEvents[0].t, 0, 'Selected rod events simultaneous in measuring frame', 1e-7);
  close(rod.observerEvents[1].x - rod.observerEvents[0].x, rod.measuredLength, 'Endpoint distance matches reading');
  close(rod.restEvents[1].x - rod.restEvents[0].x, 10, 'Persistent rod endpoints keep rest separation');
  const simultaneous = model.simultaneity(beta);
  close(model.intervalSquared(...simultaneous.observed), -90000, 'Same spacelike event pair retains its interval');
  const body = model.energy(beta), pushed = model.energy(beta, model.c ** 2, 'push');
  close((body.totalEnergy / body.restEnergy) ** 2 - (model.c * body.momentum / body.restEnergy) ** 2, 1, 'Derived mass shell');
  assert.equal(body.impulse, null, 'Observer change does not manufacture an impulse');
  close(pushed.impulse, pushed.momentum, 'Rest-to-motion pulse balance');
  close(model.clock(beta).properSeconds, 4, 'Retained clock interval');
}
const small = 1e-6, forward = model.energy(small, model.c ** 2, 'push'), backward = model.energy(-small, model.c ** 2, 'push');
close((forward.impulse - backward.impulse) / (2 * small * model.c), 1, 'Measured small-speed inertial response');
for (const beta of [-1, 1, NaN, Infinity]) assert.throws(() => model.gamma(beta), RangeError);
assert.throws(() => model.radar(0, 1, 2), RangeError);
assert.throws(() => model.rod(0, -1), RangeError);
assert.throws(() => model.energy(.6, 0), RangeError);
assert.throws(() => model.energy(.6, 1, 'coordinate-push'), RangeError);
console.log('SR recovery model passed: known values, SI radar and delay, 181 boosts preserving event identity/null signals/order, rod event selection, spacelike interval, energy–momentum invariant, physical impulse distinction, and measured rest inertia.');
