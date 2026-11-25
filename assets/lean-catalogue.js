(() => {
  'use strict';
  const cards = Array.from(document.querySelectorAll('[data-lean-project]'));
  const filters = Array.from(document.querySelectorAll('[data-lean-filter]'));
  const input = document.getElementById('lean-search');
  const clear = document.getElementById('lean-clear');
  const result = document.getElementById('lean-results');
  const archive = document.getElementById('lean-archive');
  let openedForSearch = false;
  const empty = document.getElementById('lean-empty');
  if (!cards.length || !input || !clear || !result || !empty) return;
  const names = { all: 'All', aasc: 'AASC', 'beyond-aasc': 'Beyond AASC' };
  let framework = 'all';
  function render() {
    const terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0, archivedMatches = 0;
    cards.forEach(card => {
      card.hidden = (framework !== 'all' && card.dataset.framework !== framework) || !terms.every(term => card.textContent.toLocaleLowerCase().includes(term));
      if (!card.hidden) {
        visible++;
        if (archive && archive.contains(card)) archivedMatches++;
      }
    });
    filters.forEach(link => {
      if (link.dataset.leanFilter === framework) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (archive) {
      archive.hidden = archivedMatches === 0;
      if (terms.length) {
        archive.open = archivedMatches > 0;
        openedForSearch = archive.open;
      } else if (openedForSearch) {
        archive.open = false;
        openedForSearch = false;
      }
    }
    clear.hidden = !input.value;
    empty.hidden = visible > 0;
    result.textContent = `${visible} of ${cards.length} projects · ${names[framework]}${terms.length ? ' · Search applied' : ''}`;
  }
  function readLocation() {
    const params = new URLSearchParams(location.search);
    framework = Object.hasOwn(names, params.get('framework')) ? params.get('framework') : 'all';
    input.value = params.get('q') || '';
    let targetId = '';
    try { targetId = decodeURIComponent(location.hash.slice(1)); } catch { /* Ignore malformed fragments. */ }
    const target = cards.find(card => card.id === targetId);
    if (target) { framework = 'all'; input.value = ''; }
    render();
    if (target && archive && archive.contains(target)) {
      archive.open = true;
      requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
    }
  }
  function updateLocation(push) {
    const url = new URL(location.href);
    if (framework === 'all') url.searchParams.delete('framework');
    else url.searchParams.set('framework', framework);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    url.hash = '';
    if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null, '', url);
    render();
  }
  filters.forEach(link => link.addEventListener('click', event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    framework = link.dataset.leanFilter;
    updateLocation(true);
  }));
  input.addEventListener('input', () => updateLocation(false));
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { input.value = ''; updateLocation(false); }
  });
  clear.addEventListener('click', () => { input.value = ''; updateLocation(false); input.focus(); });
  addEventListener('popstate', readLocation);
  addEventListener('hashchange', readLocation);
  readLocation();
  document.documentElement.classList.add('lean-ready');
})();
