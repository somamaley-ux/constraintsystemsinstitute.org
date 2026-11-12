import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { projects } = JSON.parse(fs.readFileSync(path.join(root, 'data/lean-projects.json'), 'utf8'));
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const names = {aasc:'AASC', 'beyond-aasc':'Beyond AASC'};
const seen = new Set();
for (const project of projects) {
  if (!/^[a-z0-9-]+$/.test(project.id) || seen.has(project.id) || !names[project.framework]) throw new Error('Invalid project identity');
  seen.add(project.id);
  for (const {url} of project.links) if (!url.startsWith('https://') && !url.startsWith('/')) throw new Error('Invalid project link');
}
const cards = projects.map(p => `<article class="lean-project" id="${p.id}" data-lean-project data-framework="${p.framework}" aria-labelledby="${p.id}-title">
  <p class="repo-type">${names[p.framework]} · ${escape(p.area)}</p>
  <h2 id="${p.id}-title">${escape(p.title)}</h2>
  <p class="project-author">${p.author ? `Author: ${escape(p.author)}<br>` : ''}Repository owner: ${escape(p.owner)}</p>
  <p class="project-scope">${escape(p.scope)}</p>
  <dl><dt>Source / version</dt><dd>${escape(p.version)}</dd><dt>Verification status</dt><dd>${escape(p.verification)}</dd><dt>Claim boundary</dt><dd>${escape(p.boundary)}</dd></dl>
  <nav class="lean-project-links" aria-label="${escape(p.title)} sources">${p.links.map(l => `<a href="${escape(l.url)}">${escape(l.label)}</a>`).join('\n')}</nav>
</article>`).join('\n');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lean 4 Formalisations | Constraint Systems Institute</title>
<meta name="description" content="Browse AASC and Beyond AASC Lean 4 projects with clear scope, source links, authorship, verification status and claim boundaries.">
<meta name="robots" content="index, follow"><link rel="canonical" href="https://constraintsystemsinstitute.org/lean/">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/lean-catalogue.css"><script defer src="/assets/lean-catalogue.js"></script>
</head><body class="lean-page">
<header class="site-header"><a class="brand" href="/" aria-label="Constraint Systems Institute home"><span class="brand-mark" aria-hidden="true"></span><span>Constraint Systems<br>Institute</span></a><nav class="nav" aria-label="Primary navigation"><a href="/#guided-tours">Tours</a><a href="/papers/">Papers</a><a href="/lean/" aria-current="page">Lean 4</a><a href="/#contact">Contact</a></nav></header>
<main class="lean-main" id="main-content" tabindex="-1">
<header class="lean-intro"><p class="eyebrow">Formal projects / One catalogue</p><h1>Lean 4 Formalisations</h1><p class="lean-lead">Inspect the formal work, its assumptions and the evidence behind it. Browse the AASC projects together with selected work from other frameworks.</p></header>
<div class="lean-framing"><section><h2>AASC and Beyond AASC</h2><p>AASC identifies projects using the AASC framework or its foundational machinery. Beyond AASC identifies work using other frameworks. These categories describe the work, not its author or institutional affiliation.</p></section><section><h2>Read each verification status</h2><p>Authorship, repository ownership and framework are recorded separately. A passing project build checks its declared formal result; it does not validate every physical interpretation. Catalogue inclusion is not independent proof verification.</p></section></div>
<div class="lean-controls"><nav class="lean-filters" aria-label="Filter projects by framework"><a class="lean-filter" data-lean-filter="all" href="/lean/" aria-current="true">All</a><a class="lean-filter" data-lean-filter="aasc" href="/lean/?framework=aasc">AASC</a><a class="lean-filter" data-lean-filter="beyond-aasc" href="/lean/?framework=beyond-aasc">Beyond AASC</a></nav><div class="lean-search"><label for="lean-search">Search projects, authors or topics</label><div class="lean-search-field"><input id="lean-search" type="search" placeholder="Kernel, Dirac, geometry…" autocomplete="off" aria-describedby="lean-results"><button id="lean-clear" type="button" hidden>Clear</button></div></div><p class="lean-results" id="lean-results" role="status" aria-live="polite">${projects.length} projects</p></div>
<noscript><p class="lean-results">All ${projects.length} projects are shown below. Filtering requires JavaScript; every project and source link remains available.</p></noscript>
<div class="lean-project-grid">${cards}</div><p class="lean-empty" id="lean-empty" hidden>No projects match this search. Try fewer words or choose All.</p>
<footer class="lean-policy"><p>External projects remain the work of their credited authors. Listing does not imply CSI affiliation or endorsement. Where a personal author has not been checked for this catalogue, the repository owner is identified without treating ownership as authorship.</p><p>These entries describe the linked formal surfaces and retain their assumptions, imported results and non-claims. Consult an exact release, theorem and audit record for a technical claim. <a href="/using-the-research/">Citation and reuse guidance</a> · <a href="/#contact">Suggest a project or report a correction</a>.</p></footer>
</main></body></html>\n`;
fs.mkdirSync(path.join(root,'lean'),{recursive:true});
fs.writeFileSync(path.join(root,'lean/index.html'),html);
console.log(`Built ${projects.length} Lean project cards.`);
