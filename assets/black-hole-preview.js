(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-black-hole-scene]').forEach(scene => {
    const canvas = scene.querySelector('canvas');
    const context = canvas?.getContext('2d');
    const button = document.getElementById(scene.dataset.motionControl);
    if (!context || !button) return;
    let width = 0, height = 0, phase = .7, previous = 0, frame = 0;
    let paused = reducedMotion.matches, visible = false;
    const tau = Math.PI * 2;

    function draw() {
      if (!width || !height) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const cx = width / 2, cy = height * .49;
      const radius = Math.min(height * .30, width * .16);
      context.save();
      context.translate(cx, cy);
      context.rotate(-.12);

      // A stylized luminous disk, not a ray-traced or numerical spacetime model.
      function disk(front) {
        for (let ring = 0; ring < 36; ring++) {
          const r = radius * (1.16 + ring * .047);
          const alpha = .12 + .35 * Math.pow(1 - ring / 36, 1.3);
          context.beginPath();
          context.ellipse(0, 0, r, r * .26, 0, front ? 0 : Math.PI, front ? Math.PI : tau);
          context.lineWidth = ring < 5 ? 1.5 : .9;
          context.strokeStyle = ring % 4 ? `rgba(209,172,165,${alpha})` : `rgba(214,225,223,${alpha + .12})`;
          context.stroke();
        }
        for (let trail = 0; trail < 38; trail++) {
          const r = radius * (1.2 + ((trail * 17) % 37) * .043);
          const start = (trail * 2.39996 + phase * (.22 + (trail % 5) * .018)) % tau;
          context.beginPath();
          for (let i = 0; i <= 18; i++) {
            const angle = start + i * .013;
            if ((Math.sin(angle) >= 0) !== front) continue;
            const x = Math.cos(angle) * r, y = Math.sin(angle) * r * .26;
            if (!i || (Math.sin(angle - .013) >= 0) !== front) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.lineWidth = .9;
          context.strokeStyle = `rgba(239,219,208,${.24 + .16 * Math.sin(trail + phase * .4)})`;
          context.stroke();
        }
      }
      disk(false);
      for (let arc = 0; arc < 14; arc++) {
        context.beginPath();
        context.ellipse(0, 0, radius * (1.05 + arc * .019), radius * (1.06 + arc * .015), 0, Math.PI, tau);
        context.lineWidth = 1.4;
        context.strokeStyle = `rgba(231,204,191,${.30 * (1 - arc / 14)})`;
        context.stroke();
      }
      for (let ring = 17; ring >= 0; ring--) {
        context.beginPath();
        context.arc(0, 0, radius * (1 + ring * .008), 0, tau);
        context.strokeStyle = `rgba(222,190,177,${.015 + .08 * (1 - ring / 18)})`;
        context.lineWidth = 1.3;
        context.stroke();
      }
      context.beginPath();context.arc(0, 0, radius, 0, tau);
      context.fillStyle = '#08090c';context.fill();
      context.shadowBlur = 8;context.shadowColor = '#d5bcb0';
      context.lineWidth = 1.5;context.strokeStyle = '#e4d1c6';context.stroke();
      context.shadowBlur = 0;
      disk(true);
      context.restore();
      scene.dataset.rendered = 'true';
    }

    function tick(time) {
      frame = 0;
      if (paused || !visible || document.hidden) { previous = 0; return; }
      if (previous) phase += Math.min((time - previous) / 1000, .05);
      previous = time;
      draw();
      frame = requestAnimationFrame(tick);
    }
    function schedule() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; previous = 0;
      if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function setButton() {
      const label = paused ? 'Play black-hole animation' : 'Pause black-hole animation';
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(paused));
      button.title = label;
      button.innerHTML = `<i data-lucide="${paused ? 'play' : 'pause'}" aria-hidden="true"></i>`;
      window.lucide?.createIcons();
      scene.dataset.paused = String(paused);
    }
    new ResizeObserver(() => {
      const box = canvas.getBoundingClientRect();
      width = box.width; height = box.height;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);canvas.height = Math.round(height * ratio);
      draw();
    }).observe(canvas);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, {threshold: .01}).observe(scene);
    button.addEventListener('click', () => { paused = !paused;setButton();schedule(); });
    reducedMotion.addEventListener('change', event => { paused = event.matches;setButton();schedule(); });
    document.addEventListener('visibilitychange', schedule);
    button.hidden = false;
    setButton();
  });
})();
