(() => {
  'use strict';
  const input = document.querySelector('#corpus-search-input');
  const results = document.querySelector('#corpus-search-results');
  const meta = document.querySelector('#corpus-search-meta');
  const clear = document.querySelector('#corpus-search-clear');
  const more = document.querySelector('#corpus-search-more');
  if (!input || !results || !meta || !clear || !more) return;
  const normalize = text => String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en');
  const clean = text => String(text || '').replace(/\s+/g, ' ').trim();
  const entries = new Map();
  let visible = 12; let catalogueCount = 0; let catalogueLoaded = false;
  const safeUrl = href => { try { const url = new URL(href, location.href); return ['http:','https:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
  const titleFrom = link => {
    if (link.dataset.paperTitle) return clean(link.dataset.paperTitle);
    const text = clean(link.textContent);
    const articleTitle = link.closest('article')?.querySelector('h3')?.textContent;
    return clean(link.querySelector('span')?.textContent || ((/^(read|open|view|add|submit|prepare)\b/i.test(text) || /^10\.\d{4,9}\//.test(text)) && articleTitle ? articleTitle : text || articleTitle));
  };
  const contextFrom = link => {
    const shelf = link.closest('.shelf'); if (shelf) return clean(shelf.querySelector('summary')?.textContent || 'Manuscript shelf');
    const container = link.closest('.topic-card,.doi-card,.project-card,.arc-focus-card');
    return clean(container?.querySelector('.repo-type')?.textContent || (link.closest('.paper-table') ? 'Major Paper Catalogue' : 'Archive'));
  };
  for (const link of document.querySelectorAll('main a[href]')) {
    const raw = link.getAttribute('href') || '';
    if (!link.hasAttribute('data-paper-link') && !/doi\.org|zenodo\.org|github\.com/.test(raw)) continue;
    const href = safeUrl(raw); const title = titleFrom(link);
    const key = link.dataset.paperDoi ? safeUrl('https://doi.org/' + link.dataset.paperDoi) : href;
    if (!href || !key || title.length < 3) continue;
    const context = contextFrom(link);
    const surrounding = link.dataset.paperDescription || link.closest('article, .topic-card')?.querySelector('p')?.textContent || '';
    const label = link.hasAttribute('data-paper-link') ? 'Manuscript' : href.includes('doi.org') ? href.replace('https://doi.org/', '') : new URL(href).hostname;
    const previous = entries.get(key);
    entries.set(key, {href:key,title:previous?.title || title,context:previous?.context || context,label:link.dataset.paperDoi || previous?.label || label,manuscriptUrl:link.hasAttribute('data-paper-link') ? href : previous?.manuscriptUrl,search:normalize(`${previous?.search || ''} ${title} ${href} ${link.dataset.paperDoi || ''} ${context} ${surrounding}`)});
  }
  function render() {
    const query = input.value.trim(); const terms = normalize(query).split(/\s+/).filter(Boolean);
    results.replaceChildren(); clear.hidden = !input.value;
    if (!terms.length) {
      meta.textContent = catalogueLoaded ? `Search ${catalogueCount} catalogue papers and linked archive sources.` : 'Search linked archive sources. The full catalogue is loading.';
      more.hidden = true; return;
    }
    const matches = [...entries.values()].filter(entry => terms.every(term => entry.search.includes(term))).map(entry => ({...entry,score:terms.reduce((score,term) => score + (normalize(entry.title).includes(term) ? 4 : 0) + (normalize(entry.label).includes(term) ? 3 : 0),0)})).sort((a,b) => b.score-a.score || a.title.localeCompare(b.title,'en'));
    const shown = matches.slice(0,visible);
    meta.textContent = matches.length ? `${matches.length} archive ${matches.length === 1 ? 'result' : 'results'} · showing ${shown.length}${catalogueLoaded ? '' : ' · linked sources only'}` : `No ${catalogueLoaded ? 'archive' : 'linked source'} results. Try a broader term or a DOI.`;
    for (const match of shown) {
      const item = document.createElement('article'); item.className = 'search-result';
      const context = document.createElement('span'); context.textContent = match.context;
      const title = document.createElement('strong'); const primary = document.createElement('a'); primary.href = match.manuscriptUrl || match.href; primary.textContent = match.title; title.append(primary);
      const label = document.createElement('em');
      if (match.manuscriptUrl) {const doi=document.createElement('a');doi.href=match.href;doi.textContent=match.label;doi.setAttribute('aria-label',`DOI for ${match.title}`);label.append(doi);} else label.textContent = match.label;
      item.append(context,title,label); results.append(item);
    }
    if (!matches.length) { const note = document.createElement('p'); note.className = 'archive-search-empty'; note.textContent = 'You can also browse the '; const link = document.createElement('a'); link.href = '/papers/'; link.textContent = 'complete manuscript index'; note.append(link, '.'); results.append(note); }
    more.hidden = matches.length <= visible;
  }
  function search(term) { input.value = term; visible = 12; render(); }
  input.addEventListener('input', () => {visible=12;render();});
  clear.addEventListener('click', () => {search('');input.focus({preventScroll:true});});
  for (const button of document.querySelectorAll('[data-search-term]')) button.addEventListener('click', () => {search(button.dataset.searchTerm);input.focus({preventScroll:true});});
  more.addEventListener('click', () => {const firstNew=results.children.length;visible+=12;render();results.children[firstNew]?.querySelector('a')?.focus({preventScroll:true});});
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;
    const editing = event.target instanceof Element && (event.target.matches('input,textarea,select') || event.target.isContentEditable);
    if (event.key === '/' && !editing) {event.preventDefault();input.focus();}
    if (event.key === 'Escape' && event.target === input) {event.preventDefault();search('');}
  });
  render();
  fetch('/papers.json').then(response => {if(!response.ok) throw new Error('Catalogue unavailable');return response.json();}).then(data => {
    if(!Array.isArray(data)) throw new Error('Invalid catalogue');
    for(const paper of data) {
      const href = safeUrl(paper.doi_url); const title = clean(paper.title);
      if(!href || !title) continue;
      const existing = entries.get(href);
      const context = clean(paper.context || 'Manuscript catalogue'); const label = clean(paper.doi || 'All-version DOI');
      entries.set(href, {href,title,context,label,manuscriptUrl:safeUrl(paper.url) || existing?.manuscriptUrl,search:normalize(`${title} ${label} ${paper.url || ''} ${context} ${paper.keywords || ''} ${paper.description || ''}`)});
      catalogueCount++;
    }
    catalogueLoaded=true;render();
  }).catch(() => {
    render();
    if(!input.value.trim()) meta.textContent='The full catalogue is unavailable. You can still search linked archive sources.';
  });
})();
