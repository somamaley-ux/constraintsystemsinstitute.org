(() => {
  'use strict';
  const root = document.querySelector('[data-pr-route]');
  if (!root) return;

  const shared = {
    title: 'Before the numbers, keep track of the physical events.',
    copy: 'A clock can tick twice. The readings differ, but we must still identify the same clock and the two distinct events. Any comparison or later use must retain those identities and what actually occurred. AASC begins with the structure that makes this possible.',
    added: 'Shared foundation: admissibility, standing, reference and irreversibility. Numerical distance, elapsed time and the equations of a particular physical branch have not yet been supplied.',
    equation: 'Same clock · distinct events',
    caption: 'The same clock remains identifiable across two distinct ticks.',
    visual: 'foundation'
  };
  const branches = {
    sr: {
      name: 'Special relativity', source: '#sr-paper', sourceLabel: 'Special relativity: manuscript and scope',
      scope: 'The necessary Kernel of physical objecthood and its Lorentzian realization are distinct parts of the argument. The reconstruction retains the manuscript’s dimensional, homogeneity, completion and actual-device conditions. Completed finite isotropic propagation supplies the Lorentz cone; common physical clock calibration supplies the Lorentz comparison law. The shared Kernel alone is not a numerical metric, a choice of units or a spacetime-dimension calculation.',
      stages: [shared, {
        title: 'Build the comparison before its coordinates.',
        copy: 'Start with physical comparison operations. On their completed physical space, finite propagation with no preferred spatial direction supplies a causal cone. The paper then uses a common clock calibration to recover the Lorentz comparison law. Space and time readings express the structure obtained through those steps.',
        added: 'This branch adds completed comparison and finite isotropic propagation, then common physical clock calibration. These are the steps connecting the premetric construction to Lorentzian measurements.',
        equation: 'Comparison → causal cone → calibration', caption: 'A finite, direction-independent propagation limit supplies the cone. Clock calibration fixes the comparison law.', visual: 'sr-build'
      }, {
        title: 'Different readings. The same spacetime interval.',
        copy: 'Observers in relative motion can assign different distances and times to the same pair of events. The Lorentz transformation relates their readings while preserving the spacetime interval. The familiar formalism appears as a faithful way to express the established physical structure.',
        added: 'Recovered description: Lorentzian event comparison in the paper’s special-relativity realization. The value assigned to c also depends on the chosen units.',
        equation: 'c²Δt² − Δx² − Δy² − Δz²', caption: 'Two coordinate frames retain one invariant interval between the same events.', visual: 'sr-form'
      }]
    },
    gr: {
      name: 'General relativity', source: '../gravity-quantum/#gravity', sourceLabel: 'Follow the general-relativity construction',
      scope: 'The Einstein result works in a faithful four-dimensional Lorentzian description with a local symmetric first-curvature response and consistent source accounting. Its minimal form does not fix every numerical constant or include every richer gravitational response. An independently constructed vacuum baseline and an occupied laboratory source are different physical targets; choosing this branch does not identify them.',
      stages: [shared, {
        title: 'Connect matter with spacetime geometry.',
        copy: 'The physical source carries energy and momentum. AASC asks how spacetime geometry can respond while keeping that source account consistent. In the stated setting, this fixes the simplest local curvature response.',
        added: 'This step uses four-dimensional Lorentzian spacetime and the specified local response. The metric must describe the same physical source.',
        equation: 'Curvature response ↔ attached source', caption: 'The geometric response and the physical source must refer to one specified construction.', visual: 'gr-build'
      }, {
        title: 'The Einstein equation is recovered in that branch.',
        copy: 'Requiring the minimal curvature response to preserve the source account fixes the familiar Einstein form. Geometry and matter are no longer two independently invented sides of an equation: the description has to retain the source it represents.',
        added: 'Recovered description: the minimal Einstein response. Its numerical constants still need the appropriate scale and calibration anchors.',
        equation: 'Gμν + Λgμν = κTμν', caption: 'Spacetime response and source are the two sides of the same represented account.', visual: 'gr-form'
      }]
    },
    qm: {
      name: 'Quantum dynamics', source: '../gravity-quantum/#quantum', sourceLabel: 'Follow the quantum-dynamics construction',
      scope: 'The current Schrödinger route uses the generic quantum-standing construction exported by WDW 9. Its spatial Hilbert representation, operator domains, continuity, self-adjoint realization and scale anchors are established separately. The minimal target is a closed scalar nonrelativistic system. This route does not turn the rank-one Wheeler–DeWitt example into arbitrary wave mechanics or supply measurement collapse.',
      stages: [shared, {
        title: 'Make state comparison and change consistent.',
        copy: 'Quantum standing first supplies meaningful state identity, transition comparisons and continuation. A faithful Hilbert-space representation then expresses that structure. The spatial branch establishes the operators and domains needed to describe a closed scalar system.',
        added: 'This branch adds a faithful spatial quantum representation and its operator requirements, followed by the minimal kinetic-and-potential response.',
        equation: 'States → faithful representation → evolution', caption: 'The represented states and their continuation must preserve the underlying comparisons.', visual: 'qm-build'
      }, {
        title: 'The familiar Schrödinger evolution follows.',
        copy: 'Within the closed scalar nonrelativistic branch, the minimal spatial response takes the familiar kinetic-plus-potential Hamiltonian form. Once its physical scales are fixed, the result is Schrödinger evolution.',
        added: 'Recovered description: closed-system quantum evolution. Schrödinger’s equation contains no collapse mechanism; measurement and physical records have their own construction.',
        equation: 'iℏ ∂ψ/∂t = Hψ', caption: 'A schematic of changing quantum description, not calculated wavefunction data.', visual: 'qm-form'
      }]
    },
    sm: {
      name: 'Matter and interactions', source: '../standard-model/#physical', sourceLabel: 'Follow the Standard Model construction',
      scope: 'The Standard Model arc retains distinct fermionic, gauge and Higgs response roles over a common source. CSP-P constructs source-qualified physical electroweak, color/composite and Einstein-response operations; CSP-R preserves that realization in its bearer reconstruction. Its state, joint parameters, operation domains and quantum-action order remain attached. The separately specified classical construction is not the same complete target. Structural reconstruction does not by itself assign every numerical parameter.',
      stages: [shared, {
        title: 'Distinguish what a common bearer can do.',
        copy: 'The physical starting point is persistence: something retains its identity while admitting different responses. Transport, handedness, charge and Higgs mediation are distinguished by those responses, while the construction keeps the shared physical inputs that connect them.',
        added: 'This branch adds the actual carrier, response and source constructions. Distinct response roles remain distinct even though they share a bearer.',
        equation: 'Persistence → differentiated responses', caption: 'Several response branches retain their attachment to the common physical source.', visual: 'sm-build'
      }, {
        title: 'Recover the structure of matter and its interactions.',
        copy: 'The fermionic and bosonic constructions combine into the Standard Model carrier–response structure. Their physical realization preserves matter, electroweak and color responses together with the source-dependent Einstein action on one occupied source.',
        added: 'Recovered description: the source-qualified Standard Model structure and its shared Einstein response. The same state, parameters and admitted operations remain attached.',
        equation: 'Persistence → response → realization', caption: 'Matter, gauge and Higgs responses keep the same source in the physical realization.', visual: 'sm-form'
      }]
    }
  };

  const line = (d, cls = '') => `<path class="pr-route-line ${cls}" d="${d}"/>`;
  const node = (x, y, r = 9, cls = '') => `<circle class="pr-route-node ${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
  const core = (x, y, r = 14) => `<circle class="pr-route-core" cx="${x}" cy="${y}" r="${r}"/>`;
  const grids = () => [50, 90, 130, 170].map(y => line(`M35 ${y} H285`, 'pr-route-faint')).join('') + [60, 110, 160, 210, 260].map(x => line(`M${x} 28 V182`, 'pr-route-faint')).join('');
  const visuals = {
    foundation: () => '<circle class="pr-route-line pr-route-sage" cx="86" cy="105" r="38"/>' + line('M86 78 V105 L108 117', 'pr-route-sage') + line('M125 105 L235 55 M125 105 L235 155 M235 55 V155', 'pr-route-faint') + core(235,55,12) + core(235,155,12) + line('M249 72 V139 M243 131 L249 139 L255 131'),
    'sr-build': () => '<path class="pr-route-area" d="M160 105 L70 35 L250 35 Z M160 105 L70 175 L250 175 Z"/>' + line('M160 20 V190 M35 105 H285', 'pr-route-faint') + line('M70 35 L250 175 M250 35 L70 175', 'pr-route-sage') + core(160,105,8),
    'sr-form': () => grids() + line('M66 170 L110 30 M66 170 L280 115', 'pr-route-sage') + line('M105 143 L215 67') + line('M105 143 V67 H215', 'pr-route-faint') + core(105,143,11) + core(215,67,11),
    'gr-build': () => [42,77,112,147,182].map(y=>line(`M30 ${y} Q100 ${y-27} 163 ${y}`, 'pr-route-faint')).join('') + [42,78,114,150].map(x=>line(`M${x} 30 Q${x+29} 108 ${x} 185`)).join('') + line('M185 92 H230 M185 122 H230', 'pr-route-sage') + core(268,107,25) + node(256,103,5) + node(274,98,5) + node(272,116,5),
    'gr-form': () => [40,75,110,145,180].map(y=>line(`M25 ${y} C105 ${y-20} 103 ${y+20} 158 ${y}`)).join('') + [40,75,110,145].map(x=>line(`M${x} 28 Q${x+25} 106 ${x} 185`,'pr-route-faint')).join('') + line('M180 98 H221 M180 116 H221','pr-route-sage') + core(270,107,28) + node(259,99,5) + node(280,99,5) + node(269,119,5),
    'qm-build': () => '<ellipse class="pr-route-line pr-route-faint" cx="160" cy="107" rx="112" ry="60"/>' + line('M74 142 Q130 24 235 72 M235 72 Q260 155 161 165','pr-route-sage') + node(74,142,10) + node(235,72,10) + node(161,165,10) + core(161,107,9) + line('M161 107 L74 142 M161 107 L235 72 M161 107 V165','pr-route-faint'),
    'qm-form': () => line('M24 158 H296','pr-route-faint') + line('M24 154 C65 154 56 45 102 45 S129 154 176 154 M24 154 H296') + line('M94 154 C127 154 131 64 178 64 S215 154 296 154','pr-route-sage') + line('M140 35 H197 M188 29 L197 35 L188 41','pr-route-sage'),
    'sm-build': () => line('M160 170 V115 M160 115 L55 48 M160 115 L125 48 M160 115 L195 48 M160 115 L265 48','pr-route-sage') + [55,125,195,265].map(x=>node(x,48,13)).join('') + core(160,170,18) + node(160,115,7),
    'sm-form': () => line('M160 170 L67 102 M160 170 V102 M160 170 L253 102 M67 102 L40 40 M67 102 L94 40 M160 102 L132 40 M160 102 L188 40 M253 102 L226 40 M253 102 L280 40','pr-route-sage') + [67,160,253].map(x=>node(x,102,15)).join('') + [40,94,132,188,226,280].map(x=>node(x,40,8)).join('') + core(160,170,19) + line('M67 102 Q160 55 253 102','pr-route-faint')
  };

  const get = name => root.querySelector(`[data-pr-route-${name}]`);
  const ui = {
    controls: get('controls'), panel: get('panel'), fallback: get('fallback'),
    label: get('label'), title: get('title'), copy: get('copy'), added: get('added'),
    graphic: get('graphic'), equation: get('equation'), caption: get('caption'),
    scope: get('scope'), source: get('source'), status: get('status'), back: get('back'), forward: get('forward')
  };
  if (Object.values(ui).some(element => !element)) return;
  const choiceButtons = [...root.querySelectorAll('[data-pr-route-choice]')];
  const stepButtons = [...root.querySelectorAll('[data-pr-route-step]')];
  let branchKey = 'sr';
  let stageIndex = 2;
  const stageNames = ['Shared premetric foundation', 'Physical construction', 'Familiar form'];

  function render(announce = true) {
    const branch = branches[branchKey];
    const stage = branch.stages[stageIndex];
    choiceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.prRouteChoice === branchKey)));
    stepButtons.forEach(button => {
      if (Number(button.dataset.prRouteStep) === stageIndex) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    ui.label.textContent = `${branch.name} / ${stageNames[stageIndex]}`;
    ui.title.textContent = stage.title;
    ui.copy.textContent = stage.copy;
    ui.added.textContent = stage.added;
    ui.graphic.innerHTML = `<svg viewBox="0 0 320 210" role="img" aria-label="${stage.caption}">${visuals[stage.visual]()}</svg>`;
    ui.equation.textContent = stage.equation;
    ui.caption.textContent = stage.caption;
    ui.scope.textContent = branch.scope;
    ui.source.textContent = branch.sourceLabel;
    ui.source.setAttribute('href', branch.source);
    ui.back.disabled = stageIndex === 0;
    ui.forward.disabled = stageIndex === 2;
    if (announce) ui.status.textContent = `${branch.name}. Step ${stageIndex + 1} of 3: ${stageNames[stageIndex]}. ${stage.title}`;
  }

  choiceButtons.forEach(button => button.addEventListener('click', () => {
    if (!branches[button.dataset.prRouteChoice]) return;
    branchKey = button.dataset.prRouteChoice;
    stageIndex = 2;
    render();
  }));
  stepButtons.forEach(button => button.addEventListener('click', () => {
    const nextStage = Number(button.dataset.prRouteStep);
    if (!Number.isInteger(nextStage) || nextStage < 0 || nextStage > 2) return;
    stageIndex = nextStage;
    render();
  }));
  ui.back.addEventListener('click', () => { stageIndex = Math.max(0, stageIndex - 1); render(); });
  ui.forward.addEventListener('click', () => { stageIndex = Math.min(2, stageIndex + 1); render(); });
  render(false);
  ui.controls.hidden = false;
  ui.panel.hidden = false;
  ui.fallback.hidden = true;
  root.dataset.prRouteReady = 'true';
})();
