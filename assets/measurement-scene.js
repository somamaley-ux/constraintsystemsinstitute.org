(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  for(const scene of document.querySelectorAll('[data-measurement-scene]')) {
    const control=scene.querySelector('.measurement-motion');
    if(!control)continue;
    let paused=reduced.matches;
    const update=()=>{scene.classList.add('js-motion');scene.classList.toggle('is-paused',paused);control.hidden=reduced.matches;control.setAttribute('aria-pressed',String(paused));control.setAttribute('aria-label',paused?'Play recording-chain animation':'Pause recording-chain animation');control.title=control.getAttribute('aria-label');control.innerHTML=`<i data-lucide="${paused?'play':'pause'}" aria-hidden="true"></i>`;window.lucide?.createIcons();};
    control.addEventListener('click',()=>{paused=!paused;update();});
    reduced.addEventListener('change',()=>{paused=reduced.matches;update();});update();
  }
})();
