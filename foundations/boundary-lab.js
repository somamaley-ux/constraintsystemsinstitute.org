(() => {
  'use strict';
  const lab = document.getElementById('boundary-lab');
  if (!lab || lab.classList.contains('bdy-ready')) return;

  const buttons = [...lab.querySelectorAll('[data-boundary-step-button]')];
  const panels = [...lab.querySelectorAll('[data-boundary-panel]')];
  const first = lab.querySelector('[data-boundary-world="first"]');
  const second = lab.querySelector('[data-boundary-world="second"]');
  const title = lab.querySelector('#boundary-lab-feedback-title');
  const explanation = lab.querySelector('#boundary-lab-feedback-copy');
  const firstNote = first?.querySelector('.bdy-world-note');
  const story = lab.querySelector('#boundary-lab-story');
  const evidence = lab.querySelector('.bdy-evidence');
  const newRecord = lab.querySelector('[data-boundary-panel="new"]');
  const caption = lab.querySelector('.bdy-worlds-caption');
  const secondNote = second?.querySelector('.bdy-world-note');
  if (buttons.length !== 3 || panels.length !== 3 || !first || !second || !title || !explanation || !firstNote || !secondNote || !story || !evidence || !newRecord || !caption) return;

  const stages = {
    loose: {
      title: 'The same note fits two different histories.',
      copy: 'A loose “PASS” note does not identify which battery passed the original test. It could have come from either situation below.',
      panels: ['loose']
    },
    record: {
      title: 'The attached record identifies the original result.',
      copy: 'The original test record connects PASS to battery A and FAIL to battery B. It identifies the first situation. The record reveals the connection; it does not create the original result.',
      panels: ['record']
    },
    new: {
      title: 'Battery B passes a new test. The old result stays.',
      copy: 'After recharging, battery B passes a new trial. That is a new result about B under new conditions. The original record still says A passed and B failed.',
      panels: ['record', 'new']
    }
  };

  function render(stage) {
    const state = stages[stage];
    if (!state) return;
    lab.dataset.boundaryStage = stage;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.boundaryStepButton === stage)));
    panels.forEach(panel => { panel.hidden = !state.panels.includes(panel.dataset.boundaryPanel); });
    // Put the new trial next to its explanation, while retaining the original record.
    if (stage === 'new') { evidence.prepend(newRecord); story.prepend(evidence); }
    else { evidence.append(newRecord); story.append(evidence); }
    caption.textContent = stage === 'loose' ? 'Two possible original situations · the loose note fits both' : stage === 'record' ? 'The original record identifies possibility 1.' : 'The original situations remain distinct. A new trial does not rewrite them.';
    title.textContent = state.title;
    explanation.textContent = state.copy;
    const originalKnown = stage !== 'loose';
    first.classList.toggle('bdy-original-known', originalKnown);
    second.classList.toggle('bdy-alternative', originalKnown);
    firstNote.textContent = originalKnown ? 'Identified by the original record.' : 'Fits the loose note.';
    secondNote.textContent = originalKnown ? 'Not this original history.' : 'Also fits the loose note.';
  }

  buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.boundaryStepButton)));
  render('loose');
  lab.classList.add('bdy-ready');
})();
