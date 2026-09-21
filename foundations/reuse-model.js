/* Finite teaching model from Structure of Admissibility, section 9.1, pp31–32. */
(function (root) {
  'use strict';
  const states = Object.freeze([
    Object.freeze({ id: 's', name: 'Stable bridge', qualifies: true, next: 's', operation: 'repeat', warrant: true }),
    Object.freeze({ id: 't', name: 'Vulnerable bridge', qualifies: true, next: 'f', operation: 'repeat', warrant: true }),
    Object.freeze({ id: 'f', name: 'Failed bridge', qualifies: false, next: 'r', operation: 'repair', warrant: true }),
    Object.freeze({ id: 'r', name: 'Repaired bridge', qualifies: true, next: 'r', operation: 'repeat', warrant: true })
  ]);
  const ids = states.map(state => state.id);
  function safeLayers() {
    const layers = [ids.slice()];
    while (true) {
      const previous = new Set(layers[layers.length - 1]);
      const next = states.filter(state => state.qualifies && state.warrant && previous.has(state.next)).map(state => state.id);
      layers.push(next);
      if (next.length === previous.size && next.every(id => previous.has(id))) return layers;
    }
  }
  function classifyClaim(proposed) {
    if (!Array.isArray(proposed) || proposed.some(id => !ids.includes(id))) throw new TypeError('Unknown bridge state.');
    const safe = safeLayers().at(-1);
    const included = new Set(proposed);
    const surplus = ids.filter(id => included.has(id) && !safe.includes(id));
    const omitted = safe.filter(id => !included.has(id));
    return { kind: surplus.length ? (omitted.length ? 'both' : 'surplus') : (omitted.length ? 'omission' : 'complete'), surplus, omitted };
  }
  function failurePath(start) {
    if (!ids.includes(start)) throw new TypeError('Unknown bridge state.');
    const seen = new Set();
    const path = [];
    let id = start;
    while (!seen.has(id)) {
      seen.add(id);
      path.push(id);
      const state = states.find(item => item.id === id);
      if (!state.qualifies || !state.warrant) return path;
      id = state.next;
    }
    return null;
  }
  const model = Object.freeze({ states, safeLayers, classifyClaim, failurePath });
  root.FoundationReuseModel = model;
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
})(typeof globalThis !== 'undefined' ? globalThis : window);
