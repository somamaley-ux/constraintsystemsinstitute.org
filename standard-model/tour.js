(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  window.lucide?.createIcons();
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionQuery.matches;
  let activeResponse = 'transport';
  let clock = 0;
  const motionButton = $('#motion-toggle');
  function updateMotion() {
    if (!motionButton) return;
    const label = paused ? 'Play diagram animation' : 'Pause diagram animation';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.innerHTML = `<i data-lucide="${paused ? 'play' : 'pause'}" aria-hidden="true"></i>`;
    window.lucide?.createIcons();
  }
  motionButton?.addEventListener('click', () => { paused = !paused; updateMotion(); });
  motionQuery.addEventListener('change', (event) => { paused = event.matches; updateMotion(); });
  updateMotion();

  const canvas = $('#source-canvas');
  if (canvas) {
    const context = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let visible = true;
    const colors = { transport: '#9ac6e4', handedness: '#d2adbe', charge: '#b3caa5', deformation: '#d7a17f' };
    const captions = {
      transport: 'Transport compares local configurations while preserving their identity, boundary, and continuation data.',
      handedness: 'Handed and representation responses distinguish how the common physical content transforms. They retain the original comparison witnesses.',
      charge: 'Charge records a boundary-detectable representation response. Sector distinctions are extracted from the same witnessed source.',
      deformation: 'The Higgs bridge mediates order and deformation responses on shared inputs. Both belong to the same persistence organization.'
    };
    const nodes = Array.from({ length: 45 }, (_, index) => {
      const column = index % 9;
      const row = Math.floor(index / 9);
      return { x: .07 + column * .105 + Math.sin(index * 2.7) * .017, y: .17 + row * .16 + Math.cos(index * 1.9) * .035, row, column };
    });
    const links = [];
    nodes.forEach((a, i) => nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.column - b.column, a.row - b.row) < 1.5) links.push([i, j]);
    }));
    function resize() {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }
    function draw() {
      if (!context || !width) return;
      context.clearRect(0, 0, width, height);
      const positions = nodes.map((node, i) => {
        const wave = Math.sin(clock * .6 + node.column * .65 + node.row * .8);
        const deformation = activeResponse === 'deformation' ? wave * 13 : wave * 2.5;
        const handed = activeResponse === 'handedness' ? Math.sin(clock + i * .3) * 5 : 0;
        return { x: node.x * width + handed, y: node.y * height + deformation };
      });
      links.forEach(([a, b], index) => {
        const p = positions[a], q = positions[b];
        const selected = activeResponse === 'transport' ? nodes[a].row === 2 && nodes[b].row === 2 : activeResponse === 'charge' ? (a + b) % 3 === 0 : activeResponse === 'handedness' ? (nodes[a].column + nodes[a].row) % 2 === 0 : index % 3 === 0;
        context.strokeStyle = selected ? colors[activeResponse] : '#b9adb530';
        context.lineWidth = selected ? 1.3 : .7;
        context.beginPath(); context.moveTo(p.x,p.y); context.lineTo(q.x,q.y); context.stroke();
        if (selected) {
          const t = (clock * .25 + index * .083) % 1;
          context.fillStyle = colors[activeResponse];
          context.beginPath(); context.arc(p.x + (q.x-p.x)*t,p.y+(q.y-p.y)*t,1.8,0,Math.PI*2); context.fill();
        }
      });
      positions.forEach((p, i) => {
        context.fillStyle = activeResponse === 'charge' ? ['#b3caa5','#9ac6e4','#d2adbe'][i%3] : (i%4 === 0 ? colors[activeResponse] : '#d8d2cc');
        context.beginPath(); context.arc(p.x,p.y,i%4===0?3:2,0,Math.PI*2); context.fill();
        if (activeResponse === 'handedness' && i%5 === 0) {
          const angle = clock * (i%2 ? -1 : 1);
          context.strokeStyle = '#d2adbe88'; context.lineWidth = 1;
          context.beginPath(); context.arc(p.x,p.y,9,angle,angle+Math.PI*1.25); context.stroke();
        }
      });
      context.font = '12px system-ui'; context.fillStyle = '#c7b9b7';
      context.textAlign = 'left'; context.fillText('Local configurations', 0, height - 5);
      context.textAlign = 'right'; context.fillText('Common persistence', width, height - 5);
    }
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);
    let last = 0;
    function animate(time) {
      const elapsed = Math.min((time-last)/1000,.05); last=time;
      if (!paused && visible && !document.hidden) { clock += elapsed; draw(); }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    document.querySelectorAll('[data-response]').forEach(button => button.addEventListener('click', () => {
      activeResponse = button.dataset.response;
      document.querySelectorAll('[data-response]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $('#response-caption').textContent = captions[activeResponse]; draw();
    }));
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  function svgElement(tag, attributes, text) {
    const element = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const graph = $('#root-graph');
  function renderGraph() {
    if (!graph) return;
    const n = Number($('#root-count').value);
    const edges = n * (n-1) / 2;
    const cycles = edges - n + 1;
    const points = Array.from({length:n},(_,i) => ({x:240+111*Math.cos(-Math.PI/2+i*Math.PI*2/n),y:140+103*Math.sin(-Math.PI/2+i*Math.PI*2/n)}));
    graph.replaceChildren();
    for (let i=0;i<n;i++) for(let j=i+1;j<n;j++) {
      // A star is a spanning tree; every remaining edge contributes one independent circuit.
      graph.append(svgElement('line',{x1:points[i].x,y1:points[i].y,x2:points[j].x,y2:points[j].y,stroke:i===0?'#a69d9f':'#d7a17f','stroke-width':i===0?1.5:2,'stroke-opacity':.8}));
    }
    points.forEach((point,i) => {
      graph.append(svgElement('circle',{cx:point.x,cy:point.y,r:15,fill:'#242327',stroke:n===3?'#9ac6e4':'#d8d2cc','stroke-width':1.5}));
      graph.append(svgElement('text',{x:point.x,y:point.y+5,fill:'#f4f0ec','text-anchor':'middle','font-family':'system-ui','font-size':15},String.fromCharCode(65+i)));
    });
    graph.setAttribute('aria-label',`${n} positions with ${edges} connections and ${cycles} independent circuits. ${n===3?'Matches':'Does not match'} rank one.`);
    $('#root-count-value').value = n; $('#graph-n-label').textContent = n;
    $('#edge-count').textContent = edges; $('#cycle-count').textContent = cycles;
    $('#cycle-plural').textContent = cycles === 1 ? '' : 's';
    $('#graph-verdict').textContent = n===3 ? "Matches the source's rank-one residue." : cycles===0 ? 'No independent circuit. The required rank-one residue is absent.' : `${cycles} independent circuits. This exceeds the source's rank-one residue.`;
    $('#graph-verdict').dataset.match = String(n===3);
  }
  $('#root-count')?.addEventListener('input',renderGraph); renderGraph();

  let matterMode = 'structural';
  let marking = [0,1,2];
  const particleNames = [['Electron neutrino','Muon neutrino','Tau neutrino'],['Electron','Muon','Tau'],['Up','Charm','Top'],['Down','Strange','Bottom']];
  const symbols = [['\u03bd\u2091','\u03bd\u03bc','\u03bd\u03c4'],['e','\u03bc','\u03c4'],['u','c','t'],['d','s','b']];
  function renderMatter() {
    document.querySelectorAll('[data-root-heading]').forEach((element,i) => { element.textContent = matterMode==='structural' ? `Root ${'ABC'[marking[i]]}` : `Family ${marking[i]+1}`; });
    document.querySelectorAll('[data-kind]').forEach((row,k) => {
      row.querySelectorAll('[role=cell]').forEach((cell,i) => {
        const root = marking[i];
        const symbol = document.createElement('span'); symbol.className = 'cell-symbol';
        symbol.textContent = matterMode === 'structural' ? `${['N','L','U','D'][k]}${String.fromCharCode(8321+root)}` : symbols[k][root];
        const name = document.createElement('small'); name.textContent = matterMode==='structural' ? `Root ${'ABC'[root]}` : particleNames[k][root];
        cell.replaceChildren(symbol,name);
      });
    });
    const caption = $('#matter-caption');
    if (caption) caption.textContent = matterMode==='structural' ? 'Each kind retains three rooted response positions through one common Higgs bridge. The root marking is a presentation choice.' : 'Familiar particle names belong to a marked physical presentation. Relabeling all four kinds together preserves the shared root structure; these labels do not derive masses or mixing.';
  }
  document.querySelectorAll('[data-matter-mode]').forEach(button => button.addEventListener('click',() => {
    matterMode=button.dataset.matterMode;
    document.querySelectorAll('[data-matter-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button))); renderMatter();
  }));
  $('#permute-roots')?.addEventListener('click',()=>{ marking=[marking[1],marking[2],marking[0]];renderMatter(); });
  renderMatter();

  const bosonDiagram = $('#boson-diagram');
  function renderBosons(mode='joint') {
    if (!bosonDiagram) return;
    bosonDiagram.replaceChildren();
    const text = (x,y,value,color='#d8d2cc',size=19) => bosonDiagram.append(svgElement('text',{x,y,fill:color,'font-family':'system-ui','font-size':size,'text-anchor':'middle'},value));
    const line = (d,color,width=1.5) => bosonDiagram.append(svgElement('path',{d,stroke:color,'stroke-width':width,fill:'none'}));
    line('M280 58 L280 99','#9ac6e4');
    line('M280 175 C280 215 132 185 132 248',mode==='ew'?'#71676a':'#d2adbe',mode==='ew'?1:2);
    line('M280 175 C280 215 428 185 428 248',mode==='matter'?'#71676a':'#d7a17f',mode==='matter'?1:2);
    text(280,36,'Common physical source','#9ac6e4',21);
    bosonDiagram.append(svgElement('circle',{cx:280,cy:136,r:37,stroke:'#d7a17f','stroke-width':1.5,fill:'#d7a17f0c'}));
    text(280,144,'C\u2095','#d7a17f',30); text(280,196,'One Higgs bridge','#c7b9b7',16);
    text(132,278,'Rooted matter',mode==='ew'?'#b4a9ad':'#e2bfce',21);
    text(132,304,'Higgs-response incidence','#c7b9b7',15);
    text(428,278,'Electroweak',mode==='matter'?'#b4a9ad':'#e2b593',21);
    text(428,304,'Fixation & residual charge','#c7b9b7',15);
    line('M72 326 L488 326','#9ac6e459');
    text(280,352,'Color retained in the joint gauge source','#b3caa5',16);
    const captions = { joint:'Both operations retain their shared bridge and original source incidences. Color belongs to the compatible joint gauge assembly.',matter:'The fermionic incidence connects each complete rooted Higgs-response record to the same bridge, retaining its kind and root.',ew:'The bosonic incidence uses the common bridge and the electroweak source inputs to construct fixation and residual response on its original domain.' };
    $('#boson-caption').textContent=captions[mode];
  }
  document.querySelectorAll('[data-boson]').forEach(button => button.addEventListener('click',()=>{
    document.querySelectorAll('[data-boson]').forEach(item=>item.setAttribute('aria-pressed',String(item===button))); renderBosons(button.dataset.boson);
  })); renderBosons();

  const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
  function updateChapter() {
    const line = (document.querySelector('.chapter-nav')?.getBoundingClientRect().height || 64)+70;
    let current = chapterLinks[0];
    for(const link of chapterLinks) if($(link.hash)?.getBoundingClientRect().top <= line) current=link;
    chapterLinks.forEach(link => { if(link===current) link.setAttribute('aria-current','step'); else link.removeAttribute('aria-current'); });
    const start = $('#bearer'); const end = $('#physical');
    if(start && end) {
      const startY=start.offsetTop; const endY=end.offsetTop+end.offsetHeight-innerHeight;
      $('#reading-progress').style.width=`${Math.max(0,Math.min(100,(scrollY-startY)/(endY-startY)*100))}%`;
    }
  }
  let scrollPending = false;
  addEventListener('scroll',()=>{ if(!scrollPending){scrollPending=true;requestAnimationFrame(()=>{updateChapter();scrollPending=false;});} },{passive:true});
  updateChapter();

  const dialog = $('#atlas-dialog');
  const viewport = $('#atlas-viewport');
  let zoom = 1;
  let fitWidth = 0;
  function applyZoom(next) {
    const oldWidth = $('#atlas-full').clientWidth;
    const centerX=(viewport.scrollLeft+viewport.clientWidth/2)/Math.max(1,oldWidth);
    const centerY=(viewport.scrollTop+viewport.clientHeight/2)/Math.max(1,oldWidth*.75);
    zoom=Math.max(1,Math.min(6,next));
    const newWidth=fitWidth*zoom;
    $('#atlas-full').style.width=`${newWidth}px`;
    $('#zoom-level').value=zoom===1?'Fit':`${Math.round(zoom*100)}%`;
    $('#zoom-out').disabled=zoom===1; $('#zoom-in').disabled=zoom===6;
    viewport.scrollLeft=Math.max(0,centerX*newWidth-viewport.clientWidth/2);
    viewport.scrollTop=Math.max(0,centerY*newWidth*.75-viewport.clientHeight/2);
  }
  function openAtlas(event) {
    if (!dialog?.showModal) return;
    event.preventDefault(); dialog.showModal();
    document.documentElement.style.overflow='hidden';
    fitWidth=Math.min(viewport.clientWidth-16,(viewport.clientHeight-16)*4/3);
    applyZoom(1); $('#atlas-close').focus();
  }
  $('#atlas-open')?.addEventListener('click',openAtlas); $('#atlas-expand')?.addEventListener('click',openAtlas);
  $('#atlas-close')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('close',()=>{ document.documentElement.style.overflow=''; });
  $('#zoom-in')?.addEventListener('click',()=>applyZoom(zoom+1));
  $('#zoom-out')?.addEventListener('click',()=>applyZoom(zoom-1));
  $('#zoom-reset')?.addEventListener('click',()=>applyZoom(1));
  if(viewport) new ResizeObserver(()=>{if(dialog.open){fitWidth=Math.min(viewport.clientWidth-16,(viewport.clientHeight-16)*4/3);applyZoom(zoom);}}).observe(viewport);
})();
