(() => {
  'use strict';
  window.lucide?.createIcons();
  const $=id=>document.getElementById(id);
  const lab=$('am-lab');
  if(lab && $('am-feedback-title') && $('am-feedback-copy')){
    const controls=lab.querySelector('.am-controls'),buttons=[...lab.querySelectorAll('[data-am-view]')];
    function render(mode){
      const measured=mode==='measured';lab.dataset.view=mode;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.amView===mode)));
      lab.querySelectorAll('.am-numbers').forEach(el=>el.hidden=!measured);
      lab.querySelectorAll('.am-preserved').forEach(el=>el.hidden=measured);
      $('am-feedback-title').textContent=measured?'Two readings, attached to two events.':'The numbers are gone. The events are still identified.';
      $('am-feedback-copy').textContent=measured?'In the watch’s rest frame: it starts at 0 seconds, and you read it at 4 seconds. Both events are at the same position in that frame.':'We still know which event began the interval and which came later. The readings described those events; removing them from view does not change what happened.';
    }
    if(controls&&buttons.length===2){buttons.forEach(b=>b.addEventListener('click',()=>render(b.dataset.amView)));render('measured');controls.hidden=false;lab.classList.add('am-ready');}
  }
  // Existing shared links continue to land at the nearest part of the new narrative.
  const aliases={'same-journey':'two-pictures','what-must-hold':'the-foundations','necessity':'the-foundations','before-a-ruler':'before-measurement','keep-the-record':'the-foundations','safe-set':'the-foundations','building-onward':'the-foundations'};
  function targetFor(hash){const id=decodeURIComponent(hash.replace(/^#/,''));return $(aliases[id]||id);}
  function go(target,focus=true){
    for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
    target.scrollIntoView({block:'start',behavior:'instant'});
    if(focus){if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  }
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const target=targetFor(link.hash);if(!target)return;e.preventDefault();history.pushState(null,'','#'+target.id);requestAnimationFrame(()=>go(target));
  }));
  const nav=document.querySelector('.chapter-nav'),chapters=[...document.querySelectorAll('.chapter-nav a')];
  function progress(){
    if(!nav)return;const height=nav.getBoundingClientRect().height;document.documentElement.style.setProperty('--origin-nav-height',height+'px');
    let current=chapters[0];chapters.forEach(link=>{const target=targetFor(link.hash);if(target&&target.getBoundingClientRect().top<=height+40)current=link;});chapters.forEach(link=>link===current?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
    const start=$('two-pictures'),end=$('papers');if(start&&end){const a=start.getBoundingClientRect().top+scrollY,z=end.getBoundingClientRect().top+scrollY;$('reading-progress').style.width=Math.max(0,Math.min(100,(scrollY-a)/(z-a)*100))+'%';}
  }
  let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;progress();});}},{passive:true});addEventListener('resize',progress);
  progress();if(location.hash){const target=targetFor(location.hash);if(target)requestAnimationFrame(()=>go(target,false));}
  addEventListener('popstate',()=>{const target=targetFor(location.hash);if(target)go(target);});
})();
