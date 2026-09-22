/* Lorentz coordinates in 1+1 dimensions; ct and x are measured in light-seconds.
 * Standard boost convention: ct' = gamma(ct-beta*x), x' = gamma(x-beta*ct).
 * Source: Scott A. Hughes, MIT 8.033 (2024), Lecture 4, equations 4.1–4.2.
 */
(function (root) {
  'use strict';
  function boost(event, beta) {
    if (!Number.isFinite(beta) || Math.abs(beta) >= 1) throw new RangeError('The frame velocity must have magnitude less than c.');
    if (!event || !Number.isFinite(event.ct) || !Number.isFinite(event.x)) throw new TypeError('Event coordinates must be finite.');
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    return { ct: gamma * (event.ct - beta * event.x), x: gamma * (event.x - beta * event.ct) };
  }
  function difference(a, b) { return { ct: b.ct - a.ct, x: b.x - a.x }; }
  function interval(delta) { return delta.ct * delta.ct - delta.x * delta.x; }
  function properTime(delta) {
    const squared = interval(delta);
    if (squared < 0) return null;
    return Math.sqrt(squared); // c = 1 light-second per second.
  }
  const events = Object.freeze({ a: Object.freeze({ct:0,x:0}), b: Object.freeze({ct:4,x:0}) });
  function watch(beta) {
    const a = boost(events.a, beta), b = boost(events.b, beta), delta = difference(a,b);
    return { beta, a, b, delta, interval: interval(delta), properTime: properTime(delta) };
  }
  const model = Object.freeze({ boost, difference, interval, properTime, events, watch });
  root.FoundationFrameModel = model;
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
})(typeof globalThis !== 'undefined' ? globalThis : window);
