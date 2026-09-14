(() => {
  'use strict';
  const section = document.getElementById('vectorlike');
  if (!section) return;
  const exhibit = section.querySelector('.vl-exhibit');
  const controls = section.querySelector('.vl-controls');
  const buttons = [...section.querySelectorAll('[data-vl-select]')];
  const label = document.getElementById('vl-stage-label');
  const title = document.getElementById('vl-step-title');
  const description = document.getElementById('vl-step-description');
  const svgDescription = document.getElementById('vl-svg-description');
  const nextButton = document.getElementById('vl-next');
  const nextLabel = document.getElementById('vl-next-label');
  const continueLink = document.getElementById('vl-continue');
  const massLayer = section.querySelector('.vl-layer-mass');
  const mixingLayer = section.querySelector('.vl-layer-mixing');
  if (!exhibit || !controls || buttons.length !== 3 || !label || !title || !description || !svgDescription || !nextButton || !nextLabel || !continueLink || !massLayer || !mixingLayer) return;

  const order = ['pair', 'mass', 'mixing'];
  const stages = {
    pair: {
      label: 'Step 1 of 3 / The two parts',
      title: 'Their gauge charges match.',
      description: 'These are the left- and right-chiral components of the heavy field. Both carry the same gauge charges. That match is the defining vectorlike feature.',
      next: 'Add the mass pairing',
      diagram: 'Only the two heavy components are shown. One is left-chiral and the other is right-chiral. Both boxes have matching gauge charges. No mass pairing or light-sector connection is displayed yet.'
    },
    mass: {
      label: 'Step 2 of 3 / Mass pairing added',
      title: 'A direct mass term is allowed.',
      description: 'Matching gauge charges allow the two components to pair in a Dirac mass term. The new gold connection shows that pairing. This term itself needs no Higgs field.',
      next: 'Connect the light sector',
      diagram: 'A gold connection has been added between the two matching heavy components, labeled mass pairing allowed directly. The light sector has not yet been added. A Higgs field is not required in this direct mass term.'
    },
    mixing: {
      label: 'Step 3 of 3 / Light connection added',
      title: 'The light and heavy sectors can mix.',
      description: 'The purple Higgs/Yukawa connection joins the right-chiral heavy component to the left-chiral light lepton doublet. The complete mass map links the light and heavy responses.',
      next: 'Replay these three steps',
      diagram: 'The completed diagram adds a purple Higgs/Yukawa connection from the right-chiral heavy component to the light weak sector. The gold direct mass pairing remains present. Field types and permitted couplings are shown, not particle paths or a count of heavy states.'
    }
  };
  if (buttons.some(button => !Object.hasOwn(stages, button.dataset.vlSelect))) return;
  let current = 'pair';

  function select(key, interacted = true) {
    const state = stages[key];
    if (!state) return;
    current = key;
    exhibit.dataset.vlStep = key;
    if (interacted) exhibit.dataset.vlInteracted = 'true';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.vlSelect === key)));
    label.textContent = state.label;
    title.textContent = state.title;
    description.textContent = state.description;
    svgDescription.textContent = state.diagram;
    nextLabel.textContent = state.next;
    massLayer.setAttribute('aria-hidden', String(key === 'pair'));
    mixingLayer.setAttribute('aria-hidden', String(key !== 'mixing'));
    continueLink.hidden = key !== 'mixing';
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(button.dataset.vlSelect));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      select(buttons[next].dataset.vlSelect);
    });
  });
  nextButton.addEventListener('click', () => select(order[(order.indexOf(current) + 1) % order.length]));

  select('pair', false);
  controls.hidden = false;
  nextButton.hidden = false;
  document.documentElement.classList.add('vectorlike-ready');
})();
