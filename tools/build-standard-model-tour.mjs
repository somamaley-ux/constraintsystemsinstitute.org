import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tour = path.join(root, 'standard-model');
const records = JSON.parse(fs.readFileSync(path.join(tour, 'papers.json'), 'utf8'));
const origin = 'https://constraintsystemsinstitute.org';
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceFolder = process.argv[2];
if (sourceFolder) {
  const files = fs.readdirSync(sourceFolder);
  fs.mkdirSync(path.join(tour, 'pdf'), { recursive: true });
  for (const paper of records) {
    const matches = files.filter(name => name.startsWith(paper.source_prefix) && name.endsWith('.pdf'));
    if (matches.length !== 1) throw new Error(`Expected exactly one source for ${paper.code}`);
    fs.copyFileSync(path.join(sourceFolder, matches[0]), path.join(tour, 'pdf', `${paper.id}.pdf`));
  }
}
for (const paper of records) {
  if (!fs.existsSync(path.join(tour, 'pdf', `${paper.id}.pdf`))) throw new Error(`Missing PDF: ${paper.id}`);
  const target = path.join(tour, 'papers', paper.id);
  fs.mkdirSync(target, { recursive: true });
  const url = `${origin}/standard-model/papers/${paper.id}/`;
  const pdf = `${origin}/standard-model/pdf/${paper.id}.pdf`;
  const metadata = { '@context':'https://schema.org', '@type':'ScholarlyArticle', headline:paper.title, author:{'@type':'Person',name:'Amos Jay Maley'}, description:paper.description, url, ...(paper.doi ? {identifier:paper.doi,sameAs:paper.doi_url}:{}), inLanguage:'en', ...(paper.date ? {datePublished:paper.date}:{}), encoding:{'@type':'MediaObject',contentUrl:pdf,encodingFormat:'application/pdf'}, isPartOf:{'@type':'CollectionPage',name:'Standard Model guided tour',url:`${origin}/standard-model/`} };
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(paper.title)} | Constraint Systems Institute</title>
<meta name="description" content="${escape(paper.description)}"><meta name="author" content="Amos Jay Maley">
<meta name="citation_title" content="${escape(paper.title)}"><meta name="citation_author" content="Maley, Amos Jay">
${paper.date ? `<meta name="citation_publication_date" content="${paper.date.replaceAll('-','/')}">` : ''}
${paper.doi ? `<meta name="citation_doi" content="${paper.doi}">` : ''}
<meta name="citation_pdf_url" content="${pdf}"><meta name="citation_language" content="en">
<link rel="canonical" href="${url}"><link rel="icon" href="../../../favicon.ico"><link rel="stylesheet" href="../../../styles.css"><link rel="stylesheet" href="../../tour.css">
<script type="application/ld+json">${JSON.stringify(metadata).replaceAll('<','\\u003c')}</script>
<script data-goatcounter="https://constraintsystemsinstitute.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head><body class="sm-tour">
<header class="site-header tour-header"><a class="brand" href="../../../index.html"><span class="brand-mark" aria-hidden="true"></span><span>Constraint Systems<br>Institute</span></a><nav class="tour-nav" aria-label="Paper navigation"><a href="../../index.html#${paper.chapter}">Guided tour</a><a href="../../index.html#papers">The full arc</a></nav></header>
<main class="sm-paper wrap"><p class="kicker">${escape(paper.code)} / ${escape(paper.group)}</p><h1>${escape(paper.title)}</h1><p class="paper-meta">Amos Jay Maley${paper.date ? ` / ${paper.date}` : ''} / Manuscript</p><div class="paper-description"><p>${escape(paper.description)}</p></div>
<div class="paper-actions">${paper.doi ? `<a class="text-link" href="${paper.doi_url}">All-versions DOI</a>` : ''}<a class="text-link" href="../../pdf/${paper.id}.pdf">Read the full paper (PDF)</a><a class="text-link" href="../../pdf/${paper.id}.pdf" download>Download PDF</a></div>
<section class="chapter"><h2>Technical overview</h2><div class="paper-description"><p>${escape(paper.technical)}</p></div><a class="text-link" href="../../index.html#${paper.chapter}">Explore this part of the argument</a></section>
</main><footer class="tour-footer wrap"><a href="../../../index.html">Constraint Systems Institute</a><a href="mailto:amos@constraintsystemsinstitute.org">Contact</a></footer></body></html>`;
  fs.writeFileSync(path.join(target, 'index.html'), html);
}

const catalogue = [...new Set(records.map(p => p.group))].map(group => `<section class="paper-group"><h3>${escape(group)}</h3>${records.filter(p => p.group===group).map(p => `<article class="paper-entry"><span class="paper-code">${escape(p.code)}</span><div><h4><a href="papers/${p.id}/index.html">${escape(p.title)}</a></h4><p>${escape(p.description)}</p>${p.doi ? `<p><a class="text-link" href="${p.doi_url}">All-versions DOI</a></p>` : ''}</div><a href="pdf/${p.id}.pdf" aria-label="Read ${escape(p.code)} PDF" title="Read ${escape(p.code)} PDF"><i data-lucide="file-text" aria-hidden="true"></i></a></article>`).join('\n')}</section>`).join('\n');
const htmlPath = path.join(tour, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const start = '<!-- PAPER_CATALOGUE -->';
const end = '<!-- /PAPER_CATALOGUE -->';
if (html.includes(end)) html = html.slice(0,html.indexOf(start)+start.length) + '\n' + catalogue + '\n' + html.slice(html.indexOf(end));
else html = html.replace(start, `${start}\n${catalogue}\n${end}`);
fs.writeFileSync(htmlPath, html);

const homePath = path.join(root, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
const homeStart='<!-- STANDARD_MODEL_PAPERS -->', homeEnd='<!-- /STANDARD_MODEL_PAPERS -->';
if(home.includes(homeStart) && home.includes(homeEnd)) {
  const links = records.map(p=>`<a href="standard-model/papers/${p.id}/index.html" data-paper-link data-paper-description="${escape(p.description)}" data-paper-title="${escape(p.title)}">${escape(p.code)}: ${escape(p.title)}</a>${p.doi ? `<a href="${p.doi_url}" data-paper-title="${escape(p.title)}">${escape(p.code)} · Zenodo</a>` : ''}`).join('\n');
  home=home.slice(0,home.indexOf(homeStart)+homeStart.length)+'\n'+links+'\n'+home.slice(home.indexOf(homeEnd));
  fs.writeFileSync(homePath, home);
}
const sharedPath = path.join(root,'papers.json');
const shared = JSON.parse(fs.readFileSync(sharedPath,'utf8')).filter(p => !p.url?.includes('/standard-model/papers/'));
for(const p of records) shared.push({title:p.title,url:`${origin}/standard-model/papers/${p.id}/`,pdf_url:`${origin}/standard-model/pdf/${p.id}.pdf`,...(p.date?{date:p.date}:{}),context:`Standard Model / ${p.group}`,description:p.description,technical:p.technical,author:'Amos Jay Maley',doi:p.doi,doi_url:p.doi_url,zenodo_record:p.zenodo_record,zenodo_publication_date:p.zenodo_publication_date,keywords:`Standard Model, AASC, ${p.code}, ${p.group}`});
fs.writeFileSync(sharedPath,JSON.stringify(shared,null,2)+'\n');
console.log(`Built tour catalogue and ${records.length} manuscript pages; verified all PDF sources.`);
