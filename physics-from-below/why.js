(() => {
  'use strict';
  const analogy = document.querySelector('[data-pr-analogy]');
  if (analogy) {
    const choices = [...analogy.querySelectorAll('[data-pr-analogy-step]')];
    const roots = [...analogy.querySelectorAll('[data-pr-analogy-root]')];
    function showReference(index, announce = true) {
      choices.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
      roots.forEach(element => { element.hidden = index === 0; });
      analogy.dataset.prAnalogyStage = index;
      const caption = analogy.querySelector('[data-pr-analogy-caption]');
      const message = index === 0
        ? 'Two words differ in language; GR and QM differ in their ontological descriptions. Their forms alone do not show what connects each pair.'
        : 'Words point to one semantic concept. By analogy, AASC seeks what GR and QM describe in shared physical reality. That physical connection still requires a common-source construction.';
      caption.innerHTML = message + '<small>The semantic concept is not the physical source. This analogy motivates the question; identifying a common source and its compatible evolution requires the scientific constructions below.</small>';
      if (announce) analogy.querySelector('[data-pr-analogy-status]').textContent = message;
    }
    choices.forEach((button,index) => {
      button.addEventListener('click', () => showReference(index));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1-index;
        choices[next].focus(); showReference(next);
      });
    });
    showReference(1, false);
    analogy.dataset.prAnalogyReady = 'true';
    analogy.querySelector('[data-pr-analogy-controls]').hidden = false;
  }
  const root = document.querySelector('[data-pr-source]');
  if (!root) return;
  const q = name => root.querySelector(`[data-pr-source-${name}]`);
  const buttons = [...root.querySelectorAll('[data-pr-source-step]')];
  const stages = [
    {
      label: 'Demand 1 of 3 / Necessary foundation',
      title: 'Same requirements. Not yet the same source.',
      copy: 'Two different physical systems both have definite identity, actual relations and admitted changes. Meeting those requirements does not identify one with the other.',
      origin: '<span>The shared requirements</span><strong>Reference · Standing<br>Admissibility · Irreversibility</strong><p>Every determinate physical system incurs these functions.</p>',
      left: 'System A', right: 'System B', leftCopy: 'Its geometry and response', rightCopy: 'Its states and evolution',
      caption: 'Both incur the Kernel. That alone does not make A and B the same system.',
      verdict: 'What is still missing?',
      takeaway: 'A physical identification: which system, which state and which original conditions do both descriptions concern?'
    },
    {
      label: 'Demand 2 of 3 / Source identification',
      title: 'One system. Two descriptions to construct.',
      copy: 'Identify one physical system with its actual state, relations and occupied history. Each description must preserve that source and answer its own physical question under the appropriate conditions.',
      origin: '<span>One identified physical source</span><strong>The system, its state<br>and its occupied history</strong><p>The original conditions remain attached.</p>',
      left: 'The same system', right: 'The same system', leftCopy: 'Its spacetime description', rightCopy: 'Its quantum description',
      caption: 'The descriptions are now attached to one source. Their evolution still needs to be connected.',
      verdict: 'What is still missing?',
      takeaway: 'Compatibility through change: sharing a starting system does not by itself prove that its two descriptions evolve consistently.'
    },
    {
      label: 'Demand 3 of 3 / Common-history compatibility',
      title: 'Keep the connection as the system changes.',
      copy: 'Follow an admitted change of the source, then describe the resulting system. Or describe the initial system and apply the certified evolution. On the common domain, both routes must preserve the same physical history.',
      origin: '<span>One occupied history</span><strong>The system → its admitted change</strong><p>Source identity, conditions and original occurrences remain attached.</p>',
      left: 'Geometry & response', right: 'States & evolution', leftCopy: 'Certified Einstein description', rightCopy: 'Certified Schrödinger description',
      caption: 'The common-history construction supplies compatible descriptions on its specified physical domain.',
      verdict: 'Now the connection does scientific work.',
      takeaway: 'It carries a physical change into compatible descriptions. The common-history result establishes this scoped compatibility; the Kernel’s four names alone do not.'
    }
  ];
  function render(index) {
    const stage = stages[index];
    root.dataset.prSourceStage = index;
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
    ['label','title','copy','left','right','leftCopy','rightCopy','caption','verdict','takeaway'].forEach(name => {
      q(name.replace(/[A-Z]/g, char => '-'+char.toLowerCase())).textContent = stage[name];
    });
    q('origin').innerHTML = stage.origin;
    q('paths').hidden = index !== 2;
    q('analogy').textContent = [
      'Where the analogy ends: two words can share a semantic concept. A shared Kernel alone does not establish that two physical descriptions have one source.',
      'The physical counterpart of a shared concept is an identified physical source. Physics must retain the actual system, its state, conditions and history; shared meaning alone supplies none of these.',
      'The analogy explains why to look for a referent. It cannot establish a law of physical change. Compatible Einstein and Schrödinger evolution requires the common-history construction on its stated domain.'
    ][index];
  }
  buttons.forEach((button,index) => {
    button.addEventListener('click', () => render(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      buttons[next].focus(); render(next);
    });
  });
  render(0);
  root.dataset.prSourceReady = 'true';
  q('controls').hidden = false;
})();
