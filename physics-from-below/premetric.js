(() => {
  'use strict';
  const lab = document.querySelector('[data-pr-premetric]');
  if (!lab) return;
  const q = selector => lab.querySelector(selector);
  const modes = [...lab.querySelectorAll('[data-pr-pm-mode]')];
  const redraw = q('[data-pr-pm-redraw]');
  const nodes = [...lab.querySelectorAll('[data-pr-pm-event]')];
  const paths = [...lab.querySelectorAll('[data-pr-pm-edge]')];
  const arrangements = [
    [{ x: 64, y: 82, labelY: 44 }, { x: 274, y: 166, labelY: 128 }, { x: 86, y: 263, labelY: 307 }],
    [{ x: 70, y: 261, labelY: 306 }, { x: 104, y: 66, labelY: 28 }, { x: 285, y: 229, labelY: 273 }]
  ];
  const metric = [{ x: 76, y: 287 }, { x: 280, y: 171 }, { x: 76, y: 55 }];
  let activeMode = 'relations';
  let drawing = 0;
  let hasRearranged = false;

  function connect(a, b) {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const dx = (b.x - a.x) / length;
    const dy = (b.y - a.y) / length;
    const gap = activeMode === 'metric' ? 26 : 30;
    return `M${a.x + dx * gap} ${a.y + dy * gap}L${b.x - dx * gap} ${b.y - dy * gap}`;
  }

  function render() {
    const isMetric = activeMode === 'metric';
    const positions = isMetric ? metric : arrangements[drawing];
    lab.dataset.prPmView = activeMode;
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.prPmMode === activeMode)));
    q('[data-pr-pm-grid]').toggleAttribute('hidden', !isMetric);
    nodes.forEach((node, index) => {
      const point = positions[index];
      node.querySelector('circle').setAttribute('cx', point.x);
      node.querySelector('circle').setAttribute('cy', point.y);
      node.querySelector('circle').setAttribute('r', isMetric ? 19 : 23);
      const id = node.querySelector('.pr-pm-node-id');
      id.setAttribute('x', point.x);
      id.setAttribute('y', point.y);
      const label = node.querySelector('.pr-pm-node-label');
      label.toggleAttribute('hidden', isMetric);
      label.setAttribute('x', point.x);
      label.setAttribute('y', point.labelY || point.y);
    });
    paths.forEach((path, index) => path.setAttribute('d', connect(positions[index], positions[index + 1])));
    redraw.disabled = isMetric;
    q('[data-pr-pm-redraw-note]').textContent = isMetric
      ? 'This view holds the coordinate grid steady so you can read the example.'
      : 'Move the marks and see what stays the same.';
    q('[data-pr-pm-eyebrow]').textContent = isMetric ? 'An example with physical comparison' : 'Physical relations before a metric';
    q('[data-pr-pm-title]').textContent = isMetric ? 'Now add measured intervals.' : 'Same events. No distance scale yet.';
    q('[data-pr-pm-body]').textContent = isMetric
      ? 'A clock at A records a two-microsecond round trip. With a stationary mirror and no reflection delay, the midpoint time is 1 microsecond. Calibrating the signal speed as c gives a radar distance of about 299.79 metres.'
      : 'A emits a signal; B reflects it; A receives it. We must keep track of which events occur, how they are connected and which endpoint remains A. Those relations do not yet supply a metre or a second.';
    q('[data-pr-pm-feedback-title]').textContent = isMetric
      ? 'What had to be added?'
      : hasRearranged ? 'The drawing moved. The physical relations did not.' : 'Try rearranging the drawing.';
    q('[data-pr-pm-feedback-body]').textContent = isMetric
      ? 'Physical clocks and signal comparisons, finite isotropic propagation, and a common clock calibration. AASC develops the metric from the completed comparison structure; three drawn events alone do not determine it.'
      : hasRearranged
        ? 'E1 leads to E2, E2 leads to E3, and A is still the same endpoint at departure and return. Changing the layout has supplied no new physical relation and changed no duration.'
        : 'E1 → E2 → E3 and the identity of A will stay fixed while the marks move. The space between marks on this page is not a physical distance.';
    q('[data-pr-pm-caption]').textContent = isMetric
      ? 'One calibrated radar example: time runs upward, distance to the right. The three events and their connections are retained.'
      : 'A schematic of physical relations, not a map of distances. The page layout does not measure space or elapsed time.';
    q('[data-pr-pm-example]').toggleAttribute('hidden', !isMetric);
    q('[data-pr-pm-svg-desc]').textContent = isMetric
      ? 'A radar space-time diagram. E1 is emission at A at zero microseconds and zero metres. E2 is reflection at B at one microsecond and approximately 299.79 metres. E3 is return to the same A at two microseconds and zero metres. Arrows connect E1 to E2 and E2 to E3.'
      : 'Three named events linked E1 to E2 to E3. E1 is emission at A, E2 reflection at B, and E3 return to the same A. Their positions on the page are only a layout and have no metre or second values.';
  }

  modes.forEach(button => {
    button.addEventListener('click', () => { activeMode = button.dataset.prPmMode; render(); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1 : (modes.indexOf(button) + (event.key === 'ArrowRight' ? 1 : -1) + modes.length) % modes.length;
      modes[index].focus();
      modes[index].click();
    });
  });
  redraw.addEventListener('click', () => {
    if (activeMode !== 'relations') return;
    drawing = 1 - drawing;
    hasRearranged = true;
    render();
  });
  render();
  lab.dataset.prPmReady = 'true';
  lab.querySelectorAll('[data-pr-pm-controls]').forEach(controls => controls.removeAttribute('hidden'));
})();
