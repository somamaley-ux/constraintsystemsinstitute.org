(() => {
  'use strict';
  document.body.classList.add('js-ready');
  window.lucide?.createIcons();
  const el = id => document.getElementById(id);
  function choices(selector, key, update) {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      update(button.dataset[key]);
    }));
  }
  const colors = {
    red: {hex: '#ae3c52', en: 'red', fr: 'rouge'},
    blue: {hex: '#3e89b5', en: 'blue', fr: 'bleu'},
    amber: {hex: '#c19542', en: 'amber', fr: 'ambre'}
  };
  let color = 'red', language = 'en';
  function updateColor(kind) {
    const current = colors[color];
    el('color-cup').style.setProperty('--cup', current.hex);
    el('color-cup').setAttribute('aria-label', `${current.en[0].toUpperCase() + current.en.slice(1)} cup`);
    el('color-word').textContent = current[language];
    el('color-word').lang = language;
    el('color-result').textContent = kind === 'word'
      ? `The cup is still ${current.en}. "${current.en}" and "${current.fr}" name the same displayed color. Only its label has changed here.`
      : `The displayed color is now ${current.en}; its label follows it. This changes the stimulus, not just the vocabulary. What you experience is a separate question.`;
  }
  choices('[data-color]', 'color', value => { color = value; updateColor('color'); });
  choices('[data-language]', 'language', value => { language = value; updateColor('word'); });

  const reports = {
    accurate: {quote: '"I saw a red cup."', kind: 'Accurate description', icon: 'message-circle', result: 'The description is accurate and refers to the earlier cup-seeing episode. The sentence is not the experience itself.'},
    mistaken: {quote: '"I saw a blue cup."', kind: 'Wrong color, same episode', icon: 'message-circle-question-mark', result: 'The color is misdescribed, but the report still concerns that earlier moment. Being wrong about what it was like is not the same as referring to nothing.'},
    silent: {quote: 'Nothing said.', kind: 'No outward report', icon: 'message-circle-off', result: 'No report is given. The example still includes the earlier experience and its internal memory. Silence alone does not erase that episode or certify what another person experienced.'}
  };
  function replaceIcon(id, name) {
    const icon = document.createElement('i');
    icon.id = id; icon.dataset.lucide = name; icon.setAttribute('aria-hidden', 'true');
    el(id).replaceWith(icon); window.lucide?.createIcons();
  }
  choices('[data-report-choice]', 'reportChoice', choice => {
    const data = reports[choice];
    document.querySelector('.memory-exhibit').dataset.report = choice;
    for (const key of ['quote', 'kind', 'result']) el(`report-${key}`).textContent = data[key];
    replaceIcon('report-icon', data.icon);
  });

  const cases = {
    thought: {
      quote: '"I hope to return the book tomorrow."', from: 'An unspoken intention, not a self-binding act',
      bundle: 'Return the book, but no promise made.',
      carrier: 'No promise-bearing act in this example.', title: 'An intention, not yet this promise.',
      result: 'Aya has a genuine intention. Sam cannot turn it into an interpersonal promise after the fact. A recognized private resolution could create a different commitment; private does not mean unreal.'
    },
    promise: {
      quote: '"I\'ll return your book tomorrow."', from: 'Aya to Sam',
      bundle: 'Return Sam\'s book tomorrow.', carrier: 'Aya\'s understood, genuine promise to Sam.',
      title: 'A promise Aya has authored.',
      result: 'In this example, Aya understands the terms, genuinely takes them up, and no one displaces her authorship. The promise is fixed before tomorrow\'s outcome.'
    },
    substitution: {
      quote: '"I\'ll return your book tomorrow."', from: 'The record secretly adds: "pay Sam $500"',
      bundle: 'Aya undertakes the return, not a concealed $500 payment.',
      carrier: 'Her words do not authorize the substituted terms.', title: 'The hidden addition is not her undertaking.',
      result: 'The visible words are unchanged, but the attributed terms have been replaced. On these facts, Aya authors the return promise, not the concealed payment. A good outcome cannot fix that access defect.'
    }
  };
  choices('[data-case-choice]', 'caseChoice', choice => {
    document.querySelector('.promise-exhibit').dataset.case = choice;
    for (const [key, value] of Object.entries(cases[choice])) el(`promise-${key}`).textContent = value;
  });

  const outcomes = {
    returned: {icon: 'book-check', word: 'Returned', title: 'The promise is fulfilled.', result: 'Aya returns the book on time. Success fulfills an already authored undertaking; it does not create her authorship retrospectively.'},
    delayed: {icon: 'ban', word: 'An unforeseeable obstacle', title: 'Performance is prevented.', result: 'An unforeseeable obstacle makes return impossible that day. Whether this excuses delay or calls for repair is a further question. It does not make yesterday\'s genuine promise never have happened.'},
    released: {icon: 'calendar-check', word: 'Sam releases the deadline', title: 'The obligation changes. The history does not.', result: 'Sam releases Aya from tomorrow\'s deadline. The original deadline no longer binds her in this example, but the earlier promise remains something she genuinely authored.'}
  };
  choices('[data-outcome-choice]', 'outcomeChoice', choice => {
    document.querySelector('.outcome-exhibit').dataset.outcome = choice;
    const data = outcomes[choice];
    el('outcome-visual-word').textContent = data.word;
    el('outcome-title').textContent = data.title; el('outcome-result').textContent = data.result;
    replaceIcon('outcome-icon', data.icon);
  });

  const links = [...document.querySelectorAll('.chapter-nav a')];
  const chapters = links.map(link => document.querySelector(link.getAttribute('href')));
  const progress = el('reading-progress');
  let scheduled = false;
  function updateProgress() {
    scheduled = false;
    let active = 0;
    const navHeight = document.querySelector('.chapter-nav').getBoundingClientRect().height;
    chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top <= navHeight + 100) active = index; });
    links.forEach((link, index) => index === active ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
    const start = chapters[0].getBoundingClientRect().top + scrollY, end = el('papers').getBoundingClientRect().top + scrollY;
    progress.style.width = `${Math.max(0, Math.min(100, (scrollY - start) / (end - start) * 100))}%`;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, {passive: true});
  addEventListener('resize', updateProgress);
  updateProgress();
})();
