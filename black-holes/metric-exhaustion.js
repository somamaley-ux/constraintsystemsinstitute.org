(() => {
  'use strict';
  const root = document.querySelector('[data-bh-metric]'), model = window.BlackHoleMetric;
  if (!root || !model) return;
  const get = name => root.querySelector(`[data-bh-${name}]`);
  const range = get('progress');
  function renderReference(announce = true) {
    const progress = Number(range.value) / 100, x = model.reference(progress);
    get('progress-label').textContent = `${Math.round(progress * 100)}% of the finite example`;
    get('cell').setAttribute('r', String(86 * x.a));
    get('contrast-fill').setAttribute('width', String(180 * x.contrast));
    for (const key of ['contrast','speed','density','energy']) get(key).textContent = `${(100 * x[key]).toFixed(1)}%`;
    get('tau').textContent = x.tau.toFixed(3);
    get('reference-desc').textContent = `The model cell has ${Math.round(100*x.a)} percent of its initial linear size. Selected contrast ${Math.round(100*x.contrast)} percent; contraction speed ${Math.round(100*x.speed)} percent; density ${Math.round(100*x.density)} percent; cell energy ${Math.round(100*x.energy)} percent.`;
    if (announce) get('reference-status').textContent = progress === 0
      ? 'Start: all four comparisons are normalized to 100%. The cell is already contracting.'
      : `The cell keeps shrinking. Selected contrast is ${(100*x.contrast).toFixed(1)}% and contraction speed is ${(100*x.speed).toFixed(1)}% of their starting values. Density rises while energy in this same shrinking cell falls through pressure work.`;
  }
  range.addEventListener('input',()=>renderReference());
  root.querySelectorAll('[data-bh-preset]').forEach(button=>button.addEventListener('click',()=>{range.value=button.dataset.bhPreset;renderReference();}));
  let selectedCase = 'survival', selectedEvent = 'turn';
  const explanations = {
    meanEntry:'The average scale of the material cell is still decreasing. Its positive acceleration begins to brake that contraction. The spherical area has its own acceleration and has not yet entered braking.',
    arealEntry:'The spheres are still shrinking, but their contraction is now being braked too. Both kinds of braking coexist with decreasing selected source responses. The spheres remain trapped.',
    turn:'The scalar reaches a positive minimum and starts increasing. This ends the decreasing-response part of this experiment. It is a turn of the field, while the geometry keeps contracting.',
    arealExit:'Braking of the shrinking spheres ends. The spheres remain trapped, and their inward contraction continues. The scalar turn and the overall-braking exit are separately determined events.',
    meanExit:'Braking of the average volume scale ends. The source and metric description continue beyond this event. An end to braking is not yet an end to spacetime.'
  };
  function renderEvents(announce = true) {
    const events = model.orderedEvents(selectedCase);
    get('event-list').replaceChildren(...events.map(event=>{
      const button = document.createElement('button'); button.type='button'; button.className='bh-metric-event';
      button.dataset.bhEvent=event.id; button.setAttribute('aria-pressed',String(event.id===selectedEvent));
      const title=document.createElement('span'); title.textContent=event.label;
      const track=document.createElement('span');track.className='bh-metric-track';track.setAttribute('aria-hidden','true');
      const band=document.createElement('span');band.className='bh-metric-band';band.style.left=`${event.lower*100}%`;band.style.width=`${(event.upper-event.lower)*100}%`;track.append(band);
      const bracket=document.createElement('small');bracket.textContent=`(${event.range[0]}/256, ${event.range[1]}/256)`;
      button.append(title,track,bracket);button.addEventListener('click',()=>{selectedEvent=event.id;renderEvents();root.querySelector(`[data-bh-event="${selectedEvent}"]`).focus({preventScroll:true});});return button;
    }));
    root.querySelectorAll('[data-bh-case]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.bhCase===selectedCase)));
    const current=events.find(x=>x.id===selectedEvent);
    get('event-title').textContent=current.label;
    get('event-copy').textContent=explanations[selectedEvent];
    get('event-result').textContent=selectedCase==='survival'
      ? 'Here, the scalar turns first; sphere braking and then overall braking end later.'
      : 'Here, sphere braking and overall braking both end before the scalar turns.';
    get('event-shear').textContent=`Published preparation: initial shear ${model.cases[selectedCase].shear}.`;
    if (selectedEvent==='turn') get('event-copy').textContent += selectedCase==='survival'
      ? ' In this preparation, both kinds of braking are still active at the turn.'
      : ' In this preparation, both kinds of braking have already ended.';
    if (announce) get('event-status').textContent=`${model.cases[selectedCase].label}. ${current.label}. ${get('event-copy').textContent}`;
  }
  root.querySelectorAll('[data-bh-case]').forEach(button=>button.addEventListener('click',()=>{selectedCase=button.dataset.bhCase;renderEvents();}));
  renderReference(false);renderEvents(false);
  root.querySelectorAll('[data-bh-controls]').forEach(x=>x.hidden=false);
  root.querySelectorAll('[data-bh-fallback]').forEach(x=>x.hidden=true);
  root.dataset.bhReady='true';
})();
