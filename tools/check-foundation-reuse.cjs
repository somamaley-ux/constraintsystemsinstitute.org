const assert = require('node:assert/strict');
const model = require('../foundations/reuse-model.js');
// Structure of Admissibility, section 9.1, pp31–32: the four-state bridge example.
assert.deepEqual(model.states.map(({id, qualifies, next, operation, warrant}) => ({id, qualifies, next, operation, warrant})), [
  {id:'s', qualifies:true, next:'s', operation:'repeat', warrant:true},
  {id:'t', qualifies:true, next:'f', operation:'repeat', warrant:true},
  {id:'f', qualifies:false, next:'r', operation:'repair', warrant:true},
  {id:'r', qualifies:true, next:'r', operation:'repeat', warrant:true}
], 'Exact source states and declared transitions');
const states = new Map(model.states.map(state => [state.id, state]));
assert.deepEqual(model.safeLayers(), [['s','t','f','r'],['s','t','r'],['s','r'],['s','r']], 'Exact published bridge approximation');
assert.equal(states.get('s').qualifies, states.get('t').qualifies, 'Initial badges agree');
assert.notEqual(states.get(states.get('s').next).qualifies, states.get(states.get('t').next).qualifies, 'Repeat observation separates the equal badges');
assert.deepEqual(model.failurePath('t'), ['t','f'], 'Repeat supplies the short failure witness');
assert.deepEqual(model.failurePath('f'), ['f'], 'Current failure needs a zero-edge witness');
assert.equal(model.failurePath('s'), null);
assert.equal(model.failurePath('r'), null);
assert.equal(states.get('f').qualifies, false);
assert.equal(states.get(states.get('f').next).qualifies, true, 'Repair permits a new positive configuration');
assert(model.states.every(state => state.warrant), 'All four source edges have warrants');
const ids = [...states.keys()];
const soundRegions=[];
for(let mask=0;mask<16;mask++) {
  const proposed=ids.filter((id,index)=>mask & (1<<index));
  const closed=proposed.every(id=>states.get(id).qualifies && proposed.includes(states.get(id).next));
  if(closed) soundRegions.push(proposed);
}
assert.deepEqual(soundRegions,[[],['s'],['r'],['s','r']], 'All sound subsets independently enumerated');
assert.deepEqual([...new Set(soundRegions.flat())].sort(),model.safeLayers().at(-1).slice().sort(), 'Interior contains every sound subset');
assert.deepEqual(model.classifyClaim(['s','t','r']), {kind:'surplus',surplus:['t'],omitted:[]});
assert.deepEqual(model.classifyClaim(['s']), {kind:'omission',surplus:[],omitted:['r']});
assert.deepEqual(model.classifyClaim(['s','r']), {kind:'complete',surplus:[],omitted:[]});
assert.deepEqual(model.classifyClaim(['t']), {kind:'both',surplus:['t'],omitted:['s','r']});
assert.throws(()=>model.classifyClaim(['unknown']), TypeError);
console.log('Bridge model checks passed: exact source transitions and layers, equal-bit repeat split, repair, failure witnesses, all 16 candidate sets, and claim classification.');
