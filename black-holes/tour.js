(() => {
  'use strict';
  window.lucide?.createIcons();
  const nav = document.querySelector('.chapter-nav');
  const links = [...nav.querySelectorAll('a')];
  const chapters = links.map(link => document.querySelector(link.hash));
  const progress = document.getElementById('reading-progress');
  let queued = false;
  function updateChapter() {
    queued = false;
    const threshold = nav.getBoundingClientRect().height + 70;
    let current = 0;
    chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top <= threshold) current = index; });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    const start = chapters[0].offsetTop;
    const last = chapters.at(-1);
    const end = last.offsetTop + last.offsetHeight - innerHeight;
    progress.style.width = `${Math.max(0, Math.min(100, (scrollY - start) / Math.max(1, end - start) * 100))}%`;
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true;requestAnimationFrame(updateChapter); }
  }, {passive: true});
  addEventListener('resize', updateChapter);
  updateChapter();
})();
