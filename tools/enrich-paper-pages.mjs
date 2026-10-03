import fs from 'node:fs';
import path from 'node:path';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paragraphs = items => items.map(text => `<p>${escape(text)}</p>`).join('\n');

export function enrichPaperPages(root, selectedFiles = null) {
  const sourcePath = path.join(root,'data','paper-page-content.json');
  if (!fs.existsSync(sourcePath)) return 0;
  const content = JSON.parse(fs.readFileSync(sourcePath,'utf8').replace(/^\uFEFF/,''));
  const catalogue = JSON.parse(fs.readFileSync(path.join(root,'papers.json'),'utf8').replace(/^\uFEFF/,''));
  let changed = 0;
  for (const entry of content.entries) {
    const file = path.resolve(root,entry.path.replace(/^\//,''));
    if (!file.startsWith(root + path.sep)) throw new Error('Paper path outside site');
    if (selectedFiles && !selectedFiles.has(file)) continue;
    const paper = catalogue.find(p => p.url === entry.page && p.doi === entry.doi);
    if (!paper || !fs.existsSync(file)) throw new Error(`Source page/DOI mismatch: ${entry.doi}`);
    let html = fs.readFileSync(file,'utf8');
    // Exact-release repository pages own current publisher descriptions; keep the
    // all-version source manifest without injecting it as a different edition.
    if (/data-paper-layout=["']repository["']/.test(html)) continue;
    const before = html;
    html = html.replace(/\r\n?/g,'\n').replace(/\s*<!-- PAPER_CONTENT -->[\s\S]*?<!-- \/PAPER_CONTENT -->/g,'');
    const metaList = /<dl\b[^>]*class=["'][^"']*\bpaper-meta-list\b[^"']*["'][^>]*>/i;
    if (!metaList.test(html)) throw new Error(`Missing paper metadata: ${entry.path}`);
    const scope = entry.scopeParagraphs.length ? `<section class="paper-scope" aria-labelledby="paper-scope-title"><h2 id="paper-scope-title">Scope and dependencies</h2>${paragraphs(entry.scopeParagraphs)}</section>` : '';
    const related = entry.related.length ? `<nav class="paper-related" aria-labelledby="paper-related-title"><h2 id="paper-related-title">Related papers in this collection</h2><ul>${entry.related.map(item=>`<li><a href="${escape(item.url)}">${escape(item.title)}</a></li>`).join('')}</ul></nav>` : '';
    const action = /class=["'][^"']*paper-actions/.test(html) ? '' : `<div class="paper-actions"><a class="button primary" href="https://doi.org/${escape(entry.doi)}">Read the full manuscript</a><a class="button secondary" href="/papers/">Browse all papers</a></div>`;
    const block = `<!-- PAPER_CONTENT -->
<section class="paper-overview" aria-labelledby="paper-overview-title">
<h2 id="paper-overview-title">About this paper</h2>
${paragraphs(entry.overviewParagraphs)}
</section>
${scope}
${action}
<details class="paper-publisher-description">
<summary>Read the complete publisher description</summary>
<div class="paper-description-text">${escape(entry.description.trim())}</div>
</details>
<p class="paper-content-source">Description by Amos Jay Maley, registered for the all-version DOI. <a href="${escape(entry.sourceUrl)}">Source metadata</a> retrieved 3 October 2026. <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. The excerpts above retain the publisher’s wording; the complete description is reproduced without editorial changes.</p>
${related}
<!-- /PAPER_CONTENT -->
`;
    html = html.replace(metaList, tag => block+tag);
    html = html.replace(/<p>Part of the [^<]*research arc in the Constraint Systems Institute archive\.<\/p>\s*/,'');
    const description = entry.overviewParagraphs[0].length > 280 ? entry.overviewParagraphs[0].slice(0,277).trimEnd()+'…' : entry.overviewParagraphs[0];
    html = html.replace(/<meta\b(?=[^>]*name=["']description["'])[^>]*>/i, `<meta name="description" content="${escape(description)}">`);
    if (!html.includes('href="/assets/paper-content.css"')) html = html.replace('</head>','<link rel="stylesheet" href="/assets/paper-content.css">\n</head>');
    if (html !== before) {fs.writeFileSync(file,html);changed++;}
  }
  return changed;
}

export function cleanSearchSitemap(root) {
  const file = path.join(root,'sitemap.xml');
  if (!fs.existsSync(file)) return 0;
  const before = fs.readFileSync(file,'utf8');
  let removed = 0;
  const after = before.replace(/\s*<url>\s*<loc>https:\/\/constraintsystemsinstitute\.org\/(?:papers\.json|oai\.xml)<\/loc>[\s\S]*?<\/url>/g,() => {removed++;return '';});
  if (after === before) return 0;
  fs.writeFileSync(file,after);return removed;
}
