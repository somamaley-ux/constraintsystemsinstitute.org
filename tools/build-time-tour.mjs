import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const all=JSON.parse(fs.readFileSync(path.join(root,'papers.json'),'utf8'));
const entries=[
  {id:'arrow',code:'Paper I',doi:'10.5281/zenodo.20678464',group:'The time pair',
    plain:'Why an event can leave a consequence that a later event cannot silently make never to have happened. The paper identifies temporal direction with standing monotonicity, while distinguishing it from entropy, causality, memory, and the choice of a clock.',
    scope:'Fixed-scope standing preorder, partial order after standing equivalence, and strict non-invertible direction. Not a global linear time, an entropy-production calculation, or a primitive temporal flow.'},
  {id:'clock',code:'Paper II',doi:'10.5281/zenodo.20833048',group:'The time pair',
    plain:'What makes a variable, field, device, or record sequence a physical clock for a particular job. Equivalent descriptions are grouped by their complete usable behavior; genuine differences and breakdown conditions remain explicit.',
    scope:'Use-relative quotient of certified clock behavior and exhaustive pair/selection classification. The quotient may be empty, singleton, or physically plural. Local-atlas compatibility is a criterion, not an existence theorem.'},
  {id:'wdw10',code:'WDW 10',doi:'10.5281/zenodo.21827349',group:'Constructive support',
    plain:'Constructs three different local clocks from a matter-field profile, local volume density, and intrinsic spatial curvature. Their transitions preserve the shared physical account and agree on overlaps, allowing clock-neutral assembly without a master clock.',
    scope:'Retained Branch-A compact-hyperbolic metric-real-scalar rank-one no-spectator target. Three function-valued local clocks and clock-neutral descent; no global monotonic clock or clock-only extension beyond the inherited scalar-chart locus.'}
].map(entry=>{
  const record=all.find(paper=>paper.doi===entry.doi);
  if(!record)throw new Error(`Missing archive record: ${entry.doi}`);
  if(!fs.existsSync(path.join(root,'papers',record.slug,'index.html')))throw new Error(`Missing landing page: ${record.slug}`);
  return {...entry,title:record.title,url:record.url,slug:record.slug};
});
const esc=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const catalogue=[...new Set(entries.map(entry=>entry.group))].map(group=>`<section class="paper-group" aria-label="${group}"><h3>${group}</h3>${entries.filter(entry=>entry.group===group).map(entry=>`<article class="paper-entry" id="paper-${entry.id}"><span class="paper-code">${entry.code}</span><div><h4><a href="../papers/${entry.slug}/index.html">${esc(entry.title)}</a></h4><p>${esc(entry.plain)}</p><div class="paper-links"><a href="../papers/${entry.slug}/index.html">Paper record <i data-lucide="file-text" aria-hidden="true"></i></a><a href="https://doi.org/${entry.doi}">All-versions DOI <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div><details class="paper-scope"><summary>Exact scope</summary><p>${esc(entry.scope)}</p></details></div></article>`).join('\n')}</section>`).join('\n');
const metadata={'@context':'https://schema.org','@type':'CollectionPage',name:'The Arrow & the Clock',url:'https://constraintsystemsinstitute.org/time/',inLanguage:'en',author:{'@type':'Person',name:'Amos Jay Maley'},description:'A guided tour of the AASC time pair and the three local profile clocks constructed in WDW 10.',hasPart:entries.map(entry=>({'@type':'ScholarlyArticle',name:entry.title,url:entry.url,identifier:entry.doi}))};
const file=path.join(root,'time','index.html');
let html=fs.readFileSync(file,'utf8');
for(const marker of ['TIME_METADATA','TIME_PAPERS'])if(!html.includes(`<!-- ${marker} -->`)||!html.includes(`<!-- /${marker} -->`))throw new Error(`Missing ${marker} markers`);
html=html.replace(/<!-- TIME_METADATA -->[\s\S]*?<!-- \/TIME_METADATA -->/,`<!-- TIME_METADATA -->\n<script type="application/ld+json">${JSON.stringify(metadata).replaceAll('<','\\u003c')}</script>\n<!-- /TIME_METADATA -->`);
html=html.replace(/<!-- TIME_PAPERS -->[\s\S]*?<!-- \/TIME_PAPERS -->/,`<!-- TIME_PAPERS -->\n${catalogue}\n<!-- /TIME_PAPERS -->`);
fs.writeFileSync(file,html);
fs.writeFileSync(path.join(root,'time','papers.json'),JSON.stringify(entries,null,2)+'\n');
console.log(`Generated ${entries.length} verified paper entries and time-tour metadata.`);
