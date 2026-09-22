(() => {
  'use strict';
  const lab = document.getElementById('xp-lab');
  if (!lab || lab.classList.contains('xp-ready')) return;
  const panels = Array.from(lab.querySelectorAll('[data-xp-panel]'));
  const modeButtons = Array.from(lab.querySelectorAll('[data-xp-mode]'));
  const status = lab.querySelector('#xp-status');
  if (panels.length !== 3 || modeButtons.length !== 3 || !status) return;
  const selections = { lived: 'reading', block: 'reading', branch: 'outcome-a' };
  let activeMode = 'lived';
  function selectRecord(panel, key, announce) {
    const record = Array.from(panel.querySelectorAll('[data-xp-record]')).find(item => item.dataset.xpRecord === key);
    if (!record) return;
    selections[panel.dataset.xpPanel] = key;
    panel.querySelectorAll('[data-xp-record]').forEach(item => { item.hidden = item !== record; });
    panel.querySelectorAll('[data-xp-select]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.xpSelect === key)); });
    panel.querySelectorAll('[data-xp-point], [data-xp-path], [data-xp-label]').forEach(item => {
      const value = item.dataset.xpPoint || item.dataset.xpPath || item.dataset.xpLabel;
      item.classList.toggle('xp-selected', value === key);
    });
    if (announce) status.textContent = record.textContent.replace(/\s+/g, ' ').trim();
  }
  function showMode(mode, announce) {
    const panel = panels.find(item => item.dataset.xpPanel === mode);
    if (!panel) return;
    activeMode = mode;
    panels.forEach(item => { item.hidden = item !== panel; });
    modeButtons.forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.xpMode === mode)); });
    selectRecord(panel, selections[mode], false);
    if (announce) status.textContent = panel.querySelector('h3').textContent + '. ' + panel.querySelector('.xp-view-footer p').textContent;
  }
  panels.forEach(panel => {
    panel.querySelectorAll('[data-xp-select]').forEach(button => {
      button.addEventListener('click', () => selectRecord(panel, button.dataset.xpSelect, true));
    });
    selectRecord(panel, selections[panel.dataset.xpPanel], false);
  });
  modeButtons.forEach(button => button.addEventListener('click', () => showMode(button.dataset.xpMode, true)));
  showMode(activeMode, false);
  lab.classList.add('xp-ready');
  lab.querySelectorAll('.xp-controls').forEach(controls => { controls.hidden = false; });
})();
