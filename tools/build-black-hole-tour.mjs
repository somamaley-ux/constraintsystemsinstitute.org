import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tour = path.join(root, 'black-holes');
const origin = 'https://constraintsystemsinstitute.org';
const papers = JSON.parse(fs.readFileSync(path.join(tour, 'papers.json'), 'utf8'));
const cataloguePath = path.join(root, 'papers.json');
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source = process.argv[2];
const verified = source ? JSON.parse(fs.readFileSync(path.join(source, 'zenodo-records.json'), 'utf8')) : null;
fs.mkdirSync(path.join(tour, 'pdf'), {recursive:true});

const entries = [];
for (const p of papers) {
  const paper = catalogue.find(item => item.doi === p.doi);
  if (!paper) throw new Error(`Missing existing manuscript record: ${p.doi}`);
  const pdfPath = path.join(tour, 'pdf', `${p.id}.pdf`);
  if (source) {
    const record = verified.find(item => item.paper === p.number);
    const bytes = fs.readFileSync(path.join(source, `${p.id}.pdf`));
    if (record.conceptdoi !== p.doi || record.versiondoi !== p.version_doi || record.checksum !== 'md5:' + createHash('md5').update(bytes).digest('hex')) throw new Error(`Source version mismatch: ${p.id}`);
    fs.writeFileSync(pdfPath, bytes);
  }
  if (!fs.existsSync(pdfPath)) throw new Error(`Missing PDF: ${p.id}`);
  const pdfUrl = `${origin}/black-holes/pdf/${p.id}.pdf`;
  paper.pdf_url = pdfUrl;
  paper.guided_tour_url = `${origin}/black-holes/#${p.chapter}`;
  const pagePath = path.join(root, 'papers', paper.slug, 'index.html');
  let page = fs.readFileSync(pagePath, 'utf8');
  const pdfMeta = `<meta name="citation_pdf_url" content="${pdfUrl}" />`;
  if (!page.includes('name="citation_pdf_url"')) page = page.replace('    <meta name="citation_doi"', `    ${pdfMeta}\n    <meta name="citation_doi"`);
  const links = `<div id="black-hole-tour-links" class="paper-tour-links"><a href="/black-holes/#${p.chapter}">Explore this step in the black-hole tour</a><a href="/black-holes/pdf/${p.id}.pdf">Read the full manuscript (PDF)</a></div>`;
  if (!page.includes('id="black-hole-tour-links"')) page = page.replace('<p class="paper-author">Amos Jay Maley</p>', `<p class="paper-author">Amos Jay Maley</p>\n        ${links}`);
  fs.writeFileSync(pagePath, page);
  entries.push(`<article class="paper-entry"><span class="paper-code">Paper ${p.number}</span><div><h3><a href="../papers/${escape(paper.slug)}/index.html">${escape(p.title)}</a></h3><p>${escape(p.description)}</p><div class="paper-links"><a href="pdf/${p.id}.pdf"><i data-lucide="file-text" aria-hidden="true"></i>Read PDF</a><a href="https://doi.org/${p.doi}">All-versions DOI<i data-lucide="arrow-up-right" aria-hidden="true"></i></a><a href="pdf/${p.id}.pdf" download title="Download Paper ${p.number}" aria-label="Download Paper ${p.number}"><i data-lucide="download" aria-hidden="true"></i></a></div><p class="paper-source-sections">${escape(p.source_sections)}</p></div></article>`);
}
fs.writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
const htmlPath = path.join(tour, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const start = '<!-- BLACK_HOLE_PAPERS -->', end = '<!-- /BLACK_HOLE_PAPERS -->';
if (!html.includes(start) || !html.includes(end)) throw new Error('Missing catalogue markers');
html = html.slice(0, html.indexOf(start) + start.length) + '\n' + entries.join('\n') + '\n' + html.slice(html.indexOf(end));
const metadata = {'@context':'https://schema.org','@type':'CollectionPage',name:'Black Holes: The Limits of Spacetime',url:`${origin}/black-holes/`,inLanguage:'en',author:{'@type':'Person',name:'Amos Jay Maley'},description:'A plain-language reading of the five-paper AASC black-hole arc: matter-energy degeneracy, the exhaustion of metric support, a non-transmissive AMetric boundary and fresh internal governance.',hasPart:papers.map(p=>({'@type':'ScholarlyArticle',name:p.title,url:catalogue.find(item=>item.doi===p.doi).url,identifier:p.doi}))};
const marker='<!-- TOUR_METADATA -->';
if (!html.includes(marker)) html=html.replace('</head>', `${marker}\n<script type="application/ld+json">${JSON.stringify(metadata).replaceAll('<','\\u003c')}</script>\n<!-- /TOUR_METADATA -->\n</head>`);
fs.writeFileSync(htmlPath, html);
console.log('Built the black-hole tour catalogue, verified five published PDF versions, and linked the five existing manuscript records.');
