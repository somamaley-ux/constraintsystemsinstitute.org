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
  const cases = {
    complete: ['The route holds together.','The places are fixed and the connections are available. The drawing can change without changing the route.'],
    gap: ['The drawing promises a step that is missing.','There is a line on the page, but no bridge connection in the example. Repeating the claim or making the line prettier cannot supply the missing step.'],
    wrong: ['A destination has been substituted.','The route reaches the airport, not the harbour originally claimed. It may be a useful route, but it is not a construction of the same journey.'],
    repair: ['A new route is available now.','Building the missing bridge changes the situation. The later journey can work; it does not make the earlier disconnected route valid all along.']
  };
  options('[data-route-case]', button => {
    const value = button.dataset.routeCase;
    map('kernel-map', straight, {gap:value === 'gap',wrong:value === 'wrong',later:value === 'repair'});
    $('kernel-case-title').textContent = cases[value][0];
    $('kernel-result').textContent = cases[value][1];
  });
  let renames = 0, redraws = 0;
  const tokens = [...document.querySelectorAll('.boundary-token')];
  $('rename-tokens').addEventListener('click', () => {
    renames++;
    tokens.forEach((token,i) => { token.textContent = ['A','B','C'][(i+renames)%3]; });
    $('boundary-result').textContent = 'The names have changed. Calling a different mark A has not supplied a reason to privilege it. The same-versus-different pattern remains.';
  });
  $('move-tokens').addEventListener('click', () => {
    redraws++;
    const positions = redraws%2 ? [[76,26],[18,52],[66,82]] : [[18,64],[50,25],[82,64]];
    tokens.forEach((token,i) => { token.style.left = positions[i][0]+'%'; token.style.top = positions[i][1]+'%'; });
    $('boundary-result').textContent = 'The spacing on your screen changed. That changes the artwork, not a distance supplied by the underlying equality-only description.';
  });
  const roles = {
    drawing: ['Only the presentation changes.','Straightening the drawing preserves the places and connections. The paper calls presentation without new authority skin.'],
    route: ['The content changes.','A connection has been removed. This is not another drawing of the same route. In the role decomposition, preserved connection-content illustrates the tensor role.'],
    rules: ['The question changes.','Suppose a line now means one-way travel rather than a two-way connection. You changed the conditions for interpreting the route. The anchor role concerns such defining preconditions, not a new style of drawing.']
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
  function trace() {
    const a = $('trace-a').checked, b = $('trace-b').checked;
    $('trace-status').textContent = a && b ? 'Two connections: no unique entry fixes this one role. A score would not repair the missing uniqueness.' : a || b ? `One connection: entry ${a ? 'A' : 'B'} fixes the role.` : 'No connection: this role is not fixed by the declared trace.';
  }
  $('trace-a').addEventListener('change', trace);
  $('trace-b').addEventListener('change', trace);
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
    if (!target || !revealSource(target)) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    requestAnimationFrame(() => target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));
  }));
  const initialTarget = document.getElementById(location.hash.slice(1));
  if (initialTarget && revealSource(initialTarget)) requestAnimationFrame(() => initialTarget.scrollIntoView({block:'start',behavior:'instant'}));
  const chapters = [...document.querySelectorAll('.chapter-nav a')];
  let scheduled = false;
  function progress() {
    scheduled = false;
    let active = chapters[0];
    chapters.forEach(link => { if (document.querySelector(link.hash).getBoundingClientRect().top <= 130) active = link; });
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
