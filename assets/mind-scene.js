(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-mind-scene]').forEach(scene => {
    const canvas = scene.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const button = document.getElementById(scene.dataset.motionControl);
    let width = 1, height = 1, phase = 0, frame = 0, last = 0;
    let visible = false, paused = false;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Match the photograph's cover transform, keeping the steam above the cup.
      const scale = Math.max(width / 1672, height / 941);
      const left = (width - 1672 * scale) / 2, top = (height - 941 * scale) / 2;
      ctx.save(); ctx.translate(left, top); ctx.scale(scale, scale);
      for (let strand = 0; strand < 3; strand++) {
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const t = i / 90;
          const x = 1090 + strand * 19 + Math.sin(t * 9 - phase * .55 + strand) * (9 + t * 17);
          const y = 230 - t * 255;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = `rgba(232,217,218,${.075 + strand * .027})`;
        ctx.lineWidth = 2.5 + strand; ctx.stroke();
      }
      ctx.restore();
      scene.dataset.rendered = 'true';
    }
    function animate(time) {
      frame = 0;
      if (last) phase += Math.min(64, time - last) / 1000;
      last = time; draw(); frame = requestAnimationFrame(animate);
    }
    function sync() {
      const running = visible && !document.hidden && !paused && !reduced.matches;
      scene.dataset.motion = running ? 'playing' : 'paused';
      if (running && !frame) { last = 0; frame = requestAnimationFrame(animate); }
      else if (!running) { cancelAnimationFrame(frame); frame = 0; last = 0; draw(); }
      if (button) {
        button.hidden = reduced.matches;
        button.setAttribute('aria-pressed', String(paused));
        const label = paused ? 'Play steam animation' : 'Pause steam animation';
        button.setAttribute('aria-label', label); button.title = label;
        button.innerHTML = `<i data-lucide="${paused ? 'play' : 'pause'}" aria-hidden="true"></i>`;
        window.lucide?.createIcons({nodes: [button]});
      }
    }
    new ResizeObserver(() => {
      const rect = scene.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    }).observe(scene);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold: .01}).observe(scene);
    button?.addEventListener('click', () => { paused = !paused; sync(); });
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
  });
})();
