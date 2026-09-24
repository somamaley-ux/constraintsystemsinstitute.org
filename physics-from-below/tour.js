(() => {
  'use strict';
  window.lucide?.createIcons();
  const navigation = document.querySelector('.chapter-nav');
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const progress = document.getElementById('reading-progress');
  const updateHeight = () => document.documentElement.style.setProperty('--pr-nav-height', `${navigation?.getBoundingClientRect().height || 76}px`);
  updateHeight();
  if (navigation && 'ResizeObserver' in window) new ResizeObserver(updateHeight).observe(navigation);
  let scheduled = false;
  function updateReading() {
    const offset = (navigation?.getBoundingClientRect().height || 76) + 40;
    let current = sections[0]?.id;
    for (const section of sections) if (section.getBoundingClientRect().top <= offset) current = section.id;
    for (const link of links) {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
    const maximum = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${maximum > 0 ? Math.min(100, Math.max(0, scrollY / maximum * 100)) : 0}%`;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, {passive:true});
  addEventListener('resize', () => { updateHeight(); updateReading(); }, {passive:true});
  updateReading();
})();
