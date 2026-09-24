import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run after a tour or paper generator, before publishing GitHub Pages.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://constraintsystemsinstitute.org';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const decode = value => value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, entity) => {
  if (entity[0] === '#') { const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2),16) : Number(entity.slice(1)); return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole; }
  return {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:'\u00a0'}[entity.toLowerCase()] || whole;
});
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=(['"])([\\s\\S]*?)\\1`, 'i'))?.[2];
const setAttr = (tag, name, value) => {
  const re = new RegExp(`\\s${name}=(["'])([\\s\\S]*?)\\1`, 'i');
  const text = ` ${name}="${escape(value)}"`;
  return re.test(tag) ? tag.replace(re, text) : tag.replace(/\s*\/?>$/, text + '>');
};
const meta = (html, key, value, type = 'property') => {
  const re = new RegExp(`<meta\\b(?=[^>]*\\s${type}=["']${key.replaceAll(':', '\\:')}["'])[^>]*>`, 'gi');
  return html.replace(re, '').replace('</head>', `<meta ${type}="${key}" content="${escape(value)}">\n</head>`);
};
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
  if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'tools') return [];
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : entry.name.endsWith('.html') ? [full] : [];
});
const records = JSON.parse(fs.readFileSync(path.join(root, 'papers.json'), 'utf8'));
const tours = new Set(['foundations', 'physics-from-below', 'gravity-quantum', 'standard-model', 'symmetry', 'black-holes', 'time', 'mind-agency', 'measurement', 'neutrinos']);
const variants = {
  'banner.jpg': [7680,2780,[480,960,1600]],
  'constraint-seal.png': [832,1248,[256,768]],
  'standard-model-bearer-8k.png': [7680,5760,[640,1280,1920]],
  'foundation-bridge.webp': [1672,941,[480,960,1600]],
  'gravity-quantum-poster.webp': [1200,420,[480,960]],
  'black-hole-poster.webp': [1200,360,[480,960]],
  'time-poster.webp': [1200,360,[480,960]],
  'mind-still-life.webp': [1672,941,[480,960,1600]],
  'measurement-record.webp': [1672,941,[480,960,1600]]
};
let count = 0;
for (const file of walk(root)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('</head>') || !html.includes('</body>')) continue;
  const before = html;
  html = html.replace(/\r\n?/g, '\n');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const isHome = rel === 'index.html';
  const slug = rel.split('/')[0];
  const isTour = tours.has(slug) && rel === `${slug}/index.html`;
  const canonical = attr(html.match(/<link\b(?=[^>]*\srel=["']canonical["'])[^>]*>/i)?.[0] || '', 'href') || `${origin}/${rel}`;
  const paper = records.find(p => p.url?.replace(/index\.html$/, '') === canonical.replace(/index\.html$/, ''));
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Constraint Systems Institute');
  const desc = decode(attr(html.match(/<meta\b(?=[^>]*\sname=["']description["'])[^>]*>/i)?.[0] || '', 'content') || 'Research and guided tours from the Constraint Systems Institute.');

  if (!/<link\b[^>]*rel=["'](?:shortcut )?icon["']/i.test(html)) html = html.replace('</head>', '<link rel="icon" href="/favicon.ico" sizes="any">\n</head>');
  if (!/rel=["']apple-touch-icon["']/i.test(html)) html = html.replace('</head>', '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n</head>');
  html = html.replace(/<link\b[^>]*href=["'][^"']*site-quality\.css[^"']*["'][^>]*>\s*/gi, '');

  const imageName = isTour ? slug : paper ? 'research-paper' : 'site';
  const image = `${origin}/assets/social/${imageName}.jpg`;
  const imageAlt = isTour ? `${title.split(' | ')[0]} — a guided tour from Constraint Systems Institute` : paper ? 'Research papers from Constraint Systems Institute' : 'Constraint Systems Institute research archive and guided tours';
  for (const [key,value] of Object.entries({'og:type':paper?'article':'website','og:site_name':'Constraint Systems Institute','og:title':paper?.title || title,'og:description':desc,'og:url':canonical,'og:image':image,'og:image:width':'1200','og:image:height':'630','og:image:type':'image/jpeg','og:image:alt':imageAlt})) html = meta(html,key,value);
  for (const [key,value] of Object.entries({'twitter:card':'summary_large_image','twitter:title':paper?.title || title,'twitter:description':desc,'twitter:image':image,'twitter:image:alt':imageAlt})) html = meta(html,key,value,'name');
  html = html.replace('</head>', '<link rel="stylesheet" href="/assets/site-quality.css">\n</head>');

  // Keep the full atlas untouched: its original source is set only when opened.
  html = html.replace(/<img\b[^>]*>/gi, tag => {
    if (attr(tag, 'id') === 'atlas-full') return tag;
    const src = attr(tag, 'src');
    if (!src) return tag;
    const current = path.posix.basename(src.split('?')[0]);
    const name = Object.keys(variants).find(name => name === current || current.match(new RegExp(`^${name.replace(/\.[^.]+$/, '')}-\\d+\\.webp$`)));
    if (!name) return setAttr(tag, 'decoding', 'async');
    const [width,height,widths] = variants[name];
    const stem = name.replace(/\.[^.]+$/, '');
    const fallback = widths.includes(1280) ? 1280 : widths.includes(960) ? 960 : widths.at(-1);
    tag = setAttr(tag, 'src', `/assets/responsive/${stem}-${fallback}.webp`);
    tag = setAttr(tag, 'srcset', widths.map(w => `/assets/responsive/${stem}-${w}.webp ${w}w`).join(', '));
    tag = setAttr(tag, 'sizes', name === 'banner.jpg' ? '(max-width: 960px) 100vw, 1440px' : name === 'constraint-seal.png' ? '160px' : isHome ? '(max-width: 860px) calc(100vw - 48px), 55vw' : '(max-width: 1200px) calc(100vw - 48px), 1160px');
    tag = setAttr(setAttr(tag, 'width', width), 'height', height);
    tag = setAttr(tag, 'decoding', 'async');
    if (!attr(tag, 'loading')) tag = setAttr(tag, 'loading', isHome && name !== 'banner.jpg' ? 'lazy' : 'eager');
    if (isHome && name === 'banner.jpg') tag = setAttr(tag, 'fetchpriority', 'high');
    return tag;
  });
  if (!/class=["'][^"']*(?:site-skip-link|skip-link)/i.test(html)) {
    let mainId;
    html = html.replace(/<main\b[^>]*>/i, tag => {
      mainId = attr(tag, 'id') || 'main-content';
      return setAttr(setAttr(tag, 'id', mainId), 'tabindex', '-1');
    });
    if (mainId) html = html.replace(/<body\b[^>]*>/i, tag => `${tag}\n<a class="site-skip-link" href="#${mainId}">Skip to content</a>`);
  }
  if (paper) {
    // Reuse a source record already on the page; do not add duplicate links.
    html = html.replace(/\s*<!-- VERSION_GUIDANCE -->[\s\S]*?<!-- \/VERSION_GUIDANCE -->/g, '');
    const record = paper.zenodo_record;
    let hasRecord = false;
    if (record) html = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, tag => {
      if (decode(attr(tag, 'href') || '') !== record) return tag;
      hasRecord = true;
      return tag.replace(/>[\s\S]*?<\/a>$/, '>This archived version</a>');
    });
    const recordLink = record && !hasRecord ? `<a href="${escape(record)}">This archived version</a> · ` : '';
    html = html.replace('</main>', `<!-- VERSION_GUIDANCE -->\n<p class="version-note">${recordLink}<a href="/using-the-research/">Citation and reuse guidance</a>. Cite the specific release you consulted for a quotation, theorem or numerical result.</p>\n<!-- /VERSION_GUIDANCE -->\n</main>`);
  }
  html = html.replace(/\s*<!-- SITE_INFORMATION -->[\s\S]*?<!-- \/SITE_INFORMATION -->/g, '');
  html = html.replace('</body>', '<!-- SITE_INFORMATION -->\n<nav class="site-information-footer" aria-label="Website information"><a href="/privacy/">Privacy</a><a href="/using-the-research/">Citation &amp; reuse</a><a href="mailto:amos@constraintsystemsinstitute.org">Contact</a></nav>\n<!-- /SITE_INFORMATION -->\n</body>');
  // Remove whitespace left behind by replacing metadata on a second run.
  html = html.replace(/\n(?:[\t ]*\n)+/g, '\n');
  if (html !== before) { fs.writeFileSync(file, html); count++; }
}
console.log(`Prepared metadata, responsive images and shared navigation on ${count} changed pages.`);
