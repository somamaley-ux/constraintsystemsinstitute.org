import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data = JSON.parse(fs.readFileSync(new URL('../data/lean-projects.json', import.meta.url)));
const code = fs.readFileSync(new URL('../assets/lean-catalogue.js', import.meta.url),'utf8');
const html = fs.readFileSync(new URL('../lean/index.html', import.meta.url),'utf8');
assert.equal(data.projects.length,18);
assert.equal(data.projects.filter(p=>p.framework==='aasc').length,14);
assert.equal(data.projects.filter(p=>p.framework==='beyond-aasc').length,4);
assert(!JSON.stringify(data).includes('LeanMillenniumPrizeProblems'));
assert.equal((html.match(/data-lean-project/g)||[]).length,18);
assert(html.includes('<noscript>'));
function setup(url) {
 const listeners={};
 const element = props=>({...props,handlers:{},attrs:{},addEventListener(type,fn){this.handlers[type]=fn},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},focus(){this.focused=true}});
 const cards=data.projects.map(p=>element({id:p.id,dataset:{framework:p.framework},textContent:JSON.stringify(p),hidden:false}));
 const filters=['all','aasc','beyond-aasc'].map(f=>element({dataset:{leanFilter:f}}));
 const nodes=Object.fromEntries(['lean-search','lean-clear','lean-results','lean-empty'].map(k=>[k,element({value:'',hidden:false,textContent:''})]));
 const context={URL,URLSearchParams,location:new URL(url),history:{},document:{querySelectorAll(s){return s==='[data-lean-project]'?cards:filters},getElementById(k){return nodes[k]},documentElement:{classList:{add(){}}}},addEventListener(k,fn){listeners[k]=fn}};
 context.history.pushState=context.history.replaceState=(_,__,url)=>{context.location=new URL(url)};
 vm.runInNewContext(code,context);
 return {cards,filters,nodes,listeners,context,visible:()=>cards.filter(c=>!c.hidden).length,click:f=>filters.find(l=>l.dataset.leanFilter===f).handlers.click({preventDefault(){}})};
}
let t=setup('https://constraintsystemsinstitute.org/lean/');
assert.equal(t.visible(),18);t.click('aasc');assert.equal(t.visible(),14);t.click('beyond-aasc');assert.equal(t.visible(),4);t.click('beyond-aasc');assert.equal(t.visible(),4);t.click('all');assert.equal(t.visible(),18);
t.nodes['lean-search'].value='Dirac';t.nodes['lean-search'].handlers.input();assert.equal(t.visible(),2);assert(t.context.location.search.includes('q=Dirac'));
t.nodes['lean-search'].value='no-such-project';t.nodes['lean-search'].handlers.input();assert.equal(t.visible(),0);assert.equal(t.nodes['lean-empty'].hidden,false);
t.nodes['lean-clear'].handlers.click();assert.equal(t.visible(),18);assert(t.nodes['lean-search'].focused);
t.nodes['lean-search'].value='kernel';t.nodes['lean-search'].handlers.input();t.nodes['lean-search'].handlers.keydown({key:'Escape'});assert.equal(t.visible(),18);
t.context.location=new URL('https://constraintsystemsinstitute.org/lean/?framework=beyond-aasc');t.listeners.popstate();assert.equal(t.visible(),4);
assert.equal(setup('https://constraintsystemsinstitute.org/lean/?framework=aasc').visible(),14);
assert.equal(setup('https://constraintsystemsinstitute.org/lean/?framework=unknown').visible(),18);
assert.equal(setup('https://constraintsystemsinstitute.org/lean/?q=Greg').visible(),4);
assert.equal(setup('https://constraintsystemsinstitute.org/lean/?framework=aasc#lean-dirac-derivation').visible(),18);
assert.equal(setup('https://constraintsystemsinstitute.org/lean/#%broken').visible(),18);
console.log('PASS: catalogue counts, exclusion, source rendering, filters, repeated clicks, searches, empty state, clear, Escape, history, direct links and malformed fragments.');

assert.equal(setup('https://constraintsystemsinstitute.org/lean/?q=Redshift&framework=beyond-aasc').visible(),1);
assert.equal(setup('https://constraintsystemsinstitute.org/lean/?framework=beyond-aasc#lean-redshift-derivation').visible(),18);

assert.equal(setup('https://constraintsystemsinstitute.org/lean/?q=Schrodinger&framework=beyond-aasc').visible(),1);
