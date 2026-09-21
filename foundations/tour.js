(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  document.body.classList.add('js-ready');
  window.lucide?.createIcons();
  const bent = [[60,174],[180,76],[330,144],[458,62]];
  const straight = [[60,145],[190,145],[330,145],[460,145]];
  function map(id, points, {gap = false, wrong = false, later = false, oneWay = false} = {}) {
    const names = ['Home','Bridge','Market',wrong ? 'Airport' : 'Harbour'];
    const lines = points.slice(1).map((point,i) => {
      const from = points[i];
      const broken = gap && i === 1;
      return `<path d="M${from} L${point}" stroke="${broken ? '#dd9ca5' : '#bacdbb'}" stroke-width="${broken ? 2 : 4}" ${broken ? 'stroke-dasharray="5 10"' : ''} fill="none"/>`;
    }).join('');
    const labels = points.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="7" fill="#201e21" stroke="#e2cfce" stroke-width="2"/><text x="${x}" y="${y + (i%2 ? -25 : 30)}" fill="#eee2dc" text-anchor="middle" font-size="15">${names[i]}</text>`).join('');
    const extra = gap ? '<text class="map-note" x="260" y="65" text-anchor="middle" fill="#dd9ca5" font-size="14">No connection</text>' : later ? '<text class="map-note" x="260" y="65" text-anchor="middle" fill="#d7b7c6" font-size="14">Available now, not earlier</text>' : oneWay ? '<path d="M115 140 L124 145 L115 150 M250 140 L259 145 L250 150 M391 140 L400 145 L391 150" stroke="#e5c095" stroke-width="2" fill="none"/><text class="map-note" x="260" y="53" text-anchor="middle" fill="#e5c095" font-size="14">Connections now mean<tspan x="260" dy="24">one-way travel</tspan></text>' : '';
    $(id).innerHTML = lines + labels + extra;
    $(id).setAttribute('aria-label', gap ? 'The claimed route has a missing bridge connection.' : wrong ? 'The route ends at the airport, not the claimed harbour.' : later ? 'The bridge is now connected, but was not connected earlier.' : oneWay ? 'The interpretation of every connection has changed to one-way travel.' : 'Home connects through the bridge and market to the harbour.');
  }
  function options(selector, handler) {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      handler(button);
    }));
  }
  options('[data-drawing]', button => {
    const isStraight = button.dataset.drawing === 'straight';
    map('journey-map', isStraight ? straight : bent);
    $('journey-result').textContent = isStraight ? 'The drawing is straighter. Home still connects through the same bridge and market to the same harbour. Nothing about that route has changed.' : 'Four places, three connections, one route. The shape of the drawing is not the journey.';
  });
  const roles = {
    drawing: ['Only the presentation changes.','Straightening the drawing keeps the same places and the same journeys available.'],
    route: ['The content changes.','The bridge connection is missing. The map can no longer support the same journey, even though the place names have stayed the same.'],
    rules: ['The question changes.','These roads now allow travel in one direction. Asking whether you can get home may have a different answer. The rule changed, so this is more than a new drawing.']
  };
  options('[data-map-change]', button => {
    const value = button.dataset.mapChange;
    map('roles-map', straight, {gap:value === 'route',oneWay:value === 'rules'});
    $('roles-title').textContent = roles[value][0];
    $('roles-result').textContent = roles[value][1];
  });
  $('frame-angle').addEventListener('input', event => {
    const angle = Number(event.target.value);
    $('coordinate-frame').setAttribute('transform', `rotate(${-angle} 145 135)`);
    $('frame-angle-value').textContent = `${angle}\u00b0`;
    const theta = (36.87-angle)*Math.PI/180;
    $('frame-result').textContent = `The arrow has not turned. In this frame its unit-direction components are (${Math.cos(theta).toFixed(2)}, ${Math.sin(theta).toFixed(2)}).`;
  });
  let traceRenamed = false;
  function trace() {
    const a = $('trace-a').checked, b = $('trace-b').checked;
    const names = traceRenamed ? ['B','A'] : ['A','B'];
    $('trace-card-a').textContent=names[0];$('trace-card-b').textContent=names[1];
    $('trace-name-a').textContent=`Entry ${names[0]} connected`;$('trace-name-b').textContent=`Entry ${names[1]} connected`;
    $('trace-wire-a').setAttribute('opacity',a?'1':'.12');$('trace-wire-b').setAttribute('opacity',b?'1':'.12');
    const result = a && b ? 'Two links: neither entry is uniquely identified by this connection.' : a || b ? `One link: it identifies entry ${a ? names[0] : names[1]}. Swapping names keeps the link attached to the same entry.` : 'No link: this input does not identify either entry.';
    $('trace-status').textContent=result;$('trace-drawing').setAttribute('aria-label',result);
  }
  $('trace-a').addEventListener('change', trace);
  $('trace-b').addEventListener('change', trace);
  $('trace-rename').addEventListener('click',()=>{traceRenamed=!traceRenamed;trace();});
  function revealSource(target) {
    let opened = false;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open) { parent.open = true; opened = true; }
    }
    return opened;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    revealSource(target);
    event.preventDefault();
    history.pushState(null, '', link.hash);
    requestAnimationFrame(() => { target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); if(!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); });
  }));
  const initialTarget = document.getElementById(location.hash.slice(1));
  if (initialTarget && revealSource(initialTarget)) requestAnimationFrame(() => initialTarget.scrollIntoView({block:'start',behavior:'instant'}));
  const chapters = [...document.querySelectorAll('.chapter-nav a')];
  let scheduled = false;
  function progress() {
    scheduled = false;
    const navHeight = document.querySelector('.chapter-nav').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--foundation-nav-height',`${navHeight}px`);
    let active = chapters[0];
    chapters.forEach(link => { if (document.querySelector(link.hash).getBoundingClientRect().top <= navHeight + 35) active = link; });
    chapters.forEach(link => { if (link === active) link.setAttribute('aria-current','step'); else link.removeAttribute('aria-current'); });
    const first = $('same-journey'), last = $('papers');
    const start = first.getBoundingClientRect().top + scrollY;
    const finish = last.getBoundingClientRect().top + scrollY;
    $('reading-progress').style.width = `${Math.max(0,Math.min(100,(scrollY-start)/(finish-start)*100))}%`;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(progress); } }, {passive:true});
  addEventListener('resize', progress);
  progress();
})();
