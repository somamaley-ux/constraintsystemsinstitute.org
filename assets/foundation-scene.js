(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-foundation-scene]').forEach(scene => {
    const canvas = scene.querySelector('canvas'), context = canvas.getContext('2d');
    if (!context) return;
    const button = document.getElementById(scene.dataset.motionControl);
    const shapeA = [[.12,.67],[.37,.26],[.64,.61],[.87,.29]];
    const shapeB = [[.12,.46],[.37,.46],[.64,.46],[.87,.46]];
    let width = 0, height = 0, frame = 0, previous = 0, elapsed = 0, visible = false, paused = false;
    function draw() {
      const blend = reduced.matches ? .35 : (1-Math.cos(elapsed/2300))/2;
      const points = shapeA.map((p,i) => [width*(p[0]+(shapeB[i][0]-p[0])*blend),height*(p[1]+(shapeB[i][1]-p[1])*blend)]);
      context.fillStyle = '#211e23'; context.fillRect(0,0,width,height);
      context.strokeStyle = '#536050'; context.lineWidth = 1;
      for(let i=1;i<6;i++) { context.beginPath(); context.moveTo(width*i/6,height*.17); context.lineTo(width*i/6,height*.77); context.stroke(); }
      context.strokeStyle = '#bdd2ba'; context.lineWidth = 3;
      context.beginPath(); points.forEach((p,i) => i ? context.lineTo(...p) : context.moveTo(...p)); context.stroke();
      const labels = ['Home','Bridge','Market','Harbour'];
      const fontSize = width < 330 ? 10 : width < 430 ? 12 : 14;
      context.font = `${fontSize}px system-ui, sans-serif`; context.textAlign = 'center';
      points.forEach(([x,y],i) => {
        context.beginPath(); context.arc(x,y,6,0,2*Math.PI); context.fillStyle='#211e23'; context.fill(); context.strokeStyle='#e3c9d3'; context.lineWidth=2; context.stroke();
        context.fillStyle='#e8dce1'; context.fillText(labels[i],x,y+(i%2?-19:25));
      });
    }
    function tick(now) { frame=0; if(previous) elapsed+=Math.min(50,now-previous); previous=now; draw(); frame=requestAnimationFrame(tick); }
    function sync() {
      const run = visible && !paused && !reduced.matches && !document.hidden;
      if(run && !frame) { previous=0; frame=requestAnimationFrame(tick); }
      if(!run && frame) { cancelAnimationFrame(frame); frame=0; previous=0; }
      if(button) { button.hidden=reduced.matches; button.setAttribute('aria-pressed',String(paused)); button.setAttribute('aria-label',paused?'Play map animation':'Pause map animation'); button.title=button.getAttribute('aria-label'); button.innerHTML=`<i data-lucide="${paused?'play':'pause'}" aria-hidden="true"></i>`; window.lucide?.createIcons({root:button}); }
      draw();
    }
    new ResizeObserver(() => {
      width=scene.clientWidth; height=scene.clientHeight;
      const dpr=Math.min(devicePixelRatio||1,2); canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr); context.setTransform(dpr,0,0,dpr,0,0); draw(); scene.classList.add('ready');
    }).observe(scene);
    new IntersectionObserver(entries => { visible=entries[0].isIntersecting; sync(); },{threshold:.05}).observe(scene);
    button?.addEventListener('click',()=>{paused=!paused;sync();});
    document.addEventListener('visibilitychange',sync); reduced.addEventListener('change',sync);
  });
})();
