import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const all = JSON.parse(fs.readFileSync(path.join(root, 'papers.json'), 'utf8'));
const entries = [
  {id:'consciousness',code:'Consciousness',doi:'10.5281/zenodo.20773878',group:'The main papers',
    plain:'How experience, internal records, memory, and qualitative differences form one subject-linked structure. Distinguishes the experience from its report and a genuine qualitative difference from a change of vocabulary.',
    scope:'Local reference and qualification theorems, a complete fixed-domain consciousness-description bridge, and a defended constitutive identification. Depends on imported AASC closure. Does not supply actual neural realization, a consciousness score, or empirical certification of present AI.'},
  {id:'free-will',code:'Free will',doi:'10.5281/zenodo.18514627',group:'The main papers',
    plain:'Locates free will in valid authorship of a determinate undertaking. Shows why authorship attaches at commitment, not when a later outcome succeeds or fails, while keeping coercion, concealed terms, and displaced authorship distinct from ordinary causal constraint.',
    scope:'Indexed standing, access, directed uptake, carrier adequacy, bundle admissibility, non-displacement and fixation. Responsibility-authorship is not outcome selection, retributive desert, or a theorem of legal liability.'},
  {id:'mentis',code:'Earlier support',doi:'10.5281/zenodo.18611122',group:'Earlier supporting work',
    plain:'Develops structural mediation and invariant reference under changes of description, then extends the account to interacting systems. Supplies earlier role-classification machinery rather than a shortcut to the newer consciousness criteria.',
    scope:'Typed single- and multi-system projection results with compatibility conditions. Role-based consciousness and agency vocabulary adds no primitives. Quotient mediation is distinct from choosing a privileged representative.'},
  {id:'agency',code:'Earlier support',doi:'10.5281/zenodo.18522150',group:'Earlier supporting work',
    plain:'Explains why calling something an agent need not add any structure beyond the behavior already described. The label remains useful, but cannot by itself supply consciousness or absorb responsibility for an authored policy.',
    scope:'Elimination of agency as an additional primitive under standing-closed admissibility and redescription stability. Does not deny capability, complexity, practical agency language, or risk.'}
].map(entry => {
  const paper = all.find(item => item.doi === entry.doi);
  if (!paper || !fs.existsSync(path.join(root, 'papers', paper.slug, 'index.html'))) throw new Error(`Missing paper: ${entry.doi}`);
  return {...entry, title:paper.title, url:paper.url, slug:paper.slug};
});
const esc = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const article = entry => `<article class="paper-entry" id="paper-${entry.id}"><span class="paper-code">${entry.code}</span><div><h4><a href="../papers/${entry.slug}/index.html">${esc(entry.title)}</a></h4><p>${esc(entry.plain)}</p><div class="paper-links"><a href="../papers/${entry.slug}/index.html">Paper record <i data-lucide="file-text" aria-hidden="true"></i></a><a href="https://doi.org/${entry.doi}">All-versions DOI <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div><details class="paper-scope"><summary>Exact scope</summary><p>${esc(entry.scope)}</p></details></div></article>`;
const catalogue = `<section class="paper-group" aria-label="The main papers"><h3>The main papers</h3>${entries.slice(0,2).map(article).join('\n')}</section>\n<details class="supporting-papers"><summary>Earlier supporting work: Mentis Umbra and Agency as a Bookkeeping Projection</summary>${entries.slice(2).map(article).join('\n')}</details>`;
const metadata = {'@context':'https://schema.org','@type':'CollectionPage',name:'Experience & Choice',url:'https://constraintsystemsinstitute.org/mind-agency/',inLanguage:'en',author:{'@type':'Person',name:'Amos Jay Maley'},description:'A guided tour of consciousness, qualia, free will and responsible authorship in the AASC corpus.',hasPart:entries.map(entry => ({'@type':'ScholarlyArticle',name:entry.title,url:entry.url,identifier:entry.doi}))};
const file = path.join(root, 'mind-agency', 'index.html');
let html = fs.readFileSync(file, 'utf8');
for (const marker of ['MIND_METADATA','MIND_PAPERS']) if (!html.includes(`<!-- ${marker} -->`) || !html.includes(`<!-- /${marker} -->`)) throw new Error(`Missing ${marker}`);
html = html.replace(/<!-- MIND_METADATA -->[\s\S]*?<!-- \/MIND_METADATA -->/, `<!-- MIND_METADATA -->\n<script type="application/ld+json">${JSON.stringify(metadata).replaceAll('<','\\u003c')}</script>\n<!-- /MIND_METADATA -->`);
html = html.replace(/<!-- MIND_PAPERS -->[\s\S]*?<!-- \/MIND_PAPERS -->/, `<!-- MIND_PAPERS -->\n${catalogue}\n<!-- /MIND_PAPERS -->`);
fs.writeFileSync(file, html);
fs.writeFileSync(path.join(root, 'mind-agency', 'papers.json'), JSON.stringify(entries, null, 2) + '\n');
console.log(`Generated ${entries.length} verified mind/agency paper records.`);
