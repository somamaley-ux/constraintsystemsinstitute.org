(() => {
  'use strict';
  const model = window.FoundationReuseModel;
  const record = document.getElementById('keep-the-record');
  const safe = document.getElementById('safe-set');
  if (!model || !record || !safe) return;
  const $ = id => document.getElementById(id);
  const ids = ['rl-record-context', 'rl-repeat', 'rl-record-heading', 'rl-record-result', 'rl-safe-count', 'rl-stage-caption', 'rl-safe-heading', 'rl-safe-result', 'rl-safe-next', 'rl-safe-reset', 'rl-challenge', 'rl-claim-heading', 'rl-claim-result'];
  if (ids.some(id => !$(id))) return;
  const modes = [...record.querySelectorAll('[data-rl-mode]')];
  const cards = [...record.querySelectorAll('[data-rl-record]')];
  const stages = [...safe.querySelectorAll('[data-rl-step]')];
  const stateCards = [...safe.querySelectorAll('[data-rl-state]')];
  const claims = [...safe.querySelectorAll('[data-rl-claim]')];
  if (modes.length !== 2 || cards.length !== 2 || stages.length !== 4 || stateCards.length !== 4 || claims.length !== 3) return;
  if (cards.some(card => !card.querySelector('.rl-test-record') || !card.querySelector('.rl-record-missing') || !card.querySelector('.rl-repeat-result')) || stateCards.some(card => !card.querySelector('.rl-state-status') || !card.querySelector('.rl-state-reason'))) return;
  let mode = 'badge', repeated = false, step = 0;
  const layers = model.safeLayers();
  function renderRecord() {
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rlMode === mode)));
    cards.forEach(card => {
      card.querySelector('.rl-test-record').hidden = mode === 'badge';
      card.querySelector('.rl-record-missing').hidden = mode !== 'badge';
      card.querySelector('.rl-repeat-result').hidden = !repeated;
    });
    $('rl-repeat').textContent = repeated ? 'Show before the repeat' : mode === 'badge' ? 'Reveal the repeat results' : 'Run the repeat test';
    $('rl-record-context').textContent = mode === 'badge' ? 'Both badges say “Pass now.” The information about repeat use has been left out.' : 'The records keep both facts: the first test and what happens on the stated repeat.';
    $('rl-record-heading').textContent = repeated ? 'Same pass badge. Different next result.' : mode === 'badge' ? 'The badges match. Is that all we need?' : 'Now the difference is in view.';
    $('rl-record-result').textContent = repeated ? (mode === 'badge' ? 'Bridge A passes again; Bridge B fails. The revealed repeat-test results add information that the two pass badges did not contain.' : 'Bridge A passes again; Bridge B fails. The retained records distinguish them, even though both passed the first test.') : mode === 'badge' ? 'Reveal the repeat results to see what the shared badge leaves out.' : 'Bridge A is stable under repeat. Bridge B is vulnerable to it. Keeping the record preserves information the next use needs.';
  }
  const stageCopy = [
    ['4 candidates', 'Start with all four configurations.', 'First, fix the test and the next steps.', 'We will test the same stated load. Each bridge card gives its next step. These conditions stay fixed while we find the answer.', 'Check the current test'],
    ['3 pass now', 'The failed configuration is excluded.', 'A current pass is only the first check.', 'Stable, vulnerable and repaired bridges pass the current test. The failed bridge does not. Next, follow the stated next steps of the three survivors.', 'Follow the next steps'],
    ['2 keep passing', 'The vulnerable bridge fails on repeat.', 'One current pass does not survive reuse.', 'The vulnerable bridge leads to a failed configuration, so it is excluded too. The stable and repaired bridges each repeat successfully.', 'Check the survivors again'],
    ['2 remain', 'Checking again changes nothing.', 'Both survivors keep passing.', 'Repeating the test takes each surviving bridge back to a passing configuration. Nothing else must be removed, and both safe bridges are included.', 'All steps checked']
  ];
  function clearClaim() {
    claims.forEach(button => button.setAttribute('aria-pressed', 'false'));
    stateCards.forEach(card => { delete card.dataset.claim; });
    safe.querySelectorAll('[data-rl-roster]').forEach(item => {
      delete item.dataset.included;
      delete item.dataset.problem;
      item.textContent = model.states.find(state => state.id === item.dataset.rlRoster).name;
    });
    $('rl-claim-heading').textContent = 'Which answer includes every safe bridge?';
    $('rl-claim-result').textContent = 'Choose a proposed answer. It must leave out the unsafe bridge and keep both safe ones.';
  }
  function renderSafe() {
    const [count, caption, heading, result, next] = stageCopy[step];
    $('rl-safe-count').textContent = count;
    $('rl-stage-caption').textContent = caption;
    $('rl-safe-heading').textContent = heading;
    $('rl-safe-result').textContent = result;
    $('rl-safe-next').textContent = next;
    $('rl-safe-next').disabled = step === 3;
    stages.forEach(button => {
      if (Number(button.dataset.rlStep) === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    stateCards.forEach(card => {
      const id = card.dataset.rlState;
      const kept = layers[step].includes(id);
      if (step === 0) delete card.dataset.kept;
      else card.dataset.kept = String(kept);
      card.querySelector('.rl-state-status').textContent = step === 0 ? 'Not checked yet' : kept ? (step === 1 ? 'Passes this check' : 'Kept in the safe set') : 'Excluded from the safe set';
      card.querySelector('.rl-state-reason').textContent = step === 0 ? 'Its stated test and next step are shown above.' : !kept ? (id === 'f' ? 'Fails the current test. A later repair is a new configuration.' : 'Repeat → failed bridge. This starting point does not keep passing.') : step === 1 ? 'Still needs the next-step check.' : 'Repeat → passes again. The same is true on every repeat.';
    });
    $('rl-challenge').hidden = step < 3;
    clearClaim();
  }
  const proposed = { extra: ['s', 't', 'r'], little: ['s'], complete: ['s', 'r'] };
  const claimCopy = {
    surplus: ['One bridge should not be included.', 'The vulnerable bridge passes now but fails on repeat. Including it makes this proposed safe set too large.'],
    omission: ['A safe bridge has been left out.', 'The stable bridge is safe, but so is the repaired bridge. Keeping only the stable one gives a sound partial answer, not the complete set.'],
    complete: ['Complete: both safe bridges, and no unsafe ones.', 'The stable and repaired bridges both keep passing. Neither is left out, and the vulnerable bridge is excluded. One complete set has two members.']
  };
  modes.forEach(button => button.addEventListener('click', () => { mode = button.dataset.rlMode; repeated = false; renderRecord(); }));
  $('rl-repeat').addEventListener('click', () => { repeated = !repeated; renderRecord(); });
  stages.forEach(button => button.addEventListener('click', () => { step = Number(button.dataset.rlStep); renderSafe(); }));
  $('rl-safe-next').addEventListener('click', () => { step = Math.min(3, step + 1); renderSafe(); });
  $('rl-safe-reset').addEventListener('click', () => { step = 0; renderSafe(); });
  claims.forEach(button => button.addEventListener('click', () => {
    const members = proposed[button.dataset.rlClaim];
    const result = model.classifyClaim(members);
    claims.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const [heading, text] = claimCopy[result.kind];
    $('rl-claim-heading').textContent = heading;
    $('rl-claim-result').textContent = text;
    stateCards.forEach(card => {
      const id = card.dataset.rlState;
      if (result.surplus.includes(id)) card.dataset.claim = 'surplus';
      else if (result.omitted.includes(id)) card.dataset.claim = 'omitted';
      else delete card.dataset.claim;
    });
    safe.querySelectorAll('[data-rl-roster]').forEach(item => {
      const id = item.dataset.rlRoster;
      item.dataset.included = String(members.includes(id));
      const problem = result.surplus.includes(id) ? 'surplus' : result.omitted.includes(id) ? 'omitted' : '';
      if (problem) item.dataset.problem = problem; else delete item.dataset.problem;
      const state = model.states.find(candidate => candidate.id === id);
      item.textContent = `${members.includes(id) ? 'Included' : 'Left out'}: ${state.name.toLowerCase()}`;
    });
  }));
  renderRecord();
  renderSafe();
  document.documentElement.classList.add('reuse-lab-ready');
})();
