(() => {
  'use strict';
  const colors = ['#d8acae', '#a9ccc6', '#c8c9a1'];
  const tau = Math.PI * 2;

  function line(ctx, points, color, width = 1) {
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  // Qualitative profile motifs, not numerical fields or Wheeler-DeWitt solutions.
  function profile(ctx, kind, cx, cy, size, phase = 0) {
    ctx.save();
    ctx.translate(cx,cy);
    const color = colors[['matter','volume','curvature'].indexOf(kind)];
    if (kind === 'matter') {
      for (let row = -3; row <= 3; row++) {
        const points = [];
        for (let i = 0; i <= 90; i++) {
          const x = (i / 90 - .5) * size * 1.75;
          const envelope = Math.sin(i / 90 * Math.PI);
          const y = row * size * .15 + Math.sin(i / 90 * tau * 1.25 + phase + row * .22) * size * .16 * envelope;
          points.push([x,y]);
        }
        ctx.globalAlpha = .95 - Math.abs(row) * .13;
        line(ctx,points,color,row === 0 ? 2 : 1);
      }
    } else if (kind === 'volume') {
      for (let axis = 0; axis < 2; axis++) {
        for (let row = -4; row <= 4; row++) {
          const points = [];
          for (let i = 0; i <= 45; i++) {
            const a = (i / 45 - .5) * 1.5;
            const b = row / 5;
            const stretch = 1 + .16 * Math.cos(a * 3 + phase);
            const x = axis ? b * stretch : a;
            const y = axis ? a : b * stretch;
            points.push([(x + .15*y) * size, y * size * .72]);
          }
          ctx.globalAlpha = .8 - Math.abs(row) * .09;
          line(ctx,points,color,1.2);
        }
      }
    } else {
      for (let ring = 1; ring <= 7; ring++) {
        const points = [];
        for (let i = 0; i <= 100; i++) {
          const angle = i / 100 * tau;
          const r = (ring / 8) * size * (1 + .11 * Math.sin(angle*3 + phase) + .04*Math.cos(angle*5));
          points.push([Math.cos(angle)*r*1.12,Math.sin(angle)*r*.67]);
        }
        ctx.globalAlpha = 1 - ring * .09;
        line(ctx,points,color,ring === 3 ? 2 : 1);
      }
    }
    ctx.restore();
  }

  function fit(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1,2);
    const width = Math.max(1,Math.round(rect.width));
    const height = Math.max(1,Math.round(rect.height));
    if (canvas.width !== width*dpr || canvas.height !== height*dpr) {
      canvas.width = width*dpr;
      canvas.height = height*dpr;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    return {ctx,width,height};
  }

  window.CSITime = {profile,fit,line,colors};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-time-scene]').forEach(scene => {
    const canvas = scene.querySelector('canvas');
    if (!canvas?.getContext('2d')) return;
    const control = document.getElementById(scene.dataset.motionControl);
    let paused = false, visible = false, frame = 0, previous = 0, phase = 0;

    function draw() {
      const {ctx,width:w,height:h} = fit(canvas);
      const radius = Math.min(h*.26,w*.12,72);
      const xs = [w*.21,w*.5,w*.79];
      xs.forEach((x,index) => {
        const y = h*.37;
        ctx.strokeStyle = colors[index] + '50';
        ctx.lineWidth = 1;
        ctx.beginPath();ctx.arc(x,y,radius*1.1,0,tau);ctx.stroke();
        for (let tick = 0; tick < 32; tick++) {
          const a = tick / 32 * tau - Math.PI/2;
          const long = tick % 4 === 0;
          line(ctx,[[x+Math.cos(a)*radius*1.12,y+Math.sin(a)*radius*1.12],[x+Math.cos(a)*radius*(long?1.24:1.18),y+Math.sin(a)*radius*(long?1.24:1.18)]],colors[index]+'77');
        }
        profile(ctx,['matter','volume','curvature'][index],x,y,radius*.81,phase*(.38+index*.07));
        line(ctx,[[x,h*.8],[x,h*.88]],colors[index]+'60');
      });
      const y = h*.89;
      line(ctx,[[w*.11,y],[w*.89,y]],'#b8acb780',1.2);
      line(ctx,[[w*.89-7,y-4],[w*.89,y],[w*.89-7,y+4]],'#d4c9c4',1.2);
      for (let i = 0; i < 9; i++) {
        const x = w*(.16+i*.081);
        const shine = .35 + .55 * Math.max(0,Math.cos(phase*.8-i*.7));
        ctx.globalAlpha = shine;
        ctx.beginPath();ctx.arc(x,y,2.5,0,tau);ctx.fillStyle='#d8acae';ctx.fill();
      }
      ctx.globalAlpha=1;
      scene.dataset.rendered = 'true';
    }

    function tick(now) {
      frame=0;
      if (previous) phase += Math.min(now-previous,50)/1000;
      previous=now;
      draw();
      if (!paused && !reduced.matches && visible && !document.hidden) frame=requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);frame=0;previous=0;
      draw();
      if (!paused && !reduced.matches && visible && !document.hidden) frame=requestAnimationFrame(tick);
      if (control) {
        control.hidden=reduced.matches;
        const name=paused?'Play':'Pause';
        control.title=`${name} time animation`;
        control.setAttribute('aria-label',control.title);
        control.setAttribute('aria-pressed',String(paused));
        control.innerHTML=`<i data-lucide="${paused?'play':'pause'}" aria-hidden="true"></i>`;
        window.lucide?.createIcons({nodes:[control]});
      }
    }
    control?.addEventListener('click',()=>{paused=!paused;sync();});
    new ResizeObserver(draw).observe(scene);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'60px'}).observe(scene);
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',sync);
    sync();
  });
})();
