(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const icons = () => window.lucide?.createIcons();
  const text = (selector, value) => { $(selector).textContent = value; };
  const select = (selector, selected) => all(selector).forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
  icons();

  const canvas = $('#boundary-canvas');
  const ctx = canvas.getContext('2d');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionPreference.matches;
  let visible = true;
  let view = 'geometry';
  let phase = 0;
  let previousTime = 0;
  let width = 0;
  let height = 0;
  let frameId = 0;

  function drawBoundary() {
    if (!ctx || !width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2, radius = Math.min(height * .31, width * .18);
    ctx.lineWidth = 1;
    if (view === 'geometry') {
      // A comparison-grid sketch, deliberately not a numerical GR solution.
      for (let line = -4; line <= 4; line++) {
        const base = cy + line * height / 10;
        ctx.beginPath();
        for (let x = 8; x <= width - 8; x += 5) {
          const distance = x - cx;
          const warp = Math.exp(-distance * distance / (radius * radius * 4));
          const y = base + Math.sign(line) * warp * radius * .45;
          if (x === 8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(165,201,206,.18)'; ctx.stroke();
      }
      for (let i = 1; i < 15; i++) {
        const x = width * i / 15;
        ctx.beginPath();
        for (let y = 8; y <= height - 8; y += 4) {
          const warp = Math.exp(-Math.pow((y - cy) / radius, 2));
          const dx = x + Math.sign(x - cx) * warp * radius * .26 * Math.exp(-Math.pow((x - cx) / (radius * 2.5), 2));
          if (y === 8) ctx.moveTo(dx, y); else ctx.lineTo(dx, y);
        }
        ctx.strokeStyle = 'rgba(165,201,206,.16)'; ctx.stroke();
      }
      ctx.beginPath();ctx.ellipse(cx,cy,radius*2.2,radius*1.05,-.1,0,Math.PI*2);
      ctx.strokeStyle='rgba(214,161,141,.42)';ctx.setLineDash([5,8]);ctx.lineDashOffset=-phase*10;ctx.stroke();ctx.setLineDash([]);
    } else {
      const points = Array.from({length:8},(_,i)=>{
        const angle = Math.PI * 2 * i / 8 - Math.PI / 8;
        return {x:cx+Math.cos(angle)*Math.min(width*.36,radius*3.3),y:cy+Math.sin(angle)*height*.38};
      });
      points.forEach((p,i)=>{
        const next=points[(i+1)%points.length];
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(next.x,next.y);ctx.strokeStyle='rgba(165,201,206,.22)';ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,3.3,0,Math.PI*2);ctx.fillStyle=`rgba(165,201,206,${.65+.25*Math.sin(phase+i)})`;ctx.fill();
      });
      [0,4].forEach(i=>{
        const p=points[i],dx=p.x-cx,dy=p.y-cy,len=Math.hypot(dx,dy);
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(cx+dx/len*(radius+14),cy+dy/len*(radius+14));
        ctx.strokeStyle='rgba(214,161,141,.75)';ctx.setLineDash([4,5]);ctx.lineDashOffset=-phase*7;ctx.stroke();ctx.setLineDash([]);
      });
    }
    ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fillStyle='#19171b';ctx.fill();
    ctx.lineWidth=1.5;ctx.strokeStyle='rgba(214,161,141,.92)';ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,radius+7,0,Math.PI*2);ctx.lineWidth=1;ctx.strokeStyle='rgba(214,161,141,.17)';ctx.stroke();
    ctx.font='12px system-ui';ctx.textBaseline='middle';ctx.fillStyle='#d2c6c1';
    if(view==='geometry'){
      ctx.textAlign='center';ctx.fillText('Horizon',cx,cy);
    } else {
      [-1,1].forEach(i=>{ctx.beginPath();ctx.arc(cx+i*radius*.32,cy,4,0,Math.PI*2);ctx.strokeStyle='#d6a18d';ctx.stroke();});
      ctx.textAlign='center';ctx.fillText('Unresolved',cx,cy+radius*.5);
    }
    ctx.textAlign='left';ctx.fillStyle='#b7b2b4';ctx.fillText(view==='geometry'?'Exterior comparison':'Exterior witnesses',10,14);
  }
  function animate(time) {
    frameId=0;
    if(paused||!visible||document.hidden) { previousTime=0; return; }
    if(previousTime) phase+=Math.min((time-previousTime)/1000,.06);
    previousTime=time;drawBoundary();frameId=requestAnimationFrame(animate);
  }
  function updateMotion() {
    const button=$('#motion-toggle');
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'Play diagram animation':'Pause diagram animation');
    button.title=button.getAttribute('aria-label');
    button.innerHTML=`<i data-lucide="${paused?'play':'pause'}" aria-hidden="true"></i>`;icons();
    if(frameId)cancelAnimationFrame(frameId);
    frameId=0;previousTime=0;drawBoundary();
    if(!paused&&visible&&!document.hidden)frameId=requestAnimationFrame(animate);
  }
  function resizeCanvas() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);drawBoundary();
  }
  new ResizeObserver(resizeCanvas).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updateMotion();},{threshold:.05}).observe(canvas);
  $('#motion-toggle').addEventListener('click',()=>{paused=!paused;updateMotion();});
  motionPreference.addEventListener('change',event=>{paused=event.matches;updateMotion();});
  document.addEventListener('visibilitychange',updateMotion);
  all('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    select('[data-view]',button);view=button.dataset.view;
    text('#boundary-label',view==='geometry'?'A horizon within a licensed geometry':'A separate burden: exterior reconstruction');
    text('#boundary-caption',view==='geometry'?'A classical horizon is a metric and causal structure. Its geometry does not itself supply an exterior reconstruction map.':'Exterior witnesses may remain available while some references lack an image. A genuine reconstruction map, not a storage label, resolves that burden.');
    canvas.setAttribute('aria-label',view==='geometry'?'A schematic classical horizon within an exterior comparison grid. This is not an AMetric boundary.':'An exterior witness network surrounds two unresolved reference markers. The missing witness relation is a reconstruction issue, not a claim that the interior is empty.');
    drawBoundary();
  }));
  resizeCanvas();updateMotion();

  function updateTransport() {
    const leakage=$('#leakage').checked,certificate=$('#certificate').checked,storage=$('#storage').checked;
    const complete=leakage||certificate;
    all('[data-reference]').forEach(row=>{
      row.dataset.defined=String(complete);
      const witness=row.querySelector('[data-witness]');
      if(complete)witness.innerHTML=`<span class="math">w<sub>${row.dataset.reference}</sub></span>`;else witness.textContent='Undefined';
      const arrow=row.querySelector('.transport-path');arrow.setAttribute('aria-label',complete?'defined':'undefined');
      arrow.innerHTML=`<i data-lucide="${complete?'arrow-right':'unlink'}" aria-hidden="true"></i>`;
    });
    text('#transport-count',`${complete?4:2} of 4 references have exterior witnesses`);
    $('.transport-result').dataset.complete=String(complete);
    let message=complete?(leakage&&certificate?'Both declared routes supply the required witness relation. The assignment is total in this toy case.':leakage?'Leakage supplies late witnesses for the threatened references. The assignment is total in this toy case.':'The certificate supplies the exterior reconstruction map. The assignment is total in this toy case.'):'The assignment is partial. Neither a label nor an unsupported storage claim supplies the two missing witnesses.';
    if(storage)message+=complete?' The storage claim adds no independent reconstruction force.':' Global storage without an exterior map leaves this result unchanged.';
    text('#transport-verdict',message);icons();
  }
  all('.route-controls input').forEach(input=>input.addEventListener('change',updateTransport));updateTransport();

  const supportCases={
    licensed:{label:'Licensed roles',heading:'Description and role support agree.',description:'The declared domain supports reference, comparison and reuse. Metric, source and record descriptions operate within that governed scope.',boundary:'A black-hole horizon is a structure within such a licensed projection, not a new source of its licensing.',standing:'Supported reference and reuse',organization:'Licensed physical role structure',metric:'Supported comparison and continuation'},
    residual:{label:'Residual coherence',heading:'Organization remains; standing does not.',description:'In the uncertified case, traceable role organization remains representable without old-scope standing. Its residual support depends on the role and its ancestry, not on a fractional amount of standing.',boundary:'No annihilation is inferred. No ordinary same-scope interior continuation is supplied merely by retaining a writable metric or recognizable pattern.',standing:'Absent for the affected crossed content',organization:'Traceable retained patterns, without full licensing',metric:'Residual comparison support remains nonempty'},
    exhausted:{label:'Metric support exhausted',heading:'The metric descriptor loses its remaining support.',description:'The residual successor class for metric comparison is empty. “Deeper inside” no longer has that residual metric basis. This is a structural condition, not a clock time or a radius.',boundary:'Paper III still has to establish all remaining endpoint coordinates and route closures. Metric-support exhaustion alone is not the complete boundary theorem.',standing:'No old-scope standing transport',organization:'Not reclassified as a primitive surviving substance',metric:'No residual metric-comparison successor'}
  };
  all('[data-support]').forEach(button=>button.addEventListener('click',()=>{
    select('[data-support]',button);const key=button.dataset.support,s=supportCases[key];
    for(const name of ['label','heading','description','boundary','standing','organization','metric'])text('#support-'+name,s[name]);
    $('#support-network').dataset.state=key;
    $('#support-network').setAttribute('aria-label',`${s.label}. ${s.standing}. ${s.organization}. ${s.metric}.`);
  }));
  const profiles={
    metric:{origin:'No metric, scale or comparison rule has primitive authority at the boundary.',endpoint:'Old-scope residual metric and comparison support is exhausted for the endpoint target.',result:'Metricity is not primitive at the origin and cannot authorize its own continuation at the exhausted endpoint.'},
    time:{origin:'No primitive first instant, clock or boundary process is licensed.',endpoint:'No old-scope temporal continuation, endpoint event or process remains in the domain.',result:'The matching profile supplies no before-and-after process connecting the two boundary tokens.'},
    causal:{origin:'No pre-admission causal relation supplies boundary authority.',endpoint:'No parent-to-successor causal production relation is defined.',result:'The profile comparison is not a mechanism by which an earlier universe produces a later one.'},
    transport:{origin:'No prior standing, law, ledger or reference is inherited into the admitted interior.',endpoint:'No parent standing, law, ledger or reference is inherited by a successor.',result:'Equal profiles do not provide a channel for energy, information, laws, records or identity.'},
    governance:{origin:'An admitted interior requires its own gate. No physical structure authorizes its own admission.',endpoint:'Any positive successor requires its own gate. An exhausted equation or ledger cannot re-license its own use.',result:'Both positions require independent governance. Homology alone does not establish a populated successor.'}
  };
  all('[data-profile]').forEach(button=>button.addEventListener('click',()=>{
    select('[data-profile]',button);const p=profiles[button.dataset.profile];
    text('#origin-profile',p.origin);text('#endpoint-profile',p.endpoint);text('#profile-result',p.result);
  }));
  const routes={
    transfer:{icon:'ban',closed:true,title:'Closed by absolute no-crossing',description:'A transferred law, energy ledger, record or identity would require an admissible cross-boundary transport relation. The AMetric target supplies none. A richer theory adding such a relation changes the governance scope.'},
    silence:{icon:'minus',closed:true,title:'Homology is the handoff, not the capstone',description:'Paper III stops at boundary-profile equality and no crossing. Paper IV adds the counter-boundary classification burden and route closure: a bare boundary label or mute non-classification cannot do the work of an admissible occupation status.'},
    fresh:{icon:'check',closed:false,title:'The surviving governance-equivalence class',description:'Under the certified endpoint antecedents and completed route closure, the capstone establishes fresh internal governed-domain status. No parent content is needed or permitted to cross.'}
  };
  all('[data-route]').forEach(button=>button.addEventListener('click',()=>{
    select('[data-route]',button);const r=routes[button.dataset.route];
    text('#route-title',r.title);text('#route-description',r.description);
    $('#route-symbol').innerHTML=`<i data-lucide="${r.icon}" aria-hidden="true"></i>`;
    $('.route-reading').dataset.closed=String(r.closed);icons();
  }));

  const chapterLinks=all('.chapter-nav a');
  let scrollQueued=false;
  function updateChapter() {
    scrollQueued=false;
    const threshold=$('.chapter-nav').getBoundingClientRect().height+70;
    let current=chapterLinks[0];
    for(const link of chapterLinks)if($(link.hash).getBoundingClientRect().top<=threshold)current=link;
    chapterLinks.forEach(link=>{if(link===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    const start=$('#horizons').offsetTop,end=$('#origins').offsetTop+$('#origins').offsetHeight-innerHeight;
    $('#reading-progress').style.width=`${Math.max(0,Math.min(100,(scrollY-start)/Math.max(1,end-start)*100))}%`;
  }
  addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateChapter);}},{passive:true});
  addEventListener('resize',updateChapter);updateChapter();
})();
