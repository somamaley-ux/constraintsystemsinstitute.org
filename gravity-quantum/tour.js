(() => {
  'use strict';
  window.lucide?.createIcons();
  document.body.dataset.enhanced='true';
  const nav=document.querySelector('.chapter-nav');
  const links=[...nav.querySelectorAll('a')];
  const chapters=links.map(link=>document.querySelector(link.hash));
  let queued=false;
  function updateChapter() {
    queued=false;
    const threshold=nav.getBoundingClientRect().height+70;
    let current=0;
    chapters.forEach((chapter,i)=>{if(chapter.getBoundingClientRect().top<=threshold)current=i;});
    links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    const start=chapters[0].offsetTop,last=chapters.at(-1);
    const end=last.offsetTop+last.offsetHeight-innerHeight;
    document.getElementById('reading-progress').style.width=`${Math.max(0,Math.min(100,(scrollY-start)/Math.max(1,end-start)*100))}%`;
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateChapter);}},{passive:true});
  addEventListener('resize',updateChapter);updateChapter();

  const projectionCopy={
    gravity:'The gravity view represents spacetime and its attached source. It does not establish the underlying physical interior by assuming a metric first.',
    quantum:'The quantum view represents state identity, transition comparisons, and evolution. Its Hilbert and spatial machinery has to preserve the already-established structure.',
    together:'Together, the two descriptions have to preserve the same source, physical records, and compatible history. Agreement cannot be added by silently changing the underlying target.'
  };
  document.querySelectorAll('[data-projection]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-projection]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    const scene=document.getElementById('projection-scene');scene.dataset.view=button.dataset.projection;
    scene.dispatchEvent(new Event('gq-view-change'));
    document.getElementById('projection-caption').textContent=projectionCopy[button.dataset.projection];
  }));

  function drawing(canvas, painter) {
    const ctx=canvas?.getContext('2d');
    if(!ctx)return()=>{};
    const draw=()=>{
      const {width:w,height:h}=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
      if(!w||!h)return;
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      painter(ctx,w,h);canvas.dataset.rendered='true';
    };
    new ResizeObserver(draw).observe(canvas);return draw;
  }
  let clock='matter';
  const clockCopy={
    matter:['Matter as the clock','The scalar matter-field profile supplies the local clock. Other records are compared at that profile, not at an externally imposed universal time.'],
    volume:['Local volume as the clock','A profile of local spatial volume supplies a different clock description. On the proved overlap, its records refer back to the same retained physical history.'],
    curvature:['Curvature as the clock','The intrinsic spatial-curvature profile supplies a third clock description. The paper constructs the transition that preserves the shared source, records, and continuation.']
  };
  const redrawClocks=drawing(document.getElementById('clock-canvas'),(ctx,w,h)=>{
    const x0=w*.30,x1=w*.92;
    const columns=[x0+(x1-x0)*.13,x0+(x1-x0)*.50,x0+(x1-x0)*.87];
    ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillStyle='#ada5a7';
    columns.forEach((x,i)=>{ctx.fillText(['Earlier','Shared history','Later'][i],x,22);ctx.beginPath();ctx.moveTo(x,34);ctx.lineTo(x,h-12);ctx.strokeStyle='#c5b9b42b';ctx.setLineDash([3,5]);ctx.stroke();ctx.setLineDash([]);});
    ['matter','volume','curvature'].forEach((key,i)=>{
      const y=66+i*65,active=key===clock;
      ctx.fillStyle=active?'#dce8df':'#948e91';ctx.textAlign='left';ctx.font=`${active?'600':'400'} 12px system-ui`;
      ctx.fillText(['Matter','Local volume','Curvature'][i],5,y+4);
      ctx.strokeStyle=active?'#aed0c9':'#777174';ctx.lineWidth=active?2:1;
      ctx.beginPath();
      for(let n=0;n<=90;n++){const u=n/90,x=x0+u*(x1-x0);const dy=i===0?Math.sin(u*4)*10:i===1?(u-.5)*23:Math.cos(u*6)*9; n?ctx.lineTo(x,y+dy):ctx.moveTo(x,y+dy);}
      ctx.stroke();
      columns.forEach(x=>{const u=(x-x0)/(x1-x0);const dy=i===0?Math.sin(u*4)*10:i===1?(u-.5)*23:Math.cos(u*6)*9;ctx.beginPath();ctx.arc(x,y+dy,active?4:3,0,Math.PI*2);ctx.fillStyle=active?'#dce8df':'#948e91';ctx.fill();});
    });
  });
  document.querySelectorAll('[data-clock-choice]').forEach(button=>button.addEventListener('click',()=>{
    clock=button.dataset.clockChoice;
    document.querySelectorAll('[data-clock-choice]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    document.querySelector('.clock-exhibit').dataset.clock=clock;
    document.getElementById('clock-heading').textContent=clockCopy[clock][0];
    document.getElementById('clock-description').textContent=clockCopy[clock][1];redrawClocks();
  }));

  let exchange='internal';
  const redrawExchange=drawing(document.getElementById('exchange-canvas'),(ctx,w,h)=>{
    const left=w*.16,right=w*.67,y=h*.48;
    ctx.strokeStyle='#b5a5a29c';ctx.lineWidth=1;ctx.setLineDash([5,4]);ctx.strokeRect(w*.06,38,w*.79,h-64);ctx.setLineDash([]);
    ctx.fillStyle='#b8b0ad';ctx.font='12px system-ui';ctx.textAlign='left';ctx.fillText('The combined system',w*.07,25);
    const block=(x,name,color)=>{ctx.strokeStyle=color;ctx.strokeRect(x-14,y-25,28,50);for(let n=1;n<=3;n++){ctx.beginPath();ctx.moveTo(x-14,y-25+n*12.5);ctx.lineTo(x+14,y-25+n*12.5);ctx.stroke();}ctx.textAlign='center';ctx.fillStyle='#d9d1cc';ctx.fillText(name,x,y+50);};
    block(left,'Part A','#d8aaa8');block(right,'Part B','#aed0c9');
    const arrow=(start,end,yy,color)=>{ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,yy);ctx.lineTo(end,yy);ctx.stroke();ctx.beginPath();ctx.moveTo(end,yy);ctx.lineTo(end-7,yy-4);ctx.lineTo(end-7,yy+4);ctx.closePath();ctx.fill();};
    if(exchange==='internal'){
      arrow(left+24,right-24,y,'#ddd0bd');ctx.textAlign='center';ctx.fillStyle='#ddd0bd';ctx.fillText('One internal transfer',(left+right)/2,y-28);
      ctx.fillStyle='#d8aaa8';ctx.fillText('loss',left,y+74);ctx.fillStyle='#aed0c9';ctx.fillText('gain',right,y+74);
    }else{
      arrow(right+22,w*.98,y,'#d8aaa8');ctx.textAlign='center';ctx.fillStyle='#d8aaa8';ctx.fillText('Leaves the system',w*.66,y-42);
      ctx.textAlign='left';ctx.fillStyle='#ddd0bd';ctx.fillText('External exchange retained',w*.12,y+75);
    }
  });
  document.querySelectorAll('[data-exchange-choice]').forEach(button=>button.addEventListener('click',()=>{
    exchange=button.dataset.exchangeChoice;
    document.querySelectorAll('[data-exchange-choice]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    document.querySelector('.exchange-exhibit').dataset.exchange=exchange;
    const internal=exchange==='internal';
    document.getElementById('exchange-heading').textContent=internal?'One transfer. Two opposite entries.':'A boundary crossing stays in the account.';
    document.getElementById('exchange-description').textContent=internal?'The internal loss and gain cancel in the combined source account. No external exchange has been introduced.':'There is no balancing gain inside this system. The external exchange must remain explicit; it cannot be cancelled as if it were internal.';
    document.getElementById('exchange-canvas').setAttribute('aria-label',internal?'Two parts of one system exchanging internally, with no exchange across the outer boundary.':'An exchange leaves the combined system through its boundary and remains in the source account.');redrawExchange();
  }));
})();
