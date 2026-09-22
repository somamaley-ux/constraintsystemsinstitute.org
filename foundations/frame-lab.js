(() => {
  'use strict';
  const model = window.FoundationFrameModel;
  const section = document.getElementById('what-stays');
  if (!model || !section) return;
  const $ = id => document.getElementById(id);
  const required = ['fr-beta','fr-speed','fr-heading','fr-result','fr-time','fr-position','fr-proper','fr-interval','fr-moving-grid','fr-time-axis','fr-space-axis','fr-time-label','fr-space-label','fr-chart-description','fr-live-equation'];
  if (required.some(id => !$(id))) return;
  const presets = [...section.querySelectorAll('[data-fr-beta]')];
  if (presets.length !== 3) return;
  const x0=320, y0=378, scale=48;
  const bounds={left:(62-x0)/scale,right:(578-x0)/scale,bottom:(y0-424)/scale,top:(y0-34)/scale};
  const pixel = ({ct,x}) => ({x:x0+scale*x,y:y0-scale*ct});
  const path = (a,b) => {const p=pixel(a),q=pixel(b);return `M${p.x.toFixed(3)} ${p.y.toFixed(3)}L${q.x.toFixed(3)} ${q.y.toFixed(3)}`;};
  const format = value => (Math.abs(value)<0.0005?0:value).toFixed(2);
  function axisEnd(x,ct,direction=1) {
    const dx=x*direction, dt=ct*direction;
    const tx=dx>0?bounds.right/dx:dx<0?bounds.left/dx:Infinity;
    const tt=dt>0?bounds.top/dt:dt<0?bounds.bottom/dt:Infinity;
    const distance=Math.min(tx,tt);
    return {x:distance*dx,ct:distance*dt};
  }
  function draw(beta) {
    const lines=[];
    for(let n=-16;n<=16;n++) {
      if(n===0) continue;
      const spaceA=model.boost({ct:-16,x:n},-beta),spaceB=model.boost({ct:16,x:n},-beta);
      const timeA=model.boost({ct:n,x:-16},-beta),timeB=model.boost({ct:n,x:16},-beta);
      lines.push(`<path class="fr-space-grid" d="${path(spaceA,spaceB)}"/><path class="fr-time-grid" d="${path(timeA,timeB)}"/>`);
    }
    $('fr-moving-grid').innerHTML=lines.join('');
    const timeEnd=axisEnd(beta,1), spaceEnd=axisEnd(1,beta);
    $('fr-time-axis').setAttribute('d',path(axisEnd(beta,1,-1),timeEnd));
    $('fr-space-axis').setAttribute('d',path(axisEnd(1,beta,-1),spaceEnd));
    const t=pixel(timeEnd), x=pixel(spaceEnd);
    $('fr-time-label').setAttribute('x',String(t.x+(beta>0.35?-17:17)));
    $('fr-time-label').setAttribute('y',String(t.y+25));
    $('fr-time-label').setAttribute('text-anchor',beta>0.35?'end':'start');
    $('fr-space-label').setAttribute('x',String(Math.min(596,x.x+15)));
    $('fr-space-label').setAttribute('y',String(Math.min(443,x.y+9)));
  }
  function render() {
    const beta=Number($('fr-beta').value), state=model.watch(beta), percent=Math.round(Math.abs(beta)*100);
    const direction=beta>0?'right':'left';
    const description=beta===0?'At rest with the watch':`${percent}% of light speed ${direction}`;
    $('fr-speed').textContent=description;
    $('fr-beta').setAttribute('aria-valuetext',description);
    presets.forEach(button=>button.setAttribute('aria-pressed',String(Math.abs(Number(button.dataset.frBeta)-beta)<0.00001)));
    $('fr-time').textContent=format(state.delta.ct);
    $('fr-position').textContent=format(state.delta.x);
    $('fr-proper').textContent=format(state.properTime);
    $('fr-interval').textContent=format(state.interval);
    $('fr-heading').textContent=beta===0?'With the watch, both readings happen in one place.':'The coordinates change. The watch still records four seconds.';
    $('fr-result').textContent=beta===0?'In this frame, the second reading is 4.00 seconds later at the same position. Choose a moving frame to change the coordinates assigned to these same two events.':`In the selected frame, the second reading is ${format(state.delta.ct)} seconds later and ${format(Math.abs(state.delta.x))} light-seconds to the ${beta>0?'left':'right'} of the first. The watch itself still records 4.00 seconds.`;
    $('fr-live-equation').textContent=`(${format(state.delta.ct)})² − (${format(state.delta.x)})² ≈ ${format(state.interval)} light-seconds². The displayed coordinates are rounded; the calculation uses their full precision.`;
    $('fr-chart-description').textContent=`The same two watch events remain at fixed positions in this diagram. The selected frame is ${beta===0?'at rest with the watch':`moving ${description.toLowerCase()}`}. Its time coordinate difference is ${format(state.delta.ct)} seconds and its position coordinate difference is ${format(state.delta.x)} light-seconds. The watch records four seconds.`;
    draw(beta);
  }
  $('fr-beta').addEventListener('input',render);
  presets.forEach(button=>button.addEventListener('click',()=>{$('fr-beta').value=button.dataset.frBeta;render();}));
  render();
  document.documentElement.classList.add('frame-lab-ready');
})();
