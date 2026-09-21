(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const lab = $('history-lab');
  if (!lab) return;
  const buttons = [...lab.querySelectorAll('[data-ht-select]')];
  const controls = lab.querySelector('.ht-controls');
  const required = ['ht-trial-label','ht-evidence-label','ht-bridge','ht-scene-caption','ht-step-label','ht-result-title','ht-result-copy','ht-next','ht-next-label','ht-original-answer','ht-original-note','ht-later-answer','ht-later-note'];
  if (buttons.length !== 3 || !controls || required.some(id => !$(id))) return;
  const order = ['claim','record','repair'];
  const states = {
    claim: {trial:'Trial 1 · first report',tag:'Unchecked claim',caption:'A report says the car crossed without help. We have not checked its recording.',label:'Step 1 of 3 / A claim to check',title:'The report says “passed.”',copy:'The claim is about this bridge, this car and this trial. Reading “passed” does not yet tell us whether the no-extra-support condition was met. Open the recording to check.',next:'Open the recording',original:'Report not yet checked',originalNote:'The event has happened; our account is unverified.',later:'No second trial yet',laterNote:'First, check the original recording.',aria:'The original test recording is covered by an unchecked report claiming an unassisted crossing.'},
    record: {trial:'Trial 1 · recording opened',tag:'Evidence checked',caption:'The recording reveals a prop under the bridge. Extra support was used.',label:'Step 2 of 3 / Check the conditions',title:'It crossed—with extra help.',copy:'The recording shows a prop under the bridge. Trial 1 did not meet the stated condition. Checking the evidence corrects our report; it does not change what happened.',next:'Repair and run Trial 2',original:'Extra support was used',originalNote:'The recording corrects the original report.',later:'No second trial yet',laterNote:'A repair would lead to a new test.',aria:'The first toy-bridge trial used a visible extra support under the bridge, so it did not meet the unassisted-crossing condition.'},
    repair: {trial:'Trial 2 · after repair',tag:'New test',caption:'The repaired bridge passes a new trial without extra support.',label:'Step 3 of 3 / A new trial',title:'Now it passes. Trial 1 stays on record.',copy:'After repair, the bridge carries the car without extra support. Trial 2 passes. That new success belongs to the new trial; it does not turn Trial 1 into an unassisted crossing.',next:'Replay from the first report',original:'Extra support was used',originalNote:'The first trial remains the first trial.',later:'Passed without support',laterNote:'A new test, with its own result.',aria:'A repaired toy bridge carries a car without the extra support used in the first trial.'}
  };
  let selected = 'claim';
  function select(key) {
    const s = states[key]; if (!s) return;
    selected = key; lab.dataset.htStage = key;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.htSelect === key)));
    const values = {'ht-trial-label':s.trial,'ht-evidence-label':s.tag,'ht-scene-caption':s.caption,'ht-step-label':s.label,'ht-result-title':s.title,'ht-result-copy':s.copy,'ht-next-label':s.next,'ht-original-answer':s.original,'ht-original-note':s.originalNote,'ht-later-answer':s.later,'ht-later-note':s.laterNote};
    Object.entries(values).forEach(([id,value]) => {$(id).textContent = value;});
    $('ht-bridge').setAttribute('aria-label',s.aria);
  }
  buttons.forEach((b,i) => {
    b.addEventListener('click',() => select(b.dataset.htSelect));
    b.addEventListener('keydown', e => {
      const direction = {ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : direction ? (i + direction + 3) % 3 : null;
      if (index === null) return;
      e.preventDefault();buttons[index].focus();select(order[index]);
    });
  });
  $('ht-next').addEventListener('click',() => select(order[(order.indexOf(selected)+1)%3]));
  select('claim');controls.hidden=false;$('ht-next').hidden=false;
  document.documentElement.classList.add('history-lab-ready');
})();
