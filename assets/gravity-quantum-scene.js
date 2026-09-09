(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-gq-scene]').forEach(scene => {
    const canvas = scene.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    const control = document.getElementById(scene.dataset.motionControl);
    if (!ctx || !control) return;
    let width = 0, height = 0, phase = .55, previous = 0, frame = 0;
    let visible = false, paused = reduced.matches;

    function line(points, color, thickness = 1) {
      ctx.beginPath();
      points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.stroke();
    }
    function draw() {
      if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,width,height);
      const gravity = scene.dataset.view !== 'quantum';
      const quantum = scene.dataset.view !== 'gravity';
      const left = width * .25, right = width * .75, mid = height * .50;
      const radius = width * .20;

      // Shared ancestry fans into two schematic representations, not a simulated causal signal.
      for (let i = -5; i <= 5; i++) {
        const x = width * .5 + i * width * .003;
        for (const [target,color,on] of [[left,'213,173,172',gravity],[right,'174,208,201',quantum]]) {
          ctx.beginPath();ctx.moveTo(x,height*.18);
          ctx.bezierCurveTo(x,height*.25,target+i*radius*.06,height*.20,target+i*radius*.10,height*.30);
          ctx.strokeStyle = `rgba(${color},${on ? .32 : .08})`;ctx.lineWidth=.85;ctx.stroke();
        }
      }
      for (let i=0;i<7;i++) {
        const points=[];
        for(let n=0;n<=70;n++) {
          const t=n/70;
          points.push([width*(.46+.08*t),height*(.145+.012*Math.sin(t*Math.PI*3+i*.8+phase))]);
        }
        line(points,`rgba(223,211,200,${.30+i*.035})`,.8);
      }

      const surface = (u,v) => {
        const bend = Math.exp(-3*(u*u+v*v))*(.85+.1*Math.sin(phase*.65));
        return [left+u*radius*(.82+.12*v),mid+v*height*.14+bend*height*.11+u*height*.025];
      };
      ctx.globalAlpha = gravity ? 1 : .15;
      for(let row=0;row<=16;row++) {
        const v=-1+row/8, pts=[];
        for(let n=0;n<=70;n++)pts.push(surface(-1+n/35,v));
        line(pts,`rgba(213,173,172,${row%4===0?.78:.35})`,row%4===0?1.15:.7);
      }
      for(let col=0;col<=20;col++) {
        const u=-1+col/10,pts=[];
        for(let n=0;n<=40;n++)pts.push(surface(u,-1+n/20));
        line(pts,`rgba(228,197,185,${col%5===0?.7:.28})`,col%5===0?1:.7);
      }
      const scan=-.9+((phase*.16)%1)*1.8;
      line(Array.from({length:71},(_,n)=>surface(-1+n/35,scan)),'rgba(244,215,199,.8)',1.5);

      ctx.globalAlpha = quantum ? 1 : .15;
      for(let row=0;row<17;row++) {
        const pts=[];
        for(let n=0;n<=110;n++) {
          const u=-1+2*n/110;
          const envelope=Math.exp(-2.2*u*u);
          const wave=Math.sin(u*9-phase*1.2+row*.23)*envelope;
          pts.push([right+u*radius,mid+(row-8)*height*.012+wave*height*.09]);
        }
        line(pts,`rgba(174,208,201,${row===8?.95:.2+Math.max(0,1-Math.abs(row-8)/8)*.24})`,row===8?1.7:.85);
      }
      ctx.globalAlpha=1;
      scene.dataset.rendered='true';
    }
    function tick(time) {
      frame=0;
      if(paused || !visible || document.hidden){previous=0;return;}
      if(previous)phase+=Math.min((time-previous)/1000,.05);
      previous=time;draw();frame=requestAnimationFrame(tick);
    }
    function schedule() {
      if(frame)cancelAnimationFrame(frame);
      frame=0;previous=0;
      if(!paused && visible && !document.hidden)frame=requestAnimationFrame(tick);
    }
    function syncButton() {
      const label=`${paused?'Play':'Pause'} gravity-quantum animation`;
      control.setAttribute('aria-label',label);control.setAttribute('aria-pressed',String(paused));control.title=label;
      control.innerHTML=`<i data-lucide="${paused?'play':'pause'}" aria-hidden="true"></i>`;
      window.lucide?.createIcons();scene.dataset.paused=String(paused);
    }
    new ResizeObserver(()=>{
      const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();
    }).observe(canvas);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.01}).observe(scene);
    control.addEventListener('click',()=>{paused=!paused;syncButton();schedule();});
    scene.addEventListener('gq-view-change',draw);
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener('change',event=>{paused=event.matches;syncButton();schedule();});
    control.hidden=false;syncButton();
  });
})();
