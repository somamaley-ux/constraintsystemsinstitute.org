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
  if (!exhibit || !controls || buttons.length !== 3 || !label || !title || !description || !svgDescription) return;

  const stages = {
    pair: {
      label: '01 / Matching gauge identity',
      title: 'Two chiral parts. The same gauge identity.',
      description: 'The heavy fields N_L and N_R have opposite chirality, but the same Standard Model gauge representation: both are singlets. They also share B−L = −1. This matching of representations is what “vectorlike” means here.',
      diagram: 'The two heavy field types N_L and N_R are highlighted. They have left and right chirality, respectively, but both have Standard Model singlet representation (1, 1, 0) and B minus L charge minus one. Their later mass and mixing connections remain faintly visible for context.'
    },
    mass: {
      label: '02 / The direct mass pairing',
      title: 'A mass pairing the gauge symmetry allows.',
      description: 'Because the representations match, a direct Dirac mass term can pair N_L with N_R. This term itself needs no Higgs field. The pairing explains an allowed piece of the source architecture; it does not assign the heavy mass a numerical value.',
      diagram: 'A direct mass connection between N_L and N_R is highlighted, labeled minus N bar L times M_N times N_R plus its Hermitian conjugate. Matching gauge representations allow this operator without a Higgs field in the mass term itself.'
    },
    mixing: {
      label: '03 / Connection to the light sector',
      title: 'The light weak interface still matters.',
      description: 'The light weak interaction is chiral: it acts on the left-chiral lepton doublet. A Higgs/Yukawa coupling connects that doublet to N_R, and the full mass mixing links the light and heavy responses. A direct heavy mass and a Higgs-mediated connection coexist.',
      diagram: 'The full diagram is visible. A Higgs/Yukawa connection joins the chiral light lepton doublet L, containing nu_L and ell_L, to the heavy field N_R. The direct N_L to N_R mass pairing remains present. These curves indicate source operators, not particle paths.'
    }
  };
  if (buttons.some(button => !Object.hasOwn(stages, button.dataset.vlSelect))) return;

  function select(key) {
    const state = stages[key];
    if (!state) return;
    exhibit.dataset.vlStep = key;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.vlSelect === key)));
    label.textContent = state.label;
    title.textContent = state.title;
    description.textContent = state.description;
    svgDescription.textContent = state.diagram;
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

  select('pair');
  controls.hidden = false;
  document.documentElement.classList.add('vectorlike-ready');
})();
