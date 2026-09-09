import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const records = JSON.parse(fs.readFileSync(path.join(root, 'gravity-quantum/papers.json'), 'utf8'));
const archive = JSON.parse(fs.readFileSync(path.join(root, 'papers.json'), 'utf8'));
const origin = 'https://constraintsystemsinstitute.org';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
if (records.length !== 21 || new Set(records.map(p => p.doi)).size !== 21) throw Error('Expected exactly 21 distinct suite papers.');
const groups = new Map();
const parts = [];
for (const paper of records) {
  const source = archive.find(p => p.doi === paper.doi);
  if (!source?.slug || !fs.existsSync(path.join(root, 'papers', source.slug, 'index.html'))) throw Error(`Missing archive record for ${paper.id}`);
  if (!groups.has(paper.group)) groups.set(paper.group, []);
  groups.get(paper.group).push(`<article class="paper-entry" id="paper-${paper.id}"><span class="paper-code">${escape(paper.code)}</span><div><h4><a href="../papers/${source.slug}/index.html">${escape(paper.title)}</a></h4><p>${escape(paper.description)}</p><div class="paper-links"><a href="../papers/${source.slug}/index.html">Paper record <i data-lucide="file-text" aria-hidden="true"></i></a><a href="https://doi.org/${paper.doi}">All-versions DOI <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div><details class="paper-scope"><summary>Exact scope</summary><p>${escape(paper.scope)}</p></details></div></article>`);
  parts.push({'@type':'ScholarlyArticle', name:paper.title, url:`${origin}/papers/${source.slug}/`, identifier:paper.doi});
}
const catalogue = [...groups].map(([group, entries]) => `<section class="paper-group" aria-label="${escape(group)}"><h3>${escape(group)}</h3><div class="paper-grid">${entries.join('\n')}</div></section>`).join('\n');
const metadata = {'@context':'https://schema.org', '@type':'CollectionPage', name:'Gravity and Quantum: One Physical World', url:`${origin}/gravity-quantum/`, inLanguage:'en', author:{'@type':'Person', name:'Amos Jay Maley'}, description:'A plain-language guided tour of the complete 21-paper AASC gravity-quantum dependency suite.', hasPart:parts};
const target = path.join(root, 'gravity-quantum/index.html');
let html = fs.readFileSync(target, 'utf8');
function replaceBlock(start, end, content) {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  if (a < 0 || b < 0) throw Error(`Missing generated block ${start}`);
  html = html.slice(0, a + start.length) + '\n' + content + '\n' + html.slice(b);
}
replaceBlock('<!-- PAPER_CATALOGUE -->', '<!-- /PAPER_CATALOGUE -->', catalogue);
replaceBlock('<!-- TOUR_METADATA -->', '<!-- /TOUR_METADATA -->', `<script type="application/ld+json">${JSON.stringify(metadata).replaceAll('<', '\\u003c')}</script>`);
fs.writeFileSync(target, html);
console.log('Built 21 source-linked paper explanations and matching collection metadata.');
