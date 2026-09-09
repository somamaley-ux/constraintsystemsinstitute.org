(() => {
  'use strict';
  const drawing = window.CSITime;
  if (!drawing) return;
  const {fit,profile,line,colors} = drawing;
  document.body.dataset.enhanced = 'true';
  window.lucide?.createIcons();

  const lamp = document.querySelector('.lamp-exhibit');
  const lampSwitch = document.getElementById('lamp-switch');
  const eventLog = document.getElementById('event-log');
  let events = 0;
  lampSwitch.addEventListener('change',() => {
    const on = lampSwitch.checked;
    lamp.dataset.lit = String(on);
    const item = document.createElement('li');
    item.textContent = `${++events}. Switched ${on?'on':'off'}`;
    eventLog.append(item);
    eventLog.scrollTop = eventLog.scrollHeight;
    document.getElementById('event-count').textContent = `${events} ${events===1?'event':'events'} retained`;
    document.getElementById('lamp-caption').textContent = on
      ? 'The light is on. A new event has been added to the history; earlier events remain part of that history.'
      : 'The light is off again. Switching it off was a new event. It does not make the earlier lighting never have happened.';
  });

  function bindChoices(selector,attribute,action) {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach(button=>button.addEventListener('click',()=>{
      buttons.forEach(candidate=>candidate.setAttribute('aria-pressed',String(candidate===button)));
      action(button.dataset[attribute]);
    }));
  }

  let unit = 'seconds', interrupted = false;
  const connection = document.getElementById('readout-switch');
  function updateCounter() {
    const connected = connection.checked;
    document.querySelector('.counter-exhibit').dataset.connected=String(connected);
    document.getElementById('counter-value').textContent = connected ? (unit==='seconds'?'2.400':'2400') : '--';
    document.getElementById('counter-unit').textContent = connected ? unit : 'no readout';
    const heading = document.getElementById('counter-heading');
    const caption = document.getElementById('counter-caption');
    if (!connected) {
      heading.textContent='The source remains. This use fails.';
      caption.textContent='The counter may still run, but its disconnected readout cannot timestamp the next detector event. A changing physical quantity is not enough for this job.';
    } else if (interrupted) {
      heading.textContent='A usable readout again. The gap remains.';
      caption.textContent='Reconnection permits a new timestamping use. It does not recover the missing reading during the gap. The sample readout is shown again in the selected units.';
    } else {
      heading.textContent='Different units. The same timestamp.';
      caption.textContent='2.400 seconds and 2400 milliseconds represent the same retained detector-event readout. The underlying clock use has not changed.';
    }
  }
  bindChoices('[data-unit]','unit',choice=>{unit=choice;updateCounter();});
  connection.addEventListener('change',()=>{if(!connection.checked)interrupted=true;updateCounter();});

  const profiles = {
    matter: {
      kind:'A matter-field profile',title:'Compare events using the matter field.',
      description:'The scalar matter field has a value at each spatial location. Its whole local profile supplies the clock condition; it is not replaced by one average value.',
      question:'What do the other physical records say at this matter-field profile?',
      boundary:'Local limit: the matter-clock construction must retain its required direction and remain inside its certified neighborhood.',
      alt:'Schematic matter-field values across a local spatial region.',label:'Matter-field profile'
    },
    volume: {
      kind:'An intrinsic metric profile',title:'Compare events using local spatial volume.',
      description:'Geometry supplies another reference: the local volume density relative to the specified reference geometry. This is a profile across space, not the total volume of the universe.',
      question:'What do the other physical records say at this local-volume profile?',
      boundary:'Local limit: the volume response must remain invertible. A vanishing expansion trace or exit from the certified neighborhood ends this clock use.',
      alt:'Schematic spatial cells with different local volume densities.',label:'Local volume-density profile'
    },
    curvature: {
      kind:'An intrinsic curvature profile',title:'Compare events using spatial curvature.',
      description:'The intrinsic scalar curvature of the spatial geometry supplies the third profile. It uses how geometry varies locally, not just a rescaling of the matter or volume reading.',
      question:'What do the other physical records say at this curvature profile?',
      boundary:'Local limit: the curvature response operator must remain elliptic and invertible, with the inherited source and record conditions intact.',
      alt:'Schematic contours of intrinsic spatial scalar curvature, not an embedding of space.',label:'Intrinsic curvature profile'
    }
  };
  let selectedProfile = 'matter';
  const profileCanvas = document.getElementById('profile-canvas');
  function drawProfile() {
    const {ctx,width:w,height:h}=fit(profileCanvas);
    const kind=selectedProfile,index=['matter','volume','curvature'].indexOf(kind);
    const size=Math.min(w*.40,h*.40);
    const left=w*.1,right=w*.9,top=25,bottom=h-35;
    ctx.strokeStyle='#c6beb51e';ctx.lineWidth=1;
    ctx.strokeRect(left,top,right-left,bottom-top);
    profile(ctx,kind,w/2,h*.47,size,.3);
    ctx.textAlign='center';ctx.font='12px system-ui';ctx.fillStyle=colors[index];
    ctx.fillText(profiles[kind].label,w/2,h-10);
    ctx.fillStyle='#9f979c';ctx.font='10px system-ui';
    ctx.fillText('Local spatial region',w/2,14);
  }
  bindChoices('[data-profile-choice]','profileChoice',choice=>{
    selectedProfile=choice;
    document.querySelector('.profile-exhibit').dataset.profile=choice;
    const data=profiles[choice];
    for(const key of ['kind','title','description','question','boundary']) document.getElementById(`profile-${key}`).textContent=data[key];
    profileCanvas.setAttribute('aria-label',data.alt);
    drawProfile();
  });
  new ResizeObserver(drawProfile).observe(profileCanvas);
  drawProfile();

  let route='direct';
  const routeCanvas=document.getElementById('route-canvas');
  function arrow(ctx,a,b,color,active) {
    const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
    const ux=dx/length,uy=dy/length,p=[a[0]+ux*26,a[1]+uy*26],q=[b[0]-ux*26,b[1]-uy*26];
    ctx.setLineDash(active?[]:[3,5]);
    line(ctx,[p,q],color,active?2:1);ctx.setLineDash([]);
    if(active)line(ctx,[[q[0]-ux*8+uy*4,q[1]-uy*8-ux*4],q,[q[0]-ux*8-uy*4,q[1]-uy*8+ux*4]],color,2);
  }
  function drawRoute() {
    const {ctx,width:w,height:h}=fit(routeCanvas);
    const a=[w*.17,h*.72],b=[w*.5,h*.22],c=[w*.83,h*.72];
    arrow(ctx,a,c,route==='direct'?'#d8acae':'#b4acb03a',route==='direct');
    arrow(ctx,a,b,route==='via'?'#a9ccc6':'#b4acb03a',route==='via');
    arrow(ctx,b,c,route==='via'?'#c8c9a1':'#b4acb03a',route==='via');
    [[a,'Matter','φ'],[b,'Local volume','ν'],[c,'Curvature','R']].forEach(([p,label,symbol],index)=>{
      ctx.fillStyle=colors[index];ctx.font='italic 29px Georgia';ctx.textAlign='center';ctx.fillText(symbol,p[0],p[1]+8);
      ctx.font='12px system-ui';ctx.fillStyle='#cfc5c1';ctx.fillText(label,p[0],p[1]+37);
    });
  }
  bindChoices('[data-route-choice]','routeChoice',choice=>{
    route=choice;
    document.querySelector('.route-exhibit').dataset.route=choice;
    const direct=choice==='direct';
    document.getElementById('route-title').textContent=direct?'Matter to curvature':'Matter to local volume to curvature';
    document.getElementById('route-description').textContent=direct
      ? 'The direct transition carries the common physical content from the matter description into the curvature description.'
      : 'Going through the local-volume description gives the same physical account on the common overlap. The intermediate clock does not add a new history.';
    routeCanvas.setAttribute('aria-label',direct?'Direct matter-to-curvature transition highlighted.':'Matter-to-local-volume-to-curvature transitions highlighted; the same physical content is preserved.');
    drawRoute();
  });
  new ResizeObserver(drawRoute).observe(routeCanvas);
  drawRoute();

  const links=[...document.querySelectorAll('.chapter-nav a')];
  const chapters=links.map(link=>document.querySelector(link.getAttribute('href')));
  const progress=document.getElementById('reading-progress');
  let scheduled=false;
  function updateProgress() {
    scheduled=false;
    let active=0;
    chapters.forEach((chapter,index)=>{if(chapter.getBoundingClientRect().top<=160)active=index;});
    links.forEach((link,index)=>index===active?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
    const start=chapters[0].offsetTop,end=document.getElementById('papers').offsetTop;
    progress.style.width=`${Math.max(0,Math.min(100,(window.scrollY-start)/(end-start)*100))}%`;
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
  addEventListener('resize',updateProgress);
  updateProgress();
})();
